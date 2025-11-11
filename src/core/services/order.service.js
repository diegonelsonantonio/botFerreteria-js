import { setContext, deleteContext, getContext } from '../context/conversation.manager.js';
// Importamos sendQuickReply para el error de producto no encontrado
import { sendTextMessage, sendQuickReply } from './meta.service.js'; 
// ¡Importamos las funciones de la base de datos!
import { findProductByName, createOrder } from '../repositories/mongo.repository.js';
// Importamos el servicio de mensajes para acceder a menuData (usado en el cierre del pedido)
import * as messageService from './message.service.js';


// Función helper para extraer el nombre del producto
const extractProductName = (messageText) => {
  // Quita palabras comunes de la consulta
  const keywords = ['precio de', 'dame', 'cotiza', 'quiero', 'comprar', 'tiene', 'hay', 'existe'];
  let productName = messageText.toLowerCase();
  
  for (const kw of keywords) {
    productName = productName.replace(kw, '');
  }
  
  // Quita artículos (el, la, los, las) y signos de puntuación
  productName = productName
    .replace(/\b(el|la|los|las)\b/g, '')
    .replace(/[?¿!¡]/g, '') // Quita signos de interrogación
    .trim();
  
  // Devuelve las palabras clave limpias
  return productName;
};


export const handleOrderLogic = async (senderId, messageText, context) => {
  // Si no hay contexto, es un pedido/cotización nuevo
  if (!context) {
    // Extrae el nombre del producto del mensaje
    const productName = extractProductName(messageText);

    // 1. IR A LA BASE DE DATOS
    const product = await findProductByName(productName);

    // 2. Si encontramos el producto
    if (product) {
      // Creamos el objeto de contexto antes de la lógica de respuesta
      const newContext = { 
        state: 'IN_ORDER', 
        step: 'CONFIRM', 
        order: { 
          items: product.nombre, // Guardamos el nombre real
          price: product.precio,
          productId: product._id
        }
      };

      // Lógica para construir la respuesta de STOCK vs COTIZACIÓN
      const isStockQuestion = ['tiene', 'hay', 'existe'].some(kw => messageText.toLowerCase().includes(kw));
      let quoteText;

      if (isStockQuestion) {
          // Respuesta simple de stock
          quoteText = `Sí, tenemos "${product.nombre}" en stock.
Actualmente quedan ${product.stock} unidades.
Cuesta S/ ${product.precio.toFixed(2)}. ¿Deseas hacer un pedido? (si/no)`;
      } else {
          // Respuesta de cotización completa
          quoteText = `Encontré: ${product.nombre}.
Precio: S/ ${product.precio.toFixed(2)}.
Stock: ${product.stock} unidades.
¿Confirmas el pedido? (si/no)`;
      }

      // 3. Guardamos el contexto y enviamos la respuesta
      setContext(senderId, newContext);
      await sendTextMessage(senderId, quoteText);

    } else {
      // 4. Si no encontramos el producto (LÓGICA MEJORADA DE ERROR)
      const cannotFindMessage = `Lo siento, no pude encontrar el producto **${productName}** en nuestro inventario.`;
      
      const quickReplyButtons = [
        { title: 'Ver Productos', payload: 'LISTAR_PRODUCTOS' },
        { title: 'Volver al Menú', payload: 'MENU_MAIN' }
      ];

      await sendTextMessage(senderId, cannotFindMessage);
      
      // Enviamos un mensaje con los botones Quick Reply
      await sendQuickReply(
        senderId,
        '¿Deseas ver nuestra lista de productos disponibles en stock?',
        quickReplyButtons
      );
    }
    return;
  }

  // --- Si SÍ hay contexto, manejamos la máquina de estados ---
  
  switch (context.step) {
    case 'CONFIRM':
      if (messageText.toLowerCase() === 'si' || messageText.toLowerCase() === 'sí') {
        context.step = 'ASK_NAME';
        setContext(senderId, context);
        await sendTextMessage(senderId, '¡Perfecto! ¿A qué nombre registro el pedido?');
      } else {
        await sendTextMessage(senderId, 'Pedido cancelado. ¿En qué más te puedo ayudar?');
        deleteContext(senderId);
      }
      break;
    
    case 'ASK_NAME':
      context.order.name = messageText;
      context.step = 'ASK_PHONE';
      setContext(senderId, context);
      await sendTextMessage(senderId, `Gracias, ${messageText}. ¿Cuál es tu número de celular?`);
      break;
    
    case 'ASK_PHONE':
      context.order.phone = messageText;
      context.step = 'ASK_ADDRESS';
      setContext(senderId, context);
      await sendTextMessage(senderId, 'Casi listo. ¿Cuál es tu dirección de entrega?');
      break;
      
    case 'ASK_ADDRESS':
      context.order.address = messageText;
      
      // Guardar en la DB
      try {
        // Pasamos el objeto 'order' del contexto al repositorio
        await createOrder(senderId, context.order); 
        
        // --- RESPUESTA MEJORADA DE CIERRE DEL FLUJO ---
        await sendTextMessage(senderId, '¡Pedido registrado con éxito! Un asesor te contactará pronto. Gracias por elegirnos, vuelva pronto.');
      } catch (error) {
        console.error('Error al guardar pedido:', error);
        await sendTextMessage(senderId, 'Hubo un error registrando tu pedido, por favor intenta de nuevo.');
      }
      
      // Limpiamos el contexto para liberar al bot
      deleteContext(senderId);
      
      // Opcional: Reiniciamos el menú principal inmediatamente después del agradecimiento
      setTimeout(async () => {
          // Acceso directo al menú data del servicio de mensajes
          const menuData = messageService.menuData; 
          await sendTextMessage(senderId, '¿En qué más te puedo ayudar?');
          await sendQuickReply(senderId, menuData.main.text, menuData.main.replies);
      }, 1000); // 1 segundo de pausa para que se vea bien

      break;
  }
};