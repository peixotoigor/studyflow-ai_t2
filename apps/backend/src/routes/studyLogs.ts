import { Router } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest } from '../middleware/auth';
import { StudyLog } from '../models/StudyLog';
import { Subject } from '../models/Subject';
import { assertSubjectOwnership, assertTopicOwnership } from '../services/studyAccess';
import { syncToDriveIfConnected } from '../services/driveSync';

const router = Router();

const logSchema = z.object({
  subjectId: z.string().uuid(),
  topicId: z.string().uuid().optional(),
  topicName: z.string().min(1),
  date: z.coerce.date(),
  durationMinutes: z.number().int().nonnegative(),
  questionsCount: z.number().int().nonnegative().optional(),
  correctCount: z.number().int().nonnegative().optional(),
  modalities: z.array(z.string()).optional(),
  notes: z.string().optional()
});

router.get('/', async (req: AuthenticatedRequest, res) => {
  const logs = await StudyLog.findAll({
    include: [{
      association: 'subject',
      required: true,
      include: [{
        association: 'plan',
        required: true,
        where: { userId: req.userId },
        attributes: []
      }]
    }],
    order: [['date', 'DESC']]
  });
  res.json({ logs });
});

router.post('/', async (req: AuthenticatedRequest, res) => {
  const data = logSchema.parse(req.body);
  await assertSubjectOwnership(req.userId as string, data.subjectId);
  if (data.topicId) {
    const topic = await assertTopicOwnership(req.userId as string, data.topicId);
    if (topic.subjectId !== data.subjectId) {
      return res.status(400).json({ message: 'Tópico não pertence à disciplina informada' });
    }
  }
  const log = await StudyLog.create({
    subjectId: data.subjectId,
    topicId: data.topicId ?? null,
    topicName: data.topicName,
    date: data.date,
    durationMinutes: data.durationMinutes,
    questionsCount: data.questionsCount ?? 0,
    correctCount: data.correctCount ?? 0,
    modalities: data.modalities ?? null,
    notes: data.notes ?? null
  });
  void syncToDriveIfConnected(req.userId as string).catch((err) => console.warn('[drive-sync] studyLog create', err));
  res.status(201).json({ log });
});

router.put('/:logId', async (req: AuthenticatedRequest, res) => {
  const { logId } = req.params;
  const existing = await StudyLog.findByPk(logId, {
    include: [{
      association: 'subject',
      required: true,
      include: [{ association: 'plan', required: true }]
    }]
  });
  if (!existing || existing.subject?.plan?.userId !== req.userId) {
    return res.status(404).json({ message: 'Registro não encontrado' });
  }
  const data = logSchema.partial().parse(req.body);
  if (data.subjectId) {
    await assertSubjectOwnership(req.userId as string, data.subjectId);
  }
  if (data.topicId) {
    const topic = await assertTopicOwnership(req.userId as string, data.topicId);
    const targetSubjectId = data.subjectId ?? existing.subjectId;
    if (topic.subjectId !== targetSubjectId) {
      return res.status(400).json({ message: 'Tópico não pertence à disciplina informada' });
    }
  }
  await existing.update({
    subjectId: data.subjectId ?? existing.subjectId,
    topicId: data.topicId ?? existing.topicId,
    topicName: data.topicName ?? existing.topicName,
    date: data.date ?? existing.date,
    durationMinutes: data.durationMinutes ?? existing.durationMinutes,
    questionsCount: data.questionsCount ?? existing.questionsCount,
    correctCount: data.correctCount ?? existing.correctCount,
    modalities: data.modalities ?? existing.modalities,
    notes: data.notes ?? existing.notes
  });
  void syncToDriveIfConnected(req.userId as string).catch((err) => console.warn('[drive-sync] studyLog update', err));
  res.json({ log: existing });
});

router.delete('/:logId', async (req: AuthenticatedRequest, res) => {
  const { logId } = req.params;
  const existing = await StudyLog.findByPk(logId, {
    include: [{
      association: 'subject',
      required: true,
      include: [{ association: 'plan', required: true }]
    }]
  });
  if (!existing || existing.subject?.plan?.userId !== req.userId) {
    return res.status(404).json({ message: 'Registro não encontrado' });
  }
  await existing.destroy();
  void syncToDriveIfConnected(req.userId as string).catch((err) => console.warn('[drive-sync] studyLog delete', err));
  res.status(204).send();
});

export default router;
