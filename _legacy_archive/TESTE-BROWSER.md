# 🌐 Teste no Browser - StudyFlow AI

## ✅ Servidores Iniciados

Os servidores foram iniciados em background:

- **Backend**: http://localhost:4000
- **Frontend**: http://localhost:5173

## 🚀 Como Testar no Browser

### 1. Abrir a Aplicação

Abra seu navegador e acesse:
```
http://localhost:5173
```

### 2. Testar Fluxo Completo

#### Passo 1: Registrar Novo Usuário
1. Na tela inicial, clique em **"Registrar"** ou acesse `/register`
2. Preencha:
   - Nome: `Test User`
   - Email: `test@example.com` (ou qualquer email único)
   - Senha: `test123456` (mínimo 6 caracteres)
3. Clique em **"Registrar"**
4. Você deve ser redirecionado automaticamente para a aplicação

#### Passo 2: Verificar Dashboard
1. Após o login, você deve ver o Dashboard
2. Verifique se não há erros no console (F12 > Console)

#### Passo 3: Criar um Plano
1. Navegue até **"Disciplinas"** (ou use a sidebar)
2. Se não houver planos, crie um novo:
   - Clique em "Adicionar Plano" ou similar
   - Nome: `Meu Plano de Estudos`
   - Cor: Escolha uma cor
   - Clique em "Salvar"

#### Passo 4: Criar uma Disciplina
1. Com um plano selecionado, clique em **"Adicionar Disciplina"**
2. Preencha:
   - Nome: `Matemática`
   - Prioridade: `Alta`
   - Nível: `Iniciante`
   - Cor: Escolha uma cor
3. Clique em **"Salvar"**
4. Verifique se a disciplina aparece na lista

#### Passo 5: Adicionar Tópico
1. Na disciplina criada, clique em **"Adicionar Tópico"**
2. Nome: `Álgebra`
3. Clique em **"Salvar"**
4. Verifique se o tópico aparece

#### Passo 6: Adicionar Log de Estudo
1. Navegue até **"Histórico"** ou **"Study History"**
2. Clique em **"Adicionar Registro"** ou similar
3. Preencha:
   - Disciplina: Selecione `Matemática`
   - Tópico: Selecione `Álgebra`
   - Data: Data de hoje
   - Duração: `60` minutos
   - Questões: `10`
   - Acertos: `8`
4. Clique em **"Salvar"**
5. Verifique se o registro aparece na lista

#### Passo 7: Testar Isolamento de Dados
1. Clique em **"Sair"** ou faça logout
2. Registre um **novo usuário** com email diferente
3. Faça login com o novo usuário
4. Verifique que **NÃO** vê os dados do primeiro usuário
5. Crie um plano para este usuário
6. Verifique que os planos são independentes

#### Passo 8: Verificar Persistência
1. Faça logout
2. Feche o navegador
3. Abra novamente e faça login
4. Verifique que seus dados ainda estão lá (planos, disciplinas, etc.)

## 🔍 Verificações no Browser

### Console do Navegador (F12)
1. Abra o DevTools (F12)
2. Vá para a aba **Console**
3. Verifique se há erros em vermelho
4. Deve ver apenas logs informativos (se houver)

### Network Tab (F12 > Network)
1. Abra o DevTools (F12)
2. Vá para a aba **Network**
3. Faça uma ação (ex: criar plano)
4. Verifique:
   - Requisições para `/api/v1/*`
   - Status 200 (sucesso) ou 201 (criado)
   - Respostas JSON válidas

### Application Tab (F12 > Application)
1. Vá para **Application** > **Local Storage**
2. Verifique se há:
   - `studyflow_token` - Token JWT
3. Não deve haver dados antigos do localStorage (exceto token)

## ✅ Checklist de Testes

### Autenticação
- [ ] Registrar novo usuário funciona
- [ ] Login funciona
- [ ] Logout funciona
- [ ] Redirecionamento após login funciona
- [ ] Token é salvo no localStorage

### CRUD - Planos
- [ ] Criar plano funciona
- [ ] Listar planos mostra apenas os do usuário
- [ ] Atualizar plano funciona
- [ ] Deletar plano funciona
- [ ] Trocar de plano funciona

### CRUD - Disciplinas
- [ ] Criar disciplina funciona
- [ ] Listar disciplinas funciona
- [ ] Atualizar disciplina funciona
- [ ] Deletar disciplina funciona
- [ ] Ativar/desativar disciplina funciona

### CRUD - Tópicos
- [ ] Criar tópico funciona
- [ ] Atualizar tópico funciona
- [ ] Deletar tópico funciona
- [ ] Marcar tópico como completo funciona

### CRUD - Logs e Dados
- [ ] Criar log de estudo funciona
- [ ] Listar logs funciona
- [ ] Atualizar log funciona
- [ ] Deletar log funciona
- [ ] Criar erro no caderno funciona
- [ ] Criar simulado funciona
- [ ] Criar nota salva funciona

### Isolamento de Dados
- [ ] Usuário 1 não vê dados do usuário 2
- [ ] Cada usuário tem seus próprios planos
- [ ] Dados persistem após logout/login

### UI/UX
- [ ] Navegação entre telas funciona
- [ ] Loading states aparecem durante requisições
- [ ] Mensagens de erro aparecem quando necessário
- [ ] Formulários validam corretamente

## 🐛 Problemas Comuns

### "Network Error" ou CORS
- Verifique se o backend está rodando: http://localhost:4000/health
- Verifique o console do navegador para erros específicos
- Verifique se `CORS_ORIGIN` no `.env` do backend inclui `http://localhost:5173`

### "401 Unauthorized"
- Faça logout e login novamente
- Verifique se o token está no localStorage
- Limpe o localStorage e tente novamente

### Dados não aparecem
- Verifique o Network tab para ver se as requisições estão sendo feitas
- Verifique se as requisições retornam 200/201
- Verifique o console para erros

### Erro ao criar recurso
- Verifique se todos os campos obrigatórios estão preenchidos
- Verifique o console para mensagens de erro específicas
- Verifique o Network tab para ver a resposta do servidor

## 📊 Testes Avançados

### Teste de Performance
1. Crie 10 planos
2. Crie 20 disciplinas
3. Crie 50 logs de estudo
4. Verifique se a aplicação ainda responde bem

### Teste de Concorrência
1. Abra duas abas do navegador
2. Faça login com usuários diferentes
3. Crie dados em cada aba
4. Verifique que não há interferência

### Teste de Validação
1. Tente criar plano sem nome (deve falhar)
2. Tente criar disciplina sem planId (deve falhar)
3. Tente fazer login com senha errada (deve falhar)
4. Verifique se as mensagens de erro são claras

## 🎯 Resultado Esperado

Após todos os testes, você deve ter:
- ✅ Aplicação funcionando completamente
- ✅ Dados isolados por usuário
- ✅ Persistência funcionando
- ✅ Sem erros no console
- ✅ Todas as operações CRUD funcionando

## 📝 Notas

- O banco de dados SQLite é criado automaticamente na primeira execução
- Os dados persistem entre sessões
- Cada usuário tem seus próprios dados isolados
- O frontend usa React Query para cache e sincronização automática
