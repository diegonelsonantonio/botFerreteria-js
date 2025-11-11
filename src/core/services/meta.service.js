import { env } from '../../config/index.js';

const META_API_URL = `https://graph.facebook.com/v18.0/me/messages?access_token=${env.META_PAGE_ACCESS_TOKEN}`;

const callMetaAPI = async (messageData) => {
  try {
    const response = await fetch(META_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(messageData),
    });
    if (!response.ok) {
      console.error('Error enviando mensaje a Meta:', await response.json());
    }
  } catch (error) {
    console.error('Error en fetch a Meta API:', error);
  }
};

export const sendTextMessage = async (recipientId, text) => {
  const messageData = {
    recipient: { id: recipientId },
    message: { text: text },
  };
  await callMetaAPI(messageData);
};

// --- ¡NUEVA FUNCIÓN! ---
/**
 * Envía un mensaje de texto con botones de respuesta rápida.
 * @param {string} recipientId - El ID del usuario en Messenger.
 * @param {string} text - El texto que se mostrará sobre los botones.
 * @param {Array<Object>} replies - Un array de objetos de respuesta.
 * E.g., [{ title: 'Botón 1', payload: 'PAYLOAD_1' }]
 */
export const sendQuickReply = async (recipientId, text, replies) => {
  const messageData = {
    recipient: { id: recipientId },
    messaging_type: 'RESPONSE',
    message: {
      text: text,
      quick_replies: replies.map(reply => ({
        content_type: 'text',
        title: reply.title, // El texto visible del botón
        payload: reply.payload, // El ID "oculto" que recibimos al hacer clic
      })),
    },
  };
  await callMetaAPI(messageData);
};