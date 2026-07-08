import express, { type Express } from 'express';
import cors from 'cors';
import importRoutes from './routes/import.routes';
import { errorHandler } from './middleware/errorHandler';

export function createApp(): Express {
  const app = express();

  const allowedOrigins = process.env.ALLOWED_ORIGINS ?? '*';
  app.use(
    cors({
      origin: allowedOrigins === '*' ? true : allowedOrigins.split(',').map((s) => s.trim()),
    })
  );

  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', model: process.env.AI_MODEL ?? 'llama-3.3-70b-versatile' });
  });

  app.use('/api', importRoutes);

  app.use(errorHandler);

  return app;
}
