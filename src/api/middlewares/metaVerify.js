import crypto from 'crypto';
import { env } from '../../config/index.js';

export const verifyMetaSignature = (req, res, next) => {
  const signature = req.headers['x-hub-signature-256'];

  if (!signature) {
    console.warn('Petición sin firma, descartada.');
    return res.sendStatus(403);
  }

  // req.body es el 'buffer' crudo gracias a express.raw()
  const hash = crypto
    .createHmac('sha256', env.META_APP_SECRET)
    .update(req.body)
    .digest('hex');

  if (signature !== `sha256=${hash}`) {
    console.warn('Firma inválida.');
    return res.sendStatus(403);
  }

  // Firma válida.
  // Ahora, parseamos el 'buffer' a JSON para el siguiente controlador
  try {
    req.body = JSON.parse(req.body.toString());
  } catch (e) {
    return res.status(400).send('Payload JSON inválido');
  }

  next();
};