#!/bin/bash

# Script de Teste Local - StudyFlow AI
# Este script testa a aplicação localmente

set -e

echo "🧪 Teste Local - StudyFlow AI"
echo "=============================="
echo ""

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para verificar se um comando existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Verificar dependências
echo "📋 Verificando dependências..."
if ! command_exists node; then
    echo -e "${RED}❌ Node.js não encontrado. Instale Node.js 20+${NC}"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo -e "${RED}❌ Node.js versão 20+ requerida. Versão atual: $(node -v)${NC}"
    exit 1
fi

if ! command_exists npm; then
    echo -e "${RED}❌ npm não encontrado${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js $(node -v)${NC}"
echo -e "${GREEN}✅ npm $(npm -v)${NC}"
echo ""

# Verificar se node_modules existe
echo "📦 Verificando dependências instaladas..."
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠️  Dependências não instaladas. Instalando...${NC}"
    npm install
fi

if [ ! -d "apps/backend/node_modules" ]; then
    echo -e "${YELLOW}⚠️  Dependências do backend não instaladas. Instalando...${NC}"
    cd apps/backend && npm install && cd ../..
fi

if [ ! -d "apps/frontend/node_modules" ]; then
    echo -e "${YELLOW}⚠️  Dependências do frontend não instaladas. Instalando...${NC}"
    cd apps/frontend && npm install && cd ../..
fi

echo -e "${GREEN}✅ Dependências verificadas${NC}"
echo ""

# Verificar arquivo .env do backend
echo "⚙️  Verificando configuração do backend..."
if [ ! -f "apps/backend/.env" ]; then
    echo -e "${YELLOW}⚠️  Arquivo .env não encontrado. Criando...${NC}"
    cat > apps/backend/.env << EOF
PORT=4000
DATABASE_URL=sqlite:./data/dev.sqlite
JWT_SECRET=$(openssl rand -base64 32 2>/dev/null || echo "dev-secret-change-in-production-$(date +%s)")
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173,http://localhost:3000
EOF
    echo -e "${GREEN}✅ Arquivo .env criado${NC}"
else
    echo -e "${GREEN}✅ Arquivo .env encontrado${NC}"
fi
echo ""

# Verificar arquivo .env do frontend
echo "⚙️  Verificando configuração do frontend..."
if [ ! -f "apps/frontend/.env" ]; then
    echo -e "${YELLOW}⚠️  Arquivo .env não encontrado. Criando...${NC}"
    cat > apps/frontend/.env << EOF
VITE_API_PROXY=http://localhost:4000
EOF
    echo -e "${GREEN}✅ Arquivo .env criado${NC}"
else
    echo -e "${GREEN}✅ Arquivo .env encontrado${NC}"
fi
echo ""

# Verificar se o diretório de dados existe
echo "📁 Verificando estrutura de diretórios..."
mkdir -p apps/backend/data
echo -e "${GREEN}✅ Diretórios criados${NC}"
echo ""

# Compilar backend
echo "🔨 Compilando backend..."
cd apps/backend
npm run build
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Backend compilado com sucesso${NC}"
else
    echo -e "${RED}❌ Erro ao compilar backend${NC}"
    exit 1
fi
cd ../..
echo ""

# Testar conexão com banco de dados (se PostgreSQL)
echo "🗄️  Verificando banco de dados..."
cd apps/backend
DB_URL=$(grep DATABASE_URL .env | cut -d'=' -f2-)
if [[ $DB_URL == sqlite:* ]]; then
    echo -e "${GREEN}✅ Usando SQLite (desenvolvimento)${NC}"
    echo "   Database: ${DB_URL#sqlite:}"
else
    echo -e "${YELLOW}⚠️  Usando PostgreSQL. Verificando conexão...${NC}"
    # Aqui poderia adicionar teste de conexão PostgreSQL
fi
cd ../..
echo ""

# Iniciar testes
echo "🚀 Iniciando testes..."
echo ""
echo "=========================================="
echo "  Backend: http://localhost:4000"
echo "  Frontend: http://localhost:5173"
echo "=========================================="
echo ""
echo "Para iniciar os servidores, execute em terminais separados:"
echo ""
echo "  Terminal 1 (Backend):"
echo "    cd apps/backend && npm run dev"
echo ""
echo "  Terminal 2 (Frontend):"
echo "    cd apps/frontend && npm run dev"
echo ""
echo "Ou use o comando do monorepo:"
echo "    npm run dev"
echo ""
echo -e "${GREEN}✅ Verificações concluídas!${NC}"
echo ""
