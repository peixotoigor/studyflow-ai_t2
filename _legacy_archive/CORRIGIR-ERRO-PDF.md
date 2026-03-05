# 🔧 Corrigir Erro: pdfjs-dist não encontrado

## ❌ Erro
```
Failed to resolve import "pdfjs-dist" from "../../components/Importer.tsx"
```

## ✅ Solução

### Passo 1: Instalar dependência

Execute no terminal:

```bash
cd apps/frontend
npm install pdfjs-dist@^4.8.69
```

Ou na raiz do projeto:

```bash
npm install --workspace apps/frontend pdfjs-dist@^4.8.69
```

### Passo 2: Reiniciar servidor

Após instalar, pare o servidor (Ctrl+C) e reinicie:

```bash
npm run dev
```

## ✅ Verificação

Após instalar, o erro deve desaparecer e a aplicação deve carregar normalmente.

## 📝 Nota

A dependência `pdfjs-dist` é usada pelo componente `Importer.tsx` para processar arquivos PDF durante a importação de disciplinas.
