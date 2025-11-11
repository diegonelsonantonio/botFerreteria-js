# ✅ Checklist de Producción - Bot Ferretería

Lista de verificación completa antes de lanzar a producción.

## 🔐 Seguridad

### Credenciales
- [ ] Todas las credenciales están en variables de entorno
- [ ] Archivo `.env` está en `.gitignore`
- [ ] No hay API keys hardcodeadas en el código
- [ ] Secret Manager configurado en GCP (recomendado)
- [ ] Credenciales rotadas recientemente

### Autenticación y Autorización
- [ ] Verificación de firma HMAC implementada
- [ ] Webhook de Meta verificado correctamente
- [ ] HTTPS habilitado (obligatorio en Cloud Run)
- [ ] Rate limiting implementado (recomendado)

### Validación de Datos
- [ ] Input sanitization en mensajes de usuario
- [ ] Validación de payloads de Quick Replies
- [ ] Límites de tamaño en requests
- [ ] Manejo seguro de errores (sin exponer detalles internos)

## 🗄️ Base de Datos

### MongoDB
- [ ] Conexión a MongoDB Atlas configurada
- [ ] Base de datos creada (`ferreteria_db`)
- [ ] Colecciones creadas:
  - [ ] `products`
  - [ ] `orders`
  - [ ] `knowledge`
- [ ] Índices creados:
  - [ ] `products`: text index en name y description
  - [ ] `products`: index en category
  - [ ] `orders`: index en userId y createdAt
- [ ] IP whitelist configurada (o 0.0.0.0/0 para Cloud Run)
- [ ] Usuario con permisos correctos
- [ ] Backups automáticos habilitados
- [ ] Datos de prueba cargados (opcional)

### Pinecone (si se usa)
- [ ] Índice creado con dimensión correcta (1536)
- [ ] Datos embebidos y cargados
- [ ] API key configurada

## 🤖 Integraciones

### Meta (Facebook/WhatsApp)
- [ ] App de Meta creada
- [ ] Producto Messenger/WhatsApp agregado
- [ ] Page Access Token generado
- [ ] App Secret obtenido
- [ ] Webhook configurado:
  - [ ] URL: `https://tu-dominio.run.app/webhook`
  - [ ] Verify Token configurado
  - [ ] Suscripciones: `messages`, `messaging_postbacks`
- [ ] Webhook verificado (check verde en Meta)
- [ ] Página de Facebook conectada
- [ ] Número de WhatsApp Business conectado (si aplica)
- [ ] Permisos de la app aprobados

### OpenAI
- [ ] API key válida
- [ ] Créditos o método de pago configurado
- [ ] Rate limits entendidos
- [ ] Modelo correcto configurado (gpt-4 o gpt-3.5-turbo)

## ☁️ Google Cloud

### Proyecto
- [ ] Proyecto de GCP creado
- [ ] Facturación habilitada
- [ ] APIs habilitadas:
  - [ ] Cloud Run API
  - [ ] Cloud Build API
  - [ ] Container Registry API
  - [ ] Secret Manager API (si se usa)

### Cloud Run
- [ ] Servicio desplegado
- [ ] Variables de entorno configuradas
- [ ] Memoria suficiente (512Mi mínimo)
- [ ] CPU configurada (1 vCPU mínimo)
- [ ] Instancias mínimas/máximas configuradas
- [ ] Puerto 8080 configurado
- [ ] Allow unauthenticated habilitado
- [ ] Región seleccionada (us-central1 recomendado)
- [ ] URL del servicio obtenida

### Monitoreo
- [ ] Logs configurados
- [ ] Alertas configuradas (recomendado):
  - [ ] Error rate > 5%
  - [ ] Latencia > 2s
  - [ ] Memoria > 80%
- [ ] Dashboard de métricas creado (opcional)

## 🧪 Testing

### Tests Funcionales
- [ ] Webhook GET funciona (verificación)
- [ ] Webhook POST funciona (recepción de mensajes)
- [ ] Bot responde a mensaje simple
- [ ] Bot responde a Quick Reply
- [ ] Búsqueda de productos funciona
- [ ] Creación de pedidos funciona
- [ ] Menú interactivo funciona
- [ ] Manejo de errores funciona

### Tests de Integración
- [ ] Conexión a MongoDB exitosa
- [ ] Conexión a OpenAI exitosa
- [ ] Conexión a Pinecone exitosa (si aplica)
- [ ] Envío de mensajes a Meta exitoso

### Tests de Carga (opcional)
- [ ] Probado con múltiples usuarios simultáneos
- [ ] Tiempo de respuesta aceptable (< 3s)
- [ ] Sin memory leaks
- [ ] Auto-scaling funciona

## 📝 Documentación

### Código
- [ ] README.md actualizado
- [ ] Comentarios en código crítico
- [ ] Variables de entorno documentadas en .env.example
- [ ] API endpoints documentados

### Operacional
- [ ] Guía de despliegue disponible
- [ ] Procedimientos de rollback documentados
- [ ] Contactos de soporte definidos
- [ ] Runbook de incidentes creado (recomendado)

## 🚀 Despliegue

### Pre-Despliegue
- [ ] Código en repositorio Git
- [ ] Branch de producción creada (main/master)
- [ ] Versión taggeada (v1.0.0)
- [ ] CHANGELOG.md actualizado

### Despliegue
- [ ] Script de despliegue probado
- [ ] Despliegue en staging exitoso (recomendado)
- [ ] Despliegue en producción ejecutado
- [ ] Verificación post-despliegue realizada
- [ ] Rollback plan listo

### Post-Despliegue
- [ ] Servicio accesible públicamente
- [ ] Healthcheck pasando
- [ ] Logs sin errores críticos
- [ ] Métricas normales
- [ ] Usuarios pueden interactuar

## 📊 Monitoreo Continuo

### Métricas a Vigilar
- [ ] Uptime (objetivo: 99.9%)
- [ ] Latencia (objetivo: < 2s p95)
- [ ] Error rate (objetivo: < 1%)
- [ ] Uso de memoria (objetivo: < 70%)
- [ ] Costos (presupuesto definido)

### Alertas Configuradas
- [ ] Downtime > 5 minutos
- [ ] Error rate > 5%
- [ ] Latencia > 3s
- [ ] Memoria > 80%
- [ ] Costos > presupuesto

## 💰 Costos

### Estimación
- [ ] Costos de Cloud Run calculados
- [ ] Costos de MongoDB calculados
- [ ] Costos de OpenAI calculados
- [ ] Costos de Pinecone calculados (si aplica)
- [ ] Presupuesto mensual definido
- [ ] Alertas de presupuesto configuradas

### Optimización
- [ ] Cache implementado (recomendado)
- [ ] Rate limiting implementado (recomendado)
- [ ] Instancias mínimas = 0 (para ahorrar)
- [ ] Embeddings cacheados (recomendado)

## 🔄 Mantenimiento

### Backups
- [ ] Backups de MongoDB configurados
- [ ] Frecuencia de backups definida (diario recomendado)
- [ ] Procedimiento de restore probado
- [ ] Backups almacenados en ubicación segura

### Actualizaciones
- [ ] Proceso de actualización definido
- [ ] Ventana de mantenimiento definida
- [ ] Notificación a usuarios planificada
- [ ] Procedimiento de rollback documentado

### Seguridad
- [ ] Plan de rotación de credenciales definido
- [ ] Auditorías de seguridad programadas
- [ ] Actualizaciones de dependencias planificadas
- [ ] Respuesta a incidentes documentada

## 📱 Experiencia de Usuario

### Conversación
- [ ] Respuestas son coherentes
- [ ] Tono es apropiado
- [ ] Menú es intuitivo
- [ ] Errores se manejan gracefully
- [ ] Tiempos de respuesta aceptables

### Funcionalidad
- [ ] Búsqueda de productos funciona bien
- [ ] Pedidos se crean correctamente
- [ ] Información de tienda es precisa
- [ ] Quick Replies funcionan
- [ ] Contexto se mantiene entre mensajes

## 🎯 Métricas de Negocio

### KPIs Definidos
- [ ] Tasa de conversión objetivo definida
- [ ] Satisfacción del cliente objetivo definida
- [ ] Tiempo de respuesta objetivo definido
- [ ] Volumen de mensajes esperado definido

### Tracking
- [ ] Analytics configurado (opcional)
- [ ] Conversiones trackeadas
- [ ] Feedback de usuarios recopilado
- [ ] Métricas revisadas regularmente

## 🚨 Plan de Contingencia

### Escenarios
- [ ] Plan si OpenAI está caído
- [ ] Plan si MongoDB está caído
- [ ] Plan si Cloud Run está caído
- [ ] Plan si Meta API está caída

### Comunicación
- [ ] Canal de comunicación de incidentes definido
- [ ] Contactos de emergencia listados
- [ ] Procedimiento de escalación definido
- [ ] Plantillas de comunicación preparadas

## ✅ Aprobaciones

### Técnicas
- [ ] Code review completado
- [ ] Tests pasando
- [ ] Seguridad revisada
- [ ] Performance aceptable

### Negocio
- [ ] Product Owner aprueba
- [ ] Stakeholders informados
- [ ] Presupuesto aprobado
- [ ] Go-live date confirmado

---

## 🎉 Listo para Producción

Una vez que todos los items estén marcados:

1. **Ejecutar despliegue final**:
```powershell
.\deploy.ps1
```

2. **Verificar funcionamiento**:
```powershell
# Probar endpoint
curl https://tu-servicio.run.app/

# Ver logs
gcloud run services logs read bot-ferreteria --region us-central1 --follow
```

3. **Enviar mensaje de prueba** desde WhatsApp/Messenger

4. **Monitorear durante las primeras 24 horas**

5. **Celebrar** 🎊

---

## 📋 Checklist Rápido

Para verificación rápida antes de cada despliegue:

```
[ ] Código commiteado y pusheado
[ ] Tests pasando
[ ] Variables de entorno actualizadas
[ ] Documentación actualizada
[ ] Stakeholders notificados
[ ] Backup reciente disponible
[ ] Rollback plan listo
[ ] Monitoreo activo
```

---

**Última actualización**: 11 de Noviembre, 2025  
**Versión**: 1.0.0

**Nota**: Este checklist debe revisarse y actualizarse regularmente conforme el proyecto evoluciona.
