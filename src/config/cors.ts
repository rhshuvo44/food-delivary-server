import cors from 'cors';
import { config } from './environment';

export const corsOptions = cors({
  origin: config.CORS_ORIGIN,
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});
