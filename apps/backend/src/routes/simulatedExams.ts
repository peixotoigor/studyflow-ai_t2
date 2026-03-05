import { Router } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest } from '../middleware/auth';
import { SimulatedExam } from '../models/SimulatedExam';
import { assertPlanOwnership } from '../services/studyAccess';
import { syncToDriveIfConnected } from '../services/driveSync';

const router = Router();

const examSchema = z.object({
  planId: z.string().uuid(),
  title: z.string().min(2),
  institution: z.string().min(2),
  date: z.coerce.date(),
  totalQuestions: z.number().int().positive(),
  correctAnswers: z.number().int().min(0),
  notes: z.string().optional()
});

router.get('/', async (req: AuthenticatedRequest, res) => {
  const exams = await SimulatedExam.findAll({
    include: [{
      association: 'plan',
      required: true,
      where: { userId: req.userId }
    }],
    order: [['date', 'DESC']]
  });
  res.json({ exams });
});

router.post('/', async (req: AuthenticatedRequest, res) => {
  const data = examSchema.parse(req.body);
  const plan = await assertPlanOwnership(req.userId as string, data.planId);
  if (data.correctAnswers > data.totalQuestions) {
    return res.status(400).json({ message: 'Respostas corretas não podem exceder o total de questões' });
  }
  const exam = await SimulatedExam.create({
    planId: plan.id,
    title: data.title,
    institution: data.institution,
    date: data.date,
    totalQuestions: data.totalQuestions,
    correctAnswers: data.correctAnswers,
    notes: data.notes ?? null
  });
  void syncToDriveIfConnected(req.userId as string).catch((err) => console.warn('[drive-sync] exam create', err));
  res.status(201).json({ exam });
});

router.put('/:examId', async (req: AuthenticatedRequest, res) => {
  const { examId } = req.params;
  const exam = await SimulatedExam.findByPk(examId, { include: ['plan'] });
  if (!exam || exam.plan?.userId !== req.userId) {
    return res.status(404).json({ message: 'Simulado não encontrado' });
  }
  const data = examSchema.partial().parse(req.body);
  if (data.planId) {
    await assertPlanOwnership(req.userId as string, data.planId);
  }
  const targetPlanId = data.planId ?? exam.planId;
  const targetTotal = data.totalQuestions ?? exam.totalQuestions;
  const targetCorrect = data.correctAnswers ?? exam.correctAnswers;
  if (targetCorrect > targetTotal) {
    return res.status(400).json({ message: 'Respostas corretas não podem exceder o total de questões' });
  }
  await exam.update({
    planId: targetPlanId,
    title: data.title ?? exam.title,
    institution: data.institution ?? exam.institution,
    date: data.date ?? exam.date,
    totalQuestions: targetTotal,
    correctAnswers: targetCorrect,
    notes: data.notes ?? exam.notes
  });
  void syncToDriveIfConnected(req.userId as string).catch((err) => console.warn('[drive-sync] exam update', err));
  res.json({ exam });
});

router.delete('/:examId', async (req: AuthenticatedRequest, res) => {
  const { examId } = req.params;
  const exam = await SimulatedExam.findByPk(examId, { include: ['plan'] });
  if (!exam || exam.plan?.userId !== req.userId) {
    return res.status(404).json({ message: 'Simulado não encontrado' });
  }
  await exam.destroy();
  void syncToDriveIfConnected(req.userId as string).catch((err) => console.warn('[drive-sync] exam delete', err));
  res.status(204).send();
});

export default router;
