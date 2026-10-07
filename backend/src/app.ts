import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env';
import { errorHandler } from './middlewares/errorHandler';

import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import quizRoutes from './routes/quizRoutes';
import govtExamRoutes from './routes/govtExamRoutes';
import socialRoutes from './routes/socialRoutes';
import aiRoutes from './routes/aiRoutes';
import adminRoutes from './routes/adminRoutes';
import tournamentRoutes from './routes/tournamentRoutes';

export const createApp = (): Express => {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN,
      credentials: true,
    })
  );
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  if (env.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
  }

  // Health check endpoint
  app.get('/health', (_req, res) => {
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });

  // REST API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/quizzes', quizRoutes);
  app.use('/api/govt-exams', govtExamRoutes);
  app.use('/api/social', socialRoutes);
  app.use('/api/tournaments', tournamentRoutes);
  app.use('/api/ai', aiRoutes);
  app.use('/api/admin', adminRoutes);

  // Global Error Handler
  app.use(errorHandler);

  return app;
};
