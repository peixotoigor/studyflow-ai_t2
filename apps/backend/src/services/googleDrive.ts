import { google, drive_v3 } from 'googleapis';
import { AppError } from '../utils/AppError';

const SCOPES = ['https://www.googleapis.com/auth/drive.file'];
const DATA_FOLDER_NAME = 'StudyFlow';
const DATA_FILE_NAME = 'studyflow-data.json';

const buildOAuthClient = () => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    throw new AppError('Credenciais Google não configuradas (GOOGLE_CLIENT_ID/SECRET/REDIRECT_URI)', 500);
  }

  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
};

export const getConsentUrl = (userId: string, returnUrl?: string) => {
  const oauth2Client = buildOAuthClient();
  const state = Buffer.from(JSON.stringify({ userId, returnUrl: returnUrl || null })).toString('base64url');
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: SCOPES,
    state
  });
};

export const exchangeCodeForTokens = async (code: string) => {
  const oauth2Client = buildOAuthClient();
  const { tokens } = await oauth2Client.getToken(code);
  if (!tokens.refresh_token) {
    throw new AppError('Não recebemos refresh_token do Google. Refaça o consentimento.', 400);
  }
  return tokens.refresh_token;
};

const buildDriveClient = (refreshToken: string): drive_v3.Drive => {
  const oauth2Client = buildOAuthClient();
  oauth2Client.setCredentials({ refresh_token: refreshToken });
  return google.drive({ version: 'v3', auth: oauth2Client });
};

export const ensureDataFolder = async (refreshToken: string): Promise<string> => {
  const drive = buildDriveClient(refreshToken);
  const list = await drive.files.list({
    q: `mimeType = 'application/vnd.google-apps.folder' and name = '${DATA_FOLDER_NAME}' and trashed = false`,
    fields: 'files(id, name)',
    pageSize: 1
  });

  const existing = list.data.files?.[0];
  if (existing?.id) {
    return existing.id;
  }

  const created = await drive.files.create({
    requestBody: {
      name: DATA_FOLDER_NAME,
      mimeType: 'application/vnd.google-apps.folder'
    },
    fields: 'id'
  });

  if (!created.data.id) {
    throw new AppError('Falha ao criar pasta de backup no Drive', 500);
  }

  return created.data.id;
};

export const ensureDataFile = async (refreshToken: string, folderId: string): Promise<string> => {
  const drive = buildDriveClient(refreshToken);
  const list = await drive.files.list({
    q: `'${folderId}' in parents and name = '${DATA_FILE_NAME}' and trashed = false`,
    fields: 'files(id, name)',
    pageSize: 1
  });

  const existing = list.data.files?.[0];
  if (existing?.id) return existing.id;

  const created = await drive.files.create({
    requestBody: { name: DATA_FILE_NAME, parents: [folderId] },
    fields: 'id'
  });
  if (!created.data.id) {
    throw new AppError('Falha ao criar arquivo de dados no Drive', 500);
  }
  return created.data.id;
};

export const writeDataFile = async (refreshToken: string, fileId: string, payload: unknown): Promise<void> => {
  const drive = buildDriveClient(refreshToken);
  await drive.files.update({
    fileId,
    media: {
      mimeType: 'application/json',
      body: JSON.stringify(payload, null, 2)
    },
    fields: 'id'
  });
};

export const readDataFile = async (refreshToken: string, fileId: string) => {
  const drive = buildDriveClient(refreshToken);
  const response = await drive.files.get({ fileId, alt: 'media' }, { responseType: 'json' as const });
  return response.data;
};

export const uploadJsonBackup = async (
  refreshToken: string,
  folderId: string,
  filename: string,
  payload: unknown
): Promise<string> => {
  const drive = buildDriveClient(refreshToken);
  const fileMetadata = {
    name: filename,
    parents: [folderId]
  };

  const media = {
    mimeType: 'application/json',
    body: JSON.stringify(payload, null, 2)
  } as const;

  const response = await drive.files.create({
    requestBody: fileMetadata,
    media,
    fields: 'id'
  });

  if (!response.data.id) {
    throw new AppError('Falha ao enviar backup para o Drive', 500);
  }

  return response.data.id;
};

export const listBackups = async (
  refreshToken: string,
  folderId: string,
  pageToken?: string
): Promise<{ files: Array<{ id: string; name: string; createdTime?: string }>; nextPageToken?: string }> => {
  const drive = buildDriveClient(refreshToken);
  const response = await drive.files.list({
    q: `'${folderId}' in parents and trashed = false`,
    orderBy: 'createdTime desc',
    pageSize: 20,
    pageToken,
    fields: 'files(id, name, createdTime), nextPageToken'
  });

  const files = (response.data.files || [])
    .filter((file): file is { id: string; name: string; createdTime?: string } => Boolean(file?.id && file?.name))
    .map((file) => ({
      id: file.id,
      name: file.name,
      createdTime: file.createdTime || undefined
    }));

  return {
    files,
    nextPageToken: response.data.nextPageToken || undefined
  };
};

export const downloadBackup = async (refreshToken: string, fileId: string) => {
  const drive = buildDriveClient(refreshToken);
  const response = await drive.files.get({ fileId, alt: 'media' }, { responseType: 'json' as const });
  return response.data;
};
