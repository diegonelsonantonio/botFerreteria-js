# Script de despliegue para Google Cloud Run usando Secret Manager
# Mas seguro que pasar variables de entorno directamente
# Autor: Script generado para bot-ferreteria-api
# Fecha: 2025-11-11

# Configuracion del proyecto
$PROJECT_ID = "softagents"
$SERVICE_NAME = "agente-sofia"
$REGION = "us-central1"
$IMAGE_NAME = "gcr.io/$PROJECT_ID/$SERVICE_NAME"

# Colores para output
function Write-Success { Write-Host $args -ForegroundColor Green }
function Write-Info { Write-Host $args -ForegroundColor Cyan }
function Write-Error { Write-Host $args -ForegroundColor Red }

Write-Info "========================================="
Write-Info "  Despliegue a Google Cloud Run"
Write-Info "  (Usando Secret Manager)"
Write-Info "========================================="
Write-Host ""

# Verificar que gcloud este instalado
Write-Info "Verificando instalacion de gcloud..."
if (-not (Get-Command gcloud -ErrorAction SilentlyContinue)) {
    Write-Error "Error: gcloud CLI no esta instalado."
    exit 1
}
Write-Success "OK gcloud CLI encontrado"

# Configurar el proyecto de GCP
Write-Info "`nConfigurando proyecto GCP: $PROJECT_ID"
gcloud config set project $PROJECT_ID

# Habilitar APIs necesarias
Write-Info "`nHabilitando APIs necesarias..."
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable secretmanager.googleapis.com

# Crear secretos desde el archivo .env (si no existen)
Write-Info "`nCreando secretos en Secret Manager..."

# Leer archivo .env
$reservedVars = @('PORT', 'K_SERVICE', 'K_REVISION', 'K_CONFIGURATION')
$secretsList = @()

if (Test-Path .env) {
    Get-Content .env | ForEach-Object {
        $line = $_.Trim()
        if ($line -and -not $line.StartsWith("#")) {
            $parts = $line.Split("=", 2)
            if ($parts.Count -eq 2) {
                $secretName = $parts[0].Trim()
                $secretValue = $parts[1].Trim()
                
                # Excluir variables reservadas de Cloud Run
                if ($secretName -and $secretValue -and -not ($reservedVars -contains $secretName)) {
                    Write-Info "Creando secreto: $secretName"
                    
                    # Crear o actualizar el secreto
                    $secretValue | gcloud secrets create $secretName --data-file=- 2>$null
                    if ($LASTEXITCODE -ne 0) {
                        # Si ya existe, actualizar
                        $secretValue | gcloud secrets versions add $secretName --data-file=-
                    }
                    
                    $secretsList += "$secretName=${secretName}:latest"
                }
            }
        }
    }
    Write-Success "OK Secretos creados/actualizados"
} else {
    Write-Error "Archivo .env no encontrado"
    exit 1
}

# Construir y subir imagen
Write-Info "`nConstruyendo y subiendo imagen..."
gcloud builds submit --tag $IMAGE_NAME
if ($LASTEXITCODE -ne 0) {
    Write-Error "Error al construir/subir la imagen."
    exit 1
}
Write-Success "OK Imagen construida y subida"

# Desplegar a Cloud Run con secretos
Write-Info "`nDesplegando a Cloud Run..."

$secretsString = $secretsList -join ","

gcloud run deploy $SERVICE_NAME `
    --image $IMAGE_NAME `
    --platform managed `
    --region $REGION `
    --allow-unauthenticated `
    --port 8080 `
    --memory 512Mi `
    --cpu 1 `
    --min-instances 0 `
    --max-instances 10 `
    --set-secrets $secretsString

if ($LASTEXITCODE -ne 0) {
    Write-Error "Error al desplegar en Cloud Run."
    exit 1
}

Write-Host ""
Write-Success "========================================="
Write-Success "  OK Despliegue completado exitosamente"
Write-Success "========================================="
Write-Host ""

# Obtener la URL del servicio
$SERVICE_URL = gcloud run services describe $SERVICE_NAME --platform managed --region $REGION --format "value(status.url)"
Write-Success "URL del servicio: $SERVICE_URL"
