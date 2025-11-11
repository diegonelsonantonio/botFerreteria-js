import { Schema, model } from 'mongoose';

const knowledgeSchema = new Schema({
  text: { type: String, required: true },
  embedding: { type: [Number], required: true },
});

export const KnowledgeModel = model('knowledge', knowledgeSchema);