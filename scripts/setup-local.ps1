# Script de Setup Local - StudyFlow AI (PowerShell)
# Configura o ambiente local para desenvolvimento

Write-Host "🔧 Setup Local - StudyFlow AI" -ForegroundColor Cyan
Write-Host "==============================" -ForegroundColor Cyan
Write-Host ""

# Verificar Node.js
Write-Host "📋 Verificando Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node -v
    Write-Host "✅ Node.js $nodeVersion instalado" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js não encontrado. Instale Node.js 20+" -ForegroundColor Red
    exit 1
}

# Instalar dependências
Write-Host ""
Write-Host "📦 Instalando dependências..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Dependências instaladas" -ForegroundColor Green
} else {
    Write-Host "❌ Erro ao instalar dependências" -ForegroundColor Red
    exit 1
}

# Criar .env do backend
Write-Host ""
Write-Host "⚙️  Configurando backend..." -ForegroundColor Yellow
if (-not (Test-Path "apps\backend\.env")) {
    $jwtSecret = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
    $envContent = @"
PORT=4000
DATABASE_URL=sqlite:./data/dev.sqlite
JWT_SECRET=$jwtSecret
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173,http://localhost:3000
"@
    $envContent | Out-File -FilePath "apps\backend\.env" -Encoding utf8
    Write-Host "✅ Arquivo apps/backend/.env criado" -ForegroundColor Green
} else {
    Write-Host "⚠️  apps/backend/.env já existe" -ForegroundColor Yellow
}

# Criar .env do frontend
Write-Host ""
Write-Host "⚙️  Configurando frontend..." -ForegroundColor Yellow
if (-not (Test-Path "apps\frontend\.env")) {
    $envContent = @"
VITE_API_PROXY=http://localhost:4000
"@
    $envContent | Out-File -FilePath "apps\frontend\.env" -Encoding utf8
    Write-Host "✅ Arquivo apps/frontend/.env criado" -ForegroundColor Green
} else {
    Write-Host "⚠️  apps/frontend/.env já existe" -ForegroundColor Yellow
}

# Criar diretório de dados
Write-Host ""
Write-Host "📁 Criando diretórios..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path "apps\backend\data" | Out-Null
Write-Host "✅ Diretórios criados" -ForegroundColor Green

# Compilar backend
Write-Host ""
Write-Host "🔨 Compilando backend..." -ForegroundColor Yellow
Set-Location "apps\backend"
npm run build
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Backend compilado" -ForegroundColor Green
} else {
    Write-Host "❌ Erro ao compilar backend" -ForegroundColor Red
    Set-Location ..\..
    exit 1
}
Set-Location ..\..

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "✅ Setup concluído!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Para iniciar a aplicação:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  npm run dev" -ForegroundColor White
Write-Host ""
