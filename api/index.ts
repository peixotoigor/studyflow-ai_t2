// Vercel Serverless Function entrypoint
// Reutiliza o app Express do backend (que já trata VERCEL env internamente)
import app from '../apps/backend/src/index';

export default app;
