import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { ValidationError } from 'sequelize';
import { AppError } from '../utils/AppError';

export const errorHandler = (error: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({ message: error.message });
  }

  if (error instanceof ZodError) {
    return res.status(400).json({
      message: 'Dados inválidos',
      issues: error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message
      }))
    });
  }

  if (error instanceof ValidationError) {
    return res.status(409).json({
      message: 'Violação de integridade',
      errors: error.errors.map((e) => e.message)
    });
  }

  console.error(error);
  return res.status(500).json({ message: 'Erro interno do servidor' });
};
