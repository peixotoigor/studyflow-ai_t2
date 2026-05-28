import OpenAI from 'openai';
import { AiProviderConfig } from '../models/AiProviderConfig';

interface AiProviderInstance {
  client: OpenAI;
  config: AiProviderConfig;
}

// Memory cache of the active provider (refreshes every 5 mins or on demand)
let cachedProvider: AiProviderInstance | null = null;
let cachedAt = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function getActiveProvider(): Promise<AiProviderInstance> {
  const now = Date.now();
  if (cachedProvider && (now - cachedAt) < CACHE_TTL) {
    return cachedProvider;
  }

  const config = await AiProviderConfig.findOne({ where: { isActive: true } });
  if (!config) {
    throw new Error('Nenhum provedor de IA configurado como ativo.');
  }

  // Resolve the API key from the configured environment variable name
  const apiKey = process.env[config.apiKeyEnvVar];
  if (!apiKey) {
    throw new Error(`Chave de API ausente: env var "${config.apiKeyEnvVar}" não definida.`);
  }

  const client = new OpenAI({
    apiKey,
    baseURL: config.baseUrl,
    defaultHeaders: config.extraHeaders || {},
    timeout: 30000,
    maxRetries: 1,
  });

  cachedProvider = { client, config };
  cachedAt = now;
  return cachedProvider;
}

// Invalidates cache when admin switches the active provider
export function invalidateProviderCache() {
  cachedProvider = null;
  cachedAt = 0;
}

// Unified completion response interface
export interface AiCompletionResult {
  content: string;
  model: string;
  provider: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  costUsd: number;
}

// Unified completion call
export async function createCompletion(params: {
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  responseFormat?: { type: 'json_object' } | undefined;
}): Promise<AiCompletionResult> {
  const { client, config } = await getActiveProvider();
  
  const modelToUse = params.model || config.defaultModel;
  const maxTokens = Math.min(
    params.maxTokens || config.maxTokensPerRequest,
    config.maxTokensPerRequest
  );

  const response = await client.chat.completions.create({
    model: modelToUse,
    messages: params.messages,
    temperature: params.temperature ?? 0.5,
    max_tokens: maxTokens,
    response_format: params.responseFormat,
  });

  const choice = response.choices?.[0];
  if (!choice?.message?.content) {
    throw new Error('Provedor de IA retornou resposta vazia.');
  }

  const usage = response.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };
  const costUsd = estimateCost(modelToUse, usage, config);

  return {
    content: choice.message.content,
    model: response.model || modelToUse,
    provider: config.slug,
    usage: {
      prompt_tokens: usage.prompt_tokens || 0,
      completion_tokens: usage.completion_tokens || 0,
      total_tokens: usage.total_tokens || 0,
    },
    costUsd,
  };
}

function estimateCost(
  model: string,
  usage: { prompt_tokens?: number; completion_tokens?: number },
  config: AiProviderConfig
): number {
  const models = (config.modelsAvailable as any[]) || [];
  const modelInfo = models.find((m: any) => m.id === model);
  if (!modelInfo) return 0;
  
  const inputCost = ((usage.prompt_tokens || 0) / 1000) * (modelInfo.costPer1kInput || 0);
  const outputCost = ((usage.completion_tokens || 0) / 1000) * (modelInfo.costPer1kOutput || 0);
  return inputCost + outputCost;
}
