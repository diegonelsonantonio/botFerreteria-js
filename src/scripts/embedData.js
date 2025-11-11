// Para ejecutar, usa este comando en tu terminal:
// node --require=dotenv/config src/scripts/embedData.js

import { initDB } from '../config/database.js';
import openai from '../config/openai.js';
import { KnowledgeModel } from '../core/models/knowledge.model.js';
import { env } from '../config/index.js';

// --- TUS DATOS (del anexo del examen) ---

const faqs = [
  "¿Qué es el fierro corrugado y para qué se utiliza en construcción? El fierro corrugado es una varilla de acero con relieves en su superficie que mejora la adherencia al concreto. Se usa como refuerzo estructural en columnas, vigas y losas.",
  "¿Qué tipo de cemento se recomienda para estructuras resistentes? Para estructuras que requieren alta resistencia, se recomienda el Cemento Portland Tipo I, por su durabilidad y desempeño en obras generales.",
  "¿Qué ventajas tiene usar pintura látex en interiores? La pintura látex es ideal para interiores por su bajo olor, fácil aplicación, rápido secado y posibilidad de limpieza sin dañar el acabado.",
  "¿Qué herramientas básicas se necesitan para trabajos domésticos? Las herramientas esenciales incluyen taladro, cinta métrica, brochas, llave ajustable, guantes de seguridad y destornilladores.",
  "¿Qué beneficios ofrece un foco LED frente a uno tradicional? Los focos LED consumen menos energía, duran más tiempo y generan menos calor, lo que los hace más eficientes y seguros.",
  "¿Qué información se necesita para registrar un pedido? Para registrar un pedido se requiere nombre completo, número de celular, dirección de entrega y una descripción clara de los productos.",
  "¿La ferretería ofrece servicio de entrega a domicilio? Sí",
  "¿Qué métodos de pago aceptan? Aceptamos transferencias, yape, plin",
  "¿Cuál es el horario de atención? Atendemos de lunes a sábado entre 8:00 a.m. y 6:00 p.m",
  "¿Atienden los domingos o feriados? No atendemos domingos o feriados.",
  "¿Puedo dejar un pedido fuera del horario de atención? Sí, puedes dejar tu solicitud. Será atendida en el siguiente horario hábil."
];

const products = [
  "Producto: Cemento Portland Tipo I (Bolsa 42.5 kg). Descripción: Cemento de alta resistencia ideal para estructuras, muros y pisos. Precio: S/ 28.50",
  "Producto: Fierro Corrugado 1/2\" x 9 m. Descripción: Varilla de acero corrugado para refuerzo de concreto en obras de construcción. Precio: S/ 32.00",
  "Producto: Clavo de acero 2” (caja x 1 kg). Descripción: Clavos galvanizados para carpintería y estructuras livianas. Precio: S/ 9.90",
  "Producto: Pintura Látex Blanca 1 galón. Descripción: Pintura de acabado mate para interiores, de fácil aplicación y secado rápido. Precio: S/ 45.00",
  "Producto: Brocha de 2” de cerda sintética. Descripción: Brocha económica y duradera, ideal para pintura en muros y superficies lisas. Precio: S/ 8.50",
  "Producto: Taladro Percutor 1/2” 710W (marca Truper). Descripción: Taladro eléctrico de doble función (perforar y percutir) con mango auxiliar. Precio: S/ 189.00",
  "Producto: Cinta Métrica de 5 metros. Descripción: Cinta de acero retráctil con gancho imantado y carcasa ergonómica. Precio: S/ 17.00",
  "Producto: Llave Stillson 14” (ajustable). Descripción: Llave ajustable para tuberías metálicas, de cuerpo robusto y dientes templados. Precio: S/ 46.00",
  "Producto: Guantes de Seguridad de Nitrilo (par). Descripción: Guantes resistentes a cortes y productos químicos, ideales para trabajos industriales. Precio: S/ 11.50",
  "Producto: Foco LED 12W rosca E27 (luz fría). Descripción: Foco LED de bajo consumo y larga duración, equivalente a 100W incandescente. Precio: S/ 7.90"
];

const documents = [...faqs, ...products];

// --- LÓGICA DEL SCRIPT ---

const createEmbedding = async (text) => {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small', // 1536 dimensiones
    input: text,
  });
  return response.data[0].embedding;
};

const embedAndUpsert = async () => {
  console.log('Iniciando conexión a la DB...');
  await initDB();
  console.log('Iniciando proceso de embedding...');
  
  // Borra los documentos viejos para evitar duplicados
  await KnowledgeModel.deleteMany({});
  console.log("Colección 'knowledge' limpiada.");

  for (const docText of documents) {
    try {
      // 1. Crear el vector
      const vector = await createEmbedding(docText);
      
      // 2. Subirlo a Mongo Atlas
      const newDoc = new KnowledgeModel({
        text: docText,
        embedding: vector,
      });
      await newDoc.save();
      
      console.log(`✅ Embedd y subido: ${docText.substring(0, 40)}...`);
    } catch (error) {
      console.error(`❌ Error con documento:`, error);
    }
  }
  
  console.log('¡Proceso completado!');
  process.exit(0);
};

// Ejecuta el script
embedAndUpsert();