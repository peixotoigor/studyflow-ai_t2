import nodemailer from 'nodemailer';
import { AppError } from './AppError';

const from = process.env.SMTP_FROM || 'no-reply@studyflow.local';
let cachedTransporter: nodemailer.Transporter | null = null;

const buildConfiguredTransport = () => {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;
  if (!host || !user || !pass) return null;
  return nodemailer.createTransport({ host, port, secure, auth: { user, pass } });
};

const buildEtherealTransport = async () => {
  const testAccount = await nodemailer.createTestAccount();
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass
    }
  });
};

const getTransporter = async (): Promise<nodemailer.Transporter> => {
  if (cachedTransporter) return cachedTransporter;

  const configured = buildConfiguredTransport();
  if (configured) {
    cachedTransporter = configured;
    return configured;
  }

  // fallback para ambiente de dev com Ethereal
  cachedTransporter = await buildEtherealTransport();
  return cachedTransporter;
};

export const sendPasswordResetEmail = async (to: string, resetLink: string) => {
  const transporter = await getTransporter();

  const subject = 'Redefinição de senha - StudyFlow';
  const html = `
    <p>Olá,</p>
    <p>Recebemos um pedido para redefinir sua senha. Clique no botão abaixo para continuar:</p>
    <p><a href="${resetLink}" style="padding:12px 18px;background:#6366f1;color:#fff;text-decoration:none;border-radius:8px;font-weight:600">Redefinir senha</a></p>
    <p>Se o botão não funcionar, copie e cole este link no navegador:</p>
    <p><a href="${resetLink}">${resetLink}</a></p>
    <p>Se você não solicitou, ignore este e-mail.</p>
  `;

  const info = await transporter.sendMail({ from, to, subject, html });

  // Em fallback Ethereal, registra URL de visualização para facilitar debug
  const previewUrl = nodemailer.getTestMessageUrl(info) || undefined;
  if (previewUrl) {
    console.warn('[mailer] Email de teste (Ethereal):', previewUrl);
  }

  return { messageId: info.messageId, previewUrl };
};
