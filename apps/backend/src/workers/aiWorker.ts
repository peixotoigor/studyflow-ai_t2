import 'dotenv/config';
import '../models/index';
import { Worker, Job } from 'bullmq';
import Bottleneck from 'bottleneck';
import { redisConnection } from '../config/redis';
import { createCompletion } from '../services/aiProvider';
import { AiUsageLog } from '../models/AiUsageLog';
import { AiQuota } from '../models/AiQuota';
import { connectDatabase } from '../config/database';

// Global Rate Limiter: max 50 RPM, 5 parallel requests
const limiter = new Bottleneck({
  maxConcurrent: 5,
  reservoir: 50,
  reservoirRefreshAmount: 50,
  reservoirRefreshInterval: 60 * 1000,
});

async function handleChat(data: any): Promise<any> {
  const systemInstruction = `
    ATUAÇÃO: Você é um Mentor de Elite para Concursos Públicos.
    CONTEXTO: O aluno está em uma sessão de estudo focado (tempo cronometrado). Ele precisa de respostas imediatas.
    
    DISCIPLINA: "${data.subject}"
    TÓPICO: "${data.topic}"

    REGRAS RÍGIDAS DE RESPOSTA:
    1. SEJA CIRÚRGICO: Vá direto à resposta. PROIBIDO usar saudações ("Olá", "Tudo bem"), frases de apoio ("Ótima pergunta") ou introduções longas.
    2. FOCO NA PROVA: Explique o conceito focando em como as bancas cobram.
    3. PEGADINHAS: Se houver uma "pegadinha" clássica sobre o tema, alerte imediatamente com o emoji ⚠️.
    4. LEI SECA: Se for jurídico, cite o Artigo/Lei.
    5. MNEMÔNICOS: Se houver macete para decorar, entregue-o.
    6. FORMATAÇÃO: Use Bullet Points e NEGRITO nas palavras-chave para leitura dinâmica.
    7. TAMANHO: Mantenha a resposta curta (máximo de 3 parágrafos curtos ou listas).

    Exemplo de tom desejado:
    "A diferença é X.
    - **Conceito A**: Aplica-se em Y (Art. 5º).
    - **Conceito B**: Aplica-se em Z.
    ⚠️ Cuidado: A banca FGV costuma trocar os prazos."
  `;

  // Make sure system message is the first one
  const apiMessages = [
    { role: 'system' as const, content: systemInstruction },
    ...data.messages.map((m: any) => ({
      role: (m.role === 'assistant' || m.role === 'user' ? m.role : 'system') as 'system' | 'user' | 'assistant',
      content: m.content || m.text
    }))
  ];

  return createCompletion({
    messages: apiMessages,
    model: data.model,
    temperature: 0.5,
    maxTokens: 300,
  });
}

async function handleGenerateTopics(data: any): Promise<any> {
  const prompt = `Converta este edital em tópicos JSON: { "topics": ["Tópico 1", "Tópico 2"] }. Mantenha a numeração original.`;
  return createCompletion({
    messages: [
      { role: 'system' as const, content: 'Extractor JSON.' },
      { role: 'user' as const, content: prompt + '\n\n' + data.syllabusText }
    ],
    temperature: 0.1,
    responseFormat: { type: 'json_object' },
  });
}

async function handleImportSyllabus(data: any): Promise<any> {
  const filterPrompt = `
    Analise o documento fornecido. Sua ÚNICA tarefa é encontrar e retornar o texto referente ao "CONTEÚDO PROGRAMÁTICO" (Syllabus) ou "ANEXO DE DISCIPLINAS".
    
    Regras:
    1. O documento é um edital longo. Ignore regras de inscrição, datas, isenções, etc.
    2. Vá direto para a parte onde as matérias (Português, Direito, etc.) são listadas.
    3. Se houver múltiplos cargos, identifique o cargo de NÍVEL SUPERIOR ou o primeiro cargo listado que tenha um conteúdo completo e RETORNE O CONTEÚDO DELE.
    4. Retorne APENAS o texto bruto dessa seção, do início ao fim das disciplinas. Não formate, não resuma. Quero o texto original recortado.
  `;

  const MAX_CHARS_FOR_FILTER = 150000;
  const textForFilter = data.pdfText.substring(0, MAX_CHARS_FOR_FILTER);

  // Step 1: Filter relevant section
  const filterResult = await createCompletion({
    messages: [
      { role: 'system' as const, content: 'Você é um assistente especialista em filtrar textos de editais.' },
      { role: 'user' as const, content: filterPrompt + '\n\n--- DOCUMENTO ---\n' + textForFilter }
    ],
    temperature: 0.1,
    maxTokens: 4096
  });

  const textToProcess = (filterResult.content && filterResult.content.length > 100)
    ? filterResult.content
    : data.pdfText.substring(0, 50000);

  const extractionPrompt = `
    Com base no texto recortado do edital abaixo, extraia o conteúdo programático estruturado.
    
    CRITÉRIOS RIGOROSOS DE EXTRAÇÃO:
    1. Identifique o Cargo (se mencionado no texto).
    2. Separe TODAS as disciplinas encontradas (Ex: Português, Informática, Dir. Constitucional, etc).
    3. DENTRO DE CADA DISCIPLINA:
       - O texto costuma vir em blocos densos (ex: "Conceito de ADM; Poderes; Atos.").
       - VOCÊ DEVE QUEBRAR ESSES BLOCOS EM UMA LISTA DE TÓPICOS INDIVIDUAIS.
       - Use pontuação (., ;) para separar os itens.
    
    Saída OBRIGATÓRIA em JSON:
    {
        "cargo": "Nome do Cargo",
        "categorias": [
            {
                "nome": "Conhecimentos Gerais",
                "disciplinas": [
                    { "nome": "Língua Portuguesa", "topicos": ["Interpretação", "Gramática", "..."] }
                ]
            },
            {
                "nome": "Conhecimentos Específicos",
                "disciplinas": [
                    { "nome": "Nome da Disciplina", "topicos": ["Tópico 1", "Tópico 2", "..."] }
                ]
            }
        ]
    }
    
    Se não houver distinção explícita de Gerais/Específicos, coloque tudo em "Conteúdo Programático".
  `;

  // Step 2: Extract JSON structure
  const structureResult = await createCompletion({
    messages: [
      { role: 'system' as const, content: 'Você é um extrator JSON preciso.' },
      { role: 'user' as const, content: extractionPrompt + '\n\n--- TEXTO DO CONTEÚDO ---\n' + textToProcess }
    ],
    temperature: 0.1,
    responseFormat: { type: 'json_object' },
    maxTokens: 4096
  });

  // Calculate combined tokens & estimated cost
  return {
    content: structureResult.content,
    model: structureResult.model,
    provider: structureResult.provider,
    usage: {
      prompt_tokens: (filterResult.usage?.prompt_tokens || 0) + (structureResult.usage?.prompt_tokens || 0),
      completion_tokens: (filterResult.usage?.completion_tokens || 0) + (structureResult.usage?.completion_tokens || 0),
      total_tokens: (filterResult.usage?.total_tokens || 0) + (structureResult.usage?.total_tokens || 0),
    },
    costUsd: (filterResult.costUsd || 0) + (structureResult.costUsd || 0)
  };
}

async function handleInsights(data: any): Promise<any> {
  const prompt = `
    Você é o motor de inteligência do StudyFlow. Sua função é EXPLICAR POR QUE certas matérias estão no 'Radar de Atenção', usando dados específicos.
    
    DADOS DO ALUNO:
    ${JSON.stringify(data.attentionData)}

    OBJETIVO:
    Para cada matéria, forneça uma análise de 1 frase justificando a prioridade.
    
    REGRAS DE OURO:
    1. MENCIONE TÓPICOS ESPECÍFICOS se houver dados de erros. Ex: "Prioridade alta pois você errou questões de 'Crimes contra a Vida'..."
    2. SE NÃO HOUVER ERROS, focado na Recência/Esquecimento. Ex: "Você estudou 'Atos Administrativos' mas faz 15 dias que não revisa."
    3. USE O CONTEXTO: Se ele já estudou muito mas a acurácia é baixa, sugira que ele pode estar avançando sem consolidar.
    4. FORMATO: HTML (<ul>, <li> com <strong> no nome da matéria).

    Exemplo Ideal:
    <ul>
      <li><strong>Direito Penal:</strong> Alerta crítico em 'Teoria do Crime' (múltiplos erros). Sua acurácia geral de 40% indica necessidade de voltar à teoria.</li>
      <li><strong>Português:</strong> Faz 12 dias que você não revisa tópicos como 'Crase' e 'Sintaxe', risco alto de curva de esquecimento.</li>
    </ul>
  `;

  return createCompletion({
    messages: [
      { role: 'system' as const, content: 'Você é um analista de dados educacionais focado em explicar decisões algorítmicas com precisão cirúrgica.' },
      { role: 'user' as const, content: prompt }
    ],
    temperature: 0.3,
  });
}

// Main BullMQ Worker
const worker = new Worker('ai-requests', async (job: Job) => {
  const startTime = Date.now();
  const { userId } = job.data;
  
  return limiter.schedule(async () => {
    try {
      let result: any;
      switch (job.name) {
        case 'ai:chat':             result = await handleChat(job.data); break;
        case 'ai:generate-topics':  result = await handleGenerateTopics(job.data); break;
        case 'ai:import-syllabus':  result = await handleImportSyllabus(job.data); break;
        case 'ai:insights':         result = await handleInsights(job.data); break;
        default: throw new Error(`Job desconhecido: ${job.name}`);
      }

      // Create usage audit log
      await AiUsageLog.create({
        userId,
        endpoint: job.name,
        provider: result.provider || 'unknown',
        model: result.model || 'unknown',
        inputTokens: result.usage?.prompt_tokens || 0,
        outputTokens: result.usage?.completion_tokens || 0,
        estimatedCostUsd: result.costUsd || 0,
        durationMs: Date.now() - startTime,
        status: 'success',
        ipAddress: job.data.__audit?.ipAddress,
        userAgent: job.data.__audit?.userAgent,
      });

      // Update token/request quota limit daily
      const today = new Date().toISOString().split('T')[0];
      const [quota] = await AiQuota.findOrCreate({
        where: { userId, date: today },
        defaults: {
          userId,
          date: today,
          requestCount: 0,
          tokenCount: 0
        }
      });
      await quota.increment({
        requestCount: 1,
        tokenCount: result.usage?.total_tokens || 0
      });
      await quota.update({ lastRequestAt: new Date() });

      return result.content || result;
    } catch (error: any) {
      await AiUsageLog.create({
        userId,
        endpoint: job.name,
        provider: 'unknown',
        model: job.data.model || 'unknown',
        inputTokens: 0,
        outputTokens: 0,
        estimatedCostUsd: 0,
        durationMs: Date.now() - startTime,
        status: error.message?.includes('rate') ? 'rate_limited' : 'error',
        errorMessage: error.message?.substring(0, 500),
        ipAddress: job.data.__audit?.ipAddress,
        userAgent: job.data.__audit?.userAgent,
      });
      throw error;
    }
  });
}, {
  connection: redisConnection as any,
  concurrency: 5,
  limiter: { max: 10, duration: 1000 },
});

// Bootstrap
(async () => {
  await connectDatabase();
  console.log('[AI Worker] Pronto para processar jobs');
})();

export { worker };
