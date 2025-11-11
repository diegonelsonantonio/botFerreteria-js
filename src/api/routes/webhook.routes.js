import { Router } from 'express';
import express from 'express';
import { getWebhook, postWebhook } from '../controllers/webhook.controller.js';
import { verifyMetaSignature } from '../middlewares/metaVerify.js';

const router = Router();

// Endpoint GET para la verificación del "challenge" de Meta
router.get('/', getWebhook);

// Endpoint POST para recibir mensajes
// 1. Usamos express.raw() para obtener el cuerpo como buffer
// 2. Pasamos por el middleware de verificación de firma
// 3. Pasamos al controlador final
router.post(
  '/',
  express.raw({ type: 'application/json' }), // 1.
  verifyMetaSignature, // 2.
  postWebhook // 3.
);

export default router;