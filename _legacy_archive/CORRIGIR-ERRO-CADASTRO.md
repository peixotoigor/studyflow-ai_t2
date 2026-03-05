# 🔧 Erro ao Cadastrar - Solução

## ❌ Problema

Ao tentar cadastrar com email "igor@teste", aparece "Falha ao cadastrar".

## 🔍 Causa

O email "igor@teste" **não é um email válido**. O backend valida o formato do email e requer um domínio completo (ex: `igor@teste.com`).

## ✅ Solução

### Opção 1: Usar email válido (Recomendado)

Use um email com formato válido:
- ✅ `igor@teste.com`
- ✅ `igor@teste.com.br`
- ✅ `igor.teste@example.com`
- ❌ `igor@teste` (inválido - falta domínio)

### Opção 2: Verificar mensagem de erro

Agora o sistema mostra a mensagem de erro real do backend. Tente cadastrar novamente e você verá uma mensagem mais específica como:
- "Invalid email" (se o email estiver inválido)
- "Email já cadastrado" (se o email já existir)
- "Dados inválidos" (se houver outros problemas de validação)

## 📝 Validações do Backend

O backend valida:
- **Nome**: mínimo 2 caracteres
- **Email**: formato de email válido (ex: `usuario@dominio.com`)
- **Senha**: mínimo 6 caracteres

## 🧪 Teste

Tente cadastrar com:
```
Nome: Igor
Email: igor@teste.com
Senha: 123456
```

Isso deve funcionar! ✅
