// Vercel Serverless Function entrypoint
import 'dotenv/config';
import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import routes from '../apps/backend/src/routes/index';
import { errorHandler } from '../apps/backend/src/middleware/errorHandler';
import { connectDatabase, sequelize } from '../apps/backend/src/config/database';
import '../apps/backend/src/models/index';

const app = express();

const corsOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(o => o.trim()).filter(Boolean)
  : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({ origin: corsOrigins, credentials: true }));
app.use(helmet());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Lazy DB init — uma vez por cold start
let dbReady: Promise<void> | null = null;
const ensureDb = () => {
  if (!dbReady) {
    dbReady = (async () => {
      await connectDatabase();
      await sequelize.sync();
    })();
  }
  return dbReady;
};

// Middleware: garantir DB antes de cada request
app.use(async (_req, _res, next) => {
  try {
    await ensureDb();
  } catch (err) {
    console.error('[vercel-db-init]', err);
  }
  next();
});

// Rotas
app.use('/api/v1', routes);
app.use(errorHandler);

export default app;
