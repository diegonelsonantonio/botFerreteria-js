// ATENCIÓN: Esto es un gestor de contexto en memoria.
// Si Cloud Run escala a múltiples instancias, esto NO funcionará.
// Para el examen, demuestra el concepto, pero en la "vida real"
// deberías guardar el contexto en tu tabla 'users' de MySQL o en Redis.

const conversationContexts = new Map();

export const getContext = (userId) => {
  return conversationContexts.get(userId);
};

export const setContext = (userId, context) => {
  conversationContexts.set(userId, context);
};

export const deleteContext = (userId) => {
  conversationContexts.delete(userId);
};