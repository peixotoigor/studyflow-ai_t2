import { sequelize } from './database';
import { DataTypes } from 'sequelize';
import { AiProviderConfig } from '../models/AiProviderConfig';

export const ensureColumn = async (
  qi: any,
  tableName: string,
  camelName: string,
  snakeName: string,
  options: any
) => {
  const table = await qi.describeTable(tableName);
  // If the camelCase column exists and the snake_case one does not, rename it
  if (table[camelName] && !table[snakeName]) {
    await qi.renameColumn(tableName, camelName, snakeName);
    console.log(`[migrate] Renomeada coluna '${camelName}' para '${snakeName}' em '${tableName}'`);
  } 
  // If neither exists, add the snake_case column
  else if (!table[camelName] && !table[snakeName]) {
    await qi.addColumn(tableName, snakeName, options);
    console.log(`[migrate] Adicionada coluna '${snakeName}' em '${tableName}'`);
  }
};

export const ensureUsersSchema = async () => {
  const qi = sequelize.getQueryInterface();
  try {
    await ensureColumn(qi, 'users', 'subscriptionStatus', 'subscription_status', {
      type: DataTypes.ENUM('free', 'premium', 'cancelled'),
      allowNull: false,
      defaultValue: 'free'
    });
    await ensureColumn(qi, 'users', 'subscriptionId', 'subscription_id', {
      type: DataTypes.STRING,
      allowNull: true
    });
    await ensureColumn(qi, 'users', 'stripeCustomerId', 'stripe_customer_id', {
      type: DataTypes.STRING,
      allowNull: true
    });
    await ensureColumn(qi, 'users', 'premiumExpiresAt', 'premium_expires_at', {
      type: DataTypes.DATE,
      allowNull: true
    });
  } catch (err) {
    console.warn('[migrate] Não foi possível inspecionar/adicionar colunas de sub em users:', err);
  }
};

export const ensureUserSettingsSchema = async () => {
  const qi = sequelize.getQueryInterface();
  try {
    await ensureColumn(qi, 'user_settings', 'avatarUrl', 'avatar_url', {
      type: DataTypes.TEXT,
      allowNull: true
    });
  } catch (err) {
    console.warn('[migrate] Não foi possível inspecionar/adicionar avatar_url em user_settings:', err);
  }

  // Ensure edital_files in study_plans
  try {
    await ensureColumn(qi, 'study_plans', 'editalFiles', 'edital_files', {
      type: DataTypes.JSON,
      allowNull: true
    });
  } catch (err) {
    console.warn('[migrate] Não foi possível inspecionar/adicionar edital_files em study_plans:', err);
  }
};

export const seedAiProviders = async () => {
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

export const runMigrationsAndSeed = async () => {
  await ensureUsersSchema();
  await ensureUserSettingsSchema();
  await sequelize.sync();
  await seedAiProviders();
};
