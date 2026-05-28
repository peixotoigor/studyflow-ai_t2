# 🏗️ Guia: Como Criar um Bom Backend

Um guia completo de boas práticas para construção de backends robustos, escaláveis e manteníveis.

---

## 📚 Índice

1. [Arquitetura](#1-arquitetura)
2. [Estrutura de Pastas](#2-estrutura-de-pastas)
3. [Segurança](#3-segurança)
4. [Banco de Dados](#4-banco-de-dados)
5. [API Design](#5-api-design)
6. [Autenticação & Autorização](#6-autenticação--autorização)
7. [Tratamento de Erros](#7-tratamento-de-erros)
8. [Logging & Monitoramento](#8-logging--monitoramento)
9. [Testes](#9-testes)
10. [Performance](#10-performance)
11. [CI/CD & Deploy](#11-cicd--deploy)

---

## 1. Arquitetura

### ✅ Padrões Recomendados

| Padrão | Quando Usar |
|--------|-------------|
| **MVC** | Aplicações simples, CRUDs |
| **Layered Architecture** | Aplicações médias, separação clara |
| **Clean Architecture** | Aplicações complexas, testabilidade |
| **Hexagonal Architecture** | Sistemas enterprise, muitas integrações |

### 🎯 Princípios SOLID no Backend

```typescript
// ✅ S - Single Responsibility
// Cada serviço faz UMA coisa bem

// ❌ Ruim: Serviço fazendo tudo
class UserService {
  async createUser(data) {
    // valida, salva, envia email, cria log...
  }
}

// ✅ Bom: Serviços especializados
class UserCreator {
  async execute(data) {
    await this.validator.validate(data);
    const user = await this.repository.create(data);
    await this.emailService.sendWelcome(user);
    return user;
  }
}
```

---

## 2. Estrutura de Pastas

### 📂 Estrutura Recomendada (Clean Architecture)

```
src/
├── config/                 # Configurações (DB, env, etc)
│   ├── database.ts
│   ├── env.ts
│   └── redis.ts
├── modules/               # Domínios da aplicação
│   ├── users/
│   │   ├── entities/      # Entidades de domínio
│   │   ├── usecases/      # Casos de uso (lógica de negócio)
│   │   ├── repositories/  # Interfaces de acesso a dados
│   │   ├── controllers/   # HTTP handlers
│   │   ├── routes.ts      # Definição de rotas
│   │   └── dto.ts         # Data Transfer Objects
│   └── products/
│       └── ...
├── shared/                # Código compartilhado
│   ├── errors/           # Classes de erro customizadas
│   ├── middlewares/      # Middlewares globais
│   ├── utils/            # Utilitários
│   └── types/            # Tipos TypeScript globais
├── infrastructure/        # Implementações concretas
│   ├── database/
│   │   ├── models/       # Modelos ORM
│   │   └── repositories/ # Implementações dos repos
│   ├── services/         # Serviços externos (email, storage)
│   └── http/
│       └── server.ts     # Configuração do servidor
└── index.ts             # Entry point
```

---

## 3. Segurança

### 🔐 Checklist de Segurança

```typescript
// ✅ 1. Use Helmet para headers de segurança
import helmet from 'helmet';
app.use(helmet());

// ✅ 2. Limite rate de requisições
import rateLimit from 'express-rate-limit';
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // limite por IP
});
app.use(limiter);

// ✅ 3. Sanitize inputs (proteção contra XSS/Injection)
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
app.use(mongoSanitize());
app.use(xss());

// ✅ 4. Valide TODOS os inputs com Zod/Yup
import { z } from 'zod';
const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2).max(100)
});

// ✅ 5. Nunca exponha erros internos em produção
app.use((err, req, res, next) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(500).json({ 
      message: 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  }
  res.status(500).json({ message: err.message, stack: err.stack });
});

// ✅ 6. Use CORS configurado corretamente
import cors from 'cors';
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// ✅ 7. Proteção contra SQL Injection (use ORM/Query Builders)
// ❌ NUNCA: const query = `SELECT * FROM users WHERE id = ${userId}`
// ✅ SEMPRE: await User.findByPk(userId)

// ✅ 8. Secrets em variáveis de ambiente
// ❌ NUNCA: const SECRET = 'minha-chave-secreta';
// ✅ SEMPRE: const SECRET = process.env.JWT_SECRET;

// ✅ 9. HTTPS em produção
// ✅ 10. Valide file uploads (tipo, tamanho)
// ✅ 11. Use HttpOnly cookies para tokens
// ✅ 12. Implemente CSRF protection se usar sessions
```

---

## 4. Banco de Dados

### 📊 Melhores Práticas

```typescript
// ✅ Use Connection Pooling
const sequelize = new Sequelize({
  // ...
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

// ✅ Transactions para operações múltiplas
await sequelize.transaction(async (t) => {
  const user = await User.create({ name: 'John' }, { transaction: t });
  await Profile.create({ userId: user.id }, { transaction: t });
});

// ✅ Indexes nas colunas frequentemente consultadas
// ✅ Soft delete (deletedAt) em vez de DELETE físico
// ✅ Migrations versionadas (nunca edite migração aplicada)
// ✅ Seeding para dados iniciais/teste

// ❌ Evite N+1 queries
// ❌ Não armazene senhas em plain text
// ❌ Não use SELECT * em queries grandes
```

### 🔍 Exemplo de Repository Pattern

```typescript
// src/modules/users/repositories/IUserRepository.ts
export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(data: CreateUserDTO): Promise<User>;
  update(id: string, data: UpdateUserDTO): Promise<User>;
  delete(id: string): Promise<void>;
}

// src/infrastructure/database/repositories/UserRepository.ts
export class UserRepository implements IUserRepository {
  async findById(id: string): Promise<User | null> {
    return UserModel.findByPk(id);
  }
  // ...
}
```

---

## 5. API Design

### 🌐 RESTful API - Boas Práticas

```typescript
// ✅ Use HTTP verbs corretamente
GET    /api/v1/users          # Listar (com paginação)
GET    /api/v1/users/:id      # Detalhar
POST   /api/v1/users          # Criar
PUT    /api/v1/users/:id      # Atualizar completo
PATCH  /api/v1/users/:id      # Atualizar parcial
DELETE /api/v1/users/:id      # Remover

// ✅ Versionamento na URL
/api/v1/users
/api/v2/users  // quando houver breaking changes

// ✅ Respostas consistentes
// Sucesso
{
  "success": true,
  "data": { /* ... */ },
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100
  }
}

// Erro
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid email format",
    "details": [
      { "field": "email", "message": "Must be valid email" }
    ]
  }
}

// ✅ Paginação padrão
GET /api/v1/users?page=1&limit=20&sort=name:asc&filter=active:true

// ✅ Status HTTP adequados
200 - OK
201 - Created
204 - No Content
400 - Bad Request
401 - Unauthorized
403 - Forbidden
404 - Not Found
409 - Conflict
422 - Unprocessable Entity
429 - Too Many Requests
500 - Internal Server Error
```

---

## 6. Autenticação & Autorização

### 🔐 Implementação JWT + Refresh Token

```typescript
// src/shared/middlewares/auth.ts
import jwt from 'jsonwebtoken';

interface AuthRequest extends Request {
  user?: { id: string; email: string; role: string };
}

export const authenticate = (req: AuthRequest, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader?.startsWith('Bearer ')) {
    throw new UnauthorizedError('Token not provided');
  }
  
  const token = authHeader.substring(7);
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;
    req.user = decoded;
    next();
  } catch {
    throw new UnauthorizedError('Invalid or expired token');
  }
};

// Autorização por role
export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw new ForbiddenError('Insufficient permissions');
    }
    next();
  };
};

// Uso:
// router.post('/admin-only', authenticate, authorize('admin'), handler);
```

---

## 7. Tratamento de Erros

### 🚨 Error Handling Centralizado

```typescript
// src/shared/errors/AppError.ts
export abstract class AppError extends Error {
  abstract statusCode: number;
  abstract code: string;
  
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends AppError {
  statusCode = 400;
  code = 'BAD_REQUEST';
}

export class UnauthorizedError extends AppError {
  statusCode = 401;
  code = 'UNAUTHORIZED';
}

export class NotFoundError extends AppError {
  statusCode = 404;
  code = 'NOT_FOUND';
}

// Middleware global
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message
      }
    });
  }
  
  // Erros não tratados
  console.error('Unhandled error:', err);
  return res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Something went wrong'
    }
  });
};
```

---

## 8. Logging & Monitoramento

### 📊 Implementação com Pino/Winston

```typescript
// src/shared/logger.ts
import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: process.env.NODE_ENV === 'development' 
    ? { target: 'pino-pretty' } 
    : undefined,
  base: { pid: process.pid, service: 'studyflow-api' }
});

// Uso:
logger.info({ userId: '123', action: 'login' }, 'User logged in');
logger.error({ err: error }, 'Failed to process payment');

// Middleware de request logging
export const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    logger.info({
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: Date.now() - start,
      userAgent: req.get('user-agent'),
      ip: req.ip
    });
  });
  
  next();
};

// Health checks
app.get('/health', async (req, res) => {
  const checks = {
    database: await checkDatabase(),
    redis: await checkRedis(),
    memory: process.memoryUsage(),
    uptime: process.uptime()
  };
  
  const isHealthy = checks.database && checks.redis;
  res.status(isHealthy ? 200 : 503).json(checks);
});
```

---

## 9. Testes

### 🧹 Pirâmide de Testes

```typescript
// Unit tests (Jest/Vitest)
describe('UserCreator', () => {
  it('should create user with valid data', async () => {
    const mockRepo = { create: jest.fn() };
    const service = new UserCreator(mockRepo);
    
    await service.execute({ email: 'test@test.com', name: 'John' });
    
    expect(mockRepo.create).toHaveBeenCalled();
  });
});

// Integration tests
describe('POST /api/v1/users', () => {
  it('should return 201 for valid data', async () => {
    const response = await request(app)
      .post('/api/v1/users')
      .send({ email: 'test@test.com', password: '123456' });
    
    expect(response.status).toBe(201);
    expect(response.body.data).toHaveProperty('id');
  });
});

// E2E tests (Cypress/Playwright)
```

---

## 10. Performance

### ⚡ Otimizações

```typescript
// ✅ Compression
import compression from 'compression';
app.use(compression());

// ✅ Caching (Redis)
import Redis from 'ioredis';
const redis = new Redis(process.env.REDIS_URL);

const cachedMiddleware = (duration = 300) => {
  return async (req, res, next) => {
    const key = `cache:${req.originalUrl}`;
    const cached = await redis.get(key);
    
    if (cached) {
      return res.json(JSON.parse(cached));
    }
    
    res.sendResponse = res.json;
    res.json = (body) => {
      redis.setex(key, duration, JSON.stringify(body));
      return res.sendResponse(body);
    };
    
    next();
  };
};

// ✅ Streaming para arquivos grandes
// ✅ Pagination em todas as listas
// ✅ Database query optimization (EXPLAIN ANALYZE)
// ✅ Connection pooling
```

---

## 11. CI/CD & Deploy

### 🚀 Pipeline Recomendada

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          
      - run: npm ci
      - run: npm run lint
      - run: npm run test
      - run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to Vercel
        run: npx vercel --prod --token ${{ secrets.VERCEL_TOKEN }}
```

---

## 📋 Checklist Final

### Antes de Deployar

- [ ] Variáveis de ambiente configuradas
- [ ] SSL/TLS habilitado
- [ ] Rate limiting implementado
- [ ] Logs configurados
- [ ] Health checks funcionando
- [ ] Migrations aplicadas
- [ ] Backup automático configurado
- [ ] Documentação da API (Swagger/OpenAPI)
- [ ] Testes passando
- [ ] Secrets não expostos no código

---

## 📚 Recursos Recomendados

| Recurso | Descrição |
|---------|-----------|
| [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices) | Guia completo Node.js |
| [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html) | Artigo do Uncle Bob |
| [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html) | Oficial Express |
| [12-Factor App](https://12factor.net/) | Metodologia de apps cloud-native |

---

> 💡 **Dica Final**: Comece simples e evolua conforme necessidade. Premature optimization é a raiz de todo mal. Mas sempre mantenha segurança e testes desde o início!