import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth';
import { AppError } from '../utils/AppError';

// Remove zero-width spaces, non-printable controls, and normalize unicode
function cleanControlChars(str: string): string {
  return str
    .replace(/[\u200B-\u200D\uFEFF]/g, '') // zero-width
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '') // non-printable ASCII/ANSI controls
    .normalize('NFC');
}

// Detect prompt injection patterns (case insensitive)
function detectPromptInjection(str: string): boolean {
  const injectionPatterns = [
    /ignore\s+(?:the\s+)?previous\s+instruction/i,
    /ignore\s+above/i,
    /system:/i,
    /<\|im_sep\|>/i,
    /<\|im_start\|>/i,
    /<\|im_end\|>/i,
    /\[INST\]/i,
    /\[\/INST\]/i,
    /Assistant:/i,
    /Human:/i,
    /new\s+role/i,
    /you\s+must\s+now\s+act\s+as/i,
  ];
  return injectionPatterns.some((pattern) => pattern.test(str));
}

// Remove script tags and event handlers
function cleanHtmlScripts(str: string): string {
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // script tags
    .replace(/on\w+\s*=\s*(['"][^'"]*['"]|[^\s>]+)/gi, ''); // inline handlers
}

// Scan for PII and log if found (do not block)
function scanAndLogPii(str: string, userId: string) {
  const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  const cpfPattern = /\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/;
  const phonePattern = /\b(?:\+?55\s?)?(?:\(?\d{2}\)?\s?)?\d{4,5}-?\d{4}\b/;

  if (emailPattern.test(str) || cpfPattern.test(str) || phonePattern.test(str)) {
    console.warn(`[PII Warning] Possible PII detected in user input from userId=${userId}`);
  }
}

export const aiInputSanitizer = (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
  if (!req.body) {
    return next();
  }

  const { messages, syllabusText, pdfText, attentionData } = req.body;
  const userId = req.userId || 'unknown';

  // 1. Validate 'messages' for AiTutorChat
  if (messages !== undefined) {
    if (!Array.isArray(messages)) {
      return next(new AppError('Mensagens devem ser enviadas como uma lista.', 400));
    }
    if (messages.length > 20) {
      return next(new AppError('Histórico de chat excede o limite de 20 mensagens.', 400));
    }

    for (const msg of messages) {
      if (typeof msg.content !== 'string' && typeof msg.text !== 'string') {
        return next(new AppError('Conteúdo das mensagens deve ser em texto.', 400));
      }
      
      let text = msg.content || msg.text || '';
      if (text.length > 8000) {
        return next(new AppError('Mensagem muito longa. O limite é de 8.000 caracteres por mensagem.', 400));
      }

      // Sanitize text
      text = cleanControlChars(text);
      text = cleanHtmlScripts(text);

      if (detectPromptInjection(text)) {
        return next(new AppError('Entrada rejeitada por motivos de segurança (tentativa de prompt injection detectada).', 400));
      }

      scanAndLogPii(text, userId);

      // Mutate req.body to contain sanitized text
      if (msg.content !== undefined) msg.content = text;
      if (msg.text !== undefined) msg.text = text;
    }
  }

  // 2. Validate 'syllabusText' (SubjectManager)
  if (syllabusText !== undefined) {
    if (typeof syllabusText !== 'string') {
      return next(new AppError('Syllabus deve ser enviado em formato texto.', 400));
    }
    if (syllabusText.length > 50000) {
      return next(new AppError('Texto do edital muito longo. Limite de 50.000 caracteres.', 400));
    }

    let cleaned = cleanControlChars(syllabusText);
    cleaned = cleanHtmlScripts(cleaned);

    if (detectPromptInjection(cleaned)) {
      return next(new AppError('Entrada do edital rejeitada devido a padrões inseguros.', 400));
    }

    req.body.syllabusText = cleaned;
  }

  // 3. Validate 'pdfText' (Importer)
  if (pdfText !== undefined) {
    if (typeof pdfText !== 'string') {
      return next(new AppError('Texto do PDF deve ser enviado em formato texto.', 400));
    }
    if (pdfText.length > 150000) {
      return next(new AppError('Arquivo muito grande. O limite máximo do processamento é 150.000 caracteres.', 400));
    }

    let cleaned = cleanControlChars(pdfText);
    cleaned = cleanHtmlScripts(cleaned);

    if (detectPromptInjection(cleaned)) {
      return next(new AppError('Conteúdo do arquivo rejeitado por razões de segurança.', 400));
    }

    req.body.pdfText = cleaned;
  }

  // 4. Validate 'attentionData' (Dashboard)
  if (attentionData !== undefined) {
    if (!Array.isArray(attentionData)) {
      return next(new AppError('Dados de atenção devem ser fornecidos em um array.', 400));
    }
    if (attentionData.length > 10) {
      return next(new AppError('Limite de análise excedido. Máximo de 10 matérias analisadas simultaneamente.', 400));
    }
    
    // Simple sanitization for string fields in attentionData
    for (const item of attentionData) {
      if (item && typeof item === 'object') {
        for (const key of Object.keys(item)) {
          if (typeof item[key] === 'string') {
            item[key] = cleanControlChars(item[key]);
            item[key] = cleanHtmlScripts(item[key]);
            if (detectPromptInjection(item[key])) {
              return next(new AppError('Entrada de dados inválida por razões de segurança.', 400));
            }
          }
        }
      }
    }
  }

  next();
};
