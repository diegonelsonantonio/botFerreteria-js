import { Schema, model } from 'mongoose';

const orderSchema = new Schema({
  user_id: { type: String, required: true }, // El PSID de Messenger
  customer_name: { type: String, required: true },
  customer_phone: { type: String, required: true },
  customer_address: { type: String, required: true },
  description: { type: String, required: true }, // La descripción del pedido
  status: { type: String, default: 'pending' },
  createdAt: { type: Date, default: Date.now },
});

export const OrderModel = model('orders', orderSchema);