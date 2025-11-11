import { Schema, model } from 'mongoose';

// Este es el esquema de tu colección 'productos'
// Coincide con la imagen que me mostraste
const productSchema = new Schema({
  nombre: { type: String, required: true },
  descripcion: { type: String, required: true },
  precio: { type: Number, required: true },
  stock: { type: Number, default: 0 },
  // Dejaremos el 'embedding' para el RAG después
});

// Exportamos el modelo
export const ProductModel = model('productos', productSchema);