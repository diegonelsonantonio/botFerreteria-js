# Script de despliegue para Google Cloud Run
# Autor: Script generado para bot-ferreteria-api
# Fecha: 2025-11-11

# Configuracion del proyecto
$PROJECT_ID = "softagents"
$SERVICE_NAME = "agente-sofia2"
$REGION = "us-central1"
$IMAGE_NAME = "gcr.io/$PROJECT_ID/$SERVICE_NAME"

# Colores para output
function Write-Success { Write-Host $args -ForegroundColor Green }
function Write-Info { Write-Host $args -ForegroundColor Cyan }
function Write-Error { Write-Host $args -ForegroundColor Red }

Write-Info "========================================="
Write-Info "  Despliegue a Google Cloud Run"
Write-Info "========================================="
Write-Host ""

# Verificar que gcloud este instalado
Write-Info "Verificando instalacion de gcloud..."
if (-not (Get-Command gcloud -ErrorAction SilentlyContinue)) {
    Write-Error "Error: gcloud CLI no esta instalado."
    Write-Error "Instala desde: https://cloud.google.com/sdk/docs/install"
    exit 1
}
Write-Success "OK gcloud CLI encontrado"

# Verificar que Docker este instalado
Write-Info "Verificando instalacion de Docker..."
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Error "Error: Docker no esta instalado."
    Write-Error "Instala desde: https://www.docker.com/products/docker-desktop"
    exit 1
}
Write-Success "OK Docker encontrado"

# Configurar el proyecto de GCP
Write-Info "`nConfigurando proyecto GCP: $PROJECT_ID"
gcloud config set project $PROJECT_ID
if ($LASTEXITCODE -ne 0) {
    Write-Error "Error al configurar el proyecto. Verifica que el PROJECT_ID sea correcto."
    exit 1
}

# Habilitar APIs necesarias
Write-Info "`nHabilitando APIs necesarias..."
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com

# Construir la imagen Docker
Write-Info "`nConstruyendo imagen Docker..."
Write-Info "Imagen: $IMAGE_NAME"
docker build -t $IMAGE_NAME .
if ($LASTEXITCODE -ne 0) {
    Write-Error "Error al construir la imagen Docker."
    exit 1
}
Write-Success "OK Imagen construida exitosamente"

# Autenticar Docker con GCR
Write-Info "`nAutenticando Docker con Google Container Registry..."
gcloud auth configure-docker
if ($LASTEXITCODE -ne 0) {
    Write-Error "Error al autenticar Docker."
    exit 1
}

# Subir la imagen a Google Container Registry
Write-Info "`nSubiendo imagen a Google Container Registry..."
docker push $IMAGE_NAME
if ($LASTEXITCODE -ne 0) {
    Write-Error "Error al subir la imagen."
    exit 1
}
Write-Success "OK Imagen subida exitosamente"

# Cargar variables de entorno desde .env
Write-Info "`nCargando variables de entorno desde .env..."
$envVars = @()
$reservedVars = @('PORT', 'K_SERVICE', 'K_REVISION', 'K_CONFIGURATION')

if (Test-Path .env) {
    Get-Content .env | ForEach-Object {
        $line = $_.Trim()
        if ($line -and -not $line.StartsWith("#")) {
            $parts = $line.Split("=", 2)
            if ($parts.Count -eq 2) {
                $key = $parts[0].Trim()
                $value = $parts[1].Trim()
                
                # Excluir variables reservadas de Cloud Run
                if ($key -and $value -and -not ($reservedVars -contains $key)) {
                    $envVars += "$key=$value"
                }
            }
        }
    }
    Write-Success "OK Variables cargadas: $($envVars.Count)"
} else {
    Write-Error "Archivo .env no encontrado"
    exit 1
}

# Desplegar a Cloud Run
Write-Info "`nDesplegando a Cloud Run..."
Write-Info "Servicio: $SERVICE_NAME"
Write-Info "Region: $REGION"

$envVarsString = $envVars -join ","

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
    --set-env-vars $envVarsString

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
Write-Info "Obteniendo URL del servicio..."
$SERVICE_URL = gcloud run services describe $SERVICE_NAME --platform managed --region $REGION --format "value(status.url)"
Write-Success "URL del servicio: $SERVICE_URL"

Write-Host ""
Write-Info "Comandos utiles:"
Write-Host "  Ver logs:     gcloud run services logs read $SERVICE_NAME --region $REGION"
Write-Host "  Ver detalles: gcloud run services describe $SERVICE_NAME --region $REGION"
Write-Host "  Eliminar:     gcloud run services delete $SERVICE_NAME --region $REGION"
