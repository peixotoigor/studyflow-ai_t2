# 🚀 Teste Rápido - StudyFlow AI

Guia rápido para testar a aplicação localmente.

## ⚡ Setup Rápido (1 minuto)

### Windows (PowerShell)
```powershell
.\scripts\setup-local.ps1
```

### Linux/macOS
```bash
bash scripts/setup-local.sh
```

## ▶️ Iniciar Aplicação

```bash
npm run dev
```

Isso inicia:
- **Backend**: http://localhost:4000
- **Frontend**: http://localhost:5173

## 🧪 Testar API

### Windows (PowerShell)
```powershell
.\scripts\test-api.ps1
```

### Linux/macOS
```bash
bash scripts/test-api.sh
```

## 🌐 Acessar

1. Abra http://localhost:5173 no navegador
2. Clique em "Registrar" para criar uma conta
3. Faça login
4. Explore a aplicação!

## ✅ Testes Manuais Rápidos

### 1. Criar Plano
- Navegue até "Disciplinas"
- Crie um novo plano
- Verifique se aparece na lista

### 2. Criar Disciplina
- Selecione um plano
- Adicione uma disciplina
- Verifique se aparece

### 3. Adicionar Log de Estudo
- Vá para "Histórico"
- Adicione um registro de estudo
- Verifique se foi salvo

### 4. Verificar Isolamento
- Faça logout
- Crie outra conta
- Verifique que não vê dados da conta anterior

## 🐛 Problemas?

### Backend não inicia
```bash
# Verificar se a porta 4000 está livre
# Windows:
netstat -ano | findstr :4000

# Mudar porta no apps/backend/.env se necessário
```

### Frontend não conecta
```bash
# Verificar se backend está rodando
curl http://localhost:4000/health

# Verificar CORS no apps/backend/.env
```

### Erro de dependências
```bash
# Limpar e reinstalar
rm -rf node_modules apps/*/node_modules
npm install
```

## 📝 Próximos Passos

Após o teste básico, consulte `README-TESTE.md` para testes mais detalhados.
