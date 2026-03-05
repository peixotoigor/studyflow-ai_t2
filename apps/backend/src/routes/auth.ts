import { Router } from 'express';
import { z } from 'zod';
import { User } from '../models/User';
import { UserSettings } from '../models/UserSettings';
import { AppError } from '../utils/AppError';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';
import { UserDriveAuth } from '../models/UserDriveAuth';
import { ensureDataFolder, ensureDataFile, readDataFile } from '../services/googleDrive';
import { applyFullPayload } from '../services/syncPayload';
import { syncToDriveIfConnected } from '../services/driveSync';
import { encryptSecret, decryptSecret, hasSecret } from '../utils/crypto';

const router = Router();

const serializeUser = (user: User) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  createdAt: user.createdAt
});

router.get('/me', authMiddleware, async (req: AuthenticatedRequest, res) => {
  let user = await User.findByPk(req.userId as string, {
    include: [{ association: 'settings', required: false }]
  });

  if (!user) {
    user = await User.create({
      id: req.userId as string,
      name: req.userName as string,
      email: req.userEmail as string
    });
  }

  // Sincronização pull no login inicial baseada na existência do token do drive
  try {
    const driveAuth = await UserDriveAuth.findOne({ where: { userId: user.id } });
    if (driveAuth?.refreshToken) {
      void (async () => {
        try {
          const folderId = driveAuth.driveFolderId || (await ensureDataFolder(driveAuth.refreshToken));
          if (!driveAuth.driveFolderId && folderId) {
            await driveAuth.update({ driveFolderId: folderId });
          }
          const fileId = await ensureDataFile(driveAuth.refreshToken, folderId);
          const data = await readDataFile(driveAuth.refreshToken, fileId);
          await applyFullPayload(data, user.id);
        } catch(e) { console.warn('[me-sync] erro', e) }
      })();
    }
  } catch (syncErr) {
    console.warn('[me-sync] Falha ao inciar sync do Drive:', syncErr);
  }

  const userData = serializeUser(user);
  const settings = user.settings || await UserSettings.create({ userId: user.id });
  const openAiApiKeyDecrypted = decryptSecret(settings.openAiApiKey);
  const githubTokenDecrypted = decryptSecret(settings.githubToken);
  res.json({ 
    user: userData,
    settings: {
      dailyAvailableTimeMinutes: settings.dailyAvailableTimeMinutes,
      openAiModel: settings.openAiModel,
      openAiApiKey: hasSecret(settings.openAiApiKey) ? '***' : null,
      hasOpenAiApiKey: hasSecret(settings.openAiApiKey),
      githubToken: hasSecret(settings.githubToken) ? '***' : null,
      hasGithubToken: hasSecret(settings.githubToken),
      backupGistId: settings.backupGistId,
      avatarUrl: settings.avatarUrl || null,
      scheduleSettings: settings.scheduleSettings || null,
      scheduleSelection: settings.scheduleSelection || null,
      openAiApiKeyDecrypted,
      githubTokenDecrypted
    }
  });
});

const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
});

router.put('/me', authMiddleware, async (req: AuthenticatedRequest, res) => {
  const data = updateProfileSchema.parse(req.body);
  const user = await User.findByPk(req.userId as string);
  if (!user) {
    throw new AppError('Usuário não encontrado', 404);
  }

  await user.update(data);
  res.json({ user: serializeUser(user) });
});

const updateSettingsSchema = z.object({
  dailyAvailableTimeMinutes: z.number().int().positive().optional(),
  openAiApiKey: z.string().optional().nullable(),
  openAiModel: z.string().optional(),
  githubToken: z.string().optional().nullable(),
  backupGistId: z.string().optional().nullable(),
  avatarUrl: z.string().max(600000).optional().nullable(),
  scheduleSettings: z.any().optional().nullable(),
  scheduleSelection: z.any().optional().nullable()
});

router.get('/settings', authMiddleware, async (req: AuthenticatedRequest, res) => {
  let settings = await UserSettings.findOne({ where: { userId: req.userId } });
  if (!settings) {
    settings = await UserSettings.create({ userId: req.userId as string });
  }
  const openAiApiKeyDecrypted = decryptSecret(settings.openAiApiKey);
  const githubTokenDecrypted = decryptSecret(settings.githubToken);
  res.json({
    dailyAvailableTimeMinutes: settings.dailyAvailableTimeMinutes,
    openAiModel: settings.openAiModel,
    hasOpenAiApiKey: hasSecret(settings.openAiApiKey),
    hasGithubToken: hasSecret(settings.githubToken),
    backupGistId: settings.backupGistId,
    avatarUrl: settings.avatarUrl || null,
    scheduleSettings: settings.scheduleSettings || null,
    scheduleSelection: settings.scheduleSelection || null,
    openAiApiKeyDecrypted,
    githubTokenDecrypted
  });
});

router.put('/settings', authMiddleware, async (req: AuthenticatedRequest, res) => {
  const data = updateSettingsSchema.parse(req.body);
  let settings = await UserSettings.findOne({ where: { userId: req.userId } });
  
  if (!settings) {
    settings = await UserSettings.create({ 
      userId: req.userId as string,
      ...data,
      openAiApiKey: data.openAiApiKey ? encryptSecret(data.openAiApiKey) : null,
      githubToken: data.githubToken ? encryptSecret(data.githubToken) : null
    });
  } else {
    const payload = { ...data } as any;
    if (data.openAiApiKey !== undefined) {
      payload.openAiApiKey = data.openAiApiKey ? encryptSecret(data.openAiApiKey) : null;
    }
    if (data.githubToken !== undefined) {
      payload.githubToken = data.githubToken ? encryptSecret(data.githubToken) : null;
    }
    await settings.update(payload);
  }

  void syncToDriveIfConnected(req.userId as string).catch((err) => console.warn('[drive-sync] settings update', err));

  res.json({
    dailyAvailableTimeMinutes: settings.dailyAvailableTimeMinutes,
    openAiModel: settings.openAiModel,
    hasOpenAiApiKey: hasSecret(settings.openAiApiKey),
    hasGithubToken: hasSecret(settings.githubToken),
    backupGistId: settings.backupGistId,
    avatarUrl: settings.avatarUrl || null,
    scheduleSettings: settings.scheduleSettings || null,
    scheduleSelection: settings.scheduleSelection || null,
    openAiApiKeyDecrypted: decryptSecret(settings.openAiApiKey),
    githubTokenDecrypted: decryptSecret(settings.githubToken)
  });
});

export default router;
