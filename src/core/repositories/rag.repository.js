import { KnowledgeModel } from '../models/knowledge.model.js';
import openai from '../../config/openai.js';

// Helper para crear el embedding de la pregunta del usuario
const createQueryEmbedding = async (text) => {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  });
  return response.data[0].embedding;
}

// Busca en Mongo Atlas
export const queryVectorDB = async (queryText, topK = 3) => {
  try {
    // 1. Crea el embedding de la pregunta del usuario
    const queryVector = await createQueryEmbedding(queryText);

    // 2. Ejecuta la búsqueda vectorial en Mongo
    const results = await KnowledgeModel.aggregate([
      {
        '$vectorSearch': {
          index: 'vector_index', // El nombre del índice que creaste en Atlas
          path: 'embedding',
          queryVector: queryVector,
          numCandidates: 10,
          limit: topK
        }
      },
      {
        // Pide solo los campos que necesitamos
        '$project': {
          _id: 0,
          text: 1,
          score: { '$meta': 'vectorSearchScore' }
        }
      }
    ]);
    
    // Filtra por un 'score' de similitud mínimo para asegurar relevancia
    const relevantResults = results.filter(r => r.score > 0.80);
    return relevantResults.map(r => r.text); // Devuelve solo los textos

  } catch (error) {
    console.error('Error consultando Atlas Vector Search:', error);
    return [];
  }
};