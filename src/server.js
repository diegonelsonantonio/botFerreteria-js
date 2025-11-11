import app from './app.js';
import { initDB } from './config/database.js';
import { env } from './config/index.js';

app.listen(env.PORT, () => {
  console.log(`🚀 Server corriendo en el puerto ${env.PORT}`);
  // Intenta conectarse a la DB al iniciar
  initDB();
});