import { getContext } from '../context/conversation.manager.js';
import { handleOrderLogic } from './order.service.js';
import { handleRagLogic } from './rag.service.js';
import { sendTextMessage, sendQuickReply } from './meta.service.js';
import { findAllProducts } from '../repositories/mongo.repository.js';

// --- Definimos la estructura de nuestro menú ---
const menuData = {
  // Menú Principal Simplificado
  main: {
    text: '¡Hola! ¿Cómo te puedo ayudar hoy? Selecciona una opción.',
    replies: [
      { title: '❓ Preguntas Frecuentes', payload: 'MENU_CATEGORIAS' },
      { title: '💰 Cotizar / Pedido', payload: 'INICIAR_PEDIDO' },
    ]
  },

  main2: {
    text: 'Pregunta por nuestro productos o selecciona una opción! 😊',
    replies: [
      { title: '❓ Preguntas Frecuentes', payload: 'MENU_CATEGORIAS' },
      { title: '💰 Cotizar / Pedido', payload: 'INICIAR_PEDIDO' },
    ]
  },

  // Menú de Categorías (Segundo nivel)
  categorias: {
    text: 'Selecciona una categoría para explorar:',
    replies: [
      { title: '🛠️ Sobre productos', payload: 'MENU_PRODUCTOS' },
      { title: '🧰 Sobre servicios', payload: 'MENU_SERVICIOS' },
      { title: '🕒 Horarios y atención', payload: 'MENU_HORARIOS' },
      { title: 'Volver al inicio', payload: 'MENU_MAIN' },
    ]
  },

  // Menú de Productos (5 preguntas)
  productos: {
    text: 'Aquí tienes las preguntas más comunes sobre productos. O puedes escribir tu propia pregunta.',
    replies: [
      { title: '¿Qué es el fierro?', payload: 'FAQ_FIERRO' },
      { title: '¿Qué cemento usar?', payload: 'FAQ_CEMENTO' },
      { title: '¿Ventajas de pintura?', payload: 'FAQ_LATEX' },
      { title: '¿Herramientas básicas?', payload: 'FAQ_HERRAMIENTAS' },
      { title: '¿Beneficios LED?', payload: 'FAQ_LED' },
      { title: 'Volver al inicio', payload: 'MENU_MAIN' },
    ]
  },

  // Menú de Servicios
  servicios: {
    text: 'Aquí tienes las preguntas más comunes sobre servicios:',
    replies: [
      { title: '¿Datos para pedido?', payload: 'FAQ_DATOS_PEDIDO' },
      { title: '¿Hay delivery?', payload: 'FAQ_DELIVERY' },
      { title: '¿Métodos de pago?', payload: 'FAQ_PAGOS' },
      { title: 'Volver al inicio', payload: 'MENU_MAIN' },
    ]
  },
  
  // Menú de Horarios
  horarios: {
    text: 'Aquí tienes las preguntas más comunes sobre nuestros horarios:',
    replies: [
      { title: '¿Cuál es el horario?', payload: 'FAQ_HORARIO' },
      { title: '¿Atienden domingos?', payload: 'FAQ_DOMINGOS' },
      { title: '¿Pedido fuera de hora?', payload: 'FAQ_FUERA_HORA' },
      { title: 'Volver al inicio', payload: 'MENU_MAIN' },
    ]
  }
};

// --- Mapeo de RAG: Payloads a Preguntas (NECESARIO PARA DISPARAR LA BÚSQUEDA) ---
const RAG_MAP = {
  // PRODUCTOS
  'FAQ_FIERRO': '¿Qué es el fierro corrugado y para qué se utiliza en construcción?',
  'FAQ_CEMENTO': '¿Qué tipo de cemento se recomienda para estructuras resistentes?',
  'FAQ_LATEX': '¿Qué ventajas tiene usar pintura látex en interiores?',
  'FAQ_HERRAMIENTAS': '¿Qué herramientas básicas se necesitan para trabajos domésticos?',
  'FAQ_LED': '¿Qué beneficios ofrece un foco LED frente a uno tradicional?',
  
  // SERVICIOS
  'FAQ_DATOS_PEDIDO': '¿Qué información se necesita para registrar un pedido?',
  'FAQ_DELIVERY': '¿La ferretería ofrece servicio de entrega a domicilio?',
  'FAQ_PAGOS': '¿Qué métodos de pago aceptan?',
  
  // HORARIOS
  'FAQ_HORARIO': '¿Cuál es el horario de atención?',
  'FAQ_DOMINGOS': '¿Atienden los domingos o feriados?',
  'FAQ_FUERA_HORA': '¿Puedo dejar un pedido fuera del horario de atención?',
};


// --- El Orquestador Principal (Actualizado) ---

export const processMessage = async (senderId, messageText, payload) => {
  console.log(`Procesando de ${senderId}: (Texto: ${messageText}, Payload: ${payload})`);
  
  const context = getContext(senderId);
  
  // --- Flujo 1: El usuario está en medio de un pedido ---
  if (context?.state === 'IN_ORDER') {
    await handleOrderLogic(senderId, messageText, context);
    return;
  }

  // --- Flujo 2: El usuario hizo clic en un botón (Payload) ---
  if (payload) {
    switch (payload) {
      case 'MENU_MAIN':
        await sendQuickReply(senderId, menuData.main.text, menuData.main.replies);
        break;

      // Navegación de menús
      case 'MENU_CATEGORIAS':
        await sendQuickReply(senderId, menuData.categorias.text, menuData.categorias.replies);
        break;
      case 'MENU_PRODUCTOS':
        await sendQuickReply(senderId, menuData.productos.text, menuData.productos.replies);
        break;
      case 'MENU_SERVICIOS':
        await sendQuickReply(senderId, menuData.servicios.text, menuData.servicios.replies);
        break;
      case 'MENU_HORARIOS':
        await sendQuickReply(senderId, menuData.horarios.text, menuData.horarios.replies);
        break;
      case 'INICIAR_PEDIDO':
          await sendTextMessage(senderId, '¡Excelente! Escribe el nombre o el precio del producto que deseas cotizar (ej: precio del cemento):');
          break;
      case 'LISTAR_PRODUCTOS':
        const products = await findAllProducts();
        if (products && products.length > 0) {
          const productList = products.map(p => 
            `* ${p.nombre} (Stock: ${p.stock})`
          ).join('\n');
          await sendTextMessage(senderId, `Aquí están nuestros productos:\n${productList}`);
        } else {
          await sendTextMessage(senderId, 'No pude cargar la lista de productos en este momento.');
        }
        // Después de listar, volvemos al menú principal
        await sendQuickReply(senderId, menuData.main2.text, menuData.main2.replies);
        break;
      
      // Payloads de RAG (Busca la pregunta en el mapa y la dispara)
      case 'FAQ_FIERRO':
      case 'FAQ_CEMENTO':
      case 'FAQ_LATEX':
      case 'FAQ_HERRAMIENTAS':
      case 'FAQ_LED':
      case 'FAQ_DATOS_PEDIDO':
      case 'FAQ_DELIVERY':
      case 'FAQ_PAGOS':
      case 'FAQ_HORARIO':
      case 'FAQ_DOMINGOS':
      case 'FAQ_FUERA_HORA':
        await handleRagLogic(senderId, RAG_MAP[payload]);
        break;
      
      default:
        await sendTextMessage(senderId, "Ups, no reconocí ese botón.");
    }
    return;
  }

  // --- Flujo 3: El usuario escribió texto ---
  const lowerText = messageText.toLowerCase();

  // Palabras clave para mostrar el menú
  const menuKeywords = ['menu', 'menú', 'ayuda', 'hola', 'inicio', 'empezar', 'hi'];
  if (menuKeywords.includes(lowerText)) {
    await sendQuickReply(senderId, menuData.main.text, menuData.main.replies);
    return;
  }

  // Palabras clave para lógica de pedidos (cotización y stock)
  const orderKeywords = ['pedido', 'comprar', 'cotizar', 'quiero', 'precio de', 'stock de', 'tiene', 'inventario de', 'cuanto el'];
  if (orderKeywords.some(kw => lowerText.includes(kw))) {
    await handleOrderLogic(senderId, messageText, null);
    return;
  }
  
  // Listar Productos (entrada directa)
  const listProductsKeywords = ['productos', 'lista de productos', 'que productos tienes', 'que vendes', 'inventario'];
  if (listProductsKeywords.some(kw => lowerText.includes(kw))) {
    const products = await findAllProducts();
    if (products && products.length > 0) {
      const productList = products.map(p => 
        `* ${p.nombre} (Stock: ${p.stock})`
      ).join('\n');
      
      await sendTextMessage(senderId, `Claro, aquí están nuestros productos:\n${productList}`);
    } else {
      await sendTextMessage(senderId, 'No pude encontrar la lista de productos en este momento.');
    }
    return;
  }
  // Palabras clave de Despedida/Cierre (NUEVA LÓGICA)
  const goodbyeKeywords = ['ok gracias', 'ok listo', 'chau', 'adios', 'adiós', 'terminar', 'finalizar', 'gracias', 'hasta luego', 'hasta pronto', 'bye'];
  if (goodbyeKeywords.includes(lowerText)) {
    // 1. Mensaje de cierre
    await sendTextMessage(senderId, "¡Gracias a usted! Vuelva pronto.");
    
    // 2. Limpia cualquier contexto de pedido o menú
    deleteContext(senderId); 
    
    // 3. Reinicia el ciclo, mostrando el menú principal inmediatamente después
    setTimeout(async () => {
        await sendQuickReply(senderId, menuData.main.text, menuData.main.replies);
    }, 500);
    
    return;
  }
  
  // --- Flujo 4: Si no es nada de lo anterior, es RAG (búsqueda inteligente) ---
  await handleRagLogic(senderId, messageText);
};