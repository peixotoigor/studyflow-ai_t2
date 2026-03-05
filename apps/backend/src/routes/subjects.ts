import { Router } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest } from '../middleware/auth';
import { Subject } from '../models/Subject';
import { Topic } from '../models/Topic';
import { assertPlanOwnership, assertSubjectOwnership } from '../services/studyAccess';
import { syncToDriveIfConnected } from '../services/driveSync';

const router = Router();

const subjectSchema = z.object({
  planId: z.string().uuid(),
  name: z.string().min(2),
  active: z.boolean().optional(),
  color: z.string().optional(),
  weight: z.number().optional(),
  priority: z.enum(['HIGH', 'MEDIUM', 'LOW']).optional(),
  proficiency: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).optional()
});

const topicSchema = z.object({
  name: z.string().min(1),
  completed: z.boolean().optional()
});

router.post('/', async (req: AuthenticatedRequest, res) => {
  const data = subjectSchema.parse(req.body);
  await assertPlanOwnership(req.userId as string, data.planId);
  const subject = await Subject.create({
    planId: data.planId,
    name: data.name,
    active: data.active ?? true,
    color: data.color ?? null,
    weight: data.weight ?? null,
    priority: data.priority ?? null,
    proficiency: data.proficiency ?? null
  });
  void syncToDriveIfConnected(req.userId as string).catch((err) => console.warn('[drive-sync] subject create', err));
  res.status(201).json({ subject });
});

router.put('/:subjectId', async (req: AuthenticatedRequest, res) => {
  const { subjectId } = req.params;
  const subject = await assertSubjectOwnership(req.userId as string, subjectId);
  const data = subjectSchema.partial().parse(req.body);
  await subject.update({
    name: data.name ?? subject.name,
    active: data.active ?? subject.active,
    color: data.color ?? subject.color,
    weight: data.weight ?? subject.weight,
    priority: data.priority ?? subject.priority,
    proficiency: data.proficiency ?? subject.proficiency
  });
  void syncToDriveIfConnected(req.userId as string).catch((err) => console.warn('[drive-sync] subject update', err));
  res.json({ subject });
});

router.delete('/:subjectId', async (req: AuthenticatedRequest, res) => {
  const { subjectId } = req.params;
  const subject = await assertSubjectOwnership(req.userId as string, subjectId);
  await subject.destroy();
  void syncToDriveIfConnected(req.userId as string).catch((err) => console.warn('[drive-sync] subject delete', err));
  res.status(204).send();
});

router.post('/:subjectId/topics', async (req: AuthenticatedRequest, res) => {
  const { subjectId } = req.params;
  await assertSubjectOwnership(req.userId as string, subjectId);
  const data = topicSchema.parse(req.body);
  const topic = await Topic.create({
    subjectId,
    name: data.name,
    completed: data.completed ?? false
  });
  void syncToDriveIfConnected(req.userId as string).catch((err) => console.warn('[drive-sync] topic create', err));
  res.status(201).json({ topic });
});

router.put('/:subjectId/topics/:topicId', async (req: AuthenticatedRequest, res) => {
  const { subjectId, topicId } = req.params;
  await assertSubjectOwnership(req.userId as string, subjectId);
  const topic = await Topic.findOne({ where: { id: topicId, subjectId } });
  if (!topic) {
    return res.status(404).json({ message: 'Tópico não encontrado' });
  }
  const data = topicSchema.partial().parse(req.body);
  await topic.update({
    name: data.name ?? topic.name,
    completed: data.completed ?? topic.completed
  });
  void syncToDriveIfConnected(req.userId as string).catch((err) => console.warn('[drive-sync] topic update', err));
  res.json({ topic });
});

router.delete('/:subjectId/topics/:topicId', async (req: AuthenticatedRequest, res) => {
  const { subjectId, topicId } = req.params;
  await assertSubjectOwnership(req.userId as string, subjectId);
  const deleted = await Topic.destroy({ where: { id: topicId, subjectId } });
  if (!deleted) {
    return res.status(404).json({ message: 'Tópico não encontrado' });
  }
  void syncToDriveIfConnected(req.userId as string).catch((err) => console.warn('[drive-sync] topic delete', err));
  res.status(204).send();
});

export default router;
