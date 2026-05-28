import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth';
import { AiQuota } from '../models/AiQuota';
import { AppError } from '../utils/AppError';

export const aiRateLimit = async (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
  if (!req.userId) {
    return next(new AppError('Usuário não autenticado.', 401));
  }

  const userId = req.userId;
  const today = new Date().toISOString().split('T')[0];

  const maxDailyRequests = Number(process.env.AI_DAILY_LIMIT || 100);
  const maxDailyTokens = Number(process.env.AI_DAILY_TOKEN_LIMIT || 500000);
  const minIntervalMs = Number(process.env.AI_MIN_INTERVAL_MS || 2000);

  try {
    const quota = await AiQuota.findOne({
      where: { userId, date: today }
    });

    if (quota) {
      // 1. Min interval check (prevent spam/flood)
      if (quota.lastRequestAt && minIntervalMs > 0) {
        const elapsed = Date.now() - new Date(quota.lastRequestAt).getTime();
        if (elapsed < minIntervalMs) {
          return next(new AppError('Muitas requisições em curto espaço de tempo. Aguarde um instante antes de tentar novamente.', 429));
        }
      }

      // 2. Request count check
      if (quota.requestCount >= maxDailyRequests) {
        return next(new AppError(`Limite diário de requisições de IA atingido (${maxDailyRequests}/${maxDailyRequests}).`, 429));
      }

      // 3. Token count check
      if (quota.tokenCount >= maxDailyTokens) {
        return next(new AppError(`Limite diário de uso de tokens excedido.`, 429));
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};
