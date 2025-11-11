# 🤖 Bot Ferretería - Chatbot Inteligente con IA

Bot conversacional inteligente para ferretería integrado con WhatsApp/Facebook Messenger mediante Meta Business API. Utiliza OpenAI GPT-4 para respuestas contextuales y RAG (Retrieval-Augmented Generation) con Pinecone para búsqueda semántica de productos.

---

## 📚 Documentación Completa

Este README es una introducción. Para documentación completa, consulta:

- 📖 **[INDICE_DOCUMENTACION.md](INDICE_DOCUMENTACION.md)** - Índice completo de toda la documentación
- 🏗️ **[ARCHITECTURE.md](ARCHITECTURE.md)** - Arquitectura técnica detallada
- 🚀 **[DEPLOYMENT.md](DEPLOYMENT.md)** - Guía de despliegue paso a paso
- 💡 **[IMPROVEMENTS.md](IMPROVEMENTS.md)** - Mejoras sugeridas y roadmap
- ❓ **[FAQ.md](FAQ.md)** - Preguntas frecuentes y troubleshooting
- 🛠️ **[COMANDOS_UTILES.md](COMANDOS_UTILES.md)** - Referencia rápida de comandos
- 📊 **[RESUMEN_EJECUTIVO.md](RESUMEN_EJECUTIVO.md)** - Resumen para stakeholders

---

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Arquitectura](#-arquitectura)
- [Tecnologías](#-tecnologías)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Instalación](#-instalación)
- [Configuración](#-configuración)
- [Despliegue](#-despliegue)
- [API Endpoints](#-api-endpoints)
- [Flujo de Conversación](#-flujo-de-conversación)
- [Base de Datos](#-base-de-datos)

## ✨ Características

### Funcionalidades Principales

- **Conversación Natural**: Interacción fluida usando GPT-4 de OpenAI
- **Búsqueda Semántica**: RAG con Pinecone para encontrar productos relevantes
- **Gestión de Pedidos**: Creación y seguimiento de órdenes de compra
- **Menú Interactivo**: Quick Replies para navegación rápida
- **Persistencia**: Historial de conversaciones y pedidos en MongoDB
- **Integración Meta**: Webhook verificado con firma HMAC SHA-256

### Capacidades del Bot

1. **Consultas de Productos**
   - Búsqueda por nombre, categoría o descripción
   - Información de precios y disponibilidad
   - Recomendaciones inteligentes

2. **Gestión de Pedidos**
   - Crear nuevos pedidos
   - Consultar estado de pedidos
   - Historial de compras

3. **Información General**
   - Horarios de atención
   - Ubicación y contacto
   - Políticas de la tienda

## 🏗️ Arquitectura

### Diagrama de Flujo

```
Usuario (WhatsApp/Messenger)
         ↓
    Meta Webhook
         ↓
   Express Server
         ↓
    ┌────┴────┐
    ↓         ↓
Message    Order
Service    Service
    ↓         ↓
  OpenAI   MongoDB
    ↓
 Pinecone
  (RAG)
```

### Componentes Clave

1. **API Layer** (`src/api/`)
   - Controllers: Lógica de endpoints
   - Routes: Definición de rutas
   - Middlewares: Validación y seguridad

2. **Core Layer** (`src/core/`)
   - Services: Lógica de negocio
   - Repositories: Acceso a datos
   - Models: Esquemas de MongoDB
   - Context: Gestión de contexto conversacional

3. **Config Layer** (`src/config/`)
   - Configuración de base de datos
   - Cliente de OpenAI
   - Variables de entorno

## 🛠️ Tecnologías

### Backend
- **Node.js 18+**: Runtime de JavaScript
- **Express.js**: Framework web minimalista
- **MongoDB + Mongoose**: Base de datos NoSQL y ODM

### Inteligencia Artificial
- **OpenAI GPT-4**: Modelo de lenguaje para conversaciones
- **Pinecone**: Base de datos vectorial para RAG
- **Embeddings**: text-embedding-3-small para vectorización

### Integraciones
- **Meta Business API**: WhatsApp/Messenger
- **Google Cloud Run**: Hosting serverless

### Desarrollo
- **ES Modules**: Sintaxis moderna de JavaScript
- **dotenv**: Gestión de variables de entorno
- **nodemon**: Hot reload en desarrollo

## 📁 Estructura del Proyecto

```
bot-ferreteria-api/
│
├── src/
│   ├── api/                      # Capa de API
│   │   ├── controllers/          # Controladores de endpoints
│   │   │   └── webhook.controller.js
│   │   ├── middlewares/          # Middlewares personalizados
│   │   │   ├── errorHandler.js  # Manejo global de errores
│   │   │   └── metaVerify.js    # Verificación de firma Meta
│   │   └── routes/               # Definición de rutas
│   │       └── webhook.routes.js
│   │
│   ├── config/                   # Configuración
│   │   ├── database.js          # Conexión MongoDB
│   │   ├── index.js             # Variables de entorno
│   │   └── openai.js            # Cliente OpenAI
│   │
│   ├── core/                     # Lógica de negocio
│   │   ├── context/             # Gestión de contexto
│   │   │   └── conversationContext.js
│   │   │
│   │   ├── models/              # Modelos de datos
│   │   │   ├── knowledge.model.js    # Base de conocimiento
│   │   │   ├── order.model.js        # Pedidos
│   │   │   └── products.model.js     # Productos
│   │   │
│   │   ├── repositories/        # Acceso a datos
│   │   │   ├── mongo.repository.js   # Operaciones MongoDB
│   │   │   └── rag.repository.js     # Operaciones Pinecone
│   │   │
│   │   └── services/            # Servicios de negocio
│   │       ├── message.service.js    # Procesamiento de mensajes
│   │       ├── order.service.js      # Gestión de pedidos
│   │       └── rag.service.js        # Búsqueda semántica
│   │
│   ├── scripts/                 # Scripts utilitarios
│   │   └── embedData.js        # Carga de datos a Pinecone
│   │
│   ├── app.js                   # Configuración de Express
│   └── server.js                # Punto de entrada
│
├── .env                         # Variables de entorno (no commitear)
├── .env.example                 # Plantilla de variables
├── .dockerignore               # Archivos excluidos de Docker
├── Dockerfile                  # Imagen Docker
├── package.json                # Dependencias
├── deploy.ps1                  # Script de despliegue estándar
├── deploy-secrets.ps1          # Script con Secret Manager
├── DEPLOYMENT.md               # Guía de despliegue
└── README.md                   # Este archivo
```

## 🚀 Instalación

### Prerrequisitos

- Node.js 18 o superior
- npm o yarn
- Cuenta de MongoDB Atlas
- Cuenta de OpenAI
- Cuenta de Meta Developer
- Cuenta de Google Cloud (para despliegue)

### Pasos de Instalación

1. **Clonar el repositorio**
```bash
git clone <url-del-repo>
cd bot-ferreteria-api
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env
# Editar .env con tus credenciales
```

4. **Iniciar en desarrollo**
```bash
npm run dev
```

5. **Iniciar en producción**
```bash
npm start
```

## ⚙️ Configuración

### Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
# Meta (Facebook/WhatsApp)
META_VERIFY_TOKEN=tu_token_de_verificacion
META_PAGE_ACCESS_TOKEN=tu_token_de_acceso
META_APP_SECRET=tu_app_secret

# MongoDB Atlas
MONGO_URI=mongodb+srv://usuario:password@cluster.mongodb.net/
DB_NAME=ferreteria_db
DB_USER=usuario
DB_PASSWORD=password

# OpenAI
OPENAI_API_KEY=sk-proj-...

# Server
PORT=8080
```

### Configuración de Meta Webhook

1. Ve a [Meta for Developers](https://developers.facebook.com/)
2. Crea una app de tipo "Business"
3. Agrega el producto "Messenger" o "WhatsApp"
4. Configura el webhook:
   - URL: `https://tu-dominio.com/webhook`
   - Token de verificación: El mismo que `META_VERIFY_TOKEN`
   - Suscripciones: `messages`, `messaging_postbacks`

### Configuración de MongoDB

1. Crea un cluster en [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Crea una base de datos llamada `ferreteria_db`
3. Crea las colecciones:
   - `products`: Catálogo de productos
   - `orders`: Pedidos de clientes
   - `knowledge`: Base de conocimiento

### Configuración de Pinecone (Opcional)

Si usas RAG para búsqueda semántica:

1. Crea una cuenta en [Pinecone](https://www.pinecone.io/)
2. Crea un índice con dimensión 1536 (para text-embedding-3-small)
3. Agrega las credenciales a `.env`

## 🚢 Despliegue

### Opción 1: Despliegue Rápido

```powershell
.\deploy.ps1
```

Este script:
- Construye la imagen Docker
- La sube a Google Container Registry
- Despliega en Cloud Run
- Configura variables de entorno

### Opción 2: Despliegue Seguro (Producción)

```powershell
.\deploy-secrets.ps1
```

Este script usa Google Secret Manager para mayor seguridad.

### Configuración Manual

Edita `deploy.ps1` o `deploy-secrets.ps1`:

```powershell
$PROJECT_ID = "tu-proyecto-gcp"
$SERVICE_NAME = "bot-ferreteria"
$REGION = "us-central1"
```

Ver [DEPLOYMENT.md](DEPLOYMENT.md) para guía completa.

## 📡 API Endpoints

### GET /
Endpoint de health check

**Response:**
```
API del Bot Ferretería está activa!
```

### GET /webhook
Verificación del webhook de Meta

**Query Parameters:**
- `hub.mode`: "subscribe"
- `hub.verify_token`: Token de verificación
- `hub.challenge`: Challenge de Meta

**Response:**
- 200: Devuelve el challenge
- 403: Token inválido

### POST /webhook
Recepción de mensajes de Meta

**Headers:**
- `X-Hub-Signature-256`: Firma HMAC SHA-256

**Body:**
```json
{
  "object": "page",
  "entry": [{
    "messaging": [{
      "sender": { "id": "USER_ID" },
      "message": {
        "text": "Hola",
        "quick_reply": { "payload": "MENU_PRODUCTOS" }
      }
    }]
  }]
}
```

**Response:**
- 200: EVENT_RECEIVED

## 💬 Flujo de Conversación

### 1. Usuario envía mensaje

```
Usuario: "Hola"
```

### 2. Bot procesa con contexto

```javascript
// message.service.js
const context = getConversationContext(senderId);
const response = await openai.chat.completions.create({
  model: "gpt-4",
  messages: context.messages
});
```

### 3. Bot responde con menú

```
Bot: "¡Hola! ¿En qué puedo ayudarte?"
[🛠️ Sobre productos]
[📦 Mis pedidos]
[ℹ️ Información]
```

### 4. Usuario selecciona opción

```
Usuario: [🛠️ Sobre productos]
```

### 5. Bot busca en base de conocimiento

```javascript
// rag.service.js
const results = await searchKnowledge(query);
const context = results.map(r => r.content).join('\n');
```

### 6. Bot genera respuesta contextual

```
Bot: "Tenemos estas categorías:
- Herramientas eléctricas
- Ferretería general
- Pinturas y acabados
¿Qué te interesa?"
```

## 🗄️ Base de Datos

### ¿Por qué MongoDB?

MongoDB se eligió por varias razones:

1. **Flexibilidad de Esquema**
   - Los mensajes y pedidos tienen estructuras variables
   - Fácil agregar nuevos campos sin migraciones

2. **Documentos Anidados**
   - Historial de conversaciones como array de mensajes
   - Productos en pedidos como subdocumentos

3. **Escalabilidad**
   - MongoDB Atlas ofrece escalado automático
   - Sharding para grandes volúmenes

4. **Consultas Rápidas**
   - Índices en campos frecuentes (userId, orderId)
   - Búsquedas por texto completo

5. **Integración con Node.js**
   - Mongoose proporciona ODM robusto
   - Validación de esquemas integrada

### Modelos de Datos

#### Products (Productos)

```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  price: Number,
  category: String,
  stock: Number,
  createdAt: Date
}
```

#### Orders (Pedidos)

```javascript
{
  _id: ObjectId,
  userId: String,
  products: [{
    productId: ObjectId,
    name: String,
    quantity: Number,
    price: Number
  }],
  total: Number,
  status: String, // 'pending', 'confirmed', 'delivered'
  createdAt: Date
}
```

#### Knowledge (Base de Conocimiento)

```javascript
{
  _id: ObjectId,
  content: String,
  category: String,
  metadata: Object,
  createdAt: Date
}
```

### Índices Recomendados

```javascript
// Products
db.products.createIndex({ name: "text", description: "text" });
db.products.createIndex({ category: 1 });

// Orders
db.orders.createIndex({ userId: 1, createdAt: -1 });
db.orders.createIndex({ status: 1 });

// Knowledge
db.knowledge.createIndex({ category: 1 });
```

## 🔒 Seguridad

### Verificación de Firma Meta

Todos los webhooks de Meta son verificados con HMAC SHA-256:

```javascript
// metaVerify.js
const signature = req.headers['x-hub-signature-256'];
const hash = crypto
  .createHmac('sha256', META_APP_SECRET)
  .update(rawBody)
  .digest('hex');
```

### Variables de Entorno

- Nunca commitear `.env`
- Usar Secret Manager en producción
- Rotar credenciales regularmente

### Validación de Entrada

- Sanitización de mensajes de usuario
- Validación de payloads de Quick Replies
- Rate limiting (recomendado)

## 📊 Monitoreo

### Logs en Cloud Run

```powershell
gcloud run services logs read bot-ferreteria --region us-central1 --follow
```

### Métricas Importantes

- Latencia de respuesta
- Tasa de errores 5xx
- Uso de memoria
- Número de solicitudes

### Alertas Recomendadas

- Error rate > 5%
- Latencia > 2 segundos
- Memoria > 80%

## 🧪 Testing

### Probar Localmente

1. Usar [ngrok](https://ngrok.com/) para exponer localhost:

```bash
ngrok http 8080
```

2. Configurar la URL de ngrok en Meta Developer Console

3. Enviar mensajes de prueba desde WhatsApp/Messenger

### Probar Webhook

```bash
curl -X POST https://tu-url.com/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "object": "page",
    "entry": [{
      "messaging": [{
        "sender": {"id": "123"},
        "message": {"text": "Hola"}
      }]
    }]
  }'
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Agrega nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📝 Mejoras Futuras

### Funcionalidades
- [ ] Soporte multiidioma
- [ ] Pagos integrados (Stripe/PayPal)
- [ ] Notificaciones push
- [ ] Panel de administración web
- [ ] Analytics de conversaciones

### Técnicas
- [ ] Tests unitarios y de integración
- [ ] CI/CD con GitHub Actions
- [ ] Rate limiting
- [ ] Cache con Redis
- [ ] Logs estructurados (Winston)

### IA
- [ ] Fine-tuning de GPT-4 con datos específicos
- [ ] Análisis de sentimiento
- [ ] Detección de intenciones mejorada
- [ ] Respuestas multimodales (imágenes)

## 📄 Licencia

Este proyecto es privado y confidencial.

## 👥 Autores

- Equipo de Desarrollo

## 📞 Soporte

Para soporte técnico, contactar a: [email de soporte]

---

**Nota**: Este README es un documento vivo y debe actualizarse conforme evoluciona el proyecto.
