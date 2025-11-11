import mongoose from 'mongoose';
import { env } from './index.js';

// Esta es la única función que necesitamos.
// La llamaremos desde server.js
export const initDB = async () => {
  try {
    // Usamos el MONGO_URI de tu archivo .env
    await mongoose.connect(env.MONGO_URI, {
      dbName: env.DB_NAME, // 'ferreteria_db'
    });
    console.log('✅ Conexión a MongoDB Atlas exitosa!');
  } catch (error) {
    console.error('❌ Error al conectar con MongoDB:', error);
    process.exit(1); // Detiene la app si no se puede conectar
  }
};

// No exportamos un 'pool', mongoose maneja las conexiones globalmente.