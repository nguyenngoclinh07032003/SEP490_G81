import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import { requestContext } from './middlewares/request-context.js';
import { errorHandler,notFound } from './middlewares/error-handler.js';
import { createRoutes } from './routes/index.js';
import { createHealthService } from './services/health.service.js';
// Tạo ứng dụng Express, gắn middleware và các tuyến API /api/v1.
export function createApp({healthService=createHealthService(), authService, sessionService, adminAccountService}={}) {
  const app=express();app.disable('x-powered-by');
  app.use(requestContext);
  app.use(cors({origin:env.CORS_ORIGIN,credentials:true,exposedHeaders:['X-Request-Id']}));
  app.use(express.json({limit:'32kb',strict:true}));
  app.use('/api/v1',createRoutes(healthService, authService, sessionService, adminAccountService));
  app.use(notFound);app.use(errorHandler);
  return app;
}
