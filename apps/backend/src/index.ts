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

import { AiProviderConfig } from './models/AiProviderConfig';

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

const ensureUsersSchema = async () => {
  const qi = sequelize.getQueryInterface();
  try {
    const table = await qi.describeTable('users');
    if (!table.subscriptionStatus && !table.subscription_status) {
      await qi.addColumn('users', 'subscriptionStatus', {
        type: DataTypes.ENUM('free', 'premium', 'cancelled'),
        allowNull: false,
        defaultValue: 'free'
      });
      console.log('[migrate] Adicionada coluna subscriptionStatus em users');
    }
    if (!table.subscriptionId && !table.subscription_id) {
      await qi.addColumn('users', 'subscriptionId', {
        type: DataTypes.STRING,
        allowNull: true
      });
      console.log('[migrate] Adicionada coluna subscriptionId em users');
    }
    if (!table.stripeCustomerId && !table.stripe_customer_id) {
      await qi.addColumn('users', 'stripeCustomerId', {
        type: DataTypes.STRING,
        allowNull: true
      });
      console.log('[migrate] Adicionada coluna stripeCustomerId em users');
    }
    if (!table.premiumExpiresAt && !table.premium_expires_at) {
      await qi.addColumn('users', 'premiumExpiresAt', {
        type: DataTypes.DATE,
        allowNull: true
      });
      console.log('[migrate] Adicionada coluna premiumExpiresAt em users');
    }
  } catch (err) {
    console.warn('[migrate] Não foi possível inspecionar/adicionar colunas de sub em users:', err);
  }
};

const ensureUserSettingsSchema = async () => {
  const qi = sequelize.getQueryInterface();
  try {
    const table = await qi.describeTable('user_settings');
    if (!table.avatar_url && !table.avatarUrl) {
      await qi.addColumn('user_settings', 'avatarUrl', {
        type: DataTypes.TEXT,
        allowNull: true
      });
    }
  } catch (err) {
    console.warn('[migrate] Não foi possível inspecionar/adicionar avatarUrl em user_settings:', err);
  }

  // Ensure edital_files in study_plans
  try {
    const tablePlans = await qi.describeTable('study_plans');
    if (!tablePlans.edital_files && !tablePlans.editalFiles) {
      await qi.addColumn('study_plans', 'editalFiles', {
        type: DataTypes.JSON,
        allowNull: true
      });
      console.log('[migrate] Adicionada coluna editalFiles em study_plans');
    }
  } catch (err) {
    console.warn('[migrate] Não foi possível inspecionar/adicionar editalFiles em study_plans:', err);
  }
};

const seedAiProviders = async () => {
  try {
    const count = await AiProviderConfig.count();
    if (count === 0) {
      await AiProviderConfig.bulkCreate([
        {
          name: 'OpenRouter',
          slug: 'openrouter',
          baseUrl: 'https://openrouter.ai/api/v1',
          apiKeyEnvVar: 'OPENROUTER_API_KEY',
          defaultModel: 'google/gemini-2.0-flash-001',
          isActive: true,
          extraHeaders: {
            'HTTP-Referer': 'https://studyflow.app',
            'X-Title': 'StudyFlow AI'
          },
          maxTokensPerRequest: 4096,
          modelsAvailable: [
            { id: 'google/gemini-2.0-flash-001', name: 'Gemini 2.0 Flash', costPer1kInput: 0.0001, costPer1kOutput: 0.0004 },
            { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini', costPer1kInput: 0.00015, costPer1kOutput: 0.0006 },
            { id: 'anthropic/claude-3.5-haiku', name: 'Claude 3.5 Haiku', costPer1kInput: 0.0008, costPer1kOutput: 0.004 },
            { id: 'deepseek/deepseek-chat-v3-0324', name: 'DeepSeek V3', costPer1kInput: 0.00014, costPer1kOutput: 0.00028 }
          ]
        },
        {
          name: 'OpenAI Direto',
          slug: 'openai',
          baseUrl: 'https://api.openai.com/v1',
          apiKeyEnvVar: 'OPENAI_API_KEY',
          defaultModel: 'gpt-4o-mini',
          isActive: false,
          extraHeaders: {},
          maxTokensPerRequest: 4096,
          modelsAvailable: [
            { id: 'gpt-4o-mini', name: 'GPT-4o Mini', costPer1kInput: 0.00015, costPer1kOutput: 0.0006 },
            { id: 'gpt-4o', name: 'GPT-4o', costPer1kInput: 0.0025, costPer1kOutput: 0.01 }
          ]
        },
        {
          name: 'Google Gemini',
          slug: 'gemini',
          baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai',
          apiKeyEnvVar: 'GEMINI_API_KEY',
          defaultModel: 'gemini-2.0-flash',
          isActive: false,
          extraHeaders: {},
          maxTokensPerRequest: 8192,
          modelsAvailable: [
            { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', costPer1kInput: 0, costPer1kOutput: 0 }
          ]
        }
      ]);
      console.log('[migrate] Provedores de IA semeados com sucesso.');
    }
  } catch (err) {
    console.error('[migrate] Falha ao semear provedores de IA:', err);
  }
};

const runMigrationsAndSeed = async () => {
  await ensureUsersSchema();
  await ensureUserSettingsSchema();
  await sequelize.sync();
  await seedAiProviders();
};

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
