import openai from '../../config/openai.js';
// 1. Importa la función correcta
import { queryVectorDB } from '../repositories/rag.repository.js'; 
import { sendTextMessage } from './meta.service.js';

const NO_INFO_MESSAGE = "Por ahora no cuento con la información que solicitas, pero la consultaré y te responderé en cuanto disponga de los datos necesarios.";

export const handleRagLogic = async (senderId, messageText) => {
  
  // 1. Buscar en la DB Vectorial (ahora pasamos el texto directo)
  const contextResults = await queryVectorDB(messageText);
  
  // 2. Si no hay resultados, responder "no sé"
  if (!contextResults || contextResults.length === 0) {
    await sendTextMessage(senderId, NO_INFO_MESSAGE);
    return;
  }

  // 3. Construir el prompt para OpenAI
  const contextText = contextResults.join('\n---\n');
  const prompt = `
    Eres un asistente de ferretería amable y servicial.
    Responde la pregunta del usuario basándote *únicamente* en el siguiente contexto.
    Si la respuesta no está en el contexto, di: "${NO_INFO_MESSAGE}"

    Contexto:
    ${contextText}
    
    Pregunta:
    ${messageText}
    
    Respuesta:
  `;

  // 4. Llamar a OpenAI para generar la respuesta
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
    });
    const answer = response.choices[0].message.content;
    
    // 5. Enviar respuesta
    await sendTextMessage(senderId, answer);
    
  } catch (error) {
    console.error('Error llamando a OpenAI:', error);
    await sendTextMessage(senderId, "Tuve un problema generando tu respuesta.");
  }
};

// ¡Ya no necesitamos 'createEmbedding' aquí!