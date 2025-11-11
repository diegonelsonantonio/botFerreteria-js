# 🏛️ Arquitectura Técnica - Bot Ferretería

## Índice

1. [Visión General](#visión-general)
2. [Patrones de Diseño](#patrones-de-diseño)
3. [Flujo de Datos](#flujo-de-datos)
4. [Componentes Detallados](#componentes-detallados)
5. [Decisiones Técnicas](#decisiones-técnicas)
6. [Escalabilidad](#escalabilidad)
7. [Seguridad](#seguridad)

## Visión General

### Arquitectura en Capas

El proyecto sigue una arquitectura en capas (Layered Architecture) con separación clara de responsabilidades:

```
┌─────────────────────────────────────┐
│     API Layer (Presentación)        │  ← Express Routes, Controllers
├─────────────────────────────────────┤
│   Business Logic Layer (Negocio)    │  ← Services, Context Management
├─────────────────────────────────────┤
│   Data Access Layer (Datos)         │  ← Repositories, Models
├─────────────────────────────────────┤
│   External Services (Externos)      │  ← OpenAI, Pinecone, Meta API
└─────────────────────────────────────┘
```

### Principios Aplicados

- **Separation of Concerns**: Cada capa tiene una responsabilidad única
- **Dependency Injection**: Servicios inyectados donde se necesitan
- **Single Responsibility**: Cada módulo hace una cosa bien
- **DRY (Don't Repeat Yourself)**: Código reutilizable
- **KISS (Keep It Simple, Stupid)**: Soluciones simples y mantenibles

## Patrones de Diseño

### 1. Repository Pattern

**Ubicación**: `src/core/repositories/`

**Propósito**: Abstraer el acceso a datos, permitiendo cambiar la fuente de datos sin afectar la lógica de negocio.

```javascript
// mongo.repository.js
export class MongoRepository {
  async findById(model, id) {
    return await model.findById(id);
  }
  
  async create(model, data) {
    return await model.create(data);
  }
}

// rag.repository.js
export class RAGRepository {
  async search(query, topK = 5) {
    const embedding = await this.createEmbedding(query);
    return await this.pinecone.query({ vector: embedding, topK });
  }
}
```

**Ventajas**:
- Fácil testing con mocks
- Cambiar de MongoDB a otra DB sin tocar servicios
- Centraliza queries complejas

### 2. Service Layer Pattern

**Ubicación**: `src/core/services/`

**Propósito**: Encapsular la lógica de negocio compleja.

```javascript
// message.service.js
export async function processMessage(senderId, text, payload) {
  // 1. Obtener contexto
  const context = getConversationContext(senderId);
  
  // 2. Buscar información relevante (RAG)
  const knowledge = await searchKnowledge(text);
  
  // 3. Generar respuesta con IA
  const response = await generateResponse(context, knowledge);
  
  // 4. Enviar a usuario
  await sendMessage(senderId, response);
  
  // 5. Actualizar contexto
  updateContext(senderId, text, response);
}
```

**Ventajas**:
- Lógica de negocio centralizada
- Fácil de testear
- Reutilizable desde diferentes endpoints

### 3. Middleware Pattern

**Ubicación**: `src/api/middlewares/`

**Propósito**: Procesar requests antes de llegar al controller.

```javascript
// metaVerify.js
export function verifyMetaSignature(req, res, next) {
  const signature = req.headers['x-hub-signature-256'];
  const hash = crypto
    .createHmac('sha256', META_APP_SECRET)
    .update(req.rawBody)
    .digest('hex');
    
  if (`sha256=${hash}` === signature) {
    next(); // Continuar
  } else {
    res.sendStatus(403); // Rechazar
  }
}
```

**Ventajas**:
- Separación de concerns (seguridad vs lógica)
- Reutilizable en múltiples rutas
- Fácil de testear

### 4. Context Pattern

**Ubicación**: `src/core/context/`

**Propósito**: Mantener el estado de la conversación entre mensajes.

```javascript
// conversationContext.js
const contexts = new Map();

export function getConversationContext(userId) {
  if (!contexts.has(userId)) {
    contexts.set(userId, {
      messages: [],
      lastInteraction: Date.now(),
      state: 'idle'
    });
  }
  return contexts.get(userId);
}
```

**Ventajas**:
- Conversaciones contextuales
- Memoria de interacciones previas
- Personalización por usuario

## Flujo de Datos

### Flujo Completo de un Mensaje

```
1. Usuario envía mensaje en WhatsApp
   ↓
2. Meta envía POST a /webhook
   ↓
3. Middleware verifyMetaSignature valida firma
   ↓
4. Controller webhook.controller.postWebhook recibe
   ↓
5. Service message.service.processMessage procesa
   ├─→ 5a. Obtiene contexto (conversationContext)
   ├─→ 5b. Busca en base de conocimiento (rag.service)
   │       ├─→ Crea embedding con OpenAI
   │       └─→ Busca en Pinecone
   ├─→ 5c. Genera respuesta con GPT-4 (openai)
   ├─→ 5d. Envía respuesta a Meta API
   └─→ 5e. Actualiza contexto y guarda en MongoDB
   ↓
6. Usuario recibe respuesta en WhatsApp
```

### Flujo de Creación de Pedido

```
1. Usuario: "Quiero comprar martillo"
   ↓
2. Bot busca producto en MongoDB
   ↓
3. Bot: "Encontré: Martillo $150. ¿Confirmas?"
   ↓
4. Usuario: "Sí"
   ↓
5. order.service.createOrder()
   ├─→ Valida stock
   ├─→ Crea documento en Orders
   ├─→ Actualiza stock en Products
   └─→ Genera número de orden
   ↓
6. Bot: "Pedido #12345 creado. Total: $150"
```

## Componentes Detallados

### API Layer

#### webhook.controller.js

**Responsabilidad**: Manejar requests HTTP del webhook de Meta.

**Funciones**:
- `getWebhook()`: Verificación inicial del webhook
- `postWebhook()`: Recepción de mensajes

**Decisiones**:
- Responde 200 OK inmediatamente (Meta requiere respuesta < 20s)
- Procesa mensajes de forma asíncrona
- Maneja tanto mensajes de texto como Quick Replies

#### webhook.routes.js

**Responsabilidad**: Definir rutas y aplicar middlewares.

**Configuración**:
```javascript
router.post(
  '/',
  express.raw({ type: 'application/json' }), // Raw body para verificación
  verifyMetaSignature,                        // Seguridad
  postWebhook                                 // Handler
);
```

**Decisión**: `express.raw()` en lugar de `express.json()` porque la verificación de firma requiere el body sin parsear.

#### metaVerify.js

**Responsabilidad**: Verificar que los requests vienen de Meta.

**Algoritmo**:
1. Obtener firma del header `X-Hub-Signature-256`
2. Calcular HMAC SHA-256 del body con `META_APP_SECRET`
3. Comparar firmas
4. Rechazar si no coinciden

**Seguridad**: Previene ataques de replay y spoofing.

### Business Logic Layer

#### message.service.js

**Responsabilidad**: Orquestar el procesamiento de mensajes.

**Flujo**:
```javascript
export async function processMessage(senderId, text, payload) {
  // 1. Contexto
  const context = getConversationContext(senderId);
  
  // 2. Determinar intención
  if (payload === 'MENU_PRODUCTOS') {
    await handleProductsMenu(senderId);
  } else if (payload === 'MENU_PEDIDOS') {
    await handleOrdersMenu(senderId);
  } else {
    // 3. Búsqueda RAG
    const knowledge = await searchKnowledge(text);
    
    // 4. Generar respuesta
    const response = await generateAIResponse(context, text, knowledge);
    
    // 5. Enviar
    await sendToMeta(senderId, response);
  }
  
  // 6. Actualizar contexto
  updateContext(senderId, text);
}
```

**Decisiones**:
- Payloads para acciones específicas (menús)
- RAG solo para consultas generales
- Contexto persistente entre mensajes

#### order.service.js

**Responsabilidad**: Gestionar pedidos.

**Funciones**:
- `createOrder(userId, products)`: Crear nuevo pedido
- `getOrderById(orderId)`: Consultar pedido
- `getUserOrders(userId)`: Historial de usuario
- `updateOrderStatus(orderId, status)`: Actualizar estado

**Validaciones**:
- Stock disponible
- Precios actualizados
- Usuario válido

#### rag.service.js

**Responsabilidad**: Búsqueda semántica con RAG.

**Proceso**:
```javascript
export async function searchKnowledge(query) {
  // 1. Crear embedding del query
  const embedding = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: query
  });
  
  // 2. Buscar en Pinecone
  const results = await pinecone.query({
    vector: embedding.data[0].embedding,
    topK: 5,
    includeMetadata: true
  });
  
  // 3. Retornar documentos relevantes
  return results.matches.map(m => ({
    content: m.metadata.content,
    score: m.score
  }));
}
```

**Ventajas de RAG**:
- Respuestas basadas en información real
- Reduce alucinaciones de GPT-4
- Actualizable sin reentrenar modelo

### Data Access Layer

#### mongo.repository.js

**Responsabilidad**: Operaciones CRUD genéricas en MongoDB.

**Funciones**:
```javascript
export class MongoRepository {
  async findById(model, id) { }
  async findOne(model, query) { }
  async findMany(model, query, options) { }
  async create(model, data) { }
  async update(model, id, data) { }
  async delete(model, id) { }
}
```

**Ventajas**:
- Código DRY
- Fácil agregar logging/caching
- Consistencia en manejo de errores

#### rag.repository.js

**Responsabilidad**: Operaciones con Pinecone.

**Funciones**:
- `upsert(vectors)`: Insertar/actualizar vectores
- `query(vector, topK)`: Búsqueda de similitud
- `delete(ids)`: Eliminar vectores

**Optimizaciones**:
- Batch upserts para eficiencia
- Filtros por metadata
- Namespace para separar datos

### Models

#### products.model.js

```javascript
const productSchema = new Schema({
  name: { type: String, required: true, index: true },
  description: { type: String },
  price: { type: Number, required: true },
  category: { type: String, index: true },
  stock: { type: Number, default: 0 },
  imageUrl: String,
  createdAt: { type: Date, default: Date.now }
});

// Índice de texto para búsqueda
productSchema.index({ name: 'text', description: 'text' });
```

**Decisiones**:
- Índices en campos frecuentes (name, category)
- Índice de texto para búsqueda full-text
- Stock como número para operaciones atómicas

#### order.model.js

```javascript
const orderSchema = new Schema({
  userId: { type: String, required: true, index: true },
  products: [{
    productId: { type: Schema.Types.ObjectId, ref: 'Product' },
    name: String,
    quantity: Number,
    price: Number
  }],
  total: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  createdAt: { type: Date, default: Date.now, index: true }
});
```

**Decisiones**:
- Productos embebidos (desnormalización) para snapshot del pedido
- Enum para status (validación)
- Índice compuesto en userId + createdAt

#### knowledge.model.js

```javascript
const knowledgeSchema = new Schema({
  content: { type: String, required: true },
  category: { type: String, index: true },
  metadata: Schema.Types.Mixed,
  embedding: [Number], // Opcional: guardar embedding en Mongo también
  createdAt: { type: Date, default: Date.now }
});
```

**Uso**: Base de conocimiento para RAG (horarios, políticas, FAQs).

## Decisiones Técnicas

### ¿Por qué MongoDB?

**Ventajas**:
1. **Esquema Flexible**: Fácil evolucionar modelos
2. **Documentos Anidados**: Pedidos con productos embebidos
3. **Escalabilidad Horizontal**: Sharding nativo
4. **Atlas**: Managed service con backups automáticos
5. **Mongoose**: ODM robusto con validación

**Alternativas Consideradas**:
- PostgreSQL: Más rígido, requiere migraciones
- DynamoDB: Vendor lock-in con AWS
- Firebase: Menos control, costos variables

### ¿Por qué OpenAI GPT-4?

**Ventajas**:
1. **Calidad**: Mejores respuestas conversacionales
2. **Contexto**: 128k tokens de contexto
3. **Multimodal**: Soporte futuro para imágenes
4. **API Simple**: Fácil integración

**Alternativas Consideradas**:
- Claude (Anthropic): Bueno pero menos disponible
- Llama 2: Requiere hosting propio
- Gemini: Menos maduro en español

### ¿Por qué Pinecone?

**Ventajas**:
1. **Managed**: No requiere infraestructura
2. **Rápido**: Búsqueda < 100ms
3. **Escalable**: Millones de vectores
4. **Metadata Filtering**: Filtros avanzados

**Alternativas Consideradas**:
- Weaviate: Requiere self-hosting
- Qdrant: Menos maduro
- pgvector: Limitado en escala

### ¿Por qué Express.js?

**Ventajas**:
1. **Minimalista**: Solo lo necesario
2. **Middleware**: Ecosistema rico
3. **Maduro**: Estable y probado
4. **Documentación**: Excelente

**Alternativas Consideradas**:
- Fastify: Más rápido pero menos maduro
- NestJS: Demasiado complejo para este caso
- Koa: Menos ecosistema

### ¿Por qué Google Cloud Run?

**Ventajas**:
1. **Serverless**: No gestionar servidores
2. **Escala a Cero**: Ahorro de costos
3. **Contenedores**: Flexibilidad total
4. **Integración**: Fácil con otros servicios GCP

**Alternativas Consideradas**:
- AWS Lambda: Límites de tiempo de ejecución
- Heroku: Más caro
- VPS: Requiere mantenimiento

## Escalabilidad

### Estrategias Actuales

1. **Stateless API**: Sin estado en servidor
2. **Contexto en Memoria**: Map() para contextos (limitado)
3. **MongoDB Atlas**: Auto-scaling
4. **Cloud Run**: Escala automática

### Mejoras Futuras

#### 1. Redis para Contexto

**Problema**: Map() en memoria no escala horizontalmente.

**Solución**:
```javascript
// Usar Redis en lugar de Map
import Redis from 'ioredis';
const redis = new Redis(process.env.REDIS_URL);

export async function getConversationContext(userId) {
  const context = await redis.get(`context:${userId}`);
  return context ? JSON.parse(context) : createNewContext();
}
```

**Ventajas**:
- Compartido entre instancias
- TTL automático
- Persistencia opcional

#### 2. Queue para Mensajes

**Problema**: Procesamiento síncrono puede ser lento.

**Solución**:
```javascript
// Usar Bull Queue
import Queue from 'bull';
const messageQueue = new Queue('messages', REDIS_URL);

// En controller
export const postWebhook = async (req, res) => {
  res.status(200).send('EVENT_RECEIVED');
  
  // Encolar en lugar de procesar
  await messageQueue.add({ senderId, text });
};

// Worker separado
messageQueue.process(async (job) => {
  await processMessage(job.data.senderId, job.data.text);
});
```

**Ventajas**:
- Respuesta inmediata a Meta
- Retry automático
- Rate limiting
- Priorización

#### 3. Cache de Embeddings

**Problema**: Crear embeddings es costoso.

**Solución**:
```javascript
// Cache en Redis
async function getEmbedding(text) {
  const cacheKey = `emb:${hash(text)}`;
  const cached = await redis.get(cacheKey);
  
  if (cached) return JSON.parse(cached);
  
  const embedding = await openai.embeddings.create({ input: text });
  await redis.setex(cacheKey, 86400, JSON.stringify(embedding));
  
  return embedding;
}
```

**Ahorro**: ~90% de llamadas a OpenAI.

#### 4. CDN para Assets

**Problema**: Imágenes de productos lentas.

**Solución**: Usar Cloud Storage + CDN (Cloudflare/CloudFront).

### Límites de Escala

**Configuración Actual**:
- Max instancias Cloud Run: 10
- Memoria por instancia: 512Mi
- CPU: 1 vCPU

**Capacidad Estimada**:
- ~100 mensajes/segundo
- ~10,000 usuarios concurrentes

**Cuellos de Botella**:
1. OpenAI API (rate limits)
2. MongoDB connections
3. Memoria para contextos

## Seguridad

### Implementadas

1. **Verificación de Firma Meta**: HMAC SHA-256
2. **Variables de Entorno**: Credenciales fuera del código
3. **HTTPS**: Obligatorio en Cloud Run
4. **Validación de Input**: Sanitización básica

### Recomendadas

1. **Rate Limiting**:
```javascript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // 100 requests por IP
});

app.use('/webhook', limiter);
```

2. **Helmet.js**: Headers de seguridad
```javascript
import helmet from 'helmet';
app.use(helmet());
```

3. **Input Validation**:
```javascript
import { body, validationResult } from 'express-validator';

router.post('/webhook',
  body('object').equals('page'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
);
```

4. **Secrets Manager**: En producción
```javascript
// En lugar de .env
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
const client = new SecretManagerServiceClient();

async function getSecret(name) {
  const [version] = await client.accessSecretVersion({
    name: `projects/${PROJECT_ID}/secrets/${name}/versions/latest`
  });
  return version.payload.data.toString();
}
```

5. **Logging Seguro**:
```javascript
// NO logear datos sensibles
console.log('Message received', { 
  userId: senderId, 
  // text: messageText ← NO
  length: messageText.length 
});
```

## Monitoreo y Observabilidad

### Logs Estructurados

```javascript
import winston from 'winston';

const logger = winston.createLogger({
  format: winston.format.json(),
  transports: [
    new winston.transports.Console()
  ]
});

logger.info('Message processed', {
  userId: senderId,
  duration: Date.now() - startTime,
  success: true
});
```

### Métricas

```javascript
import { Counter, Histogram } from 'prom-client';

const messageCounter = new Counter({
  name: 'messages_total',
  help: 'Total messages processed'
});

const responseTime = new Histogram({
  name: 'response_duration_seconds',
  help: 'Response time in seconds'
});
```

### Tracing

```javascript
import { trace } from '@opentelemetry/api';

const tracer = trace.getTracer('bot-ferreteria');

export async function processMessage(senderId, text) {
  const span = tracer.startSpan('processMessage');
  
  try {
    // ... lógica
  } finally {
    span.end();
  }
}
```

## Conclusión

Esta arquitectura balancea:
- **Simplicidad**: Fácil de entender y mantener
- **Escalabilidad**: Puede crecer con el negocio
- **Flexibilidad**: Fácil agregar features
- **Seguridad**: Protección básica implementada

Es ideal para un MVP que puede evolucionar a producción con las mejoras sugeridas.
