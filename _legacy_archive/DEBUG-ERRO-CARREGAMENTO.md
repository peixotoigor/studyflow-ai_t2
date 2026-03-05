# 🔍 Debug: Erro ao Carregar Dados

## ❌ Problema

Aparece apenas "Erro ao carregar dados" sem detalhes.

## 🔍 Como Diagnosticar

### Passo 1: Abrir Console do Navegador

1. Pressione **F12**
2. Vá para a aba **Console**
3. Procure por erros em **vermelho**
4. Veja a mensagem de erro específica

### Passo 2: Verificar Network Tab

1. F12 > **Network**
2. Recarregue a página (F5)
3. Procure por requisições com status **vermelho** (4xx, 5xx)
4. Clique em cada requisição falhada
5. Veja a aba **Response** para ver a mensagem de erro

### Passo 3: Verificar Requisições

Verifique se estas requisições estão funcionando:

- `GET /api/v1/auth/me` - Deve retornar 200
- `GET /api/v1/summary` - Deve retornar 200
- `GET /api/v1/plans` - Deve retornar 200
- `GET /api/v1/auth/settings` - Pode retornar 404 (não crítico se /auth/me tiver settings)

## 🐛 Erros Comuns

### 1. "401 Unauthorized"
**Causa**: Token inválido ou expirado
**Solução**: 
- Faça logout e login novamente
- Ou limpe localStorage: `localStorage.removeItem('studyflow_token')`

### 2. "Network Error" ou "Failed to fetch"
**Causa**: Backend não está rodando
**Solução**: 
```bash
# Verificar se backend está rodando
curl http://localhost:4000/health

# Se não responder, iniciar:
cd apps/backend && npm run dev
```

### 3. "404 Not Found" em /auth/settings
**Causa**: Endpoint não existe (mas não é crítico)
**Solução**: O sistema agora usa settings de `/auth/me` como fallback

### 4. "500 Internal Server Error"
**Causa**: Erro no servidor
**Solução**: 
- Verifique os logs do backend no terminal
- Verifique se o banco de dados está acessível

### 5. Erro de CORS
**Causa**: Backend não permite requisições do frontend
**Solução**: 
- Verifique `CORS_ORIGIN` no `.env` do backend
- Deve incluir `http://localhost:5174`

## ✅ Teste Manual

Teste cada endpoint manualmente:

```bash
# 1. Obter token (faça login primeiro)
TOKEN="seu-token-aqui"

# 2. Testar /auth/me
curl -H "Authorization: Bearer $TOKEN" http://localhost:4000/api/v1/auth/me

# 3. Testar /summary
curl -H "Authorization: Bearer $TOKEN" http://localhost:4000/api/v1/summary

# 4. Testar /plans
curl -H "Authorization: Bearer $TOKEN" http://localhost:4000/api/v1/plans
```

## 🔧 Correções Aplicadas

1. ✅ Tratamento de erros melhorado - mostra mensagem específica
2. ✅ Settings opcional - usa dados de `/auth/me` se disponível
3. ✅ Log detalhado no console para debug
4. ✅ Botão para logout e tentar novamente

## 📝 Próximos Passos

1. **Abra o Console (F12)** e veja a mensagem de erro específica
2. **Copie a mensagem de erro** completa
3. **Verifique o Network tab** para ver qual requisição está falhando
4. **Compartilhe o erro específico** para que eu possa ajudar melhor

Agora o sistema mostra mensagens de erro mais detalhadas no console e na tela!
