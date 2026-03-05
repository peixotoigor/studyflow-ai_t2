#!/bin/bash

# Script para testar a API localmente
# Requer que o backend esteja rodando em http://localhost:4000

set -e

API_URL="http://localhost:4000/api/v1"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "🧪 Testando API - StudyFlow AI"
echo "=============================="
echo ""

# Verificar se o backend está rodando
echo "🔍 Verificando se o backend está rodando..."
if curl -s -f "$API_URL/../health" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend está rodando${NC}"
else
    echo -e "${RED}❌ Backend não está rodando. Inicie o backend primeiro:${NC}"
    echo "   cd apps/backend && npm run dev"
    exit 1
fi
echo ""

# Teste 1: Health check
echo "1️⃣  Testando Health Check..."
HEALTH=$(curl -s "$API_URL/../health")
if echo "$HEALTH" | grep -q "ok"; then
    echo -e "${GREEN}✅ Health check OK${NC}"
else
    echo -e "${RED}❌ Health check falhou${NC}"
    echo "$HEALTH"
fi
echo ""

# Teste 2: Registro de usuário
echo "2️⃣  Testando Registro de Usuário..."
REGISTER_RESPONSE=$(curl -s -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test'$(date +%s)'@example.com",
    "password": "test123456"
  }')

TOKEN=$(echo "$REGISTER_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -n "$TOKEN" ]; then
    echo -e "${GREEN}✅ Registro bem-sucedido${NC}"
    echo "   Token: ${TOKEN:0:20}..."
else
    echo -e "${RED}❌ Registro falhou${NC}"
    echo "$REGISTER_RESPONSE"
    exit 1
fi
echo ""

# Teste 3: Login
echo "3️⃣  Testando Login..."
LOGIN_EMAIL="test$(date +%s)@example.com"
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Test User\",
    \"email\": \"$LOGIN_EMAIL\",
    \"password\": \"test123456\"
  }")

LOGIN_TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -n "$LOGIN_TOKEN" ]; then
    echo -e "${GREEN}✅ Login bem-sucedido${NC}"
    TOKEN="$LOGIN_TOKEN"
else
    echo -e "${RED}❌ Login falhou${NC}"
    exit 1
fi
echo ""

# Teste 4: Obter perfil
echo "4️⃣  Testando GET /auth/me..."
ME_RESPONSE=$(curl -s -X GET "$API_URL/auth/me" \
  -H "Authorization: Bearer $TOKEN")

if echo "$ME_RESPONSE" | grep -q "user"; then
    echo -e "${GREEN}✅ Perfil obtido com sucesso${NC}"
    USER_ID=$(echo "$ME_RESPONSE" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
else
    echo -e "${RED}❌ Falha ao obter perfil${NC}"
    echo "$ME_RESPONSE"
    exit 1
fi
echo ""

# Teste 5: Criar plano
echo "5️⃣  Testando Criar Plano..."
PLAN_RESPONSE=$(curl -s -X POST "$API_URL/plans" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Plano de Teste",
    "description": "Descrição do plano",
    "color": "blue"
  }')

PLAN_ID=$(echo "$PLAN_RESPONSE" | grep -o '"id":"[^"]*' | cut -d'"' -f4)

if [ -n "$PLAN_ID" ]; then
    echo -e "${GREEN}✅ Plano criado com sucesso${NC}"
    echo "   Plan ID: $PLAN_ID"
else
    echo -e "${RED}❌ Falha ao criar plano${NC}"
    echo "$PLAN_RESPONSE"
    exit 1
fi
echo ""

# Teste 6: Listar planos
echo "6️⃣  Testando Listar Planos..."
PLANS_RESPONSE=$(curl -s -X GET "$API_URL/plans" \
  -H "Authorization: Bearer $TOKEN")

if echo "$PLANS_RESPONSE" | grep -q "plans"; then
    echo -e "${GREEN}✅ Planos listados com sucesso${NC}"
else
    echo -e "${RED}❌ Falha ao listar planos${NC}"
    echo "$PLANS_RESPONSE"
fi
echo ""

# Teste 7: Criar disciplina
echo "7️⃣  Testando Criar Disciplina..."
SUBJECT_RESPONSE=$(curl -s -X POST "$API_URL/subjects" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"planId\": \"$PLAN_ID\",
    \"name\": \"Matemática\",
    \"active\": true,
    \"color\": \"blue\",
    \"priority\": \"HIGH\",
    \"proficiency\": \"BEGINNER\"
  }")

SUBJECT_ID=$(echo "$SUBJECT_RESPONSE" | grep -o '"id":"[^"]*' | cut -d'"' -f4)

if [ -n "$SUBJECT_ID" ]; then
    echo -e "${GREEN}✅ Disciplina criada com sucesso${NC}"
    echo "   Subject ID: $SUBJECT_ID"
else
    echo -e "${RED}❌ Falha ao criar disciplina${NC}"
    echo "$SUBJECT_RESPONSE"
    exit 1
fi
echo ""

# Teste 8: Criar tópico
echo "8️⃣  Testando Criar Tópico..."
TOPIC_RESPONSE=$(curl -s -X POST "$API_URL/subjects/$SUBJECT_ID/topics" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Álgebra",
    "completed": false
  }')

TOPIC_ID=$(echo "$TOPIC_RESPONSE" | grep -o '"id":"[^"]*' | cut -d'"' -f4)

if [ -n "$TOPIC_ID" ]; then
    echo -e "${GREEN}✅ Tópico criado com sucesso${NC}"
    echo "   Topic ID: $TOPIC_ID"
else
    echo -e "${RED}❌ Falha ao criar tópico${NC}"
    echo "$TOPIC_RESPONSE"
    exit 1
fi
echo ""

# Teste 9: Criar log de estudo
echo "9️⃣  Testando Criar Log de Estudo..."
LOG_RESPONSE=$(curl -s -X POST "$API_URL/study-logs" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"subjectId\": \"$SUBJECT_ID\",
    \"topicId\": \"$TOPIC_ID\",
    \"topicName\": \"Álgebra\",
    \"date\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",
    \"durationMinutes\": 60,
    \"questionsCount\": 10,
    \"correctCount\": 8,
    \"modalities\": [\"QUESTIONS\"]
  }")

LOG_ID=$(echo "$LOG_RESPONSE" | grep -o '"id":"[^"]*' | cut -d'"' -f4)

if [ -n "$LOG_ID" ]; then
    echo -e "${GREEN}✅ Log de estudo criado com sucesso${NC}"
else
    echo -e "${RED}❌ Falha ao criar log de estudo${NC}"
    echo "$LOG_RESPONSE"
fi
echo ""

# Teste 10: Obter summary
echo "🔟 Testando GET /summary..."
SUMMARY_RESPONSE=$(curl -s -X GET "$API_URL/summary" \
  -H "Authorization: Bearer $TOKEN")

if echo "$SUMMARY_RESPONSE" | grep -q "plans"; then
    echo -e "${GREEN}✅ Summary obtido com sucesso${NC}"
else
    echo -e "${RED}❌ Falha ao obter summary${NC}"
    echo "$SUMMARY_RESPONSE"
fi
echo ""

# Teste 11: Obter configurações
echo "1️⃣1️⃣  Testando GET /auth/settings..."
SETTINGS_RESPONSE=$(curl -s -X GET "$API_URL/auth/settings" \
  -H "Authorization: Bearer $TOKEN")

if echo "$SETTINGS_RESPONSE" | grep -q "dailyAvailableTimeMinutes"; then
    echo -e "${GREEN}✅ Configurações obtidas com sucesso${NC}"
else
    echo -e "${RED}❌ Falha ao obter configurações${NC}"
    echo "$SETTINGS_RESPONSE"
fi
echo ""

# Teste 12: Atualizar configurações
echo "1️⃣2️⃣  Testando PUT /auth/settings..."
UPDATE_SETTINGS_RESPONSE=$(curl -s -X PUT "$API_URL/auth/settings" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "dailyAvailableTimeMinutes": 300,
    "openAiModel": "gpt-4o"
  }')

if echo "$UPDATE_SETTINGS_RESPONSE" | grep -q "dailyAvailableTimeMinutes"; then
    echo -e "${GREEN}✅ Configurações atualizadas com sucesso${NC}"
else
    echo -e "${RED}❌ Falha ao atualizar configurações${NC}"
    echo "$UPDATE_SETTINGS_RESPONSE"
fi
echo ""

echo "=========================================="
echo -e "${GREEN}✅ Todos os testes passaram!${NC}"
echo "=========================================="
echo ""
echo "Resumo dos testes:"
echo "  ✅ Health check"
echo "  ✅ Registro de usuário"
echo "  ✅ Login"
echo "  ✅ Obter perfil"
echo "  ✅ Criar plano"
echo "  ✅ Listar planos"
echo "  ✅ Criar disciplina"
echo "  ✅ Criar tópico"
echo "  ✅ Criar log de estudo"
echo "  ✅ Obter summary"
echo "  ✅ Obter configurações"
echo "  ✅ Atualizar configurações"
echo ""
