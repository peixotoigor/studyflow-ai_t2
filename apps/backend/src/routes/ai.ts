import { Router, Response } from 'express';
import { QueueEvents } from 'bullmq';
import { AuthenticatedRequest } from '../middleware/auth';
import { requirePremium } from '../middleware/requirePremium';
import { aiRateLimit } from '../middleware/aiRateLimit';
import { aiInputSanitizer } from '../middleware/aiInputSanitizer';
import { aiAuditLogger } from '../middleware/aiAuditLogger';
import { aiQueue } from '../queues/aiQueue';
import { redisConnection } from '../config/redis';
import { AiQuota } from '../models/AiQuota';
import { AppError } from '../utils/AppError';

const router = Router();
const queueEvents = new QueueEvents('ai-requests', { connection: redisConnection as any });

// Apply standard middleware sequence for all AI routes
router.use(requirePremium);
router.use(aiRateLimit);
router.use(aiInputSanitizer);
router.use(aiAuditLogger);

// Get current daily usage
router.get('/usage', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const quota = await AiQuota.findOne({
      where: { userId: req.userId, date: today }
    });

    res.json({
      requestCount: quota ? quota.requestCount : 0,
      tokenCount: quota ? quota.tokenCount : 0,
      dailyLimit: Number(process.env.AI_DAILY_LIMIT || 100),
      tokenLimit: Number(process.env.AI_DAILY_TOKEN_LIMIT || 500000)
    });
  } catch (error) {
    next(error);
  }
});

// Synchronous AI Chat
router.post('/chat', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { messages, subject, topic } = req.body;
    
    const job = await aiQueue.add('ai:chat', {
      userId: req.userId,
      messages,
      subject,
      topic,
      __audit: req.body.__audit
    });

    const result = await job.waitUntilFinished(queueEvents, 30000);
    res.json({ content: result });
  } catch (error) {
    next(error);
  }
});

// Synchronous Generate Topics
router.post('/generate-topics', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { syllabusText } = req.body;

    const job = await aiQueue.add('ai:generate-topics', {
      userId: req.userId,
      syllabusText,
      __audit: req.body.__audit
    });

    const result = await job.waitUntilFinished(queueEvents, 30000);
    
    // Parse result content if it is a JSON string
    let parsed = result;
    if (typeof result === 'string') {
      try {
        parsed = JSON.parse(result);
      } catch (_) {
        // Fallback
      }
    }
    res.json(parsed);
  } catch (error) {
    next(error);
  }
});

// Synchronous AI Insights
router.post('/insights', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { attentionData } = req.body;

    const job = await aiQueue.add('ai:insights', {
      userId: req.userId,
      attentionData,
      __audit: req.body.__audit
    });

    const result = await job.waitUntilFinished(queueEvents, 30000);
    res.json({ content: result });
  } catch (error) {
    next(error);
  }
});

// Asynchronous Import Syllabus (PDF)
router.post('/import-syllabus', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { pdfText } = req.body;

    const job = await aiQueue.add('ai:import-syllabus', {
      userId: req.userId,
      pdfText,
      __audit: req.body.__audit
    });

    res.json({ jobId: job.id, status: 'queued' });
  } catch (error) {
    next(error);
  }
});

// GET job status (polling endpoint for async imports)
router.get('/job/:jobId', async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { jobId } = req.params;
    const job = await aiQueue.getJob(jobId);

    if (!job) {
      return next(new AppError('Job não encontrado.', 404));
    }

    // Security check: ensure the user requesting the job status is the owner
    if (job.data.userId !== req.userId) {
      return next(new AppError('Acesso não autorizado ao job.', 403));
    }

    const state = await job.getState();
    const result = job.returnvalue;
    const failedReason = job.failedReason;

    let parsedResult = result;
    if (state === 'completed' && typeof result === 'string') {
      try {
        parsedResult = JSON.parse(result);
      } catch (_) {}
    }

    res.json({
      id: job.id,
      state,
      progress: job.progress,
      result: parsedResult,
      failedReason: failedReason || null
    });
  } catch (error) {
    next(error);
  }
});

export default router;
