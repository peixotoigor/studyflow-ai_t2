import crypto from 'crypto';

const DEFAULT_KEY = (process.env.SECRET_KEY || 'studyflow-dev-secret-key-32chars!!').slice(0, 32).padEnd(32, '0');

const getKey = () => Buffer.from(DEFAULT_KEY, 'utf8');

export const encryptSecret = (plain: string | null | undefined): string | null => {
  if (!plain) return null;
  const key = getKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString('base64');
};

export const decryptSecret = (ciphertext: string | null | undefined): string | null => {
  if (!ciphertext) return null;
  try {
    const raw = Buffer.from(ciphertext, 'base64');
    const iv = raw.subarray(0, 12);
    const tag = raw.subarray(12, 28);
    const data = raw.subarray(28);
    const key = getKey();
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(tag);
    const decrypted = Buffer.concat([decipher.update(data), decipher.final()]);
    return decrypted.toString('utf8');
  } catch (err) {
    console.warn('[crypto] failed to decrypt secret', err);
    return null;
  }
};

export const hasSecret = (ciphertext: string | null | undefined): boolean => !!ciphertext;
