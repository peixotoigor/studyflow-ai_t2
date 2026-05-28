import { Router, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { AiProviderConfig } from '../models/AiProviderConfig';
import { AiUsageLog } from '../models/AiUsageLog';
import { invalidateProviderCache } from '../services/aiProvider';
import { AppError } from '../utils/AppError';
import { sequelize } from '../config/database';

const router = Router();

// Middleware to check if user is an admin
export const requireAdmin = (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
  const adminIdsEnv = process.env.ADMIN_USER_IDS || '';
  const adminIds = adminIdsEnv.split(',').map((id) => id.trim()).filter(Boolean);

  if (!req.userId || !adminIds.includes(req.userId)) {
    return next(new AppError('Acesso restrito a administradores.', 403));
  }
  next();
};

router.use(requireAdmin);

// GET all providers
router.get('/providers', async (_req, res, next) => {
  try {
    const providers = await AiProviderConfig.findAll({
      order: [['name', 'ASC']]
    });
    res.json(providers);
  } catch (error) {
    next(error);
  }
});

// ACTIVATE a provider (and deactivate others)
router.put('/providers/:slug/activate', async (req: AuthenticatedRequest, res: Response, next) => {
  const transaction = await sequelize.transaction();
  try {
    const { slug } = req.params;

    // Verify if provider exists
    const provider = await AiProviderConfig.findOne({ where: { slug }, transaction });
    if (!provider) {
      await transaction.rollback();
      return next(new AppError('Provedor não encontrado.', 404));
    }

    // Deactivate all
    await AiProviderConfig.update({ isActive: false }, { where: {}, transaction });

    // Activate this one
    await provider.update({ isActive: true }, { transaction });

    await transaction.commit();
    invalidateProviderCache();

    res.json({ message: `Provedor ${provider.name} ativado com sucesso.`, provider });
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
});

// UPDATE a provider config
router.put('/providers/:slug', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { slug } = req.params;
    const { defaultModel, baseUrl, apiKeyEnvVar, maxTokensPerRequest, modelsAvailable } = req.body;

    const provider = await AiProviderConfig.findOne({ where: { slug } });
    if (!provider) {
      return next(new AppError('Provedor não encontrado.', 404));
    }

    await provider.update({
      defaultModel: defaultModel !== undefined ? defaultModel : provider.defaultModel,
      baseUrl: baseUrl !== undefined ? baseUrl : provider.baseUrl,
      apiKeyEnvVar: apiKeyEnvVar !== undefined ? apiKeyEnvVar : provider.apiKeyEnvVar,
      maxTokensPerRequest: maxTokensPerRequest !== undefined ? maxTokensPerRequest : provider.maxTokensPerRequest,
      modelsAvailable: modelsAvailable !== undefined ? modelsAvailable : provider.modelsAvailable
    });

    invalidateProviderCache();
    res.json({ message: `Configurações do provedor ${provider.name} atualizadas com sucesso.`, provider });
  } catch (error) {
    next(error);
  }
});

// ADD a new custom provider
router.post('/providers', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { name, slug, baseUrl, apiKeyEnvVar, defaultModel, maxTokensPerRequest, modelsAvailable, extraHeaders } = req.body;

    if (!name || !slug || !baseUrl || !apiKeyEnvVar || !defaultModel) {
      return next(new AppError('Campos obrigatórios ausentes: name, slug, baseUrl, apiKeyEnvVar, defaultModel.', 400));
    }

    const existing = await AiProviderConfig.findOne({ where: { slug } });
    if (existing) {
      return next(new AppError(`Já existe um provedor cadastrado com o slug "${slug}".`, 409));
    }

    const provider = await AiProviderConfig.create({
      name,
      slug,
      baseUrl,
      apiKeyEnvVar,
      defaultModel,
      maxTokensPerRequest: maxTokensPerRequest || 4096,
      modelsAvailable: modelsAvailable || [],
      extraHeaders: extraHeaders || {},
      isActive: false
    });

    res.status(201).json({ message: `Provedor ${name} criado com sucesso.`, provider });
  } catch (error) {
    next(error);
  }
});

// GET aggregated usage/cost stats
router.get('/usage-stats', async (_req, res, next) => {
  try {
    // Basic stats group by provider and endpoint
    const stats = await AiUsageLog.findAll({
      attributes: [
        'provider',
        'endpoint',
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('inputTokens')), 'totalInputTokens'],
        [sequelize.fn('SUM', sequelize.col('outputTokens')), 'totalOutputTokens'],
        [sequelize.fn('SUM', sequelize.col('estimatedCostUsd')), 'totalCostUsd'],
        [sequelize.fn('AVG', sequelize.col('durationMs')), 'avgDurationMs'],
      ],
      group: ['provider', 'endpoint', 'status'],
      order: [['provider', 'ASC'], ['endpoint', 'ASC']]
    });

    res.json(stats);
  } catch (error) {
    next(error);
  }
});

export default router;
