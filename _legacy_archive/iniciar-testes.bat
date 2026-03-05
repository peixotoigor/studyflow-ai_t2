@echo off
REM Script para iniciar backend e frontend para testes no browser (Windows)

echo 🚀 Iniciando StudyFlow AI para testes no browser...
echo.

REM Verificar se node_modules existe
if not exist "node_modules" (
    echo 📦 Instalando dependências...
    call npm install
)

REM Configurar ambiente se necessário
if not exist "apps\backend\.env" (
    echo ⚙️  Configurando ambiente...
    node scripts/setup.js
)

REM Compilar backend
echo 🔨 Compilando backend...
cd apps\backend
call npm run build
cd ..\..

REM Verificar se já está rodando
curl -s http://localhost:4000/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ⚠️  Backend já está rodando na porta 4000
) else (
    echo ▶️  Iniciando backend...
    start "Backend" cmd /k "cd apps\backend && npm run dev"
    timeout /t 5 /nobreak >nul
)

REM Verificar backend
curl -s http://localhost:4000/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Backend está rodando em http://localhost:4000
) else (
    echo ❌ Backend não iniciou. Verifique os logs acima.
    pause
    exit /b 1
)

REM Verificar se frontend já está rodando
curl -s http://localhost:5173 >nul 2>&1
if %errorlevel% equ 0 (
    echo ⚠️  Frontend já está rodando na porta 5173
) else (
    echo ▶️  Iniciando frontend...
    start "Frontend" cmd /k "cd apps\frontend && npm run dev"
    timeout /t 5 /nobreak >nul
)

echo.
echo ==========================================
echo ✅ Servidores iniciados!
echo ==========================================
echo.
echo 🌐 Acesse a aplicação em:
echo    http://localhost:5173
echo.
echo 🔍 Backend API:
echo    http://localhost:4000
echo    http://localhost:4000/health
echo.
echo 🧪 Siga o guia em TESTE-BROWSER.md para testar
echo.
pause
