# Script para testar a API localmente (PowerShell)
# Requer que o backend esteja rodando em http://localhost:4000

$API_URL = "http://localhost:4000/api/v1"
$ErrorActionPreference = "Stop"

Write-Host "🧪 Testando API - StudyFlow AI" -ForegroundColor Cyan
Write-Host "==============================" -ForegroundColor Cyan
Write-Host ""

# Verificar se o backend está rodando
Write-Host "🔍 Verificando se o backend está rodando..." -ForegroundColor Yellow
try {
    $healthResponse = Invoke-WebRequest -Uri "http://localhost:4000/health" -UseBasicParsing -TimeoutSec 2
    Write-Host "✅ Backend está rodando" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend não está rodando. Inicie o backend primeiro:" -ForegroundColor Red
    Write-Host "   cd apps/backend && npm run dev" -ForegroundColor Yellow
    exit 1
}
Write-Host ""

# Teste 1: Health check
Write-Host "1️⃣  Testando Health Check..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:4000/health" -UseBasicParsing
    Write-Host "✅ Health check OK" -ForegroundColor Green
} catch {
    Write-Host "❌ Health check falhou" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Teste 2: Registro de usuário
Write-Host "2️⃣  Testando Registro de Usuário..." -ForegroundColor Yellow
$timestamp = Get-Date -Format "yyyyMMddHHmmss"
$registerBody = @{
    name = "Test User"
    email = "test$timestamp@example.com"
    password = "test123456"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-WebRequest -Uri "$API_URL/auth/register" `
        -Method POST `
        -ContentType "application/json" `
        -Body $registerBody `
        -UseBasicParsing
    
    $registerData = $registerResponse.Content | ConvertFrom-Json
    $TOKEN = $registerData.token
    
    if ($TOKEN) {
        Write-Host "✅ Registro bem-sucedido" -ForegroundColor Green
        Write-Host "   Token: $($TOKEN.Substring(0, 20))..." -ForegroundColor Gray
    } else {
        Write-Host "❌ Registro falhou" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Erro no registro: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Teste 3: Obter perfil
Write-Host "3️⃣  Testando GET /auth/me..." -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $TOKEN"
    }
    $meResponse = Invoke-WebRequest -Uri "$API_URL/auth/me" `
        -Headers $headers `
        -UseBasicParsing
    
    $meData = $meResponse.Content | ConvertFrom-Json
    $USER_ID = $meData.user.id
    
    Write-Host "✅ Perfil obtido com sucesso" -ForegroundColor Green
    Write-Host "   User ID: $USER_ID" -ForegroundColor Gray
} catch {
    Write-Host "❌ Falha ao obter perfil: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Teste 4: Criar plano
Write-Host "4️⃣  Testando Criar Plano..." -ForegroundColor Yellow
$planBody = @{
    name = "Plano de Teste"
    description = "Descrição do plano"
    color = "blue"
} | ConvertTo-Json

try {
    $planResponse = Invoke-WebRequest -Uri "$API_URL/plans" `
        -Method POST `
        -Headers $headers `
        -ContentType "application/json" `
        -Body $planBody `
        -UseBasicParsing
    
    $planData = $planResponse.Content | ConvertFrom-Json
    $PLAN_ID = $planData.plan.id
    
    Write-Host "✅ Plano criado com sucesso" -ForegroundColor Green
    Write-Host "   Plan ID: $PLAN_ID" -ForegroundColor Gray
} catch {
    Write-Host "❌ Falha ao criar plano: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Teste 5: Listar planos
Write-Host "5️⃣  Testando Listar Planos..." -ForegroundColor Yellow
try {
    $plansResponse = Invoke-WebRequest -Uri "$API_URL/plans" `
        -Headers $headers `
        -UseBasicParsing
    
    Write-Host "✅ Planos listados com sucesso" -ForegroundColor Green
} catch {
    Write-Host "❌ Falha ao listar planos: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Teste 6: Criar disciplina
Write-Host "6️⃣  Testando Criar Disciplina..." -ForegroundColor Yellow
$subjectBody = @{
    planId = $PLAN_ID
    name = "Matemática"
    active = $true
    color = "blue"
    priority = "HIGH"
    proficiency = "BEGINNER"
} | ConvertTo-Json

try {
    $subjectResponse = Invoke-WebRequest -Uri "$API_URL/subjects" `
        -Method POST `
        -Headers $headers `
        -ContentType "application/json" `
        -Body $subjectBody `
        -UseBasicParsing
    
    $subjectData = $subjectResponse.Content | ConvertFrom-Json
    $SUBJECT_ID = $subjectData.subject.id
    
    Write-Host "✅ Disciplina criada com sucesso" -ForegroundColor Green
    Write-Host "   Subject ID: $SUBJECT_ID" -ForegroundColor Gray
} catch {
    Write-Host "❌ Falha ao criar disciplina: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Teste 7: Obter summary
Write-Host "7️⃣  Testando GET /summary..." -ForegroundColor Yellow
try {
    $summaryResponse = Invoke-WebRequest -Uri "$API_URL/summary" `
        -Headers $headers `
        -UseBasicParsing
    
    Write-Host "✅ Summary obtido com sucesso" -ForegroundColor Green
} catch {
    Write-Host "❌ Falha ao obter summary: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Teste 8: Obter configurações
Write-Host "8️⃣  Testando GET /auth/settings..." -ForegroundColor Yellow
try {
    $settingsResponse = Invoke-WebRequest -Uri "$API_URL/auth/settings" `
        -Headers $headers `
        -UseBasicParsing
    
    Write-Host "✅ Configurações obtidas com sucesso" -ForegroundColor Green
} catch {
    Write-Host "❌ Falha ao obter configurações: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "✅ Todos os testes passaram!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
