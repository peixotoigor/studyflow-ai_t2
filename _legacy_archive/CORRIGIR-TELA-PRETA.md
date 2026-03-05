# 🔧 Tela Preta - Solução

## ❌ Problema

Ao acessar http://localhost:5174/, a tela fica preta e nada carrega.

## ✅ Correções Aplicadas

### 1. ErrorBoundary Adicionado
- Captura erros de JavaScript que quebram a renderização
- Mostra mensagem de erro amigável
- Botão para recarregar a página

### 2. Melhor Tratamento de Loading
- Loading states com estilos inline (não dependem de CSS externo)
- Feedback visual claro durante carregamento

### 3. Configuração do React Query
- Retry reduzido para evitar loops
- Refetch desabilitado ao focar janela

## 🔍 Como Diagnosticar

### Passo 1: Abrir Console do Navegador
1. Pressione **F12**
2. Vá para a aba **Console**
3. Procure por erros em **vermelho**

### Passo 2: Verificar Network
1. F12 > **Network**
2. Recarregue a página (F5)
3. Verifique se há requisições falhando

### Erros Comuns:

**"Cannot find module '@root/...'"**
- Problema com alias do Vite
- Verifique `apps/frontend/vite.config.ts`

**"Failed to fetch" ou "Network Error"**
- Backend não está rodando
- Verifique: `curl http://localhost:4000/health`

**"401 Unauthorized"**
- Token inválido
- Faça logout e login novamente

**Erro de importação de componente**
- Componente não encontrado
- Verifique se o arquivo existe em `components/`

## 🧪 Teste Rápido

1. **Limpar cache do navegador**
   - Ctrl+Shift+Delete (Chrome/Firefox)
   - Ou Ctrl+F5 (hard refresh)

2. **Verificar se backend está rodando**
   ```bash
   curl http://localhost:4000/health
   ```

3. **Verificar console do navegador**
   - F12 > Console
   - Veja se há erros

4. **Recarregar página**
   - F5 ou Ctrl+R

## 🔧 Se Ainda Estiver Preto

### Opção 1: Verificar Erro no Console
1. Abra F12 > Console
2. Copie o erro completo
3. Verifique qual componente está falhando

### Opção 2: Verificar se Backend Está Rodando
```bash
# Terminal 1
cd apps/backend
npm run dev

# Terminal 2  
cd apps/frontend
npm run dev
```

### Opção 3: Limpar e Reinstalar
```bash
# Limpar node_modules
rm -rf node_modules apps/*/node_modules

# Reinstalar
npm install
```

## 📝 Nota

O ErrorBoundary agora captura erros e mostra uma tela de erro amigável ao invés de tela preta. Se você ver uma tela de erro, ela mostrará:
- Mensagem de erro
- Stack trace
- Botão para recarregar

Isso ajuda a identificar o problema real!
