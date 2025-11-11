import { env } from '../../config/index.js';
import { processMessage } from '../../core/services/message.service.js';

// GET /webhook (Sin cambios)
export const getWebhook = (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === env.META_VERIFY_TOKEN) {
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  }
};

// --- ¡POST /webhook (ACTUALIZADO)! ---
export const postWebhook = async (req, res) => {
  const body = req.body;

  // Responde 200 OK inmediatamente a Meta
  res.status(200).send('EVENT_RECEIVED');

  if (body.object === 'page') {
    try {
      for (const entry of body.entry) {
        for (const event of entry.messaging) {
          const senderId = event.sender.id;
          
          // Caso 1: El usuario envió un mensaje de texto
          if (event.message && event.message.text && !event.message.quick_reply) {
            const messageText = event.message.text;
            // Pasamos null como payload
            await processMessage(senderId, messageText, null);
          }
          
          // Caso 2: El usuario hizo clic en un botón (Quick Reply)
          if (event.message && event.message.quick_reply) {
            const messageText = event.message.text; // El texto del botón (ej. "🛠️ Sobre productos")
            const payload = event.message.quick_reply.payload; // El ID (ej. "MENU_PRODUCTOS")
            await processMessage(senderId, messageText, payload);
          }
        }
      }
    } catch (error) {
      console.error('Error procesando el evento:', error);
    }
  }
};