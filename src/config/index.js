import { config } from 'dotenv';
config();

export const env = {
  // Meta
  META_VERIFY_TOKEN: process.env.META_VERIFY_TOKEN,
  META_PAGE_ACCESS_TOKEN: process.env.META_PAGE_ACCESS_TOKEN,
  META_APP_SECRET: process.env.META_APP_SECRET,
  // DB
  MONGO_URI: process.env.MONGO_URI,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_NAME: process.env.DB_NAME,
  // OpenAI
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  // Server
  PORT: process.env.PORT || 8080,
};