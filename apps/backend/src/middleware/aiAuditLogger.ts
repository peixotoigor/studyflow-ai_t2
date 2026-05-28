import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth';

export const aiAuditLogger = (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
  if (req.body) {
    const ipAddress = req.ip || req.headers['x-forwarded-for'] as string || req.socket.remoteAddress || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'unknown';

    req.body.__audit = {
      ipAddress: typeof ipAddress === 'string' ? ipAddress.split(',')[0].trim() : '127.0.0.1',
      userAgent: typeof userAgent === 'string' ? userAgent.substring(0, 200) : 'unknown'
    };
  }
  next();
};
