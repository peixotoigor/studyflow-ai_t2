import { Redis } from 'ioredis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

const redisConnection = new Redis(redisUrl, {
  maxRetriesPerRequest: null,  // Required by BullMQ
  enableReadyCheck: false,
  tls: process.env.REDIS_TLS === 'true' ? {} : undefined,
  retryStrategy: (times) => Math.min(times * 200, 5000),
});

redisConnection.on('error', (err) => console.error('[Redis] Erro de conexão:', err.message));
redisConnection.on('connect', () => console.log('[Redis] Conectado com sucesso'));

export { redisConnection };
