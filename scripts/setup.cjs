#!/usr/bin/env node

// Script de Setup Local - StudyFlow AI
// Configura o ambiente local para desenvolvimento

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

console.log('🔧 Setup Local - StudyFlow AI');
console.log('==============================\n');

// Criar .env do backend se não existir
const backendEnvPath = path.join(__dirname, '..', 'apps', 'backend', '.env');
if (!fs.existsSync(backendEnvPath)) {
  const jwtSecret = crypto.randomBytes(32).toString('base64');
  const backendEnv = `PORT=4000
DATABASE_URL=sqlite:./data/dev.sqlite
JWT_SECRET=${jwtSecret}
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173,http://localhost:3000
`;
  fs.writeFileSync(backendEnvPath, backendEnv);
  console.log('✅ Arquivo apps/backend/.env criado');
} else {
  console.log('⚠️  apps/backend/.env já existe');
}

// Criar .env do frontend se não existir
const frontendEnvPath = path.join(__dirname, '..', 'apps', 'frontend', '.env');
if (!fs.existsSync(frontendEnvPath)) {
  const frontendEnv = `VITE_API_PROXY=http://localhost:4000
`;
  fs.writeFileSync(frontendEnvPath, frontendEnv);
  console.log('✅ Arquivo apps/frontend/.env criado');
} else {
  console.log('⚠️  apps/frontend/.env já existe');
}

// Criar diretório de dados
const dataDir = path.join(__dirname, '..', 'apps', 'backend', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
  console.log('✅ Diretório apps/backend/data criado');
} else {
  console.log('✅ Diretório apps/backend/data já existe');
}

console.log('\n==========================================');
console.log('✅ Setup concluído!');
console.log('==========================================\n');
console.log('Para iniciar a aplicação:');
console.log('');
console.log('  npm run dev');
console.log('');
