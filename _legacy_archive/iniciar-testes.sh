#!/bin/bash

# Script para iniciar backend e frontend para testes no browser

echo "🚀 Iniciando StudyFlow AI para testes no browser..."
echo ""

# Verificar se node_modules existe
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências..."
    npm install
fi

# Configurar ambiente se necessário
if [ ! -f "apps/backend/.env" ]; then
    echo "⚙️  Configurando ambiente..."
    node scripts/setup.js
fi

# Compilar backend
echo "🔨 Compilando backend..."
cd apps/backend
npm run build
cd ../..

# Verificar se já está rodando
if curl -s http://localhost:4000/health > /dev/null 2>&1; then
    echo "⚠️  Backend já está rodando na porta 4000"
else
    echo "▶️  Iniciando backend..."
    cd apps/backend
    npm run dev &
    BACKEND_PID=$!
    cd ../..
    echo "✅ Backend iniciado (PID: $BACKEND_PID)"
fi

# Aguardar backend iniciar
echo "⏳ Aguardando backend iniciar..."
sleep 5

# Verificar backend
if curl -s http://localhost:4000/health > /dev/null 2>&1; then
    echo "✅ Backend está rodando em http://localhost:4000"
else
    echo "❌ Backend não iniciou. Verifique os logs acima."
    exit 1
fi

# Verificar se frontend já está rodando
if curl -s http://localhost:5173 > /dev/null 2>&1; then
    echo "⚠️  Frontend já está rodando na porta 5173"
else
    echo "▶️  Iniciando frontend..."
    cd apps/frontend
    npm run dev &
    FRONTEND_PID=$!
    cd ../..
    echo "✅ Frontend iniciado (PID: $FRONTEND_PID)"
fi

# Aguardar frontend iniciar
echo "⏳ Aguardando frontend iniciar..."
sleep 5

echo ""
echo "=========================================="
echo "✅ Servidores iniciados!"
echo "=========================================="
echo ""
echo "🌐 Acesse a aplicação em:"
echo "   http://localhost:5173"
echo ""
echo "🔍 Backend API:"
echo "   http://localhost:4000"
echo "   http://localhost:4000/health"
echo ""
echo "📝 Para parar os servidores:"
echo "   pkill -f 'npm run dev'"
echo "   ou"
echo "   kill $BACKEND_PID $FRONTEND_PID"
echo ""
echo "🧪 Siga o guia em TESTE-BROWSER.md para testar"
echo ""
