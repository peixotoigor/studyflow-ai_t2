// Vercel Serverless Function entrypoint
// @vercel/node compiles TS natively — import directly from backend source
import 'dotenv/config';
import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import routes from '../apps/backend/src/routes/index';
import { errorHandler } from '../apps/backend/src/middleware/errorHandler';
import { connectDatabase, sequelize } from '../apps/backend/src/config/database';
import { DataTypes } from 'sequelize';
import '../apps/backend/src/models/index';

const app = express();

// CORS — em produção (Vercel), aceitar domínio dinâmico
const corsOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(o => o.trim()).filter(Boolean)
  : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({ origin: corsOrigins, credentials: true }));
app.use(helmet());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Inicialização lazy do banco (uma vez por cold start)
let dbReady: Promise<void> | null = null;

const ensureDb = () => {
  if (!dbReady) {
    dbReady = (async () => {
      await connectDatabase();
      try {
        const qi = sequelize.getQueryInterface();
        const table = await qi.describeTable('user_settings');
        if (!table.avatar_url) {
          await qi.addColumn('user_settings', 'avatar_url', {
            type: DataTypes.TEXT,
            allowNull: true,
          });
        }
      } catch (_err) {
        // Tabela pode não existir ainda, sync criará
      }
      await sequelize.sync();
    })();
  }
  return dbReady;
};

// Middleware: garantir DB antes de cada request
app.use(async (req, _res, next) => {
  try {
    console.log(`[request] ${req.method} ${req.url} - ensuring db...`);
    await ensureDb();
  } catch (err) {
    console.error('[db-init-error]', err);
    // Não interromper o fluxo aqui, deixar as rotas/errorHandler lidarem com a falta de DB se necessário
  }
  next();
});

// Rotas do backend sob /api/v1
app.use('/api/v1', routes);
app.use(errorHandler);

export default app;
