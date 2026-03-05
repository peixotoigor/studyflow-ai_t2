import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { AppError } from '../utils/AppError';
import { buildFullPayload } from './syncPayload';

const mkdir = promisify(fs.mkdir);
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const copyFile = promisify(fs.copyFile);
const writeFile = promisify(fs.writeFile);

const BACKUP_ROOT = path.resolve(process.cwd(), 'data', 'backups');
const USER_BACKUP_DIR = path.join(BACKUP_ROOT, 'users');
const SQLITE_BACKUP_DIR = path.join(BACKUP_ROOT, 'sqlite');

const TIMESTAMP = () => new Date().toISOString().replace(/[:.]/g, '-');

const ensureDir = async (dir: string) => {
  if (!fs.existsSync(dir)) {
    await mkdir(dir, { recursive: true });
  }
};

const getSqlitePath = () => {
  const dbUrl = process.env.DATABASE_URL || 'sqlite:./data/dev.sqlite';
  if (!dbUrl.startsWith('sqlite:')) return null;
  const relative = dbUrl.replace('sqlite:', '');
  return path.resolve(process.cwd(), relative);
};

const pruneOldFiles = async (dir: string, keep: number) => {
  const files = await readdir(dir).catch(() => []);
  const withStats = await Promise.all(
    files.map(async (name) => ({ name, stat: await stat(path.join(dir, name)).catch(() => null) }))
  );
  const ordered = withStats
    .filter((f) => f.stat)
    .sort((a, b) => (b.stat!.mtimeMs || 0) - (a.stat!.mtimeMs || 0));
  const excess = ordered.slice(keep);
  for (const file of excess) {
    try { fs.unlinkSync(path.join(dir, file.name)); } catch (err) { /* ignore */ }
  }
};

export const snapshotSqlite = async (keep = 10) => {
  const sqlitePath = getSqlitePath();
  if (!sqlitePath || !fs.existsSync(sqlitePath)) {
    return null; // not sqlite or file missing
  }
  await ensureDir(SQLITE_BACKUP_DIR);
  const filename = `sqlite-${TIMESTAMP()}.sqlite`;
  const target = path.join(SQLITE_BACKUP_DIR, filename);
  await copyFile(sqlitePath, target);
  await pruneOldFiles(SQLITE_BACKUP_DIR, keep);
  return { file: filename, path: target };
};

export const exportUserPayloadBackup = async (userId: string, keep = 15) => {
  if (!userId) throw new AppError('Usuário não informado para backup local', 400);
  await ensureDir(USER_BACKUP_DIR);
  const payload = await buildFullPayload(userId);
  const filename = `${userId}-${TIMESTAMP()}.json`;
  const filePath = path.join(USER_BACKUP_DIR, filename);
  const serialized = JSON.stringify(payload, null, 2);
  await writeFile(filePath, serialized, 'utf-8');
  await pruneOldFiles(USER_BACKUP_DIR, keep);
  // Faz snapshot SQLite em paralelo para robustez
  snapshotSqlite().catch(() => {});
  return { filename, filePath, size: Buffer.byteLength(serialized) };
};

export const listUserBackups = async (userId: string) => {
  await ensureDir(USER_BACKUP_DIR);
  const files = await readdir(USER_BACKUP_DIR).catch(() => []);
  const filtered = files.filter((f) => f.startsWith(userId));
  const stats = await Promise.all(
    filtered.map(async (name) => {
      const p = path.join(USER_BACKUP_DIR, name);
      const s = await stat(p).catch(() => null);
      return s ? { name, size: s.size, modifiedAt: s.mtime } : null;
    })
  );
  return stats.filter(Boolean) as Array<{ name: string; size: number; modifiedAt: Date }>;
};

export const getUserBackupPath = (userId: string, filename: string) => {
  if (!filename || !filename.startsWith(userId)) {
    throw new AppError('Backup não encontrado ou não pertence ao usuário', 404);
  }
  const safeName = path.basename(filename);
  return path.join(USER_BACKUP_DIR, safeName);
};
