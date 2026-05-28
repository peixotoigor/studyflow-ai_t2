import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth';
import { User } from '../models/User';
import { AppError } from '../utils/AppError';

export const requirePremium = async (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
  if (!req.userId) {
    return next(new AppError('Usuário não autenticado.', 401));
  }

  try {
    const user = await User.findByPk(req.userId, {
      attributes: ['id', 'subscriptionStatus', 'premiumExpiresAt']
    });

    if (!user) {
      return next(new AppError('Usuário não encontrado.', 404));
    }

    if (user.subscriptionStatus !== 'premium') {
      return next(new AppError('Recurso exclusivo para assinantes Premium.', 403));
    }

    // Verify expiration if it's set
    if (user.premiumExpiresAt && new Date(user.premiumExpiresAt) < new Date()) {
      await user.update({ subscriptionStatus: 'cancelled' });
      return next(new AppError('Sua assinatura Premium expirou.', 403));
    }

    next();
  } catch (error) {
    next(error);
  }
};
