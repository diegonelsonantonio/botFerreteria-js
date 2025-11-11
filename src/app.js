import express from 'express';
import webhookRoutes from './api/routes/webhook.routes.js';
import { errorHandler } from './api/middlewares/errorHandler.js';

const app = express();

// Endpoint de prueba para saber que la API está viva
app.get('/', (req, res) => {
  res.send('API del Bot Ferretería está activa!');
});

// Rutas del Webhook de Meta
// Es importante NO usar un bodyParser global (express.json())
// porque la verificación de firma necesita el "raw body" (cuerpo crudo)
app.use('/webhook', webhookRoutes);

// Middleware de manejo de errores
app.use(errorHandler);

export default app;