# 🛠️ Comandos Útiles - Bot Ferretería

Referencia rápida de comandos para desarrollo, despliegue y operación.

## Desarrollo Local

### Instalación
```powershell
# Clonar repositorio
git clone <url-del-repo>
cd bot-ferreteria-api

# Instalar dependencias
npm install

# Copiar variables de entorno
copy .env.example .env
# Editar .env con tus credenciales
```

### Ejecución
```powershell
# Modo desarrollo (con hot reload)
npm run dev

# Modo producción
npm start

# Con variables de entorno específicas
$env:PORT=3000; npm start
```

### Testing Local con ngrok
```powershell
# Instalar ngrok (una vez)
choco install ngrok
# o descargar de https://ngrok.com/download

# Exponer puerto local
ngrok http 8080

# Copiar URL (ej: https://abc123.ngrok.io)
# Configurarla en Meta Developer Console
```

## Docker

### Construcción
```powershell
# Construir imagen
docker build -t bot-ferreteria .

# Construir sin cache
docker build --no-cache -t bot-ferreteria .

# Ver imágenes
docker images
```

### Ejecución
```powershell
# Ejecutar contenedor
docker run -p 8080:8080 --env-file .env bot-ferreteria

# Ejecutar en background
docker run -d -p 8080:8080 --env-file .env --name bot bot-ferreteria

# Ver logs
docker logs bot

# Ver logs en tiempo real
docker logs -f bot

# Detener contenedor
docker stop bot

# Eliminar contenedor
docker rm bot
```

### Limpieza
```powershell
# Eliminar imágenes sin usar
docker image prune

# Eliminar todo (cuidado!)
docker system prune -a
```

## Google Cloud

### Configuración Inicial
```powershell
# Instalar gcloud CLI
# Descargar de: https://cloud.google.com/sdk/docs/install

# Inicializar
gcloud init

# Autenticarse
gcloud auth login

# Configurar proyecto
gcloud config set project tu-proyecto-gcp

# Ver configuración actual
gcloud config list
```

### Cloud Run - Despliegue

#### Opción 1: Script Automático
```powershell
# Despliegue estándar
.\deploy.ps1

# Despliegue con Secret Manager
.\deploy-secrets.ps1
```

#### Opción 2: Manual
```powershell
# Habilitar APIs
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com

# Construir y subir imagen
gcloud builds submit --tag gcr.io/tu-proyecto/bot-ferreteria

# Desplegar
gcloud run deploy bot-ferreteria `
  --image gcr.io/tu-proyecto/bot-ferreteria `
  --platform managed `
  --region us-central1 `
  --allow-unauthenticated `
  --port 8080 `
  --memory 512Mi `
  --set-env-vars "MONGO_URI=$env:MONGO_URI,OPENAI_API_KEY=$env:OPENAI_API_KEY"
```

### Cloud Run - Gestión
```powershell
# Listar servicios
gcloud run services list

# Ver detalles de servicio
gcloud run services describe bot-ferreteria --region us-central1

# Ver URL del servicio
gcloud run services describe bot-ferreteria `
  --region us-central1 `
  --format "value(status.url)"

# Actualizar variables de entorno
gcloud run services update bot-ferreteria `
  --region us-central1 `
  --set-env-vars "NEW_VAR=value"

# Actualizar memoria
gcloud run services update bot-ferreteria `
  --region us-central1 `
  --memory 1Gi

# Actualizar instancias mínimas/máximas
gcloud run services update bot-ferreteria `
  --region us-central1 `
  --min-instances 1 `
  --max-instances 20

# Eliminar servicio
gcloud run services delete bot-ferreteria --region us-central1
```

### Cloud Run - Logs
```powershell
# Ver logs en tiempo real
gcloud run services logs read bot-ferreteria `
  --region us-central1 `
  --follow

# Últimos 50 logs
gcloud run services logs read bot-ferreteria `
  --region us-central1 `
  --limit 50

# Filtrar por nivel
gcloud run services logs read bot-ferreteria `
  --region us-central1 `
  --log-filter "severity>=ERROR"

# Filtrar por texto
gcloud run services logs read bot-ferreteria `
  --region us-central1 | findstr "error"

# Logs de un período específico
gcloud run services logs read bot-ferreteria `
  --region us-central1 `
  --log-filter "timestamp>=\"2025-11-11T00:00:00Z\""
```

### Cloud Run - Revisiones
```powershell
# Listar revisiones
gcloud run revisions list `
  --service bot-ferreteria `
  --region us-central1

# Ver detalles de revisión
gcloud run revisions describe REVISION_NAME `
  --region us-central1

# Rollback a revisión anterior
gcloud run services update-traffic bot-ferreteria `
  --to-revisions REVISION_NAME=100 `
  --region us-central1

# Split traffic (A/B testing)
gcloud run services update-traffic bot-ferreteria `
  --to-revisions REVISION_A=50,REVISION_B=50 `
  --region us-central1
```

### Container Registry
```powershell
# Listar imágenes
gcloud container images list

# Ver tags de una imagen
gcloud container images list-tags gcr.io/tu-proyecto/bot-ferreteria

# Eliminar imagen específica
gcloud container images delete gcr.io/tu-proyecto/bot-ferreteria:TAG

# Eliminar imágenes sin tag
gcloud container images list-tags gcr.io/tu-proyecto/bot-ferreteria `
  --filter='-tags:*' `
  --format='get(digest)' | `
  ForEach-Object { gcloud container images delete "gcr.io/tu-proyecto/bot-ferreteria@$_" --quiet }
```

### Secret Manager
```powershell
# Crear secreto
echo "valor_secreto" | gcloud secrets create NOMBRE_SECRETO --data-file=-

# Listar secretos
gcloud secrets list

# Ver versiones de un secreto
gcloud secrets versions list NOMBRE_SECRETO

# Acceder a secreto
gcloud secrets versions access latest --secret="NOMBRE_SECRETO"

# Actualizar secreto
echo "nuevo_valor" | gcloud secrets versions add NOMBRE_SECRETO --data-file=-

# Eliminar secreto
gcloud secrets delete NOMBRE_SECRETO
```

## MongoDB

### Conexión
```powershell
# Conectar con mongosh
mongosh "mongodb+srv://usuario:password@cluster.mongodb.net/ferreteria_db"

# Conectar con Node.js
node
> const mongoose = require('mongoose');
> await mongoose.connect(process.env.MONGO_URI);
```

### Operaciones Básicas
```javascript
// En mongosh o Node.js

// Ver bases de datos
show dbs

// Usar base de datos
use ferreteria_db

// Ver colecciones
show collections

// Contar documentos
db.products.countDocuments()

// Buscar todos
db.products.find()

// Buscar con filtro
db.products.find({ category: "Herramientas" })

// Buscar uno
db.products.findOne({ name: "Martillo" })

// Insertar
db.products.insertOne({
  name: "Destornillador",
  price: 50,
  category: "Herramientas",
  stock: 100
})

// Actualizar
db.products.updateOne(
  { name: "Martillo" },
  { $set: { price: 160 } }
)

// Eliminar
db.products.deleteOne({ name: "Martillo" })

// Crear índice
db.products.createIndex({ name: "text", description: "text" })

// Ver índices
db.products.getIndexes()
```

### Backup y Restore
```powershell
# Backup completo
mongodump --uri="mongodb+srv://usuario:password@cluster.mongodb.net/" `
  --out=backup-$(Get-Date -Format "yyyy-MM-dd")

# Backup de una base de datos
mongodump --uri="mongodb+srv://usuario:password@cluster.mongodb.net/ferreteria_db" `
  --out=backup

# Backup comprimido
mongodump --uri="mongodb+srv://usuario:password@cluster.mongodb.net/" `
  --gzip `
  --archive=backup.gz

# Restore completo
mongorestore --uri="mongodb+srv://usuario:password@cluster.mongodb.net/" `
  backup/

# Restore de una colección
mongorestore --uri="mongodb+srv://usuario:password@cluster.mongodb.net/" `
  --nsInclude="ferreteria_db.products" `
  backup/
```

## Git

### Workflow Básico
```powershell
# Ver estado
git status

# Ver cambios
git diff

# Agregar archivos
git add .
git add archivo.js

# Commit
git commit -m "Descripción del cambio"

# Push
git push origin main

# Pull
git pull origin main

# Ver historial
git log --oneline
```

### Branches
```powershell
# Crear branch
git checkout -b feature/nueva-funcionalidad

# Cambiar de branch
git checkout main

# Listar branches
git branch

# Merge
git checkout main
git merge feature/nueva-funcionalidad

# Eliminar branch
git branch -d feature/nueva-funcionalidad
```

### Útiles
```powershell
# Ver cambios de un archivo
git log -p archivo.js

# Deshacer cambios no commiteados
git checkout -- archivo.js

# Deshacer último commit (mantener cambios)
git reset --soft HEAD~1

# Deshacer último commit (eliminar cambios)
git reset --hard HEAD~1

# Ver diferencias entre branches
git diff main..feature/nueva-funcionalidad
```

## NPM

### Gestión de Dependencias
```powershell
# Instalar todas las dependencias
npm install

# Instalar dependencia
npm install express

# Instalar dependencia de desarrollo
npm install --save-dev jest

# Actualizar dependencias
npm update

# Ver dependencias desactualizadas
npm outdated

# Auditar seguridad
npm audit

# Corregir vulnerabilidades
npm audit fix
```

### Scripts
```powershell
# Ver scripts disponibles
npm run

# Ejecutar script
npm run dev
npm start
npm test
```

## Debugging

### Logs
```powershell
# Ver logs de aplicación
# (si usas winston o similar)
Get-Content logs/combined.log -Tail 50 -Wait

# Filtrar errores
Get-Content logs/error.log
```

### Network
```powershell
# Probar endpoint
curl http://localhost:8080/

# POST con datos
curl -X POST http://localhost:8080/webhook `
  -H "Content-Type: application/json" `
  -d '{\"test\": \"data\"}'

# Ver headers
curl -I http://localhost:8080/
```

### Procesos
```powershell
# Ver procesos de Node
Get-Process node

# Matar proceso por puerto
$port = 8080
Get-NetTCPConnection -LocalPort $port | `
  Select-Object -ExpandProperty OwningProcess | `
  ForEach-Object { Stop-Process -Id $_ -Force }
```

## Monitoreo

### Cloud Run Metrics
```powershell
# Ver métricas en consola
# https://console.cloud.google.com/run

# Crear alerta de error rate
gcloud alpha monitoring policies create `
  --notification-channels=CHANNEL_ID `
  --display-name="Bot Error Rate" `
  --condition-display-name="Error rate > 5%" `
  --condition-threshold-value=0.05
```

### Healthcheck
```powershell
# Script de healthcheck
while ($true) {
  $response = Invoke-WebRequest -Uri "https://tu-servicio.run.app/" -UseBasicParsing
  Write-Host "$(Get-Date) - Status: $($response.StatusCode)"
  Start-Sleep -Seconds 60
}
```

## Útiles Varios

### Variables de Entorno
```powershell
# Ver todas las variables
Get-ChildItem Env:

# Ver variable específica
$env:MONGO_URI

# Establecer variable (sesión actual)
$env:PORT = 3000

# Establecer variable (permanente)
[System.Environment]::SetEnvironmentVariable('PORT', '3000', 'User')
```

### Archivos
```powershell
# Buscar en archivos
Get-ChildItem -Recurse -Filter "*.js" | Select-String "processMessage"

# Contar líneas de código
(Get-ChildItem -Recurse -Filter "*.js" | Get-Content | Measure-Object -Line).Lines

# Ver tamaño de carpeta
Get-ChildItem -Recurse | Measure-Object -Property Length -Sum
```

### Performance
```powershell
# Medir tiempo de ejecución
Measure-Command { npm start }

# Monitorear uso de CPU/RAM
Get-Process node | Select-Object CPU, WorkingSet
```

## Cheatsheet Rápido

```powershell
# Desarrollo
npm run dev                    # Iniciar en desarrollo
npm start                      # Iniciar en producción

# Docker
docker build -t bot .          # Construir imagen
docker run -p 8080:8080 bot    # Ejecutar contenedor

# Despliegue
.\deploy.ps1                   # Desplegar a Cloud Run

# Logs
gcloud run services logs read bot --follow  # Ver logs en tiempo real

# MongoDB
mongosh $env:MONGO_URI         # Conectar a MongoDB

# Git
git add .                      # Agregar cambios
git commit -m "mensaje"        # Commit
git push                       # Push a remoto
```

---

**Tip**: Guarda este archivo como referencia rápida. Puedes buscar comandos con Ctrl+F.
