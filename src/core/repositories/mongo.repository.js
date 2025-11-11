// Importamos los Modelos que acabamos de crear
import { ProductModel } from '../models/products.model.js';
import { OrderModel } from '../models/order.model.js';

// Guarda el pedido en la base de datos
export const createOrder = async (userId, order) => {
  const { name, phone, address, items } = order;

  // Creamos el nuevo documento de pedido
  const newOrder = new OrderModel({
    user_id: userId,
    customer_name: name,
    customer_phone: phone,
    customer_address: address,
    description: items, // 'items' es la descripción del pedido
    status: 'pending',
  });

  // Guardamos en la base de datos
  await newOrder.save();
  
  console.log(`Pedido ${newOrder._id} creado para el usuario ${userId}`);
  return newOrder;
};

// ESTA ES LA ÚNICA VERSIÓN DE LA FUNCIÓN (LA CORRECTA)
export const findProductByName = async (productName) => {
  try {
    // 1. Divide el texto en palabras clave
    const keywords = productName.split(' ').filter(k => k.length > 0);
    
    // 2. Procesa y crea consultas Regex para CADA palabra
    const regexQueries = keywords.map(kw => {
      // Intenta quitar la 's' del final para plurales (ej: brochas -> brocha)
      let stem = kw;
      if (kw.endsWith('s')) {
        stem = kw.slice(0, -1);
      }
      
      // Busca la palabra original O el stem
      return {
        nombre: { $regex: new RegExp(`(${kw}|${stem})`, 'i') }
      };
    });

    // 3. Busca un producto que contenga TODAS las palabras clave (original o singular)
    const product = await ProductModel.findOne({ 
      $and: regexQueries 
    });
    
    return product;
  } catch (error) {
    console.error('Error buscando producto:', error);
    return null;
  }
};

// NUEVA FUNCIÓN PARA LISTAR TODOS LOS PRODUCTOS
export const findAllProducts = async () => {
  try {
    // Busca todos los productos y selecciona solo los campos 'nombre' y 'stock'
    const products = await ProductModel.find({}, 'nombre stock');
    return products;
  } catch (error) {
    console.error('Error buscando todos los productos:', error);
    return []; // Devuelve un array vacío en caso de error
  }
};


// Guarda el historial de conversación (Aún no tenemos el modelo,
// pero así se vería)
// export const saveMessageToHistory = async (userId, sender, messageText) => {
//   const newMessage = new HistoryModel({ ... });
//   await newMessage.save();
// };