# 🧪 Guia de Teste Local - StudyFlow AI

Este guia explica como testar a aplicação localmente após a migração completa.

## 📋 Pré-requisitos

- Node.js 20+ instalado
- npm 9+ instalado
- Git (opcional)

## 🚀 Setup Rápido

### Opção 1: Script Automatizado (Recomendado)

```bash
# Executar script de setup
./scripts/setup-local.sh

# Ou no Windows (PowerShell)
bash scripts/setup-local.sh
```

### Opção 2: Manual

1. **Instalar dependências:**
```bash
npm install
```

2. **Configurar variáveis de ambiente:**

Criar `apps/backend/.env`:
```env
PORT=4000
DATABASE_URL=sqlite:./data/dev.sqlite
JWT_SECRET=seu-secret-aqui-altere-em-producao
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173,http://localhost:3000
```

Criar `apps/frontend/.env`:
```env
VITE_API_PROXY=http://localhost:4000
```

3. **Compilar backend:**
```bash
cd apps/backend
npm run build
cd ../..
```

## ▶️ Executar Aplicação

### Opção 1: Monorepo (Recomendado)

```bash
# Inicia backend e frontend simultaneamente
npm run dev
```

### Opção 2: Terminais Separados

**Terminal 1 - Backend:**
```bash
cd apps/backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd apps/frontend
npm run dev
```

## 🌐 Acessar Aplicação

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:4000
- **Health Check**: http://localhost:4000/health
- **API Docs**: http://localhost:4000/api/v1

## 🧪 Testar API

### Opção 1: Script Automatizado

```bash
# Certifique-se de que o backend está rodando primeiro
./scripts/test-api.sh
```

### Opção 2: Manual com cURL

**1. Health Check:**
```bash
curl http://localhost:4000/health
```

**2. Registrar Usuário:**
```bash
curl -X POST http://localhost:4000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "test123456"
  }'
```

**3. Login:**
```bash
curl -X POST http://localhost:4000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123456"
  }'
```

**4. Obter Perfil (substitua TOKEN pelo token retornado):**
```bash
curl -X GET http://localhost:4000/api/v1/auth/me \
  -H "Authorization: Bearer TOKEN"
```

**5. Criar Plano:**
```bash
curl -X POST http://localhost:4000/api/v1/plans \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Meu Plano de Estudos",
    "description": "Plano para concursos",
    "color": "blue"
  }'
```

## ✅ Checklist de Testes

### Testes de Autenticação
- [ ] Registrar novo usuário
- [ ] Login com credenciais válidas
- [ ] Login com credenciais inválidas (deve falhar)
- [ ] Obter perfil autenticado
- [ ] Acessar endpoint protegido sem token (deve falhar)

### Testes de CRUD - Planos
- [ ] Criar plano
- [ ] Listar planos do usuário
- [ ] Atualizar plano
- [ ] Deletar plano
- [ ] Verificar isolamento (criar plano com outro usuário)

### Testes de CRUD - Disciplinas
- [ ] Criar disciplina
- [ ] Listar disciplinas de um plano
- [ ] Atualizar disciplina
- [ ] Deletar disciplina
- [ ] Criar tópico em disciplina
- [ ] Atualizar tópico
- [ ] Deletar tópico

### Testes de CRUD - Logs e Dados
- [ ] Criar log de estudo
- [ ] Listar logs de estudo
- [ ] Atualizar log de estudo
- [ ] Deletar log de estudo
- [ ] Criar erro no caderno
- [ ] Criar simulado
- [ ] Criar nota salva

### Testes de Configurações
- [ ] Obter configurações do usuário
- [ ] Atualizar configurações
- [ ] Verificar persistência das configurações

### Testes de Frontend
- [ ] Acessar página de login
- [ ] Registrar novo usuário
- [ ] Fazer login
- [ ] Navegar entre telas
- [ ] Criar plano via UI
- [ ] Criar disciplina via UI
- [ ] Adicionar log de estudo via UI
- [ ] Verificar dados no dashboard

## 🐛 Troubleshooting

### Backend não inicia

**Erro: "Port 4000 already in use"**
```bash
# Encontrar processo usando a porta
lsof -i :4000  # macOS/Linux
netstat -ano | findstr :4000  # Windows

# Matar processo ou mudar PORT no .env
```

**Erro: "JWT_SECRET não configurado"**
```bash
# Verificar se apps/backend/.env existe e tem JWT_SECRET
cat apps/backend/.env
```

### Frontend não conecta ao backend

**Erro: "Network Error" ou CORS**
```bash
# Verificar se backend está rodando
curl http://localhost:4000/health

# Verificar CORS_ORIGIN no .env do backend
# Deve incluir http://localhost:5173
```

### Banco de dados não funciona

**SQLite:**
```bash
# Verificar se o diretório existe
ls -la apps/backend/data/

# Verificar permissões
chmod 755 apps/backend/data
```

**PostgreSQL:**
```bash
# Verificar conexão
psql $DATABASE_URL

# Verificar se a URL está correta no .env
```

### Dependências não instaladas

```bash
# Limpar e reinstalar
rm -rf node_modules apps/*/node_modules
npm install
```

## 📊 Verificar Logs

### Backend
Os logs aparecem no terminal onde o backend está rodando. Use `morgan` para ver requisições HTTP.

### Frontend
Abra o DevTools do navegador (F12) e verifique:
- Console para erros JavaScript
- Network para requisições HTTP
- Application > Local Storage para tokens

## 🔍 Testes Avançados

### Testar Isolamento de Dados

1. Criar usuário 1 e fazer login
2. Criar alguns planos/disciplinas
3. Fazer logout
4. Criar usuário 2 e fazer login
5. Verificar que não vê dados do usuário 1

### Testar Performance

```bash
# Testar com muitos dados
# Criar script para popular banco com dados de teste
```

### Testar Validações

- Tentar criar plano sem nome (deve falhar)
- Tentar criar disciplina sem planId (deve falhar)
- Tentar atualizar com dados inválidos (deve falhar)

## 📝 Notas

- O banco SQLite é criado automaticamente na primeira execução
- Tokens JWT expiram em 7 dias
- Dados são isolados por usuário automaticamente
- O frontend usa React Query para cache e sincronização

## 🆘 Suporte

Se encontrar problemas:
1. Verificar logs do backend e frontend
2. Verificar console do navegador
3. Verificar se todas as variáveis de ambiente estão configuradas
4. Verificar se as dependências estão instaladas
5. Tentar limpar e reinstalar dependências
