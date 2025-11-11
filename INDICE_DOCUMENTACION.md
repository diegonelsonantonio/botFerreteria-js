# 📚 Índice de Documentación - Bot Ferretería

Guía completa de toda la documentación disponible del proyecto.

## 🎯 Para Empezar

### 1. [README.md](README.md) - **EMPIEZA AQUÍ**
**Audiencia**: Todos  
**Tiempo de lectura**: 15 minutos

**Contenido**:
- Descripción general del proyecto
- Características principales
- Tecnologías utilizadas
- Guía de instalación
- Configuración básica
- Estructura del proyecto
- API endpoints
- Flujo de conversación

**Cuándo leerlo**: Antes de hacer cualquier cosa con el proyecto.

---

## 🏗️ Arquitectura y Diseño

### 2. [ARCHITECTURE.md](ARCHITECTURE.md)
**Audiencia**: Desarrolladores, Arquitectos  
**Tiempo de lectura**: 30 minutos

**Contenido**:
- Arquitectura en capas
- Patrones de diseño aplicados
- Flujo de datos detallado
- Componentes y responsabilidades
- Decisiones técnicas y justificaciones
- Estrategias de escalabilidad
- Consideraciones de seguridad

**Cuándo leerlo**: 
- Antes de modificar código
- Para entender el "por qué" de las decisiones
- Al planear nuevas features

---

## 🚀 Despliegue

### 3. [DEPLOYMENT.md](DEPLOYMENT.md)
**Audiencia**: DevOps, Desarrolladores  
**Tiempo de lectura**: 20 minutos

**Contenido**:
- Requisitos previos
- Configuración de Google Cloud
- Métodos de despliegue
- Configuración de webhook de Meta
- Comandos útiles
- Troubleshooting
- Costos estimados

**Cuándo leerlo**:
- Antes del primer despliegue
- Al configurar nuevo ambiente
- Cuando hay problemas de despliegue

### 4. Scripts de Despliegue

#### [deploy.ps1](deploy.ps1)
**Audiencia**: DevOps  
**Tipo**: Script ejecutable

**Uso**:
```powershell
.\deploy.ps1
```

**Qué hace**:
- Construye imagen Docker
- Sube a Google Container Registry
- Despliega en Cloud Run
- Configura variables de entorno

#### [deploy-secrets.ps1](deploy-secrets.ps1)
**Audiencia**: DevOps  
**Tipo**: Script ejecutable

**Uso**:
```powershell
.\deploy-secrets.ps1
```

**Qué hace**:
- Crea secretos en Secret Manager
- Construye y sube imagen
- Despliega con secretos seguros

---

## 💡 Mejoras y Evolución

### 5. [IMPROVEMENTS.md](IMPROVEMENTS.md)
**Audiencia**: Product Managers, Desarrolladores  
**Tiempo de lectura**: 25 minutos

**Contenido**:
- Mejoras priorizadas (Alta, Media, Baja)
- Implementaciones detalladas
- Costos estimados
- ROI esperado
- Roadmap sugerido

**Cuándo leerlo**:
- Al planear sprints
- Para priorizar trabajo
- Al evaluar nuevas features

---

## ❓ Soporte y Troubleshooting

### 6. [FAQ.md](FAQ.md)
**Audiencia**: Todos  
**Tiempo de lectura**: 20 minutos

**Contenido**:
- Preguntas frecuentes
- Problemas comunes y soluciones
- Guías paso a paso
- Tips y trucos

**Cuándo leerlo**:
- Cuando tienes un problema específico
- Antes de preguntar al equipo
- Para aprender mejores prácticas

---

## 🛠️ Referencia Técnica

### 7. [COMANDOS_UTILES.md](COMANDOS_UTILES.md)
**Audiencia**: Desarrolladores, DevOps  
**Tipo**: Referencia rápida

**Contenido**:
- Comandos de desarrollo
- Comandos de Docker
- Comandos de Google Cloud
- Comandos de MongoDB
- Comandos de Git
- Debugging y monitoreo

**Cuándo usarlo**:
- Como cheatsheet diario
- Al ejecutar tareas comunes
- Para recordar sintaxis

---

## 📊 Gestión de Proyecto

### 8. [RESUMEN_EJECUTIVO.md](RESUMEN_EJECUTIVO.md)
**Audiencia**: Stakeholders, Management  
**Tiempo de lectura**: 10 minutos

**Contenido**:
- Visión general del proyecto
- Problema que resuelve
- Métricas de éxito
- Costos operacionales
- ROI estimado
- Roadmap
- Riesgos y mitigaciones

**Cuándo leerlo**:
- Para presentaciones ejecutivas
- Al justificar inversión
- Para reportes de progreso

### 9. [CHANGELOG.md](CHANGELOG.md)
**Audiencia**: Todos  
**Tipo**: Registro histórico

**Contenido**:
- Historial de versiones
- Cambios por versión
- Features agregadas
- Bugs corregidos

**Cuándo consultarlo**:
- Al actualizar versión
- Para release notes
- Para entender evolución

---

## ⚙️ Configuración

### 10. [.env.example](.env.example)
**Audiencia**: Desarrolladores  
**Tipo**: Plantilla

**Contenido**:
- Variables de entorno requeridas
- Formato y ejemplos
- Comentarios explicativos

**Cuándo usarlo**:
- Al configurar nuevo ambiente
- Como referencia de variables
- Para documentar nuevas variables

### 11. [Dockerfile](Dockerfile)
**Audiencia**: DevOps  
**Tipo**: Configuración

**Contenido**:
- Imagen base
- Instalación de dependencias
- Configuración de aplicación

**Cuándo modificarlo**:
- Al cambiar versión de Node
- Al agregar dependencias del sistema
- Al optimizar imagen

### 12. [.dockerignore](.dockerignore)
**Audiencia**: DevOps  
**Tipo**: Configuración

**Contenido**:
- Archivos excluidos de imagen Docker

**Cuándo modificarlo**:
- Al agregar archivos que no deben ir en imagen

---

## 📁 Código Fuente

### Estructura de Carpetas

```
src/
├── api/                    # Capa de API
│   ├── controllers/        # Lógica de endpoints
│   ├── middlewares/        # Middlewares
│   └── routes/             # Definición de rutas
├── config/                 # Configuración
├── core/                   # Lógica de negocio
│   ├── context/           # Gestión de contexto
│   ├── models/            # Modelos de datos
│   ├── repositories/      # Acceso a datos
│   └── services/          # Servicios de negocio
└── scripts/               # Scripts utilitarios
```

### Archivos Clave

#### [src/app.js](src/app.js)
**Qué hace**: Configura Express y middlewares

#### [src/server.js](src/server.js)
**Qué hace**: Punto de entrada, inicia servidor

#### [src/api/controllers/webhook.controller.js](src/api/controllers/webhook.controller.js)
**Qué hace**: Maneja webhooks de Meta

#### [src/core/services/message.service.js](src/core/services/message.service.js)
**Qué hace**: Procesa mensajes de usuarios

#### [src/core/services/order.service.js](src/core/services/order.service.js)
**Qué hace**: Gestiona pedidos

#### [src/core/services/rag.service.js](src/core/services/rag.service.js)
**Qué hace**: Búsqueda semántica con RAG

---

## 🎓 Guías de Aprendizaje

### Para Nuevos Desarrolladores

**Día 1**: Configuración
1. Leer [README.md](README.md)
2. Configurar ambiente local
3. Ejecutar `npm run dev`
4. Probar con ngrok

**Día 2**: Arquitectura
1. Leer [ARCHITECTURE.md](ARCHITECTURE.md)
2. Explorar código fuente
3. Entender flujo de datos
4. Hacer cambio pequeño

**Día 3**: Despliegue
1. Leer [DEPLOYMENT.md](DEPLOYMENT.md)
2. Configurar Google Cloud
3. Ejecutar `.\deploy.ps1`
4. Verificar funcionamiento

**Semana 2**: Mejoras
1. Leer [IMPROVEMENTS.md](IMPROVEMENTS.md)
2. Elegir mejora de prioridad alta
3. Implementar
4. Desplegar

### Para DevOps

**Setup Inicial**:
1. [DEPLOYMENT.md](DEPLOYMENT.md) - Configuración completa
2. [deploy.ps1](deploy.ps1) - Script de despliegue
3. [COMANDOS_UTILES.md](COMANDOS_UTILES.md) - Referencia

**Operación Diaria**:
1. [COMANDOS_UTILES.md](COMANDOS_UTILES.md) - Comandos comunes
2. [FAQ.md](FAQ.md) - Troubleshooting
3. Logs de Cloud Run

**Mejoras**:
1. [IMPROVEMENTS.md](IMPROVEMENTS.md) - Infraestructura
2. [ARCHITECTURE.md](ARCHITECTURE.md) - Escalabilidad

### Para Product Managers

**Entender el Producto**:
1. [README.md](README.md) - Qué hace
2. [RESUMEN_EJECUTIVO.md](RESUMEN_EJECUTIVO.md) - Valor de negocio
3. [FAQ.md](FAQ.md) - Casos de uso

**Planear Roadmap**:
1. [IMPROVEMENTS.md](IMPROVEMENTS.md) - Features futuras
2. [CHANGELOG.md](CHANGELOG.md) - Historial
3. [RESUMEN_EJECUTIVO.md](RESUMEN_EJECUTIVO.md) - ROI

---

## 🔍 Búsqueda Rápida

### "¿Cómo hago...?"

| Pregunta | Documento | Sección |
|----------|-----------|---------|
| ¿Cómo instalo el proyecto? | README.md | Instalación |
| ¿Cómo despliego? | DEPLOYMENT.md | Métodos de Despliegue |
| ¿Cómo veo logs? | COMANDOS_UTILES.md | Cloud Run - Logs |
| ¿Cómo agrego productos? | FAQ.md | Funcionalidad |
| ¿Cómo funciona RAG? | ARCHITECTURE.md | rag.service.js |
| ¿Por qué MongoDB? | README.md | Base de Datos |
| ¿Cuánto cuesta? | RESUMEN_EJECUTIVO.md | Costos |
| ¿Qué mejoras hay? | IMPROVEMENTS.md | Todas |
| ¿Cómo escala? | ARCHITECTURE.md | Escalabilidad |
| ¿Es seguro? | ARCHITECTURE.md | Seguridad |

### "Tengo un problema con..."

| Problema | Documento | Sección |
|----------|-----------|---------|
| Despliegue falla | FAQ.md | Errores Comunes |
| No recibo mensajes | FAQ.md | Troubleshooting |
| MongoDB no conecta | FAQ.md | Errores Comunes |
| OpenAI rate limit | FAQ.md | Errores Comunes |
| Logs no aparecen | COMANDOS_UTILES.md | Cloud Run - Logs |
| Costos muy altos | IMPROVEMENTS.md | Cache de Embeddings |

---

## 📝 Contribuir a la Documentación

### Agregar Nueva Documentación

1. Crear archivo `.md` en raíz
2. Seguir formato Markdown
3. Agregar a este índice
4. Actualizar README.md si es relevante

### Actualizar Documentación Existente

1. Editar archivo correspondiente
2. Actualizar fecha de modificación
3. Agregar entrada en CHANGELOG.md
4. Notificar al equipo

### Estándares de Documentación

- **Formato**: Markdown
- **Idioma**: Español
- **Tono**: Profesional pero accesible
- **Estructura**: Títulos claros, listas, ejemplos
- **Código**: Bloques con sintaxis highlight
- **Emojis**: Usar para mejorar legibilidad

---

## 🗂️ Resumen de Archivos

| Archivo | Tipo | Audiencia | Prioridad |
|---------|------|-----------|-----------|
| README.md | Guía | Todos | 🔴 Alta |
| ARCHITECTURE.md | Técnico | Devs | 🟡 Media |
| DEPLOYMENT.md | Guía | DevOps | 🔴 Alta |
| IMPROVEMENTS.md | Planificación | PM/Devs | 🟡 Media |
| FAQ.md | Referencia | Todos | 🔴 Alta |
| COMANDOS_UTILES.md | Referencia | Devs/DevOps | 🟡 Media |
| RESUMEN_EJECUTIVO.md | Negocio | Management | 🟢 Baja |
| CHANGELOG.md | Registro | Todos | 🟢 Baja |
| .env.example | Config | Devs | 🔴 Alta |
| deploy.ps1 | Script | DevOps | 🔴 Alta |
| deploy-secrets.ps1 | Script | DevOps | 🟡 Media |

---

## 📞 Contacto y Soporte

**Para preguntas sobre**:
- Código: Ver [ARCHITECTURE.md](ARCHITECTURE.md) y [FAQ.md](FAQ.md)
- Despliegue: Ver [DEPLOYMENT.md](DEPLOYMENT.md) y [COMANDOS_UTILES.md](COMANDOS_UTILES.md)
- Negocio: Ver [RESUMEN_EJECUTIVO.md](RESUMEN_EJECUTIVO.md)

**Si no encuentras respuesta**:
1. Busca en [FAQ.md](FAQ.md)
2. Revisa logs
3. Consulta documentación oficial de servicios
4. Contacta al equipo

---

**Última actualización**: 11 de Noviembre, 2025  
**Versión de documentación**: 1.0.0
