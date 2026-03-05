import { Router } from 'express';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';
import { AppError } from '../utils/AppError';
import { UserDriveAuth } from '../models/UserDriveAuth';
import { User } from '../models';
import {
  downloadBackup,
  ensureDataFolder,
  ensureDataFile,
  exchangeCodeForTokens,
  getConsentUrl,
  listBackups,
  uploadJsonBackup,
  readDataFile,
  writeDataFile
} from '../services/googleDrive';
import { applyFullPayload, buildFullPayload } from '../services/syncPayload';

const router = Router();

router.get('/connect', authMiddleware, async (req: AuthenticatedRequest, res) => {
  const returnUrl = typeof req.query.returnUrl === 'string' ? req.query.returnUrl : undefined;
  const url = getConsentUrl(req.userId as string, returnUrl);
  res.json({ url });
});

// Endpoint de callback do Google: configure GOOGLE_REDIRECT_URI apontando para este path completo.
router.get('/callback', async (req, res) => {
  const { code, state } = req.query;
  if (!code || typeof code !== 'string') {
    throw new AppError('Código do Google ausente', 400);
  }
  if (!state || typeof state !== 'string') {
    throw new AppError('State ausente ou inválido', 400);
  }

  let userId = state;
  let returnUrl: string | undefined;
  try {
    const decoded = JSON.parse(Buffer.from(state, 'base64url').toString('utf8')) as { userId?: string; returnUrl?: string };
    if (decoded.userId) {
      userId = decoded.userId;
    }
    if (decoded.returnUrl) {
      returnUrl = decoded.returnUrl;
    }
  } catch (_err) {
    userId = state;
  }

  const refreshToken = await exchangeCodeForTokens(code);

  const [record] = await UserDriveAuth.findOrCreate({
    where: { userId },
    defaults: { userId, refreshToken }
  });

  if (record.refreshToken !== refreshToken) {
    await record.update({ refreshToken });
  }

  const folderId = await ensureDataFolder(refreshToken);
  if (!record.driveFolderId) {
    await record.update({ driveFolderId: folderId });
  }

  const frontendBase = (process.env.FRONTEND_URL || process.env.WEB_APP_URL || 'http://localhost:5173').replace(/\/$/, '');
  const successPath = process.env.DRIVE_SUCCESS_PATH || '/';
  const baseRedirect = returnUrl
    ? returnUrl
    : `${frontendBase}${successPath.startsWith('/') ? successPath : `/${successPath}`}`;
  const redirectUrl = `${baseRedirect}${baseRedirect.includes('?') ? '&' : '?'}drive=connected&folderId=${encodeURIComponent(folderId)}`;

  res.redirect(303, redirectUrl);
});

router.post('/backup/export', authMiddleware, async (req: AuthenticatedRequest, res) => {
  const driveAuth = await UserDriveAuth.findOne({ where: { userId: req.userId } });
  if (!driveAuth) {
    throw new AppError('Conecte o Google Drive primeiro', 400);
  }

  const refreshToken = driveAuth.refreshToken;
  const folderId = driveAuth.driveFolderId || (await ensureDataFolder(refreshToken));
  if (!driveAuth.driveFolderId && folderId) {
    await driveAuth.update({ driveFolderId: folderId });
  }

  const payload = await buildFullPayload(req.userId as string);

  const filename = `studyflow-backup-${new Date().toISOString()}.json`;
  const fileId = await uploadJsonBackup(refreshToken, folderId, filename, payload);

  res.json({ message: 'Backup enviado ao Google Drive.', fileId, folderId });
});

router.get('/backups', authMiddleware, async (req: AuthenticatedRequest, res) => {
  const driveAuth = await UserDriveAuth.findOne({ where: { userId: req.userId } });
  if (!driveAuth) {
    throw new AppError('Conecte o Google Drive primeiro', 400);
  }

  const refreshToken = driveAuth.refreshToken;
  const folderId = driveAuth.driveFolderId || (await ensureDataFolder(refreshToken));
  if (!driveAuth.driveFolderId && folderId) {
    await driveAuth.update({ driveFolderId: folderId });
  }

  const { pageToken } = req.query;
  const list = await listBackups(refreshToken, folderId, typeof pageToken === 'string' ? pageToken : undefined);
  res.json(list);
});

// Sincronização completa: push (gera payload e grava no StudyFlow/studyflow-data.json)
router.post('/sync/push', authMiddleware, async (req: AuthenticatedRequest, res) => {
  const driveAuth = await UserDriveAuth.findOne({ where: { userId: req.userId } });
  if (!driveAuth) {
    throw new AppError('Conecte o Google Drive primeiro', 400);
  }

  const refreshToken = driveAuth.refreshToken;
  const folderId = driveAuth.driveFolderId || (await ensureDataFolder(refreshToken));
  if (!driveAuth.driveFolderId && folderId) {
    await driveAuth.update({ driveFolderId: folderId });
  }

  const fileId = await ensureDataFile(refreshToken, folderId);
  const payload = await buildFullPayload(req.userId as string);
  await writeDataFile(refreshToken, fileId, payload);

  res.json({ message: 'Dados sincronizados no Drive', fileId, folderId });
});

// Sincronização completa: pull (lê studyflow-data.json e aplica no banco)
router.post('/sync/pull', authMiddleware, async (req: AuthenticatedRequest, res) => {
  const driveAuth = await UserDriveAuth.findOne({ where: { userId: req.userId } });
  if (!driveAuth) {
    throw new AppError('Conecte o Google Drive primeiro', 400);
  }

  const refreshToken = driveAuth.refreshToken;
  const folderId = driveAuth.driveFolderId || (await ensureDataFolder(refreshToken));
  if (!driveAuth.driveFolderId && folderId) {
    await driveAuth.update({ driveFolderId: folderId });
  }

  const fileId = await ensureDataFile(refreshToken, folderId);
  const data = await readDataFile(refreshToken, fileId);
  await applyFullPayload(data, req.userId as string);

  res.json({ message: 'Dados carregados do Drive', fileId, folderId });
});

router.post('/backup/restore', authMiddleware, async (req: AuthenticatedRequest, res) => {
  const { fileId } = req.body as { fileId?: string };
  if (!fileId) {
    throw new AppError('fileId é obrigatório', 400);
  }

  const driveAuth = await UserDriveAuth.findOne({ where: { userId: req.userId } });
  if (!driveAuth) {
    throw new AppError('Conecte o Google Drive primeiro', 400);
  }

  const refreshToken = driveAuth.refreshToken;
  const data = await downloadBackup(refreshToken, fileId);
  await applyFullPayload(data, req.userId as string);

  res.json({ message: 'Backup restaurado com sucesso.' });
});

export default router;
