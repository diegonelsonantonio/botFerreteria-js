# ❓ Preguntas Frecuentes (FAQ)

## Configuración Inicial

### ¿Cómo obtengo las credenciales de Meta?

1. Ve a [Meta for Developers](https://developers.facebook.com/)
2. Crea una app de tipo "Business"
3. Agrega el producto "Messenger" o "WhatsApp Business"
4. En "Settings > Basic" encontrarás:
   - App ID
   - App Secret
5. En "Messenger > Settings" genera el Page Access Token

### ¿Cómo configuro el webhook en Meta?

1. En tu app de Meta, ve a "Messenger > Settings"
2. En "Webhooks", haz clic en "Add Callback URL"
3. Ingresa:
   - URL: `https://tu-dominio.com/webhook`
   - Verify Token: El mismo que pusiste en `META_VERIFY_TOKEN`
4. Suscríbete a los eventos: `messages`, `messaging_postbacks`

### ¿Necesito una cuenta de pago en OpenAI?

Sí, necesitas una cuenta con créditos o método de pago configurado. El tier gratuito tiene límites muy bajos.

**Costos Estimados**:
- GPT-4: $0.03 por 1K tokens de entrada, $0.06 por 1K tokens de salida
- Embeddings: $0.0001 por 1K tokens
- Estimado mensual (100 usuarios activos): $50-100

### ¿MongoDB Atlas es gratis?

Sí, tienen un tier gratuito (M0) con:
- 512 MB de almacenamiento
- Conexiones compartidas
- Suficiente para desarrollo y MVP

Para producción, considera M2 o superior (~$9/mes).

---

## Desarrollo

### ¿Cómo pruebo el bot localmente?

1. Instala [ngrok](https://ngrok.com/):
```bash
ngrok http 8080
```

2. Copia la URL de ngrok (ej: `https://abc123.ngrok.io`)

3. Configúrala en Meta Developer Console como webhook URL

4. Inicia tu servidor local:
```bash
npm run dev
```

5. Envía mensajes desde WhatsApp/Messenger

### ¿Por qué no recibo mensajes en mi servidor?

**Checklist**:
- ✅ Servidor corriendo y accesible públicamente
- ✅ Webhook verificado en Meta (check verde)
- ✅ Suscrito a eventos `messages`
- ✅ Page Access Token válido
- ✅ Firma HMAC verificándose correctamente

**Debug**:
```javascript
// Agregar logs en webhook.controller.js
console.log('Webhook received:', JSON.stringify(req.body, null, 2));
```

### ¿Cómo veo los logs en Cloud Run?

```powershell
# Logs en tiempo real
gcloud run services logs read bot-ferreteria --region us-central1 --follow

# Últimos 50 logs
gcloud run services logs read bot-ferreteria --region us-central1 --limit 50

# Filtrar por error
gcloud run services logs read bot-ferreteria --region us-central1 | findstr "ERROR"
```

---

## Errores Comunes

### Error: "Signature verification failed"

**Causa**: La firma HMAC no coincide.

**Soluciones**:
1. Verifica que `META_APP_SECRET` sea correcto
2. Asegúrate de usar `express.raw()` en la ruta del webhook
3. No uses `express.json()` globalmente

```javascript
// ❌ INCORRECTO
app.use(express.json());
app.use('/webhook', webhookRoutes);

// ✅ CORRECTO
app.use('/webhook', webhookRoutes);
// Y en webhook.routes.js:
router.post('/', express.raw({ type: 'application/json' }), ...);
```

### Error: "MongoServerError: Authentication failed"

**Causa**: Credenciales de MongoDB incorrectas.

**Soluciones**:
1. Verifica usuario y contraseña en MongoDB Atlas
2. Asegúrate de que el usuario tenga permisos en la base de datos
3. Verifica que la IP esté en la whitelist (o usa 0.0.0.0/0 para permitir todas)
4. Revisa que `MONGO_URI` esté correctamente formateada

### Error: "OpenAI API rate limit exceeded"

**Causa**: Excediste el límite de requests por minuto.

**Soluciones**:
1. Implementa rate limiting en tu API
2. Usa cache para embeddings repetidos
3. Considera upgrade de tier en OpenAI
4. Implementa retry con exponential backoff

```javascript
async function callOpenAIWithRetry(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (error.status === 429 && i < maxRetries - 1) {
        await sleep(Math.pow(2, i) * 1000); // 1s, 2s, 4s
        continue;
      }
      throw error;
    }
  }
}
```

### Error: "Container failed to start"

**Causa**: Error en el Dockerfile o en el código al iniciar.

**Soluciones**:
1. Revisa los logs de Cloud Run
2. Prueba el Dockerfile localmente:
```bash
docker build -t test-bot .
docker run -p 8080:8080 --env-file .env test-bot
```
3. Verifica que todas las dependencias estén en `package.json`
4. Asegúrate de que el puerto sea 8080

### Error: "reserved env names were provided: PORT"

**Causa**: Intentas establecer la variable `PORT` en Cloud Run, pero es una variable reservada.

**Solución**: 
Cloud Run establece automáticamente `PORT=8080`. No la incluyas en tus variables de entorno. Los scripts de despliegue ya filtran esta variable automáticamente.

**Variables reservadas en Cloud Run**:
- `PORT` - Puerto del contenedor (siempre 8080)
- `K_SERVICE` - Nombre del servicio
- `K_REVISION` - Nombre de la revisión
- `K_CONFIGURATION` - Nombre de la configuración

---

## Despliegue

### ¿Cuánto cuesta Cloud Run?

**Pricing**:
- Primeras 2 millones de requests/mes: GRATIS
- CPU: $0.00002400 por vCPU-segundo
- Memoria: $0.00000250 por GiB-segundo
- Requests: $0.40 por millón

**Estimado para 1000 usuarios/mes**:
- ~10,000 requests
- ~5 segundos promedio por request
- Costo: ~$2-5/mes

**Escala a cero**: Si no hay tráfico, no pagas.

### ¿Cómo actualizo el bot en producción?

**Opción 1: Script automático**
```powershell
.\deploy.ps1
```

**Opción 2: Manual**
```powershell
# 1. Construir imagen
docker build -t gcr.io/tu-proyecto/bot-ferreteria .

# 2. Subir a GCR
docker push gcr.io/tu-proyecto/bot-ferreteria

# 3. Desplegar
gcloud run deploy bot-ferreteria \
  --image gcr.io/tu-proyecto/bot-ferreteria \
  --region us-central1
```

**Opción 3: CI/CD (recomendado)**
- Push a `main` branch
- GitHub Actions despliega automáticamente

### ¿Cómo hago rollback si algo sale mal?

```powershell
# Listar revisiones
gcloud run revisions list --service bot-ferreteria --region us-central1

# Hacer rollback a revisión anterior
gcloud run services update-traffic bot-ferreteria \
  --to-revisions REVISION_NAME=100 \
  --region us-central1
```

### ¿Puedo usar otro proveedor en lugar de Google Cloud?

Sí, el bot es portable. Opciones:

**AWS**:
- ECS Fargate (similar a Cloud Run)
- Lambda (requiere adaptaciones)
- Elastic Beanstalk

**Azure**:
- Container Instances
- App Service

**Heroku**:
- Más simple pero más caro
- Buen para MVP

**VPS (DigitalOcean, Linode)**:
- Más control
- Requiere más mantenimiento

---

## Funcionalidad

### ¿Cómo agrego nuevos productos?

**Opción 1: Directamente en MongoDB**
```javascript
// Script: scripts/addProduct.js
import Product from './src/core/models/products.model.js';

await Product.create({
  name: 'Martillo',
  description: 'Martillo de acero 500g',
  price: 150,
  category: 'Herramientas',
  stock: 50
});
```

**Opción 2: API endpoint (crear uno nuevo)**
```javascript
// POST /api/products
router.post('/products', async (req, res) => {
  const product = await Product.create(req.body);
  res.json(product);
});
```

**Opción 3: Panel de administración** (mejora futura)

### ¿Cómo personalizo las respuestas del bot?

Edita el system prompt en `message.service.js`:

```javascript
const systemPrompt = `
Eres un asistente virtual de una ferretería llamada "Ferretería El Martillo".

Características:
- Amigable y profesional
- Experto en herramientas y construcción
- Ayudas a encontrar productos
- Procesas pedidos

Tono: Casual pero profesional, usa emojis ocasionalmente.

Información de la tienda:
- Horario: Lunes a Sábado 8am-6pm
- Ubicación: Av. Principal 123, Ciudad
- Teléfono: +52 123 456 7890
- Envíos: Gratis en compras mayores a $500
`;
```

### ¿Cómo agrego nuevas funcionalidades al menú?

En `message.service.js`, agrega nuevos payloads:

```javascript
// Agregar botón
const quickReplies = [
  { content_type: 'text', title: '🛠️ Productos', payload: 'MENU_PRODUCTOS' },
  { content_type: 'text', title: '📦 Pedidos', payload: 'MENU_PEDIDOS' },
  { content_type: 'text', title: '🎁 Promociones', payload: 'MENU_PROMOS' }, // NUEVO
];

// Manejar payload
if (payload === 'MENU_PROMOS') {
  await handlePromotionsMenu(senderId);
}

async function handlePromotionsMenu(senderId) {
  const promos = await getActivePromotions();
  const message = formatPromotions(promos);
  await sendMessage(senderId, message);
}
```

### ¿El bot soporta imágenes?

Actualmente solo texto. Para agregar imágenes:

```javascript
async function sendImageMessage(recipientId, imageUrl, caption) {
  await fetch(`https://graph.facebook.com/v18.0/me/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${META_PAGE_ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      recipient: { id: recipientId },
      message: {
        attachment: {
          type: 'image',
          payload: { url: imageUrl }
        }
      }
    })
  });
}

// Uso
await sendImageMessage(senderId, product.imageUrl, product.name);
```

---

## Seguridad

### ¿Es seguro guardar credenciales en .env?

**En desarrollo**: Sí, pero nunca commitees `.env` a Git.

**En producción**: Usa Secret Manager:
```powershell
# Crear secreto
gcloud secrets create OPENAI_API_KEY --data-file=-
# (pega tu API key y presiona Ctrl+D)

# Usar en Cloud Run
gcloud run deploy bot-ferreteria \
  --set-secrets OPENAI_API_KEY=OPENAI_API_KEY:latest
```

### ¿Cómo protejo mi API de ataques?

1. **Rate Limiting** (ver IMPROVEMENTS.md)
2. **Verificación de firma Meta** (ya implementado)
3. **HTTPS** (obligatorio en Cloud Run)
4. **Validación de input**:
```javascript
import validator from 'validator';

function sanitizeInput(text) {
  return validator.escape(text).substring(0, 1000);
}
```

### ¿Debo preocuparme por GDPR/privacidad?

Sí, si tienes usuarios en Europa. Consideraciones:

1. **Consentimiento**: Pide permiso para guardar datos
2. **Derecho al olvido**: Permite eliminar datos
3. **Transparencia**: Explica qué datos guardas
4. **Seguridad**: Encripta datos sensibles

```javascript
// Agregar comando para eliminar datos
if (text === '/eliminar_mis_datos') {
  await deleteUserData(senderId);
  await sendMessage(senderId, 'Tus datos han sido eliminados.');
}
```

---

## Performance

### ¿Por qué el bot responde lento?

**Causas comunes**:
1. OpenAI API lenta (2-5 segundos)
2. MongoDB query sin índices
3. Cold start de Cloud Run
4. Búsqueda en Pinecone lenta

**Soluciones**:
1. Usa `gpt-3.5-turbo` en lugar de `gpt-4` (más rápido)
2. Agrega índices en MongoDB
3. Mantén 1 instancia mínima en Cloud Run (cuesta más)
4. Implementa cache

### ¿Cómo optimizo los costos de OpenAI?

1. **Cache de respuestas comunes**:
```javascript
const commonQuestions = {
  'horario': 'Lunes a Sábado 8am-6pm',
  'ubicación': 'Av. Principal 123',
  // ...
};

if (commonQuestions[text.toLowerCase()]) {
  return commonQuestions[text.toLowerCase()];
}
```

2. **Usa GPT-3.5 cuando sea posible**
3. **Limita el contexto** (max 10 mensajes)
4. **Cache de embeddings** (ver IMPROVEMENTS.md)

### ¿Cuántos usuarios puede manejar?

**Configuración actual**:
- Max 10 instancias
- 512 MB RAM cada una
- ~10 requests/segundo por instancia
- **Total: ~100 requests/segundo = ~6000 usuarios concurrentes**

**Para escalar más**:
- Aumenta max instancias
- Aumenta memoria/CPU
- Implementa queue system
- Usa Redis para contexto

---

## Troubleshooting

### El bot no responde

**Checklist**:
1. ✅ Servidor corriendo: `gcloud run services list`
2. ✅ Logs sin errores: `gcloud run services logs read ...`
3. ✅ Webhook verificado en Meta
4. ✅ Variables de entorno correctas
5. ✅ OpenAI API key válida
6. ✅ MongoDB conectado

### El bot responde pero con errores

**Debug**:
```javascript
// Agregar try-catch detallado
try {
  await processMessage(senderId, text, payload);
} catch (error) {
  console.error('Error processing message:', {
    error: error.message,
    stack: error.stack,
    senderId,
    text
  });
  
  // Enviar mensaje de error al usuario
  await sendMessage(senderId, 'Lo siento, ocurrió un error. Intenta de nuevo.');
}
```

### MongoDB se desconecta

**Causa**: Timeout de conexión.

**Solución**:
```javascript
// En database.js
mongoose.connect(MONGO_URI, {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  keepAlive: true,
  keepAliveInitialDelay: 300000
});

// Reconectar automáticamente
mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected, reconnecting...');
  setTimeout(() => initDB(), 5000);
});
```

---

## Soporte

### ¿Dónde puedo obtener ayuda?

1. **Documentación**:
   - [README.md](README.md)
   - [ARCHITECTURE.md](ARCHITECTURE.md)
   - [DEPLOYMENT.md](DEPLOYMENT.md)

2. **Logs**: Revisa siempre los logs primero

3. **Comunidad**:
   - Stack Overflow
   - Discord de OpenAI
   - Foros de Meta Developers

4. **Soporte Oficial**:
   - [OpenAI Support](https://help.openai.com/)
   - [Meta Developer Support](https://developers.facebook.com/support/)
   - [Google Cloud Support](https://cloud.google.com/support)

### ¿Cómo reporto un bug?

1. Reproduce el error
2. Captura los logs
3. Documenta los pasos
4. Crea un issue con:
   - Descripción del problema
   - Pasos para reproducir
   - Logs relevantes
   - Comportamiento esperado vs actual

---

## Contribución

### ¿Puedo contribuir al proyecto?

¡Sí! Ver [IMPROVEMENTS.md](IMPROVEMENTS.md) para ideas.

**Proceso**:
1. Fork el repo
2. Crea una rama: `git checkout -b feature/nueva-funcionalidad`
3. Haz tus cambios
4. Agrega tests
5. Commit: `git commit -am 'Agrega nueva funcionalidad'`
6. Push: `git push origin feature/nueva-funcionalidad`
7. Abre un Pull Request

### ¿Qué mejoras son prioritarias?

Ver [IMPROVEMENTS.md](IMPROVEMENTS.md) sección "Prioridad Alta".

---

¿Tienes más preguntas? Abre un issue en el repositorio.
