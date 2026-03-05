#!/bin/bash

# Script de Setup Local - StudyFlow AI
# Configura o ambiente local para desenvolvimento

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "🔧 Setup Local - StudyFlow AI"
echo "=============================="
echo ""

# Instalar dependências
echo "📦 Instalando dependências..."
npm install
echo -e "${GREEN}✅ Dependências instaladas${NC}"
echo ""

# Criar .env do backend se não existir
if [ ! -f "apps/backend/.env" ]; then
    echo "⚙️  Criando .env do backend..."
    cat > apps/backend/.env << EOF
PORT=4000
DATABASE_URL=sqlite:./data/dev.sqlite
JWT_SECRET=$(openssl rand -base64 32 2>/dev/null || echo "dev-secret-change-in-production-$(date +%s)")
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173,http://localhost:3000
EOF
    echo -e "${GREEN}✅ Arquivo apps/backend/.env criado${NC}"
else
    echo -e "${YELLOW}⚠️  apps/backend/.env já existe${NC}"
fi
echo ""

# Criar .env do frontend se não existir
if [ ! -f "apps/frontend/.env" ]; then
    echo "⚙️  Criando .env do frontend..."
    cat > apps/frontend/.env << EOF
VITE_API_PROXY=http://localhost:4000
EOF
    echo -e "${GREEN}✅ Arquivo apps/frontend/.env criado${NC}"
else
    echo -e "${YELLOW}⚠️  apps/frontend/.env já existe${NC}"
fi
echo ""

# Criar diretório de dados
echo "📁 Criando diretórios..."
mkdir -p apps/backend/data
echo -e "${GREEN}✅ Diretórios criados${NC}"
echo ""

# Compilar backend
echo "🔨 Compilando backend..."
cd apps/backend
npm run build
cd ../..
echo -e "${GREEN}✅ Backend compilado${NC}"
echo ""

echo "=========================================="
echo -e "${GREEN}✅ Setup concluído!${NC}"
echo "=========================================="
echo ""
echo "Para iniciar a aplicação:"
echo ""
echo "  npm run dev"
echo ""
echo "Ou em terminais separados:"
echo ""
echo "  Terminal 1: cd apps/backend && npm run dev"
echo "  Terminal 2: cd apps/frontend && npm run dev"
echo ""
