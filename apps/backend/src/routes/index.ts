import { Router } from 'express';
import authRouter from './auth';
import plansRouter from './plans';
import subjectsRouter from './subjects';
import studyLogsRouter from './studyLogs';
import errorLogsRouter from './errorLogs';
import simulatedExamsRouter from './simulatedExams';
import savedNotesRouter from './savedNotes';
import summaryRouter from './summary';
import driveRouter from './drive';
import localBackupRouter from './localBackup';
import aiRouter from './ai';
import adminRouter from './admin';
import paymentsRouter from './payments';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use('/auth', authRouter);
router.use('/drive', driveRouter);
router.use('/backup/local', localBackupRouter);
router.use('/ai', authMiddleware, aiRouter);
router.use('/admin/ai', authMiddleware, adminRouter);
router.use('/payments', paymentsRouter);
router.use('/plans', authMiddleware, plansRouter);
router.use('/subjects', authMiddleware, subjectsRouter);
router.use('/study-logs', authMiddleware, studyLogsRouter);
router.use('/error-logs', authMiddleware, errorLogsRouter);
router.use('/simulated-exams', authMiddleware, simulatedExamsRouter);
router.use('/saved-notes', authMiddleware, savedNotesRouter);
router.use('/summary', authMiddleware, summaryRouter);

export default router;
