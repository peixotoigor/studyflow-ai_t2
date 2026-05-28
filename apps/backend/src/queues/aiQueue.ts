import { Queue } from 'bullmq';
import { redisConnection } from '../config/redis';

export const aiQueue = new Queue('ai-requests', {
  connection: redisConnection as any,
  defaultJobOptions: {
    removeOnComplete: { age: 3600, count: 1000 },   // Clean completed jobs after 1h
    removeOnFail: { age: 86400 },                    // Keep failed jobs for 24h for debugging
    attempts: 2,                                      // Attempt up to 2 times
    backoff: { type: 'exponential', delay: 3000 },   // Exponential backoff
  }
});
