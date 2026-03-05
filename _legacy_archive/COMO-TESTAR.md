# 🌐 Como Testar no Browser

## 🚀 Iniciar Servidores

### Opção 1: Script Automatizado

**Linux/macOS/WSL:**
```bash
chmod +x iniciar-testes.sh
./iniciar-testes.sh
```

**Windows:**
```cmd
iniciar-testes.bat
```

### Opção 2: Manual

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

### Opção 3: Monorepo (Recomendado)
```bash
npm run dev
```

## 🌐 Acessar no Browser

Após iniciar os servidores, abra seu navegador em:

```
http://localhost:5173
```

## ✅ Teste Rápido (5 minutos)

### 1. Registrar Usuário
1. Clique em **"Registrar"** ou acesse `/register`
2. Preencha:
   - Nome: `Test User`
   - Email: `test@example.com`
   - Senha: `test123456`
3. Clique em **"Registrar"**

### 2. Criar Plano
1. Após login, vá para **"Disciplinas"**
2. Crie um novo plano:
   - Nome: `Meu Plano`
   - Cor: Escolha uma
3. Salve

### 3. Criar Disciplina
1. Com o plano selecionado, adicione uma disciplina:
   - Nome: `Matemática`
   - Prioridade: `Alta`
2. Salve

### 4. Adicionar Tópico
1. Na disciplina, adicione um tópico:
   - Nome: `Álgebra`
2. Salve

### 5. Adicionar Log de Estudo
1. Vá para **"Histórico"**
2. Adicione um registro:
   - Disciplina: `Matemática`
   - Tópico: `Álgebra`
   - Duração: `60` minutos
   - Questões: `10`, Acertos: `8`
3. Salve

### 6. Testar Isolamento
1. Faça **logout**
2. Registre um **novo usuário** (email diferente)
3. Faça login
4. Verifique que **NÃO** vê dados do primeiro usuário ✅

## 🔍 Verificações Importantes

### Console do Navegador (F12)
1. Abra DevTools (F12)
2. Aba **Console**
3. Não deve haver erros em vermelho
4. Pode haver logs informativos (normal)

### Network Tab (F12 > Network)
1. Faça uma ação (ex: criar plano)
2. Verifique:
   - Requisição para `/api/v1/plans` (POST)
   - Status: `201 Created` ou `200 OK`
   - Resposta JSON válida

### Application > Local Storage
1. F12 > Application > Local Storage
2. Deve ter: `studyflow_token` (JWT)
3. Não deve ter dados antigos do localStorage

## ✅ Checklist Completo

### Autenticação
- [ ] Registrar funciona
- [ ] Login funciona
- [ ] Logout funciona
- [ ] Token salvo no localStorage

### CRUD Básico
- [ ] Criar plano
- [ ] Listar planos (apenas do usuário)
- [ ] Criar disciplina
- [ ] Criar tópico
- [ ] Adicionar log de estudo

### Isolamento
- [ ] Usuário 1 não vê dados do usuário 2
- [ ] Dados persistem após logout/login

## 🐛 Problemas?

### "Cannot connect" ou "Network Error"
```bash
# Verificar se backend está rodando
curl http://localhost:4000/health

# Se não responder, iniciar backend:
cd apps/backend && npm run dev
```

### "401 Unauthorized"
- Faça logout e login novamente
- Limpe localStorage e tente

### Dados não aparecem
- Verifique Network tab (F12)
- Verifique console para erros
- Verifique se requisições retornam 200/201

## 📚 Documentação Completa

Para testes detalhados, veja:
- [TESTE-BROWSER.md](TESTE-BROWSER.md) - Guia completo de testes
- [README-TESTE.md](README-TESTE.md) - Testes avançados

## 🎯 Resultado Esperado

Após os testes, você deve ter:
- ✅ Aplicação funcionando
- ✅ Dados isolados por usuário
- ✅ Persistência funcionando
- ✅ Sem erros no console
- ✅ CRUD funcionando
