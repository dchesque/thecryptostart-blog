# 🔐 Implantação: Sistema de Autenticação com NextAuth.js v5 + PostgreSQL EasyPanel

## 📌 Visão Geral da Implantação

### Objetivo
Substituir o sistema de autenticação **hardcoded inseguro** (admin@cryptoacademy.com/admin123) por uma solução **enterprise-grade** com:
- ✅ NextAuth.js v5 + PostgreSQL (gerenciado pelo EasyPanel)
- ✅ Sistema de roles complexo (admin, editor, author)
- ✅ Armazenamento de dados de usuários (perfis, comentários, followers)
- ✅ Rate limiting contra brute force
- ✅ CSRF protection em operations state-changing
- ✅ Permissões granulares por role
- ✅ Middleware de proteção de rotas
- ✅ Deploy automático via Docker no EasyPanel
- ✅ Migrations automáticas ao fazer deploy

### Problema que Resolve
🔴 **Crítico:** Admin hardcoded em produção permitia acesso não autorizado ao dashboard  
🟡 **Segurança:** Sem rate limiting, CORS ou CSRF protection  
🟡 **Escalabilidade:** Impossível adicionar múltiplos usuários com papéis diferentes  
🟡 **Dados:** Sem armazenamento de comentários, followers ou perfis de usuários  

### Escopo da Implantação
- Instalação e configuração Prisma + PostgreSQL (EasyPanel)
- Schema de BD com 7 tabelas principais (users, roles, posts, comments, followers, etc)
- Atualizar auth.ts com NextAuth.js v5 + queries em PostgreSQL
- Middleware de proteção de rotas e validação de roles
- Sistema de permissões granulares (RBAC)
- Rate limiting em /api/auth/login
- CSRF protection middleware
- Seed script com usuários teste
- API routes para gerenciar usuários, roles e permissões
- **Atualizar Dockerfile** para rodar Prisma migrations antes de iniciar app
- **Atualizar docker-compose.yml** com PostgreSQL como serviço
- Documentação de setup com EasyPanel

---

## 🧠 Análise de Contexto Obrigatória

### 1. Analisar `.context` do Projeto

Antigravity deve **OBRIGATORIAMENTE**:
- [ ] Ler `.context` na raiz do repositório GitHub
- [ ] Identificar padrões de nomenclatura (kebab-case para arquivos, PascalCase para componentes)
- [ ] Verificar convenções TypeScript (tipos em `types/`, libs em `lib/`)
- [ ] Notar uso de Contentful CMS integrado (não remover, complementar)
- [ ] Observar padrão de estrutura de pastas existente
- [ ] Validar versões: Next.js 16, TypeScript 5.x, Tailwind CSS

### 2. Stack Existente (Não Modificar)
```
✅ Next.js 16 (App Router)
✅ TypeScript 5.x (strict mode)
✅ Tailwind CSS + Typography Plugin
✅ NextAuth.js v5 (já instalado - upgradar se necessário)
✅ Contentful CMS (integrado)
✅ Docker (multi-stage build)
✅ EasyPanel deployment (via Docker image)
✅ PostgreSQL (gerenciado pelo EasyPanel - NÃO local)
🔧 Será adicionado: Prisma ORM, Rate Limiting
```

### 3. Estrutura de Pastas Esperada
```
crypto-academy-blog/
├── app/
│   ├── api/
│   │   └── auth/
│   │       ├── [...nextauth]/route.ts        # SERÁ REFEITO
│   │       ├── login/route.ts                # NOVO - Rate limit
│   │       └── register/route.ts             # NOVO - Criar usuário
│   ├── admin/
│   │   ├── page.tsx                          # Dashboard protegido
│   │   ├── users/page.tsx                    # NOVO - Gerenciar usuários
│   │   └── layout.tsx                        # NOVO - Layout admin
│   ├── login/page.tsx                        # Já existe
│   └── middleware.ts                         # SERÁ MELHORADO
├── lib/
│   ├── prisma.ts                             # NOVO - Cliente Prisma
│   ├── auth.ts                               # SERÁ REFEITO
│   ├── permissions.ts                        # NOVO - RBAC system
│   ├── rate-limit.ts                         # NOVO - Rate limiting
│   ├── csrf.ts                               # NOVO - CSRF protection
│   └── seed.ts                               # NOVO - Database seed
├── prisma/
│   ├── schema.prisma                         # NOVO - Schema PostgreSQL
│   └── migrations/                           # NOVO - Migrações automáticas
├── types/
│   ├── auth.ts                               # NOVO - Types de auth
│   └── roles.ts                              # NOVO - Types de roles
├── scripts/
│   └── entrypoint.sh                         # NOVO - Migrations no Docker
├── Dockerfile                                # SERÁ AJUSTADO - rodar Prisma
├── docker-compose.yml                        # SERÁ AJUSTADO - SEM PostgreSQL
├── .env.example                              # SERÁ ATUALIZADO
└── auth.ts                                   # SERÁ REFEITO (raiz)
```

### 4. Integração com Existente
- **Contentful**: Mantém como é (CMS dos posts)
- **NextAuth.js**: Já instalado - fazer upgrade se necessário
- **Docker**: Melhorar para rodar migrations no startup
- **docker-compose.yml**: Remover PostgreSQL local (será gerenciado pelo EasyPanel)
- **Layout/Pages**: Estender com rotas admin protegidas
- **Middleware**: Melhorar proteção de rotas existentes

### 5. ⚠️ IMPORTANTE: EasyPanel PostgreSQL Gerenciado
**O PostgreSQL é provisionado e gerenciado pelo EasyPanel:**
- ✅ Conexão: Via `DATABASE_URL` (env var fornecida pelo EasyPanel)
- ✅ Migrações: Rodam automaticamente no Dockerfile via `entrypoint.sh`
- ✅ Backup: Gerenciado automaticamente pelo EasyPanel
- ✅ Credenciais: Configuradas via Environment Variables no painel EasyPanel
- ✅ Port: Não exposto externamente (rede privada EasyPanel)
- ✅ Atualizações: Gerenciadas pelo EasyPanel

**Não fazer:**
- ❌ NÃO adicionar PostgreSQL em docker-compose.yml
- ❌ NÃO usar conexões localhost:5432 em produção
- ❌ NÃO fazer migrations manuais (são automáticas)

---

## 📋 Plano de Implantação (Tarefas - 16 Tarefas)

### **Tarefa 1: Preparar Dependências**

**O que fazer:**
- Instalar Prisma CLI: `npm install -D prisma`
- Instalar cliente Prisma: `npm install @prisma/client`
- Instalar bcryptjs (se não estiver): `npm install bcryptjs @types/bcryptjs`
- Instalar zod para validação: `npm install zod`
- Instalar next-rate-limit: `npm install next-rate-limit`

**Verificar versões:**
- next-auth@beta (v5) - se < 5.0.0, fazer upgrade
- TypeScript >= 5.0
- Node.js >= 20.9

**Não faz:**
- Não instalar Firebase, Supabase ou Auth0
- Não modificar next.config.mjs ou tsconfig.json
- Não remover dependências existentes

---

### **Tarefa 2: Criar Schema Prisma e Configuração BD**

**O que fazer:**
- Criar arquivo `prisma/schema.prisma` com:
  - Datasource: postgresql (URL via DATABASE_URL env)
  - 7 models principais:
    1. **User** (id, email, password_hash, name, profile_image, bio, createdAt, updatedAt)
    2. **UserRole** (id, userId, role, createdAt) - Relacionamento many-to-many
    3. **Post** (id, title, slug, content, authorId, contentfulId, published, createdAt, updatedAt)
    4. **Comment** (id, postId, userId, content, approved, createdAt, updatedAt)
    5. **Follower** (id, followerId, followingId, createdAt)
    6. **UserPermission** (id, role, permission, createdAt)
    7. **PasswordReset** (id, userId, token, expiresAt, createdAt)

**Schema Prisma deve:**
- Usar UUID para IDs primários (gerado por PostgreSQL)
- Incluir índices em email, slug, userId
- Ter relacionamentos corretos (User -> UserRole, Post -> Comment, etc)
- Incluir soft deletes opcional (isDeleted, deletedAt)
- Comentários explicativos em cada model
- **datasource db { provider = "postgresql" url = env("DATABASE_URL") }**

**Variável de Ambiente:**
- `DATABASE_URL` será fornecida pelo EasyPanel ao fazer deploy
- Formato: `postgresql://user:password@host:port/database`
- NÃO incluir DATABASE_URL em `.env.example` (será do EasyPanel)
- Incluir apenas em `.env.local` para desenvolvimento local

**Para desenvolvimento local:**
```env
# .env.local (NUNCA commitar)
DATABASE_URL="postgresql://user:password@localhost:5432/crypto_academy_dev"
```

**Não faz:**
- Não criar migrations automaticamente (será feito na Tarefa 3)
- Não modificar o schema depois (será versionado)
- NÃO incluir provider SQLite no schema (apenas PostgreSQL)
- NÃO hardcodar DATABASE_URL

---

### **Tarefa 3.5: Ajustar Dockerfile para Prisma Migrations**

**O que fazer:**
- Atualizar `Dockerfile` para:
  1. Instalar Prisma durante build (já no package.json)
  2. Gerar cliente Prisma: `RUN npx prisma generate`
  3. Criar `scripts/entrypoint.sh` (veja Tarefa 3)
  4. Adicionar ENTRYPOINT que roda migrations antes de iniciar Next.js

**Dockerfile deve ser:**
```dockerfile
# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build Next.js app
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/scripts ./scripts

# Set correct permissions
RUN mkdir -p /app/.next/cache && chown -R nextjs:nodejs /app
RUN chmod +x /app/scripts/entrypoint.sh

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Execute migrations before starting
ENTRYPOINT ["/app/scripts/entrypoint.sh"]
```

**Criar `scripts/entrypoint.sh`:**
```bash
#!/bin/bash
set -e

echo "🔄 Running Prisma migrations..."
npx prisma migrate deploy

echo "🚀 Starting Next.js server..."
exec node server.js
```

**Atualizar `docker-compose.yml`:**
```yaml
version: '3.8'

services:
  crypto-academy:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - CONTENTFUL_SPACE_ID=${CONTENTFUL_SPACE_ID}
      - CONTENTFUL_ACCESS_TOKEN=${CONTENTFUL_ACCESS_TOKEN}
      - NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
    restart: unless-stopped
    depends_on:
      - postgres (REMOVER ISSO - será do EasyPanel)
```

**Não faz:**
- ❌ NÃO adicionar PostgreSQL no docker-compose (EasyPanel gerencia)
- ❌ NÃO hardcodar DATABASE_URL no Dockerfile
- ❌ NÃO executar migrations em modo builder (apenas runner)
- ❌ NÃO fazer seed automático

**O que fazer:**
- Criar arquivo `scripts/entrypoint.sh` que será executado quando Docker inicia:
  ```bash
  #!/bin/bash
  set -e
  
  # Executar migrations
  npx prisma migrate deploy
  
  # Executar seed (apenas primeira vez ou conforme necessário)
  # npx prisma db seed
  
  # Iniciar Next.js
  exec node server.js
  ```

- Atualizar `Dockerfile` para executar entrypoint antes de iniciar:
  ```dockerfile
  ENTRYPOINT ["/app/scripts/entrypoint.sh"]
  ```

- Gerar migration inicial localmente:
  ```bash
  # LOCAL APENAS (nunca em produção)
  npx prisma migrate dev --name init
  ```

**Migrações são automáticas:**
- ✅ `prisma migrate deploy` roda no startup do Docker
- ✅ Cria/atualiza tabelas automaticamente
- ✅ Não precisa de comando manual em produção
- ✅ EasyPanel executa Docker, Docker executa migrations

**Verificações:**
- [ ] Arquivo `scripts/entrypoint.sh` existe e tem permission 755
- [ ] Dockerfile tem `ENTRYPOINT ["/app/scripts/entrypoint.sh"]`
- [ ] Migration `prisma/migrations/[timestamp]_init/migration.sql` existe
- [ ] File `migration.sql` contém CREATE TABLE para todos os models
- [ ] Índices presentes para email, slug, userId
- [ ] Foreign keys configuradas

**Não faz:**
- ❌ NÃO executar migrations manualmente em produção
- ❌ NÃO fazer seed automático no entrypoint (apenas migrate deploy)
- ❌ NÃO deixar migrations pendentes
- ❌ NÃO alterar migrations já deployadas (fazer nova migration)

---

### **Tarefa 4: Criar Cliente Prisma e Utilities**

**Criar arquivo `lib/prisma.ts`:**
- Singleton pattern para cliente Prisma
- Evitar múltiplas instâncias em desenvolvimento
- Exportar `prisma` para usar em toda app

**Criar arquivo `types/auth.ts`:**
- Tipos para User com roles
- Tipos para Session extendidos
- Tipos para JWT token
- Tipos para Permissions

**Criar arquivo `types/roles.ts`:**
- Enum de roles: ADMIN, EDITOR, AUTHOR
- Type para permissões por role
- Type para permission checks

**Não faz:**
- Não incluir lógica de negócio
- Não fazer queries ao BD (deixar para auth.ts)

---

### **Tarefa 5: Refatorar auth.ts com NextAuth v5 + PostgreSQL**

**Arquivo `auth.ts` (na raiz):**

**Funcionalidades:**
- Provider Credentials com lookup em PostgreSQL (User table)
- Verificar password_hash com bcryptjs.compare()
- Incluir user.roles na query (relacionamento UserRole)
- JWT callback: adicionar roles ao token
- Session callback: adicionar roles à session
- Callbacks customizados para logging

**Estrutura:**
```typescript
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({...}) // Buscar em User + UserRole
  ],
  pages: {
    signIn: '/login',
    error: '/login?error=...'
  },
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60 // 7 dias
  },
  callbacks: {
    jwt({ token, user }) { ... },
    session({ session, token }) { ... }
  }
})
```

**Não faz:**
- Não incluir hardcoded users
- Não deixar senhas em plain text
- Não fazer queries sem erro handling
- Não remover nextauth pages customizadas

---

### **Tarefa 6: Criar Sistema de Permissões (RBAC)**

**Criar arquivo `lib/permissions.ts`:**

**Definir:**
- Enum/const ROLES: ADMIN, EDITOR, AUTHOR
- Map PERMISSIONS: qual role tem quais permissões
- Funções helpers:
  - `hasPermission(roles[], permission)` - boolean
  - `hasRole(roles[], role)` - boolean
  - `requireRole(session, role)` - throw error se não tem

**Permissões por Role:**
```
ADMIN:
  - manage_users
  - manage_roles
  - delete_post
  - view_analytics
  - moderate_comments

EDITOR:
  - create_post
  - publish_post
  - edit_all_posts
  - moderate_comments

AUTHOR:
  - create_post
  - edit_own_post
  - delete_own_post
```

**Criar arquivo `lib/auth-utils.ts`:**
- `getSession()` - wrapper da função auth()
- `requireAuth(session)` - throw se não logado
- `requireRole(session, role)` - throw se role insuficiente
- `getUserRoles(userId)` - query UserRole table

**Não faz:**
- Não adicionar lógica de negócio complexa
- Não fazer queries ao BD (deixar para auth-utils)

---

### **Tarefa 7: Implementar Rate Limiting**

**Criar arquivo `lib/rate-limit.ts`:**

**Funcionalidades:**
- Implementar rate limit sem BD (memory-based ou Redis - especificar)
- Função `checkRateLimit(key, action, options)` que:
  - Recebe: IP, ação (login), opções (intervalo, max requests)
  - Retorna: { limited: boolean, remaining: number, resetAt: Date }
  - Limpa automaticamente após expiração

**Limites:**
- Login: 5 tentativas por 15 minutos por IP
- Register: 3 por hora por IP
- API calls: 100 por hora por user (autenticado)

**Não faz:**
- Não usar BD para rate limiting (será memory para V1)
- Não persistir indefinidamente

---

### **Tarefa 8: Implementar CSRF Protection**

**Criar arquivo `lib/csrf.ts`:**

**Funcionalidades:**
- Gerar CSRF tokens únicos por sessão
- Validar tokens em POST/PUT/DELETE requests
- Middleware para injetar token em forms

**Estratégia:**
- Usar JWT assinado com secret
- Token incluso em form hidden field + header
- Validação em middleware e API routes

**Não faz:**
- Não usar cookies SameSite (é insuficiente)
- Não fazer validação apenas no frontend

---

### **Tarefa 9: Criar Middleware de Proteção de Rotas**

**Refatorar arquivo `middleware.ts`:**

**Funcionalidades:**
- Proteger `/admin/*` - require auth
- Validar role para sub-rotas:
  - `/admin/users/*` - require ADMIN role
  - `/admin/posts/*` - require EDITOR ou ADMIN
- Injetar CSRF token em requests
- Rate limit check para APIs
- Logging de acessos

**Estrutura:**
```typescript
export async function middleware(request: NextRequest) {
  const session = await auth()
  
  // Verificar auth
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!session) return redirect('/login')
  }
  
  // Verificar role
  if (request.nextUrl.pathname.startsWith('/admin/users')) {
    if (!session.user.roles.includes('admin')) {
      return new Response('Unauthorized', { status: 403 })
    }
  }
  
  // Rate limit check
  const rateLimit = await checkRateLimit(...)
  if (rateLimit.limited) {
    return new Response('Too many requests', { status: 429 })
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/api/protected/:path*']
}
```

**Não faz:**
- Não fazer queries pesadas no middleware
- Não interromper requests para content estático

---

### **Tarefa 10: Criar API Routes**

**Criar `app/api/auth/[...nextauth]/route.ts`:**
- Integrar NextAuth handlers: `{ GET, POST }`

**Criar `app/api/auth/login/route.ts`:**
- POST: com rate limit check
- Validar credentials via auth()
- Retornar JWT token

**Criar `app/api/users/route.ts`:**
- GET: listar usuários (admin only)
- POST: criar novo usuário
- Ambas com auth + role checks

**Criar `app/api/users/[id]/route.ts`:**
- GET: dados do usuário
- PUT: atualizar perfil
- DELETE: remover usuário (admin only)

**Criar `app/api/roles/route.ts`:**
- GET: listar roles disponíveis
- POST: atribuir role a usuário (admin only)
- DELETE: remover role

**Criar `app/api/comments/route.ts`:**
- GET: listar comentários de post
- POST: criar comentário
- DELETE: remover comentário

**Padrão para todas:**
```typescript
// 1. Validar auth via auth()
// 2. Validar role se necessário
// 3. Validar rate limit se necessário
// 4. Fazer query ao BD
// 5. Retornar JSON com status correto
// 6. Error handling com mensagens úteis
```

**Não faz:**
- Não fazer queries sem tratamento de erro
- Não expor dados sensíveis (passwords, etc)
- Não confiar em dados do cliente

---

### **Tarefa 11: Criar Seed Script**

**Criar arquivo `prisma/seed.ts`:**

**Funcionalidades:**
- Criar 3 usuários teste:
  1. admin@cryptoacademy.com / admin123 (role: ADMIN)
  2. editor@cryptoacademy.com / editor123 (role: EDITOR)
  3. author@cryptoacademy.com / author123 (role: AUTHOR)
- Hash passwords com bcryptjs
- Atribuir roles via UserRole
- Retornar mensagem de sucesso

**Executar:**
```bash
npx prisma db seed
# Ou adicionar script: "seed": "node -r ts-node/register prisma/seed.ts"
npm run seed
```

**Não faz:**
- Não correr automaticamente em cada deploy (apenas manual)
- Não sobrescrever dados existentes

---

### **Tarefa 12: Criar Páginas de Admin**

**Criar `app/admin/layout.tsx`:**
- Wrapper com verificação de auth + role
- Sidebar com navegação (Users, Posts, Settings)
- Header com user info + logout button

**Criar `app/admin/page.tsx`:**
- Dashboard com estatísticas:
  - Total de posts, usuários, comentários
  - Posts recentes
  - Usuários ativos

**Criar `app/admin/users/page.tsx`:**
- Tabela de usuários (admin only)
- Colunas: email, name, roles, createdAt, actions
- Botões: editar, deletar, atribuir role

**Criar `app/admin/users/[id]/page.tsx`:**
- Form para editar usuário
- Campos: name, bio, profile_image
- Dropdown para roles

**Não faz:**
- Não criar componentes de UI custom (usar Tailwind)
- Não validar no frontend sem validar também no servidor

---

### **Tarefa 13: Atualizar Login Page**

**Refatorar `app/login/page.tsx`:**

**Funcionalidades:**
- Form com email + password
- Validação frontend com zod
- Submissão para /api/auth/login
- Mensagem de erro se rate limit ou credenciais erradas
- Link para página de registro (futuro)
- Redirecionar para /admin se already logged in

**Não faz:**
- Não fazer autenticação no client
- Não armazenar password em estado

---

### **Tarefa 14: Criar Documentação**

**Criar arquivo `SETUP_DATABASE.md`:**
- Pré-requisitos: PostgreSQL 14+
- Passos para setup local (Linux/Mac/Windows)
- Environment variables necessárias
- Como rodar migrações
- Como fazer seed
- Como conectar em BD remota

**Criar arquivo `AUTH_ARCHITECTURE.md`:**
- Diagrama de fluxo de autenticação
- Estrutura de BD (ER diagram)
- Explicação de roles e permissões
- Como adicionar novas permissões
- Troubleshooting comum

**Atualizar `README.md`:**
- Adicionar seção de Admin Setup
- Linkar para SETUP_DATABASE.md
- Incluir credenciais de teste (apenas local)

**Não faz:**
- Não incluir senhas em hardcode
- Não expor passos de produção em README

---

### **Tarefa 15: Criar Validações e Error Handling**

**Arquivo `lib/validations.ts`:**
- Schema Zod para Login
- Schema Zod para Register
- Schema Zod para UpdateProfile
- Reutilizar em API routes + forms

**Arquivo `lib/errors.ts`:**
- Classe customizada AppError
- Tipo de erro: AUTH_ERROR, PERMISSION_ERROR, RATE_LIMIT_ERROR, etc
- Mensagens de erro legíveis

**Implementar em toda app:**
- Try-catch com typing correto
- Retornar HTTP status correto
- Logging de erros (console.error com contexto)

**Não faz:**
- Não expor stack traces ao cliente
- Não retornar dados sensíveis em erros

---

## 📊 Plano de Verificação

### Verificações por Tarefa

**Tarefa 1:** 
- [ ] `npm list` mostra todas as dependências instaladas
- [ ] `npm run dev` não tem warnings sobre dependências

**Tarefa 2:**
- [ ] Arquivo `prisma/schema.prisma` existe
- [ ] Syntax TypeScript válido em schema
- [ ] 7 models definidos com relacionamentos corretos
- [ ] Arquivo `.env.example` com DATABASE_URL

**Tarefa 3:**
- [ ] Pasta `prisma/migrations/[timestamp]_init` existe
- [ ] File `migration.sql` contém CREATE TABLE para todos os models
- [ ] Índices presentes para email, slug, userId
- [ ] Foreign keys configuradas

**Tarefa 4:**
- [ ] `lib/prisma.ts` exporta singleton `prisma`
- [ ] `types/auth.ts` compila sem erros
- [ ] `types/roles.ts` tem enums ADMIN, EDITOR, AUTHOR
- [ ] Tipos são usados em `.d.ts` para extender NextAuth

**Tarefa 5:**
- [ ] `auth.ts` compila sem erros
- [ ] Função `authorize()` faz query em User + UserRole
- [ ] Callback JWT adiciona roles ao token
- [ ] Callback session adiciona roles à session
- [ ] `signIn()` e `signOut()` funcionam em `/login`

**Tarefa 6:**
- [ ] `lib/permissions.ts` compila sem erros
- [ ] Função `hasPermission()` retorna boolean correto
- [ ] Função `hasRole()` funciona para múltiplos roles
- [ ] PERMISSIONS map tem todas as 3 roles

**Tarefa 7:**
- [ ] `lib/rate-limit.ts` compila
- [ ] Função `checkRateLimit()` retorna { limited, remaining, resetAt }
- [ ] Rate limit é respeitado em /api/auth/login
- [ ] Teste: 6 logins em 15min retorna limited=true

**Tarefa 8:**
- [ ] `lib/csrf.ts` gera tokens únicos
- [ ] Tokens são validáveis
- [ ] POST/PUT/DELETE falham sem token válido

**Tarefa 9:**
- [ ] `middleware.ts` compila
- [ ] Acesso `/admin` sem auth redireciona para `/login`
- [ ] Acesso `/admin/users` sem role ADMIN retorna 403
- [ ] Rate limit middleware funciona

**Tarefa 10:**
- [ ] Todas as API routes compilam
- [ ] GET /api/users retorna lista de usuários (JSON)
- [ ] POST /api/users cria novo usuário
- [ ] Endpoints requerem auth + roles corretos
- [ ] Erro handling retorna status HTTP correto

**Tarefa 11:**
- [ ] `prisma/seed.ts` compila
- [ ] `npm run seed` cria 3 usuários
- [ ] Verificar `SELECT * FROM "User"` tem 3 users
- [ ] Verificar `SELECT * FROM "UserRole"` tem 3 roles

**Tarefa 12:**
- [ ] Páginas admin compilam sem erros
- [ ] `/admin` mostra dashboard se logged in
- [ ] `/admin/users` mostra tabela de usuários
- [ ] Botões de editar/deletar funcionam

**Tarefa 13:**
- [ ] `/login` renderiza form com email + password
- [ ] Submit faz POST para /api/auth/login
- [ ] Mensagem de erro aparece se credenciais erradas
- [ ] Redireciona para /admin se login sucesso

**Tarefa 14:**
- [ ] `SETUP_DATABASE.md` existe e é legível
- [ ] `AUTH_ARCHITECTURE.md` explica sistema
- [ ] `README.md` atualizado com admin setup

**Tarefa 15:**
- [ ] `lib/validations.ts` compila
- [ ] Zod schemas validam dados corretamente
- [ ] Erro handling não expõe stack traces

### Testes de Integração

**Fluxo de Login:**
```
1. Acessar /login
2. Inserir admin@cryptoacademy.com / admin123
3. Clicar submit
4. Verificar rate limit (5 tentativas em 15min)
5. Se sucesso: redireciona para /admin
6. Se erro: mensagem legível
7. Verificar JWT token no localStorage
```

**Fluxo de Autorização:**
```
1. Login com editor@cryptoacademy.com
2. Acessar /admin/users (requer ADMIN)
3. Deve retornar 403 Forbidden
4. Login com admin@cryptoacademy.com
5. Acessar /admin/users
6. Deve renderizar tabela
```

**Fluxo de CRUD:**
```
1. Admin cria novo usuário via /api/users (POST)
2. Verificar User criado no BD
3. Atualizar email via /api/users/[id] (PUT)
4. Deletar usuário via /api/users/[id] (DELETE)
5. Verificar deletado em BD
```

**Teste de Rate Limit:**
```
1. Login com credenciais erradas 6x em 10 min
2. 6ª tentativa deve retornar 429 Too Many Requests
3. Aguardar 15 min
4. 7ª tentativa deve funcionar
```

---

## 🎯 Resultado Esperado

### Comportamento Final

**Para Usuário Admin:**
- ✅ Acessar `/admin` com credenciais (admin@cryptoacademy.com / admin123)
- ✅ Ver dashboard com estatísticas
- ✅ Gerenciar usuários (criar, editar, deletar, atribuir roles)
- ✅ Gerenciar posts e comentários
- ✅ Visualizar analytics

**Para Usuário Editor:**
- ✅ Acessar `/admin` com suas credenciais
- ✅ Ver dashboard (limitado)
- ✅ Criar e publicar posts
- ✅ Moderar comentários
- ❌ Não pode gerenciar usuários

**Para Usuário Author:**
- ✅ Acessar `/admin` com suas credenciais
- ✅ Ver apenas seus posts
- ✅ Criar posts (não publicar)
- ❌ Não pode gerenciar outros posts
- ❌ Não pode moderar

**Segurança:**
- ✅ Sem hardcoded users em código
- ✅ Passwords hasheadas com bcryptjs
- ✅ Rate limiting ativo (máx 5 logins/15min)
- ✅ CSRF protection em forms
- ✅ JWT tokens com expiração (7 dias)
- ✅ Roles validadas em middleware

**Escalabilidade:**
- ✅ Suporta N usuários em BD PostgreSQL
- ✅ Fácil adicionar novos roles
- ✅ Fácil adicionar novas permissões
- ✅ API routes prontas para integração frontend

### Impacto no Usuário
- 🟢 Admin pode gerenciar múltiplos editores e autores
- 🟢 Editores podem colaborar sem risco de deletarem tudo
- 🟢 Sistema escalável para crescer
- 🟢 Segurança enterprise-grade

### Impacto no Sistema
- 🟢 Zero dependência de users hardcoded
- 🟢 BD relacional para dados complexos
- 🟢 API pronta para apps mobile/desktop
- 🟢 Auditável (logs de ações de usuários)

---

## 🚀 Deployment no EasyPanel (Pré-Implementação)

### Preparação no EasyPanel
Antes de fazer deploy, você precisará:

1. **Criar Database PostgreSQL:**
   - No painel EasyPanel, criar novo Database PostgreSQL
   - Copiar connection string (DATABASE_URL)
   - Guardar credenciais para usar no app

2. **Configurar Environment Variables:**
   No painel EasyPanel, adicionar:
   ```
   NODE_ENV=production
   DATABASE_URL=postgresql://...  (fornecido pelo EasyPanel)
   NEXTAUTH_SECRET=generated_secret_here
   CONTENTFUL_SPACE_ID=seu_space_id
   CONTENTFUL_ACCESS_TOKEN=seu_token
   NEXT_PUBLIC_SITE_URL=https://seu-dominio.com
   ```

3. **Fazer Build do Docker:**
   ```bash
   docker build -t crypto-academy:latest .
   ```

4. **Upload para EasyPanel:**
   - Fazer push do código para GitHub
   - Conectar GitHub ao EasyPanel (auto-deploy)
   - OU: Build Docker localmente, push para registry, usar em EasyPanel

### Fluxo de Deploy Automático
```
1. Push código para GitHub
   ↓
2. EasyPanel detecta mudança
   ↓
3. EasyPanel faz: docker build + docker run
   ↓
4. Dockerfile executa: scripts/entrypoint.sh
   ↓
5. entrypoint.sh executa: npx prisma migrate deploy
   ↓
6. Migrations rodam contra PostgreSQL do EasyPanel
   ↓
7. Next.js inicia com BD pronta
   ↓
8. App disponível em seu domínio
```

### Troubleshooting EasyPanel
Se migrations falharem:
- Verificar logs: `docker logs crypto-academy`
- Validar DATABASE_URL está correto
- Verificar PostgreSQL está acessível (EasyPanel)
- Verificar permissões de usuário PostgreSQL

---

## 🔍 Considerações Técnicas

### Stack de Implementação
```
Frontend:
  - React 18/19 (Next.js 16)
  - Tailwind CSS
  - NextAuth.js v5 (client)

Backend:
  - Next.js API Routes
  - NextAuth.js v5 (server)
  - Prisma ORM
  - PostgreSQL (EasyPanel managed)

Segurança:
  - bcryptjs para password hashing
  - JWT para sessões
  - Rate limiting em-memory (v1)
  - CSRF tokens

Validação:
  - Zod (schemas)
  - NextAuth built-in validation

Docker:
  - Multi-stage build (otimizado)
  - Prisma migrations no startup
  - Environment variables do EasyPanel
```

### Padrões de Código
- **TypeScript strict mode** - tipos sempre
- **Error handling** - try-catch com tipos
- **Middleware** - executar antes de routes
- **API safety** - validar entrada, sanitizar saída
- **Database transactions** - para operações críticas

### Próximas Evoluções (Não Fazer Agora)
- [ ] OAuth providers (Google, GitHub)
- [ ] Two-factor authentication
- [ ] Email verification
- [ ] Password reset flow
- [ ] Audit logging
- [ ] Redis para rate limiting (escalável)
- [ ] Session refresh tokens

---

## 📝 Notas Importantes - EasyPanel + PostgreSQL

### 1. **Variáveis de Ambiente**

**Em Produção (EasyPanel):**
- `DATABASE_URL` → fornecida pelo EasyPanel ao criar PostgreSQL
- `NEXTAUTH_SECRET` → gerar com: `openssl rand -base64 32`
- `CONTENTFUL_SPACE_ID` → obter do Contentful
- `CONTENTFUL_ACCESS_TOKEN` → obter do Contentful
- `NEXT_PUBLIC_SITE_URL` → seu domínio (ex: https://blog.com)
- `NODE_ENV=production`

**Em Desenvolvimento Local:**
- Criar `.env.local` (NUNCA commitar):
  ```
  DATABASE_URL="postgresql://user:password@localhost:5432/crypto_academy_dev"
  NEXTAUTH_SECRET=test-secret-local
  CONTENTFUL_SPACE_ID=seu_space_id
  CONTENTFUL_ACCESS_TOKEN=seu_token
  NEXT_PUBLIC_SITE_URL=http://localhost:3000
  ```

### 2. **Migrations com EasyPanel**

**Como funciona:**
1. Você faz `git push` do código
2. EasyPanel detecta mudança
3. EasyPanel executa `docker build`
4. Docker inicia container
5. Container executa `scripts/entrypoint.sh`
6. `entrypoint.sh` roda `npx prisma migrate deploy`
7. Se migrations falharem, container para (log de erro visível)
8. Se OK, Next.js inicia

**Workflow de Migrations:**
```bash
# Local development
npx prisma migrate dev --name add_new_field

# Isso cria: prisma/migrations/[timestamp]_add_new_field/migration.sql

# Fazer commit
git add .
git commit -m "feat: add new field to User table"

# Push para GitHub
git push

# EasyPanel faz deploy automaticamente
# Migration roda automaticamente no Docker startup
```

### 3. **Rollback de Migrations (se necessário)**

**Scenario: Migration falhou em produção**
```bash
# 1. Verificar logs no EasyPanel
# 2. Revisar migration.sql
# 3. Deletar o arquivo migration (se não foi deployado)
# 4. Fazer novo push
# 5. EasyPanel redeploy automaticamente

# OU: Se migration foi parcial
# Conectar ao PostgreSQL do EasyPanel e:
DELETE FROM "_prisma_migrations" WHERE migration_name = '..._latest_migration';
# Depois push código com fix
```

### 4. **Backup do PostgreSQL**

- **EasyPanel**: Gerencia backups automaticamente
- **Restaurar**: Contatar suporte EasyPanel ou usar painelDo painel
- **Dados sensíveis**: Passwords são hasheadas (bcryptjs), seguro

### 5. **Seed Database (Usuários Teste)**

**Para popular BD inicial:**
```bash
# Local apenas
npm run seed

# Ou manual
npx prisma db seed
```

**Em produção (EasyPanel):**
- Seed pode ser rodado via SSH do EasyPanel
- OU executar como job separado
- NÃO rodar seed automaticamente a cada deploy (comentar no entrypoint.sh)

### 6. **Certificados SSL/HTTPS**

- EasyPanel provê SSL automaticamente (Let's Encrypt)
- NextAuth requer HTTPS em produção
- `NEXT_PUBLIC_SITE_URL` deve ser HTTPS

### 7. **Secrets do NEXTAUTH**

```bash
# Gerar novo secret
openssl rand -base64 32

# Output exemplo:
# F9x8kL2mP3qR5sT6uV7wX8yZ9aB0cD1eF2gH3iJ4k=

# Adicionar no EasyPanel > Environment Variables > NEXTAUTH_SECRET
```

### 8. **Monitoramento & Logs**

- **Logs Docker**: `docker logs crypto-academy`
- **EasyPanel Logs**: Dashboard > App > Logs
- **Database Logs**: EasyPanel > Database > Activity
- **NextAuth Logs**: Adicionar console.log em callbacks se necessário

---

## 🎬 Próximos Passos Pós-Implementação (EasyPanel)

### 1. **Setup Local (Desenvolvimento)**
```bash
# 1. Instalar PostgreSQL localmente
# macOS: brew install postgresql
# Ubuntu: sudo apt install postgresql
# Windows: Download PostgreSQL installer

# 2. Criar BD local
createdb crypto_academy_dev

# 3. Configurar .env.local
cp .env.example .env.local
# Editar com DATABASE_URL local e NEXTAUTH_SECRET

# 4. Rodar migrations locais
npx prisma migrate dev

# 5. Fazer seed
npx prisma db seed

# 6. Testar
npm run dev
# Acessar http://localhost:3000/login
# Credenciais: admin@cryptoacademy.com / admin123
```

### 2. **Preparar EasyPanel**
```bash
# 1. No painel EasyPanel:
#    - Criar novo App (Docker)
#    - Criar novo Database PostgreSQL
#    - Copiar DATABASE_URL fornecido

# 2. Configurar Environment Variables no EasyPanel:
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=generated_secret_here
CONTENTFUL_SPACE_ID=seu_space_id
CONTENTFUL_ACCESS_TOKEN=seu_token
NEXT_PUBLIC_SITE_URL=https://seu-dominio.com
NODE_ENV=production

# 3. Conectar GitHub (auto-deploy) ou fazer push manual
```

### 3. **Deploy Initial**
```bash
# 1. Push código para GitHub (com Dockerfile + scripts/entrypoint.sh)
git add .
git commit -m "feat: implement auth system with NextAuth + PostgreSQL"
git push origin main

# 2. EasyPanel detecta e faz deploy automaticamente
# 3. Verificar logs: Dashboard > App > Logs
# 4. Esperuar migrations rodem automaticamente
# 5. App estará disponível em seu domínio
```

### 4. **Verificar Deploy**
```bash
# 1. Acessar seu domínio/login
# 2. Tentar login com credentials de teste
# 3. Se falhar, verificar:
#    - Logs Docker no EasyPanel
#    - DATABASE_URL configurado
#    - Migrations rodaram (ver logs)
#    - NEXTAUTH_SECRET configurado
```

### 5. **Seed em Produção (Opcional)**
Se quiser popular BD com usuários teste em produção:
```bash
# Via SSH do EasyPanel ou terminal local:
npx prisma db seed

# Isso criará:
# - admin@cryptoacademy.com / admin123
# - editor@cryptoacademy.com / editor123
# - author@cryptoacademy.com / author123
```

### 6. **Testar Funcionalidades**
- ✅ Login com diferentes roles
- ✅ Acesso a /admin (deve estar protegido)
- ✅ Rate limiting (6 logins em 15min)
- ✅ CSRF protection (testar POST sem token)
- ✅ Permissões por role (editor não acessa /admin/users)

### 7. **Monitoramento Contínuo**
- Verificar logs regularmente: EasyPanel > App > Logs
- Monitorar database size: EasyPanel > Database > Size
- Backups automáticos: Verificar EasyPanel backup settings
- Performance: Adicionar observability conforme necessário

---

**FIM DO PROMPT DE IMPLANTAÇÃO**

Este prompt cobre implantação completa de autenticação enterprise-grade com Antigravity. Todas as tarefas estão numeradas, descritas detalhadamente, e com verificações claras.
