# StudyFlow AI

**Plataforma inteligente de estudos para concursos públicos**, com agendamento algorítmico baseado em Repetição Espaçada (SRS), importação de editais por IA, tutor virtual integrado e sincronização com Google Drive.

> Monorepo full-stack · TypeScript · React 19 · Express · Sequelize · Vite

---

## Índice

- [Visão Geral](#visão-geral)
- [Arquitetura do Sistema](#arquitetura-do-sistema)
- [Stack Tecnológica](#stack-tecnológica)
- [Estrutura do Repositório](#estrutura-do-repositório)
- [Modelo de Dados](#modelo-de-dados)
- [Funcionalidades](#funcionalidades)
  - [Autenticação e Segurança](#1-autenticação-e-segurança)
  - [Planos de Estudo](#2-planos-de-estudo)
  - [Disciplinas e Tópicos](#3-disciplinas-e-tópicos)
  - [Importação Inteligente de Editais (PDF → IA)](#4-importação-inteligente-de-editais-pdf--ia)
  - [Dashboard e Mapa do Edital](#5-dashboard-e-mapa-do-edital)
  - [Modo Foco (Study Player)](#6-modo-foco-study-player)
  - [Cronograma Dinâmico com SRS](#7-cronograma-dinâmico-com-srs)
  - [Caderno de Erros](#8-caderno-de-erros)
  - [Simulados](#9-simulados)
  - [Anotações e Insights](#10-anotações-e-insights)
  - [Tutor IA (Chat)](#11-tutor-ia-chat)
  - [Histórico de Estudos](#12-histórico-de-estudos)
  - [Backup e Sincronização](#13-backup-e-sincronização)
  - [Anamnese de Tempo](#14-anamnese-de-tempo)
- [API REST — Endpoints](#api-rest--endpoints)
- [Primeiros Passos](#primeiros-passos)
  - [Pré-requisitos](#pré-requisitos)
  - [Instalação](#instalação)
  - [Variáveis de Ambiente](#variáveis-de-ambiente)
  - [Desenvolvimento](#desenvolvimento)
  - [Build de Produção](#build-de-produção)
- [Scripts Disponíveis](#scripts-disponíveis)
- [Decisões de Engenharia](#decisões-de-engenharia)
- [Licença](#licença)

---

## Visão Geral

O **StudyFlow AI** foi projetado para concurseiros que precisam de um sistema de estudos data-driven. A aplicação transforma um edital em PDF em um cronograma algorítmico personalizado, rastreia desempenho por disciplina, aplica revisões baseadas em repetição espaçada, e oferece um tutor IA contextual — tudo com sincronização em nuvem via Google Drive.

### Fluxo Principal do Usuário

```
Importar Edital (PDF)
     │
     ▼
IA extrai disciplinas e tópicos
     │
     ▼
Algoritmo gera cronograma mensal (SRS)
     │
     ▼
Modo Foco: timer Pomodoro por sessão
     │
     ▼
Registra desempenho (questões, acerto, tempo)
     │
     ▼
Dashboard atualiza progresso e próximas revisões
     │
     ▼
Caderno de Erros: análise de diagnóstico
     │
     ▼
Sincroniza com Google Drive (automático)
```

---

## Arquitetura do Sistema

```
┌──────────────────────────────────┐
│         Cliente (Browser)         │
│   React 19 + Vite + React Query  │
│   SPA com React Router            │
└──────────────┬───────────────────┘
               │ HTTP/REST (JWT Bearer)
               ▼
┌──────────────────────────────────┐
│        API REST (Express)         │
│  Zod validation · JWT auth        │
│  Helmet · CORS · Morgan logging   │
└──────────────┬───────────────────┘
               │
        ┌──────┴──────┐
        ▼             ▼
┌──────────────┐ ┌──────────────┐
│   SQLite /   │ │ Google Drive │
│   Postgres   │ │  API (OAuth) │
│  (Sequelize) │ │   Backup     │
└──────────────┘ └──────────────┘
```

### Padrão de Comunicação

| Camada | Responsabilidade |
|--------|-----------------|
| **Frontend** | Renderização, estado local (localStorage), chamadas à API via Axios, cache com React Query |
| **API** | Autenticação JWT, validação Zod, lógica de negócio, persistência via Sequelize ORM |
| **shared/types** | Contratos TypeScript compartilhados entre frontend e backend |
| **Google Drive** | Sincronização automática de dados em background (push/pull) via OAuth2 |

---

## Stack Tecnológica

### Backend

| Tecnologia | Versão | Finalidade |
|-----------|--------|-----------|
| **Node.js** | 20+ | Runtime |
| **Express** | 4.19 | HTTP framework |
| **TypeScript** | 5.3 | Linguagem |
| **Sequelize** | 6.37 | ORM (SQLite/Postgres) |
| **SQLite3** | 5.1 | Banco de dados padrão |
| **Zod** | 3.23 | Validação de schemas |
| **bcryptjs** | 2.4 | Hash de senhas |
| **jsonwebtoken** | 9.0 | Tokens JWT |
| **googleapis** | 140 | Google Drive API |
| **Nodemailer** | 6.9 | Envio de e-mails |
| **Helmet** | 7.0 | Headers de segurança |
| **tsx** | 4.19 | Dev runner (watch mode) |

### Frontend

| Tecnologia | Versão | Finalidade |
|-----------|--------|-----------|
| **React** | 19.2 | UI framework |
| **Vite** | 6.2 | Build tool & dev server |
| **TypeScript** | 5.8 | Linguagem |
| **React Router** | 7.1 | Roteamento SPA |
| **TanStack React Query** | 5.62 | Server state management |
| **Axios** | 1.7 | HTTP client |
| **pdfjs-dist** | 4.8 | Parsing de PDFs |

### Infraestrutura

| Item | Detalhes |
|------|---------|
| **Monorepo** | npm workspaces (`apps/backend`, `apps/frontend`) |
| **Concurrency** | `concurrently` para dev paralelo |
| **Shared Types** | `shared/types/domain.ts` com interfaces do domínio |
| **Criptografia** | AES-256-GCM para segredos de usuário (API keys) |

---

## Estrutura do Repositório

```
studyflow-ai/
├── package.json              # Workspace root (npm workspaces)
├── tsconfig.json             # Config base TypeScript
├── scripts/
│   ├── setup.js              # Setup automático (.env + diretórios)
│   ├── setup-local.sh        # Setup para Linux/macOS
│   ├── setup-local.ps1       # Setup para Windows
│   ├── test-api.sh           # Testes de API (curl)
│   └── test-local.sh         # Teste local end-to-end
├── shared/
│   └── types/
│       └── domain.ts         # Interfaces compartilhadas do domínio
├── docs/
│   └── architecture.md       # Documento de arquitetura
├── apps/
│   ├── backend/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── .env.example
│   │   └── src/
│   │       ├── index.ts              # Entrypoint Express
│   │       ├── config/
│   │       │   └── database.ts       # Sequelize config
│   │       ├── middleware/
│   │       │   ├── auth.ts           # JWT middleware
│   │       │   └── errorHandler.ts   # Error handler global
│   │       ├── models/
│   │       │   ├── index.ts          # Associações (1:N, 1:1)
│   │       │   ├── User.ts
│   │       │   ├── UserSettings.ts
│   │       │   ├── UserDriveAuth.ts
│   │       │   ├── PasswordResetToken.ts
│   │       │   ├── StudyPlan.ts
│   │       │   ├── Subject.ts
│   │       │   ├── Topic.ts
│   │       │   ├── StudyLog.ts
│   │       │   ├── ErrorLog.ts
│   │       │   ├── SimulatedExam.ts
│   │       │   └── SavedNote.ts
│   │       ├── routes/
│   │       │   ├── index.ts          # Router principal
│   │       │   ├── auth.ts           # Registro, login, senha
│   │       │   ├── plans.ts          # CRUD planos
│   │       │   ├── subjects.ts       # CRUD disciplinas + tópicos
│   │       │   ├── studyLogs.ts      # Registros de estudo
│   │       │   ├── errorLogs.ts      # Caderno de erros
│   │       │   ├── simulatedExams.ts # Simulados
│   │       │   ├── savedNotes.ts     # Anotações
│   │       │   ├── summary.ts        # Resumo completo
│   │       │   ├── drive.ts          # Google Drive OAuth
│   │       │   └── localBackup.ts    # Backup local
│   │       ├── services/
│   │       │   ├── studyAccess.ts    # Ownership guards
│   │       │   ├── googleDrive.ts    # Google Drive API
│   │       │   ├── driveSync.ts      # Auto-sync
│   │       │   ├── syncPayload.ts    # Build/apply payloads
│   │       │   └── localBackup.ts    # Snapshot local
│   │       └── utils/
│   │           ├── AppError.ts       # Classe de erro
│   │           ├── crypto.ts         # AES-256-GCM
│   │           └── mailer.ts         # Nodemailer + Ethereal
│   └── frontend/
│       ├── package.json
│       ├── vite.config.ts
│       ├── index.html
│       └── src/
│           ├── main.tsx              # Entrypoint React
│           ├── App.tsx               # Rotas
│           ├── styles.css
│           ├── types.ts              # Re-export domain types
│           ├── api/
│           │   └── client.ts         # Axios instance + interceptors
│           ├── contexts/
│           │   └── AuthContext.tsx    # Auth state (JWT/user)
│           ├── hooks/
│           │   ├── usePlans.ts
│           │   ├── useSubjects.ts
│           │   ├── useStudyLogs.ts
│           │   ├── useErrorLogs.ts
│           │   ├── useSimulatedExams.ts
│           │   ├── useSavedNotes.ts
│           │   ├── useSummary.ts
│           │   └── useUser.ts
│           ├── pages/
│           │   ├── MigratedAppPage.tsx    # Shell principal
│           │   ├── LoginPage.tsx
│           │   ├── RegisterPage.tsx
│           │   ├── DashboardPage.tsx
│           │   ├── ForgotPasswordPage.tsx
│           │   ├── ResetPasswordPage.tsx
│           │   └── LegacyAppPage.tsx
│           ├── components/
│           │   ├── Dashboard.tsx
│           │   ├── StudyPlayer.tsx
│           │   ├── SubjectManager.tsx
│           │   ├── DynamicSchedule.tsx
│           │   ├── ErrorNotebook.tsx
│           │   ├── SimulatedExams.tsx
│           │   ├── SavedNotes.tsx
│           │   ├── AiTutorChat.tsx
│           │   ├── Importer.tsx
│           │   ├── AlgorithmicCycle.tsx
│           │   ├── StudyHistory.tsx
│           │   ├── Sidebar.tsx
│           │   ├── BottomNavigation.tsx
│           │   ├── ProfileModal.tsx
│           │   ├── Wizard.tsx
│           │   ├── TimeAnamnesis.tsx
│           │   ├── AuthGate.tsx
│           │   └── ErrorBoundary.tsx
│           └── utils/
│               ├── scheduler.ts      # Algoritmo SRS (~1200 linhas)
│               └── secrets.ts
└── _legacy_archive/                  # Código da versão anterior (referência)
```

---

## Modelo de Dados

```
┌──────────┐     ┌───────────────┐     ┌──────────────┐
│   User   │────<│  StudyPlan    │────<│   Subject    │
│          │     │               │     │              │
│ id       │     │ id            │     │ id           │
│ name     │     │ userId (FK)   │     │ planId (FK)  │
│ email    │     │ name          │     │ name         │
│ password │     │ description   │     │ active       │
│ Hash     │     │ color         │     │ color        │
└────┬─────┘     └───────┬───────┘     │ weight       │
     │                   │             │ priority     │
     │  ┌────────────┐   │             │ proficiency  │
     └─<│UserSettings│   │             └──┬───┬───┬───┘
     │  │            │   │                │   │   │
     │  │ dailyTime  │   │  ┌─────────┐  │   │   │  ┌──────────┐
     │  │ openAiKey  │   └─<│Simulated│  │   │   └─<│  Topic   │
     │  │ githubToken│      │  Exam   │  │   │      │          │
     │  │ avatarUrl  │      └─────────┘  │   │      │ id       │
     │  └────────────┘                   │   │      │ name     │
     │                    ┌──────────┐   │   │      │ completed│
     │  ┌──────────────┐  │ SavedNote│   │   │      └──────────┘
     └─<│UserDriveAuth │  │          │   │   │
     │  │              │  │ planId   │   │   │  ┌──────────┐
     │  │ refreshToken │  │ subjectId│   │   └─<│ StudyLog │
     │  │ driveFolderId│  │ content  │   │      │          │
     │  └──────────────┘  │ tags     │   │      │ date     │
     │                    └──────────┘   │      │ duration │
     │  ┌──────────────────┐             │      │ questions│
     └─<│PasswordResetToken│             │      │ correct  │
        │                  │             │      │ modality │
        │ tokenHash        │  ┌─────────┐│      └──────────┘
        │ expiresAt        │  │ErrorLog ││
        │ used             │  │         │┘
        └──────────────────┘  │ topicName      │
                              │ reason         │
                              │ description    │
                              │ correction     │
                              │ reviewCount    │
                              └────────────────┘
```

### Enumerações do Domínio

| Tipo | Valores |
|------|---------|
| **PriorityLevel** | `HIGH`, `MEDIUM`, `LOW` |
| **ProficiencyLevel** | `BEGINNER`, `INTERMEDIATE`, `ADVANCED` |
| **StudyModality** | `PDF`, `VIDEO`, `QUESTIONS`, `LEGISLATION`, `REVIEW` |
| **ErrorReason** | `KNOWLEDGE_GAP`, `ATTENTION`, `INTERPRETATION`, `TRICK`, `TIME` |

---

## Funcionalidades

### 1. Autenticação e Segurança

- **Registro** com validação de e-mail e senha mínima (6 caracteres)
- **Login** com JWT (validade: 7 dias) e opção "Lembrar-me"
- **Recuperação de senha** via token por e-mail (hash SHA-256, TTL de 30min)
  - Envio via SMTP configurável ou fallback para Ethereal (dev)
- **Middleware de autorização** em todas as rotas protegidas
- **Criptografia AES-256-GCM** para segredos do usuário (API keys da OpenAI, tokens GitHub)
- **Helmet** para hardening de headers HTTP
- **CORS** configurável via variável de ambiente
- **Validação Zod** em todos os inputs da API
- **Error handler global** com tratamento específico para `AppError`, `ZodError` e `ValidationError`

### 2. Planos de Estudo

- CRUD completo de planos de estudo
- Cada plano pode ter **cor personalizada** e descrição
- Suporta **múltiplos planos** por usuário (ex: concurso A, concurso B)
- Alternância entre planos via sidebar com indicador visual
- Sincronização automática com Google Drive após cada operação

### 3. Disciplinas e Tópicos

- Criação de disciplinas com **prioridade** (Alta/Média/Baixa), **proficiência** (Iniciante/Intermediário/Avançado) e **peso** numérico
- **Tópicos hierárquicos** dentro de cada disciplina com status de conclusão
- **Operações em lote**: seleção múltipla para arquivamento ou atualização de peso
- **Paleta de 9 cores** para organização visual
- Alternância entre disciplinas ativas e arquivadas
- **Sistema de undo** com janela de 6 segundos para exclusões em lote
- Importação de disciplinas entre planos existentes

### 4. Importação Inteligente de Editais (PDF → IA)

Pipeline em 3 etapas para transformar um PDF de edital em disciplinas estruturadas:

1. **Upload**: Validação do PDF com `pdfjs-dist` (até 100 páginas, detecção de PDF protegido)
2. **Processamento IA** (OpenAI):
   - **Etapa 1 — Filtro**: Isola a seção de conteúdo programático do ruído do edital
   - **Etapa 2 — Estruturação**: Extrai JSON hierárquico → categorias → disciplinas → tópicos
3. **Revisão**: Multi-select das disciplinas extraídas antes da importação

- Distribuição automática de cores entre as disciplinas importadas (paleta de 16 cores)
- Barra de progresso detalhada em cada estágio (leitura 40% → filtro 45% → estruturação 75%)
- Tratamento de erros para PDFs escaneados sem OCR

### 5. Dashboard e Mapa do Edital

- **Mapa do Edital**: Visualização hierárquica de todos os tópicos com rastreamento de status:
  - `NÃO VISTO` → `VISTO` → `REVISADO` → `DOMINADO`
  - Agrupamento inteligente por separadores no nome do tópico (-, :, –, >)
- **Plano do Dia**: Top 3 disciplinas priorizadas por prioridade e progresso
- **Métricas de Performance**: Acurácia global, tempo de estudo acumulado, total de sessões
- **Modo Recovery**: Input manual de token para restauração de backup (zero-state)
- **Onboarding UI**: Fluxo guiado para novos usuários direcionando ao Importador

### 6. Modo Foco (Study Player)

- **Timer Pomodoro** configurável com alarme sonoro ao finalizar
- **Fila diária** gerada algoritmicamente via `generateMonthlySchedule()`
- **Relatório de sessão**: questões respondidas, acertos, modalidades de estudo
- **Integração com Tutor IA**: Botão para abrir chat contextual durante a sessão
- **Progresso diário**: Barra de porcentagem em relação à meta de tempo
- **Estado persistente**: Auto-save do estado do player em localStorage com restauração inteligente
- **Rastreamento de modalidades**: THEORY, REVIEW, PDF, QUESTIONS, ACTIVE_RECALL

### 7. Cronograma Dinâmico com SRS

O algoritmo central de scheduling (~1200 linhas) é o coração da aplicação:

- **Geração mensal** de cronograma baseado em disciplinas ativas, pesos, prioridade e proficiência
- **Repetição Espaçada (SRS)** com 3 modos:
  - **Acelerado**: Intervalos de 1, 3 e 7 dias
  - **Normal**: Intervalos de 1, 7 e 14 dias
  - **Relaxado**: Intervalos de 3, 10 e 20 dias
- **Modo inteligente**: Intervalos adaptativos baseados na frequência de erros
- **RNG determinístico** (seeded) para consistência entre sessões
- **Sistema de deck ponderado**: Fisher-Yates shuffle com remoção de duplicatas adjacentes
- **Três estágios de processamento**:
  1. Extração de logs reais (hoje e passado)
  2. Aplicação de revisões SRS nos intervalos corretos
  3. Preenchimento de slots com teoria nova
- **Configurações**: Seleção de disciplinas, dias ativos da semana, orçamento diário de tempo
- **Calendário visual**: Grade mensal com itens coloridos por disciplina, indicadores de folga, totais de horas/dia
- **Modal de detalhes**: Clique em um dia para ver o cronograma completo

### 8. Caderno de Erros

Sistema de análise diagnóstica de erros com 5 categorias:

| Categoria | Descrição | Cor |
|-----------|-----------|-----|
| **Lacuna Teórica** | Conteúdo não dominado | Roxo |
| **Falta de Atenção** | Erro por descuido | Laranja |
| **Interpretação** | Erro de leitura/interpretação | Azul |
| **Pegadinha** | Questão feita para confundir | Vermelho |
| **Falta de Tempo** | Não concluiu a tempo | Cinza |

- Layout em duas colunas: "Onde errei" | "Insight chave"
- **Filtros avançados**: Multi-select por disciplina, motivo; busca textual
- **Contagem de revisões** por erro
- Analytics: total de erros e categoria mais frequente

### 9. Simulados

- Registro de simulados com título, instituição (banca), data, total de questões e acertos
- **Cards com código de cores**: vermelho (<60%), amarelo (60-80%), verde (≥80%)
- **Barra de progresso visual** por simulado
- **Gráfico de evolução**: Linha SVG mostrando melhoria ao longo do tempo (mínimo 2 simulados)
- Ordenação cronológica (mais recente primeiro)

### 10. Anotações e Insights

- Coleção de insights salvos de sessões com o Tutor IA
- **Tags por disciplina/tópico** e data de criação
- **Busca** por conteúdo, nome de disciplina ou tópico
- **Copiar para área de transferência** com um clique
- Tema visual âmbar/dourado (sabedoria)

### 11. Tutor IA (Chat)

- Chat lateral integrado com **OpenAI GPT-4o-mini**
- **Contexto-aware**: Recebe disciplina e tópico da sessão atual
- **Prompts otimizados para concursos**:
  - Respostas diretas e cirúrgicas
  - Foco em como bancas cobram o conteúdo
  - Alertas de pegadinhas com emoji ⚠️
  - Citações de legislação e mnemônicos
  - Formatação em bullet points
- **Salvar resposta** como anotação com um clique
- Histórico de conversa mantido dentro da sessão
- Painel lateral de 400px (desktop) ou tela cheia (mobile)

### 12. Histórico de Estudos

- **Tabela mestre** de todos os registros de estudo
- **Edição inline**: Data, tópico, duração, questões, acurácia
- **Adição manual** de sessões com seleção inteligente de disciplina/tópico
- **Filtros e ordenação**: Busca por tópico/disciplina, ordenação por coluna
- **Indicador visual de acurácia**: Verde (≥80%), amarelo (60-80%), vermelho (<60%)
- Opção de marcar tópico como concluído ao registrar

### 13. Backup e Sincronização

#### Google Drive (OAuth2)
- **Conexão OAuth2** com fluxo de consentimento completo
- **Sync automático** (push) após cada operação CRUD
- **Sync no login** (pull) — restaura dados do Drive ao autenticar
- **Push/Pull manual** via endpoints dedicados
- **Backups timestamped** com listagem e download
- Pasta dedicada `StudyFlow/` no Drive do usuário

#### Backup Local
- Exportação de payload JSON completo do usuário
- **Snapshot automático do SQLite** em background
- **Rotação automática**: Mantém os 15 mais recentes (JSON) e 10 (SQLite)
- Listagem e download de backups por usuário

### 14. Anamnese de Tempo

Calculadora visual para estimar tempo real disponível para estudos:

- **Sliders** para sono (padrão 7.5h), trabalho/estudo (8h), deslocamento (1.5h)
- **Gráfico de barras 24h** com alocações e tempo livre em destaque
- Integrado ao Wizard de onboarding para calibrar metas realistas

---

## API REST — Endpoints

Base URL: `/api/v1`

### Autenticação (`/auth`)

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| POST | `/auth/register` | Cadastro de usuário | Não |
| POST | `/auth/login` | Login (retorna JWT) | Não |
| POST | `/auth/forgot-password` | Solicita redefinição de senha | Não |
| POST | `/auth/reset-password` | Redefine senha com token | Não |
| GET | `/auth/me` | Dados do usuário + settings | Sim |
| PUT | `/auth/me` | Atualiza perfil | Sim |
| PUT | `/auth/me/settings` | Atualiza configurações | Sim |

### Planos (`/plans`)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/plans` | Lista planos do usuário |
| POST | `/plans` | Cria novo plano |
| PUT | `/plans/:planId` | Atualiza plano |
| DELETE | `/plans/:planId` | Exclui plano |

### Disciplinas (`/subjects`)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/subjects` | Cria disciplina |
| PUT | `/subjects/:subjectId` | Atualiza disciplina |
| DELETE | `/subjects/:subjectId` | Exclui disciplina |
| POST | `/subjects/:subjectId/topics` | Cria tópico |
| PUT | `/subjects/:subjectId/topics/:topicId` | Atualiza tópico |
| DELETE | `/subjects/:subjectId/topics/:topicId` | Exclui tópico |

### Registros de Estudo (`/study-logs`)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/study-logs` | Lista registros |
| POST | `/study-logs` | Cria registro |
| PUT | `/study-logs/:logId` | Atualiza registro |
| DELETE | `/study-logs/:logId` | Exclui registro |

### Caderno de Erros (`/error-logs`)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/error-logs` | Lista erros |
| POST | `/error-logs` | Registra erro |
| PUT | `/error-logs/:logId` | Atualiza erro |
| DELETE | `/error-logs/:logId` | Exclui erro |

### Simulados (`/simulated-exams`)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/simulated-exams` | Lista simulados |
| POST | `/simulated-exams` | Registra simulado |
| PUT | `/simulated-exams/:examId` | Atualiza simulado |
| DELETE | `/simulated-exams/:examId` | Exclui simulado |

### Anotações (`/saved-notes`)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/saved-notes` | Lista anotações |
| POST | `/saved-notes` | Cria anotação |
| PUT | `/saved-notes/:noteId` | Atualiza anotação |
| DELETE | `/saved-notes/:noteId` | Exclui anotação |

### Resumo (`/summary`)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/summary` | Resumo completo (planos, logs, erros, simulados, notas) |

### Google Drive (`/drive`)

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| GET | `/drive/connect` | URL de consentimento OAuth | Sim |
| GET | `/drive/callback` | Callback do Google | Não |
| POST | `/drive/backup/export` | Exporta backup para Drive | Sim |
| GET | `/drive/backups` | Lista backups no Drive | Sim |
| POST | `/drive/sync/push` | Push completo para Drive | Sim |
| POST | `/drive/sync/pull` | Pull completo do Drive | Sim |

### Backup Local (`/backup/local`)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/backup/local/export` | Exporta backup local |
| GET | `/backup/local/list` | Lista backups locais |
| GET | `/backup/local/download/:filename` | Download de backup |

---

## Primeiros Passos

### Pré-requisitos

- **Node.js** ≥ 20.x
- **npm** ≥ 9.x

### Instalação

```bash
# Clonar o repositório
git clone https://github.com/peixotoigor/studyflow-ai_t.git
cd studyflow-ai_t

# Instalar dependências (workspaces)
npm install

# Executar setup automático (cria .env e diretórios)
npm run test:setup
```

### Variáveis de Ambiente

#### Backend (`apps/backend/.env`)

```env
# Servidor
PORT=4000
NODE_ENV=development

# Banco de dados (SQLite padrão; trocar para Postgres em produção)
DATABASE_URL=sqlite:./data/dev.sqlite

# Autenticação
JWT_SECRET=sua-chave-secreta-aqui

# CORS
CORS_ORIGIN=http://localhost:5173,http://localhost:3000

# Criptografia de segredos do usuário
SECRET_KEY=chave-32-caracteres-para-aes256!!

# Google Drive (opcional)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:4000/api/v1/drive/callback

# SMTP para e-mails (opcional; fallback para Ethereal em dev)
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=no-reply@studyflow.local

# Frontend URL (para links em e-mails)
FRONTEND_URL=http://localhost:5173

# Password reset
RESET_TOKEN_TTL_MS=1800000
```

#### Frontend (`apps/frontend/.env`)

```env
VITE_API_PROXY=http://localhost:4000
```

### Desenvolvimento

```bash
# Inicia backend (porta 4000) + frontend (porta 5173) simultaneamente
npm run dev

# Ou separadamente:
npm run dev:backend
npm run dev:frontend
```

O Vite proxy está configurado para encaminhar `/api` para o backend automaticamente.

### Build de Produção

```bash
# Build de ambos
npm run build

# Iniciar servidor de produção
npm start
```

---

## Scripts Disponíveis

| Script | Descrição |
|--------|-----------|
| `npm run dev` | Inicia backend + frontend em paralelo (watch mode) |
| `npm run dev:backend` | Inicia apenas o backend (tsx watch) |
| `npm run dev:frontend` | Inicia apenas o frontend (Vite) |
| `npm run build` | Build de produção (backend + frontend) |
| `npm run build:backend` | Build TypeScript do backend |
| `npm run build:frontend` | Build Vite do frontend |
| `npm start` | Inicia servidor de produção |
| `npm run lint` | ESLint no backend |
| `npm run test:setup` | Setup automático do ambiente |
| `npm run test:api` | Testes de API via script |

---

## Decisões de Engenharia

### Monorepo com npm Workspaces
Escolhido por simplicidade e suporte nativo no npm. Os dois apps compartilham tipos via `shared/types/domain.ts` com path alias `@shared` no Vite.

### Sequelize com SQLite (dev) / Postgres (prod)
SQLite para zero-config em desenvolvimento. A abstração do Sequelize permite trocar para Postgres em produção apenas alterando `DATABASE_URL`. Modelos usam `InferAttributes` para type-safety com TypeScript.

### React Query para Server State
Elimina boilerplate de gerenciamento de estado assíncrono. Cada entidade tem seu custom hook (`usePlans`, `useSubjects`, etc.) com invalidação automática de queries relacionadas após mutations.

### Algoritmo de Scheduling Determinístico
O scheduler usa RNG com seed baseada em ano/mês, garantindo que o mesmo cronograma seja gerado em qualquer dispositivo para o mesmo período. Isso permite consistência sem necessidade de persistir o cronograma no servidor.

### Criptografia de Segredos do Usuário
API keys (OpenAI, GitHub) são criptografadas com AES-256-GCM antes de persistir no banco. A chave de criptografia é derivada de variável de ambiente, não ficando hardcoded.

### Dual Backup Strategy
Google Drive para sincronia em nuvem com acesso do usuário + backup local com rotação automática como safety net. Snapshots do SQLite são criados em background para disaster recovery.

### Validação em Duas Camadas
- **Frontend**: Validação de formulário antes de enviar
- **Backend**: Schemas Zod em todos os endpoints, garantindo que dados inválidos nunca alcancem o banco

### Ownership Guards
Toda operação verifica ownership via chain `User → Plan → Subject → Topic/Log`. Nenhum usuário acessa dados de outro, mesmo conhecendo UUIDs.

---

## Licença

Este projeto é privado.
