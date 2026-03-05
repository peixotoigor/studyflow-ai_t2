import { Router } from 'express';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';
import { exportUserPayloadBackup, listUserBackups, getUserBackupPath } from '../services/localBackup';
import fs from 'fs';

const router = Router();

// Exporta backup local (payload completo do usuário) e cria snapshot SQLite em background
router.post('/export', authMiddleware, async (req: AuthenticatedRequest, res) => {
  const userId = req.userId as string;
  const result = await exportUserPayloadBackup(userId);
  res.json({
    message: 'Backup local gerado com sucesso.',
    file: result.filename,
    size: result.size
  });
});

// Lista backups locais do usuário
router.get('/list', authMiddleware, async (req: AuthenticatedRequest, res) => {
  const userId = req.userId as string;
  const backups = await listUserBackups(userId);
  res.json({ backups });
});

// Download de um backup pertencente ao usuário
router.get('/download/:filename', authMiddleware, async (req: AuthenticatedRequest, res) => {
  const userId = req.userId as string;
  const { filename } = req.params;
  const filePath = getUserBackupPath(userId, filename);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: 'Backup não encontrado' });
  }
  res.download(filePath, filename);
});

export default router;
