# Guía de Despliegue en Google Cloud Run

## Requisitos Previos

1. **Google Cloud SDK (gcloud CLI)**
   - Descargar desde: https://cloud.google.com/sdk/docs/install
   - Verificar instalación: `gcloud --version`

2. **Docker Desktop**
   - Descargar desde: https://www.docker.com/products/docker-desktop
   - Verificar instalación: `docker --version`

3. **Cuenta de Google Cloud Platform**
   - Crear proyecto en: https://console.cloud.google.com
   - Habilitar facturación

## Configuración Inicial

### 1. Autenticarse en Google Cloud

```powershell
gcloud auth login
```

### 2. Configurar el Proyecto

Edita el archivo `deploy-cloudrun.ps1` y actualiza:

```powershell
$PROJECT_ID = "tu-proyecto-gcp"  # Cambia esto por tu ID de proyecto
$SERVICE_NAME = "bot-ferreteria-api"
$REGION = "us-central1"  # O la región que prefieras
```

### 3. Cargar Variables de Entorno

Asegúrate de que tu archivo `.env` esté configurado correctamente con todas las credenciales.

## Métodos de Despliegue

### Opción 1: Despliegue Estándar (Recomendado para desarrollo)

Este método pasa las variables de entorno directamente:

```powershell
.\deploy-cloudrun.ps1
```

**Ventajas:**
- Más rápido
- Más simple

**Desventajas:**
- Las variables quedan visibles en la configuración del servicio

### Opción 2: Despliegue con Secret Manager (Recomendado para producción)

Este método usa Google Secret Manager para mayor seguridad:

```powershell
.\deploy-cloudrun-secrets.ps1
```

**Ventajas:**
- Más seguro
- Secretos encriptados
- Mejor para producción

**Desventajas:**
- Requiere configuración adicional
- Puede tener costos adicionales

## Verificación del Despliegue

### Ver logs en tiempo real

```powershell
gcloud run services logs read bot-ferreteria-api --region us-central1 --follow
```

### Ver detalles del servicio

```powershell
gcloud run services describe bot-ferreteria-api --region us-central1
```

### Probar el servicio

```powershell
curl https://tu-servicio-url.run.app/webhook
```

## Actualizar el Despliegue

Para actualizar tu aplicación después de hacer cambios:

```powershell
.\deploy-cloudrun.ps1
```

El script automáticamente:
1. Construye una nueva imagen
2. La sube a Container Registry
3. Actualiza el servicio en Cloud Run

## Configuración de Webhook de Meta

Una vez desplegado, actualiza la URL del webhook en Meta Developer Console:

1. Ve a: https://developers.facebook.com/apps
2. Selecciona tu app
3. Ve a Webhooks
4. Actualiza la URL de callback a: `https://tu-servicio-url.run.app/webhook`
5. Usa el token de verificación de tu `.env`

## Comandos Útiles

### Eliminar el servicio

```powershell
gcloud run services delete bot-ferreteria-api --region us-central1
```

### Ver todos los servicios

```powershell
gcloud run services list
```

### Ver imágenes en Container Registry

```powershell
gcloud container images list
```

### Eliminar imágenes antiguas

```powershell
gcloud container images delete gcr.io/tu-proyecto-gcp/bot-ferreteria-api:TAG
```

## Variables de Entorno en Cloud Run

**Importante**: Cloud Run establece automáticamente algunas variables de entorno que NO debes incluir en tu configuración:

- `PORT` - Siempre es 8080 (Cloud Run lo establece)
- `K_SERVICE` - Nombre del servicio
- `K_REVISION` - Nombre de la revisión
- `K_CONFIGURATION` - Nombre de la configuración

Los scripts de despliegue (`deploy.ps1` y `deploy-secrets.ps1`) filtran automáticamente estas variables.

## Costos Estimados

Cloud Run cobra por:
- **Tiempo de CPU**: Solo cuando procesa solicitudes
- **Memoria**: Solo cuando está activo
- **Solicitudes**: Primeras 2 millones gratis/mes

**Estimación mensual para tráfico bajo-medio**: $5-20 USD

## Troubleshooting

### Error: "Permission denied"

```powershell
gcloud auth login
gcloud auth configure-docker
```

### Error: "Service account does not have permission"

```powershell
gcloud projects add-iam-policy-binding tu-proyecto-gcp `
    --member="serviceAccount:PROJECT_NUMBER-compute@developer.gserviceaccount.com" `
    --role="roles/secretmanager.secretAccessor"
```

### El servicio no inicia

Revisa los logs:

```powershell
gcloud run services logs read bot-ferreteria-api --region us-central1 --limit 50
```

## Monitoreo

### Ver métricas en Cloud Console

https://console.cloud.google.com/run

### Configurar alertas

1. Ve a Cloud Monitoring
2. Crea políticas de alerta para:
   - Errores 5xx
   - Latencia alta
   - Uso de memoria

## Seguridad

### Mejores prácticas:

1. ✅ Usa Secret Manager para producción
2. ✅ No commitees el archivo `.env`
3. ✅ Rota las credenciales regularmente
4. ✅ Limita el acceso con IAM
5. ✅ Habilita Cloud Armor si es necesario

## Soporte

Para más información:
- Documentación de Cloud Run: https://cloud.google.com/run/docs
- Precios: https://cloud.google.com/run/pricing
