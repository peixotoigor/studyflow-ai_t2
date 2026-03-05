import { Router } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { StudyPlan, Subject, Topic, StudyLog, ErrorLog, SimulatedExam, SavedNote } from '../models/index';

const router = Router();

router.get('/', async (req: AuthenticatedRequest, res) => {
  const userId = req.userId as string;

  const plans = await StudyPlan.findAll({
    where: { userId },
    include: [{
      association: 'subjects',
      include: [{ association: 'topics' }, { association: 'logs', separate: true }]
    }],
    order: [['createdAt', 'ASC']]
  });

  const errorLogs = await ErrorLog.findAll({
    include: [{
      association: 'subject',
      required: true,
      include: [{ association: 'plan', required: true, where: { userId }, attributes: [] }]
    }],
    order: [['createdAt', 'DESC']]
  });

  const studyLogs = await StudyLog.findAll({
    include: [{
      association: 'subject',
      required: true,
      include: [{ association: 'plan', required: true, where: { userId }, attributes: [] }]
    }],
    order: [['date', 'DESC']]
  });

  const simulatedExams = await SimulatedExam.findAll({
    include: [{ association: 'plan', required: true, where: { userId } }],
    order: [['date', 'DESC']]
  });

  const savedNotes = await SavedNote.findAll({
    include: [
      { association: 'plan', required: true, where: { userId } },
      { association: 'subject', required: false }
    ],
    order: [['createdAt', 'DESC']]
  });

  res.json({ plans, errorLogs, studyLogs, simulatedExams, savedNotes });
});

export default router;
