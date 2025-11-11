# Changelog

Todos los cambios notables en este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/lang/es/).

## [1.0.0] - 2025-11-11

### Agregado
- Sistema completo de chatbot con IA para ferretería
- Integración con Meta Business API (WhatsApp/Messenger)
- Procesamiento de lenguaje natural con OpenAI GPT-4
- Búsqueda semántica con RAG (Pinecone)
- Gestión de pedidos en MongoDB
- Catálogo de productos
- Base de conocimiento
- Menú interactivo con Quick Replies
- Verificación de firma HMAC para webhooks de Meta
- Gestión de contexto conversacional
- Scripts de despliegue para Google Cloud Run
- Dockerfile optimizado
- Documentación completa:
  - README.md con guía general
  - ARCHITECTURE.md con detalles técnicos
  - DEPLOYMENT.md con guía de despliegue
  - IMPROVEMENTS.md con mejoras sugeridas
  - FAQ.md con preguntas frecuentes
  - .env.example con plantilla de configuración

### Características
- Conversación natural con usuarios
- Búsqueda de productos por nombre o categoría
- Creación y seguimiento de pedidos
- Información de la tienda (horarios, ubicación)
- Respuestas contextuales basadas en historial
- Soporte para mensajes de texto y Quick Replies

### Tecnologías
- Node.js 18 con ES Modules
- Express.js para API REST
- MongoDB + Mongoose para persistencia
- OpenAI GPT-4 para IA conversacional
- Pinecone para búsqueda vectorial
- Google Cloud Run para hosting
- Docker para containerización

### Seguridad
- Verificación de firma HMAC SHA-256
- Variables de entorno para credenciales
- Middleware de manejo de errores
- Validación de webhooks de Meta

## [Unreleased]

### Planeado
- Redis para gestión de contexto distribuido
- Rate limiting para protección contra abuso
- Sistema de colas con Bull
- Cache de embeddings
- Tests automatizados con Jest
- Logging estructurado con Winston
- Monitoreo y alertas
- CI/CD con GitHub Actions
- Panel de administración web
- Análisis de sentimiento
- Soporte multiidioma
- Integración de pagos
- Notificaciones proactivas

---

## Tipos de Cambios

- `Agregado` para nuevas características
- `Cambiado` para cambios en funcionalidad existente
- `Deprecado` para características que serán removidas
- `Removido` para características removidas
- `Corregido` para corrección de bugs
- `Seguridad` para vulnerabilidades

---

## Versionado

- **MAJOR** (X.0.0): Cambios incompatibles con versiones anteriores
- **MINOR** (0.X.0): Nueva funcionalidad compatible con versiones anteriores
- **PATCH** (0.0.X): Correcciones de bugs compatibles con versiones anteriores
