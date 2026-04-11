import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';

import { env } from './config/env';
import { connectDatabase } from './config/database';
import { swaggerSpec } from './config/swagger';
import { logger } from './utils/logger';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware';
import routes from './routes';

const app = express();

const corsOrigins = env.CORS_ORIGIN.split(',').map((o) => o.trim()).filter(Boolean);

/**
 * Helmet defaults include Cross-Origin-Resource-Policy: same-origin, which makes browsers
 * block reading API responses when the SPA origin differs (different host or port), e.g.
 * localhost:3000 → 127.0.0.1:5000. That surfaces as failed fetches / generic "Forbidden".
 * A JSON API consumed by a separate frontend needs CORP cross-origin (and no strict COEP).
 */
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginEmbedderPolicy: false,
  })
);

app.use(
  cors({
    credentials: true,
    origin(origin, callback) {
      if (!origin) {
        return callback(null, true);
      }
      if (corsOrigins.length === 0) {
        return callback(null, true);
      }
      if (corsOrigins.includes(origin)) {
        return callback(null, true);
      }
      callback(null, false);
    },
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(env.RATE_LIMIT_WINDOW_MS),
  max: parseInt(env.RATE_LIMIT_MAX),
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT',
      message: 'Too many requests, please try again later.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// HTTP request logging
app.use(morgan('dev', {
  stream: { write: (message: string) => logger.http(message.trim()) },
}));

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Medication Tracker API Docs',
}));

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api', routes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

const startServer = async () => {
  await connectDatabase();

  const PORT = parseInt(env.PORT);
  app.listen(PORT, () => {
    logger.info(`Server running on http://localhost:${PORT}`);
    logger.info(`API Docs available at http://localhost:${PORT}/api-docs`);
    logger.info(`Environment: ${env.NODE_ENV}`);
  });
};

startServer().catch((error) => {
  logger.error('Failed to start server:', error);
  process.exit(1);
});

export default app;

// 80% completed