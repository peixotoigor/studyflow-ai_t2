**Studyflow AI Monorepo**

- Node.js 20+
- npm 9+

## 🚀 Início Rápido

### 1. Setup
```bash
# Instalar dependências
npm install

# Configurar ambiente (cria arquivos .env)
node scripts/setup.js
```

### 2. Executar
```bash
# Inicia backend (porta 4000) e frontend (porta 5173)
npm run dev
```

### 3. Acessar
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:4000
- **Health Check**: http://localhost:4000/health

## 🧪 Testar

### Teste Rápido
```bash
# Ver guia rápido
cat TESTE-RAPIDO.md

# Ou teste completo
cat README-TESTE.md
```

### Testar API (requer backend rodando)
```bash
# Windows PowerShell
.\scripts\test-api.ps1

# Linux/macOS
bash scripts/test-api.sh
```

## 📋 Configuração

**Backend (.env)** - Criado automaticamente por `scripts/setup.js`
- `PORT=4000`
- `DATABASE_URL=sqlite:./data/dev.sqlite`
- `JWT_SECRET` (gerado automaticamente)
- `CORS_ORIGIN=http://localhost:5173,http://localhost:3000`

**Frontend (.env)** - Criado automaticamente
- `VITE_API_PROXY=http://localhost:4000`

## 🏗️ Estrutura

```
apps/
  backend/          # Express + TypeScript + Sequelize
  frontend/         # React + Vite + TypeScript
shared/
  types/            # Tipos compartilhados
scripts/            # Scripts de setup e teste
```

## 📚 Documentação

- [Guia de Teste Completo](README-TESTE.md) - Testes detalhados
- [Teste Rápido](TESTE-RAPIDO.md) - Início rápido
- [Análise de Migração](docs/analise-separacao-backend-frontend.md) - Detalhes técnicos
- [Arquitetura](docs/architecture.md) - Visão geral

## 🔧 Comandos

```bash
# Desenvolvimento
npm run dev              # Backend + Frontend
npm run dev:backend      # Apenas backend
npm run dev:frontend     # Apenas frontend

# Build
npm run build            # Build completo
npm run build:backend    # Build backend
npm run build:frontend   # Build frontend

# Produção
npm start                # Inicia backend compilado
```

## 🔐 API

- **Base URL**: `http://localhost:4000/api/v1`
- **Autenticação**: JWT Bearer Token
- **Endpoints**: 
  - `/auth/register`, `/auth/login`, `/auth/me`
  - `/plans`, `/subjects`, `/study-logs`, `/error-logs`
  - `/simulated-exams`, `/saved-notes`, `/summary`

## ✅ Status da Migração

✅ **Backend**: 100% completo - API multiusuário funcional
✅ **Frontend**: 90% completo - MigratedAppPage usando API
✅ **Isolamento de Dados**: Implementado via JWT
✅ **Autenticação**: Login/Register funcionando

Veja [docs/MIGRACAO-COMPLETA.md](docs/MIGRACAO-COMPLETA.md) para detalhes.
