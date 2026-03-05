import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  const apiProxyTarget = env.VITE_API_PROXY || 'http://localhost:4000';

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@shared': resolve(__dirname, '..', '..', 'shared')
      }
    },
    optimizeDeps: {
      include: ['pdfjs-dist']
    },
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: apiProxyTarget,
          changeOrigin: true
        }
      },
      fs: {
        allow: [resolve(__dirname, '..', '..')]
      }
    },
    build: {
      outDir: 'dist'
    }
  };
});
