import { Router } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest } from '../middleware/auth';
import { StudyPlan } from '../models/StudyPlan';
import { Subject } from '../models/Subject';
import { AppError } from '../utils/AppError';
import { syncToDriveIfConnected } from '../services/driveSync';

const router = Router();

const createPlanSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  color: z.string().optional(),
  editalFiles: z.any().optional()
});

router.get('/', async (req: AuthenticatedRequest, res) => {
  const plans = await StudyPlan.findAll({
    where: { userId: req.userId },
    include: [{ model: Subject, as: 'subjects' }],
    order: [['createdAt', 'ASC']]
  });
  res.json({ plans });
});

router.post('/', async (req: AuthenticatedRequest, res) => {
  const { name, description, color } = createPlanSchema.parse(req.body);
  const plan = await StudyPlan.create({
    userId: req.userId as string,
    name,
    description: description ?? null,
    color: color ?? null,
    editalFiles: req.body.editalFiles ?? null
  });
  void syncToDriveIfConnected(req.userId as string).catch((err) => console.warn('[drive-sync] plan create', err));
  res.status(201).json({ plan });
});

router.put('/:planId', async (req: AuthenticatedRequest, res) => {
  const { planId } = req.params;
  const { name, description, color } = createPlanSchema.partial().parse(req.body);
  const plan = await StudyPlan.findOne({ where: { id: planId, userId: req.userId } });
  if (!plan) {
    throw new AppError('Plano não encontrado', 404);
  }

  await plan.update({
    name: name ?? plan.name,
    description: description ?? plan.description,
    color: color ?? plan.color,
    editalFiles: req.body.editalFiles ?? plan.editalFiles
  });
  void syncToDriveIfConnected(req.userId as string).catch((err) => console.warn('[drive-sync] plan update', err));
  res.json({ plan });
});

router.delete('/:planId', async (req: AuthenticatedRequest, res) => {
  const { planId } = req.params;
  const deleted = await StudyPlan.destroy({ where: { id: planId, userId: req.userId } });
  if (!deleted) {
    throw new AppError('Plano não encontrado', 404);
  }
  void syncToDriveIfConnected(req.userId as string).catch((err) => console.warn('[drive-sync] plan delete', err));
  res.status(204).send();
});

export default router;
