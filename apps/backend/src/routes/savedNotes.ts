import { Router } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest } from '../middleware/auth';
import { SavedNote } from '../models/SavedNote';
import { assertPlanOwnership, assertSubjectOwnership } from '../services/studyAccess';
import { syncToDriveIfConnected } from '../services/driveSync';

const router = Router();

const noteSchema = z.object({
  planId: z.string().uuid(),
  subjectId: z.string().uuid().nullable().optional(),
  content: z.string().min(1),
  topicName: z.string().optional(),
  tags: z.array(z.string()).optional()
});

router.get('/', async (req: AuthenticatedRequest, res) => {
  const notes = await SavedNote.findAll({
    include: [
      {
        association: 'plan',
        required: true,
        where: { userId: req.userId }
      },
      {
        association: 'subject',
        required: false
      }
    ],
    order: [['createdAt', 'DESC']]
  });
  res.json({ notes });
});

router.post('/', async (req: AuthenticatedRequest, res) => {
  const data = noteSchema.parse(req.body);
  await assertPlanOwnership(req.userId as string, data.planId);
  if (data.subjectId) {
    const subject = await assertSubjectOwnership(req.userId as string, data.subjectId);
    if (subject.planId !== data.planId) {
      return res.status(400).json({ message: 'Disciplina não pertence ao plano informado' });
    }
  }
  const note = await SavedNote.create({
    planId: data.planId,
    subjectId: data.subjectId ?? null,
    content: data.content,
    topicName: data.topicName ?? null,
    tags: data.tags ?? null
  });
  void syncToDriveIfConnected(req.userId as string).catch((err) => console.warn('[drive-sync] note create', err));
  res.status(201).json({ note });
});

router.put('/:noteId', async (req: AuthenticatedRequest, res) => {
  const { noteId } = req.params;
  const existing = await SavedNote.findByPk(noteId, { include: ['plan', 'subject'] });
  if (!existing || existing.plan?.userId !== req.userId) {
    return res.status(404).json({ message: 'Anotação não encontrada' });
  }
  const data = noteSchema.partial().parse(req.body);
  if (data.planId) {
    await assertPlanOwnership(req.userId as string, data.planId);
  }
  if (data.subjectId) {
    const subject = await assertSubjectOwnership(req.userId as string, data.subjectId);
    if ((data.planId ?? existing.planId) !== subject.planId) {
      return res.status(400).json({ message: 'Disciplina não pertence ao plano informado' });
    }
  }
  await existing.update({
    planId: data.planId ?? existing.planId,
    subjectId: data.subjectId ?? existing.subjectId,
    content: data.content ?? existing.content,
    topicName: data.topicName ?? existing.topicName,
    tags: data.tags ?? existing.tags
  });
  void syncToDriveIfConnected(req.userId as string).catch((err) => console.warn('[drive-sync] note update', err));
  res.json({ note: existing });
});

router.delete('/:noteId', async (req: AuthenticatedRequest, res) => {
  const { noteId } = req.params;
  const existing = await SavedNote.findByPk(noteId, { include: ['plan'] });
  if (!existing || existing.plan?.userId !== req.userId) {
    return res.status(404).json({ message: 'Anotação não encontrada' });
  }
  await existing.destroy();
  void syncToDriveIfConnected(req.userId as string).catch((err) => console.warn('[drive-sync] note delete', err));
  res.status(204).send();
});

export default router;
