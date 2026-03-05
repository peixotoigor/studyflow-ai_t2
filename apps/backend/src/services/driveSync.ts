import { UserDriveAuth } from '../models/UserDriveAuth';
import { ensureDataFile, ensureDataFolder, writeDataFile } from './googleDrive';
import { buildFullPayload } from './syncPayload';

/**
 * Tenta sincronizar o estado completo do usuário com o Google Drive.
 * Não lança erro para não quebrar a requisição principal.
 */
export const syncToDriveIfConnected = async (userId: string): Promise<void> => {
  const driveAuth = await UserDriveAuth.findOne({ where: { userId } });
  if (!driveAuth?.refreshToken) return;

  const refreshToken = driveAuth.refreshToken;
  const folderId = driveAuth.driveFolderId || (await ensureDataFolder(refreshToken));
  if (!driveAuth.driveFolderId && folderId) {
    await driveAuth.update({ driveFolderId: folderId });
  }

  const fileId = await ensureDataFile(refreshToken, folderId);
  const payload = await buildFullPayload(userId);
  await writeDataFile(refreshToken, fileId, payload);
};
