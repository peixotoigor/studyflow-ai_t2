import { Router } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest } from '../middleware/auth';
import { ErrorLog } from '../models/ErrorLog';
import { Subject } from '../models/Subject';
import { assertSubjectOwnership } from '../services/studyAccess';
import { syncToDriveIfConnected } from '../services/driveSync';

const router = Router();

const errorSchema = z.object({
  subjectId: z.string().uuid(),
  topicName: z.string().min(1),
  questionSource: z.string().min(1),
  reason: z.enum(['KNOWLEDGE_GAP', 'ATTENTION', 'INTERPRETATION', 'TRICK', 'TIME']),
  description: z.string().min(1),
  correction: z.string().min(1),
  reviewCount: z.number().int().nonnegative().optional()
});

router.get('/', async (req: AuthenticatedRequest, res) => {
  const logs = await ErrorLog.findAll({
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
    order: [['createdAt', 'DESC']]
  });
  res.json({ logs });
});

router.post('/', async (req: AuthenticatedRequest, res) => {
  const data = errorSchema.parse(req.body);
  await assertSubjectOwnership(req.userId as string, data.subjectId);
  const log = await ErrorLog.create({
    subjectId: data.subjectId,
    topicName: data.topicName,
    questionSource: data.questionSource,
    reason: data.reason,
    description: data.description,
    correction: data.correction,
    reviewCount: data.reviewCount ?? 0
  });
  void syncToDriveIfConnected(req.userId as string).catch((err) => console.warn('[drive-sync] errorLog create', err));
  res.status(201).json({ log });
});

router.put('/:logId', async (req: AuthenticatedRequest, res) => {
  const { logId } = req.params;
  const existing = await ErrorLog.findByPk(logId, {
    include: [{
      association: 'subject',
      required: true,
      include: [{ association: 'plan', required: true }]
    }]
  });
  if (!existing || existing.subject?.plan?.userId !== req.userId) {
    return res.status(404).json({ message: 'Registro não encontrado' });
  }
  const data = errorSchema.partial({ subjectId: true }).parse(req.body);
  if (data.subjectId) {
    await assertSubjectOwnership(req.userId as string, data.subjectId);
  }
  await existing.update({
    subjectId: data.subjectId ?? existing.subjectId,
    topicName: data.topicName ?? existing.topicName,
    questionSource: data.questionSource ?? existing.questionSource,
    reason: data.reason ?? existing.reason,
    description: data.description ?? existing.description,
    correction: data.correction ?? existing.correction,
    reviewCount: data.reviewCount ?? existing.reviewCount
  });
  void syncToDriveIfConnected(req.userId as string).catch((err) => console.warn('[drive-sync] errorLog update', err));
  res.json({ log: existing });
});

router.delete('/:logId', async (req: AuthenticatedRequest, res) => {
  const { logId } = req.params;
  const existing = await ErrorLog.findByPk(logId, {
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
  void syncToDriveIfConnected(req.userId as string).catch((err) => console.warn('[drive-sync] errorLog delete', err));
  res.status(204).send();
});

export default router;
