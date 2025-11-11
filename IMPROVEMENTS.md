# 🚀 Mejoras Sugeridas - Bot Ferretería

## Prioridad Alta (Implementar Pronto)

### 1. Redis para Gestión de Contexto

**Problema Actual**: Los contextos de conversación se guardan en memoria (Map), lo que no escala horizontalmente.

**Solución**:
```javascript
// Instalar: npm install ioredis
import Redis from 'ioredis';
const redis = new Redis(process.env.REDIS_URL);

export async function getConversationContext(userId) {
  const key = `context:${userId}`;
  const context = await redis.get(key);
  
  if (context) {
    return JSON.parse(context);
  }
  
  const newContext = createNewContext();
  await redis.setex(key, 3600, JSON.stringify(newContext)); // TTL 1 hora
  return newContext;
}
```

**Beneficios**:
- Contexto compartido entre instancias
- TTL automático (limpieza)
- Persistencia opcional
- Escalabilidad horizontal

**Costo**: ~$10/mes (Redis Cloud)

---

### 2. Rate Limiting

**Problema Actual**: Sin protección contra abuso o ataques DDoS.

**Solución**:
```javascript
// Instalar: npm install express-rate-limit
import rateLimit from 'express-rate-limit';

const webhookLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 60, // 60 requests por minuto por IP
  message: 'Demasiadas solicitudes, intenta más tarde',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/webhook', webhookLimiter);
```

**Beneficios**:
- Protección contra spam
- Reduce costos de OpenAI
- Mejora estabilidad

---

### 3. Logging Estructurado

**Problema Actual**: console.log() no es suficiente para producción.

**Solución**:
```javascript
// Instalar: npm install winston
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Uso
logger.info('Message processed', { 
  userId: senderId, 
  duration: 150,
  success: true 
});
```

**Beneficios**:
- Logs estructurados (JSON)
- Niveles de log (info, warn, error)
- Fácil integración con Cloud Logging
- Búsqueda y análisis mejorados

---

### 4. Manejo de Errores Mejorado

**Problema Actual**: Errores genéricos, difícil debugging.

**Solución**:
```javascript
// src/utils/errors.js
export class AppError extends Error {
  constructor(message, statusCode, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(resource) {
    super(`${resource} no encontrado`, 404);
  }
}

export class ValidationError extends AppError {
  constructor(message) {
    super(message, 400);
  }
}

// Uso en servicios
if (!product) {
  throw new NotFoundError('Producto');
}

// Middleware de error mejorado
export const errorHandler = (err, req, res, next) => {
  logger.error('Error occurred', {
    message: err.message,
    stack: err.stack,
    statusCode: err.statusCode
  });
  
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: 'error',
      message: err.message
    });
  } else {
    res.status(500).json({
      status: 'error',
      message: 'Algo salió mal'
    });
  }
};
```

---

## Prioridad Media (Próximos 3 Meses)

### 5. Queue System para Mensajes

**Problema Actual**: Procesamiento síncrono puede causar timeouts.

**Solución**:
```javascript
// Instalar: npm install bull
import Queue from 'bull';

const messageQueue = new Queue('messages', {
  redis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT
  }
});

// En controller
export const postWebhook = async (req, res) => {
  res.status(200).send('EVENT_RECEIVED');
  
  const { senderId, text, payload } = extractMessageData(req.body);
  await messageQueue.add({ senderId, text, payload });
};

// Worker (puede estar en otro proceso/servidor)
messageQueue.process(async (job) => {
  const { senderId, text, payload } = job.data;
  await processMessage(senderId, text, payload);
});

// Retry automático
messageQueue.on('failed', (job, err) => {
  logger.error('Job failed', { jobId: job.id, error: err.message });
});
```

**Beneficios**:
- Respuesta inmediata a Meta
- Retry automático en fallos
- Priorización de mensajes
- Escalabilidad (múltiples workers)

---

### 6. Cache de Embeddings

**Problema Actual**: Crear embeddings es costoso ($0.0001 por 1K tokens).

**Solución**:
```javascript
import crypto from 'crypto';

function hashText(text) {
  return crypto.createHash('md5').update(text).digest('hex');
}

export async function getEmbedding(text) {
  const cacheKey = `emb:${hashText(text)}`;
  
  // Intentar obtener del cache
  const cached = await redis.get(cacheKey);
  if (cached) {
    logger.info('Embedding cache hit');
    return JSON.parse(cached);
  }
  
  // Crear nuevo embedding
  logger.info('Embedding cache miss');
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text
  });
  
  const embedding = response.data[0].embedding;
  
  // Guardar en cache (24 horas)
  await redis.setex(cacheKey, 86400, JSON.stringify(embedding));
  
  return embedding;
}
```

**Ahorro Estimado**: 80-90% de costos de embeddings.

---

### 7. Tests Automatizados

**Problema Actual**: Sin tests, riesgo de regresiones.

**Solución**:
```javascript
// Instalar: npm install --save-dev jest supertest
// package.json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch"
  }
}

// tests/webhook.test.js
import request from 'supertest';
import app from '../src/app.js';

describe('Webhook Endpoints', () => {
  describe('GET /webhook', () => {
    it('should verify webhook with correct token', async () => {
      const response = await request(app)
        .get('/webhook')
        .query({
          'hub.mode': 'subscribe',
          'hub.verify_token': process.env.META_VERIFY_TOKEN,
          'hub.challenge': 'test_challenge'
        });
      
      expect(response.status).toBe(200);
      expect(response.text).toBe('test_challenge');
    });
    
    it('should reject with incorrect token', async () => {
      const response = await request(app)
        .get('/webhook')
        .query({
          'hub.mode': 'subscribe',
          'hub.verify_token': 'wrong_token',
          'hub.challenge': 'test_challenge'
        });
      
      expect(response.status).toBe(403);
    });
  });
});

// tests/services/message.service.test.js
import { processMessage } from '../../src/core/services/message.service.js';

jest.mock('../../src/config/openai.js');

describe('Message Service', () => {
  it('should process text message', async () => {
    const senderId = 'test_user_123';
    const text = 'Hola';
    
    await processMessage(senderId, text, null);
    
    // Verificar que se llamó a OpenAI
    expect(openai.chat.completions.create).toHaveBeenCalled();
  });
});
```

**Cobertura Objetivo**: 70%+

---

### 8. Monitoreo y Alertas

**Problema Actual**: Sin visibilidad de problemas en producción.

**Solución**:
```javascript
// Instalar: npm install @google-cloud/monitoring
import { MetricServiceClient } from '@google-cloud/monitoring';

const client = new MetricServiceClient();

export async function recordMetric(metricType, value) {
  const dataPoint = {
    interval: {
      endTime: { seconds: Date.now() / 1000 }
    },
    value: { doubleValue: value }
  };
  
  const timeSeriesData = {
    metric: {
      type: `custom.googleapis.com/${metricType}`
    },
    resource: {
      type: 'global'
    },
    points: [dataPoint]
  };
  
  await client.createTimeSeries({
    name: client.projectPath(PROJECT_ID),
    timeSeries: [timeSeriesData]
  });
}

// Uso
await recordMetric('message_processing_time', duration);
await recordMetric('openai_api_calls', 1);
```

**Alertas Recomendadas**:
- Error rate > 5%
- Latencia p95 > 2s
- Memoria > 80%
- OpenAI API errors

---

## Prioridad Baja (Futuro)

### 9. Panel de Administración Web

**Funcionalidades**:
- Dashboard con métricas
- Gestión de productos
- Ver conversaciones
- Gestión de pedidos
- Configuración del bot

**Stack Sugerido**:
- Frontend: React + Tailwind CSS
- Backend: Misma API + nuevos endpoints
- Auth: Firebase Auth o Auth0

---

### 10. Análisis de Sentimiento

**Objetivo**: Detectar clientes insatisfechos.

**Solución**:
```javascript
// Usar OpenAI para análisis
async function analyzeSentiment(text) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{
      role: 'system',
      content: 'Analiza el sentimiento: positivo, neutral o negativo'
    }, {
      role: 'user',
      content: text
    }]
  });
  
  return response.choices[0].message.content;
}

// Alertar si negativo
if (sentiment === 'negativo') {
  await notifySupport(senderId, text);
}
```

---

### 11. Soporte Multiidioma

**Objetivo**: Atender clientes en inglés, portugués, etc.

**Solución**:
```javascript
// Detectar idioma
async function detectLanguage(text) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{
      role: 'system',
      content: 'Detecta el idioma: es, en, pt'
    }, {
      role: 'user',
      content: text
    }]
  });
  
  return response.choices[0].message.content;
}

// Responder en mismo idioma
const language = await detectLanguage(text);
const systemPrompt = prompts[language];
```

---

### 12. Integración de Pagos

**Objetivo**: Permitir pago directo en el chat.

**Opciones**:
- Stripe
- PayPal
- Mercado Pago (LATAM)

**Flujo**:
1. Usuario confirma pedido
2. Bot genera link de pago
3. Usuario paga
4. Webhook confirma pago
5. Bot actualiza pedido

---

### 13. Notificaciones Proactivas

**Objetivo**: Enviar mensajes sin que el usuario inicie.

**Casos de Uso**:
- Confirmación de pedido
- Actualización de envío
- Promociones
- Recordatorios

**Requisitos**:
- Aprobación de Meta
- Plantillas pre-aprobadas
- Ventana de 24h después de último mensaje

---

### 14. Analytics Avanzado

**Métricas a Trackear**:
- Tasa de conversión (mensaje → pedido)
- Tiempo promedio de respuesta
- Temas más consultados
- Productos más buscados
- Abandono de carrito

**Herramientas**:
- Google Analytics
- Mixpanel
- Amplitude

---

### 15. A/B Testing

**Objetivo**: Optimizar respuestas del bot.

**Ejemplos**:
- Probar diferentes prompts
- Variaciones de menú
- Tono de respuestas

**Implementación**:
```javascript
function getPromptVariant(userId) {
  const variant = hash(userId) % 2; // 50/50 split
  return variant === 0 ? promptA : promptB;
}

// Trackear resultados
await recordMetric('conversion_rate', {
  variant: 'A',
  converted: true
});
```

---

## Mejoras de Infraestructura

### 16. CI/CD Pipeline

**Objetivo**: Despliegues automáticos y seguros.

**Herramientas**: GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy to Cloud Run

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Cloud SDK
        uses: google-github-actions/setup-gcloud@v0
        
      - name: Build and Push
        run: |
          gcloud builds submit --tag gcr.io/$PROJECT_ID/$SERVICE_NAME
          
      - name: Deploy
        run: |
          gcloud run deploy $SERVICE_NAME \
            --image gcr.io/$PROJECT_ID/$SERVICE_NAME \
            --region us-central1
```

---

### 17. Staging Environment

**Objetivo**: Probar cambios antes de producción.

**Setup**:
- Servicio separado en Cloud Run
- Base de datos de staging
- Variables de entorno diferentes

---

### 18. Backup Automático

**Objetivo**: Proteger datos críticos.

**Solución**:
```javascript
// Script de backup diario
import { exec } from 'child_process';

async function backupMongoDB() {
  const date = new Date().toISOString().split('T')[0];
  const filename = `backup-${date}.gz`;
  
  exec(`mongodump --uri="${MONGO_URI}" --gzip --archive=${filename}`, 
    (error, stdout, stderr) => {
      if (error) {
        logger.error('Backup failed', { error });
      } else {
        logger.info('Backup completed', { filename });
        // Subir a Cloud Storage
        uploadToGCS(filename);
      }
    }
  );
}

// Cron job diario
cron.schedule('0 2 * * *', backupMongoDB); // 2 AM diario
```

---

## Resumen de Costos Estimados

| Mejora | Costo Mensual | ROI |
|--------|---------------|-----|
| Redis | $10 | Alto - Escalabilidad |
| Rate Limiting | $0 | Alto - Seguridad |
| Logging | $5 | Alto - Debugging |
| Queue System | $10 | Medio - Confiabilidad |
| Cache Embeddings | -$50 | Alto - Ahorro |
| Tests | $0 | Alto - Calidad |
| Monitoring | $20 | Alto - Visibilidad |
| Panel Admin | $100 | Medio - Productividad |

**Total Estimado**: $95/mes (ahorrando $50 en embeddings = $45 neto)

---

## Roadmap Sugerido

### Mes 1
- ✅ Redis para contexto
- ✅ Rate limiting
- ✅ Logging estructurado
- ✅ Manejo de errores

### Mes 2
- ✅ Queue system
- ✅ Cache de embeddings
- ✅ Tests básicos
- ✅ Monitoreo

### Mes 3
- ✅ CI/CD
- ✅ Staging environment
- ✅ Backups automáticos

### Mes 4-6
- Panel de administración
- Análisis de sentimiento
- Notificaciones proactivas

### Mes 7-12
- Multiidioma
- Integración de pagos
- Analytics avanzado
- A/B testing

---

## Conclusión

Estas mejoras transformarán el bot de un MVP funcional a un sistema robusto de producción. Prioriza según:

1. **Urgencia**: Seguridad y estabilidad primero
2. **Impacto**: Mejoras que afectan a más usuarios
3. **Costo**: Balance entre inversión y beneficio

El bot actual es sólido, estas mejoras lo llevarán al siguiente nivel.
