import 'dotenv/config';
import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import routes from './routes/index';
import { errorHandler } from './middleware/errorHandler';
import { connectDatabase, sequelize } from './config/database';
import { DataTypes } from 'sequelize';
import './models/index';

import { runMigrationsAndSeed } from './config/migrations';

const app = express();

// CORS configuration
const corsOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(o => o.trim()).filter(Boolean)
  : ['http://localhost:5173', 'http://localhost:3000'];

const corsOptions = {
  origin: corsOrigins,
  credentials: true
};

app.use(cors(corsOptions));
app.use(helmet());
// Stripe webhook raw body parser must be before express.json()
app.use('/api/v1/payments/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());
app.use(morgan('dev'));

app.get('/', (_req, res) => {
  res.json({ name: 'StudyFlow AI API', version: 'v1', docs: '/api/v1' });
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/v1', routes);
app.use(errorHandler);

const port = Number(process.env.PORT || 4000);

const start = async () => {
  await connectDatabase();
  await runMigrationsAndSeed();
  app.listen(port, () => {
    console.log(`API escutando na porta ${port}`);
  });
};

if (process.env.VERCEL) {
  // Inicialização assíncrona para Vercel via middleware simples ou auto-início
  connectDatabase()
    .then(() => runMigrationsAndSeed())
    .catch(console.error);
} else {
  start().catch((error) => {
    console.error('Falha ao iniciar servidor', error);
    process.exit(1);
  });
}

// Export for Vercel/Serverless
export default app;
