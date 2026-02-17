# 🔍 Prompt de Verificação Detalhada - NextAuth.js v5 + PostgreSQL EasyPanel

## 📌 Objetivo

Verificar **completamente e em detalhes** se toda a implementação de autenticação com NextAuth.js v5 + PostgreSQL foi feita corretamente antes de fazer deploy no EasyPanel.

Este prompt deve ser usado **APÓS** a implementação estar completa.

---

## ✅ VERIFICAÇÃO 1: Dependências Instaladas

### 1.1 Verificar package.json
```bash
npm list | grep -E "next-auth|@prisma|bcryptjs|zod|next-rate-limit"
```

**Esperado:**
- ✅ `next-auth` >= 5.0.0 (pode ser beta)
- ✅ `@prisma/client` >= 5.0.0
- ✅ `prisma` >= 5.0.0 (devDependencies)
- ✅ `bcryptjs` >= 2.4.0
- ✅ `zod` >= 3.0.0
- ✅ `next-rate-limit` >= 0.1.0
- ✅ `@types/bcryptjs` (devDependencies)

**Se falhar:**
```bash
npm install next-auth@latest @prisma/client prisma bcryptjs zod next-rate-limit
npm install -D @types/bcryptjs
```

### 1.2 Verificar se Prisma foi inicializado
```bash
ls -la prisma/
```

**Esperado:**
- ✅ Arquivo `schema.prisma` existe
- ✅ Pasta `migrations/` existe (mesmo que vazia)

**Se falhar:**
```bash
npx prisma init
```

---

## ✅ VERIFICAÇÃO 2: Prisma Schema

### 2.1 Verificar arquivo schema.prisma
```bash
cat prisma/schema.prisma | head -20
```

**Esperado:**
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}
```

❌ **NÃO deve ter:**
- `provider = "sqlite"`
- `provider = "mysql"`
- localhost na URL

### 2.2 Verificar Models (7 tabelas)
```bash
grep "^model " prisma/schema.prisma
```

**Esperado (exatamente 7 models):**
```
model User
model UserRole
model Post
model Comment
model Follower
model UserPermission
model PasswordReset
```

**Se faltar algum:**
```bash
# Verificar arquivo completo
cat prisma/schema.prisma | grep -A 10 "^model"
```

### 2.3 Verificar tipos de ID e relacionamentos
```bash
grep -E "id|@id|@unique|@relation" prisma/schema.prisma
```

**Esperado:**
- ✅ IDs são UUID (gerados por PostgreSQL)
- ✅ Email em User é UNIQUE
- ✅ Slug em Post é UNIQUE
- ✅ Relacionamentos corretos (User -> UserRole, Post -> Comment, etc)

### 2.4 Validar Syntax do Schema
```bash
npx prisma validate
```

**Esperado:**
```
✓ Your schema is valid
```

---

## ✅ VERIFICAÇÃO 3: Migrações Prisma

### 3.1 Verificar pasta de migrações
```bash
ls -la prisma/migrations/
```

**Esperado:**
- ✅ Pelo menos 1 pasta: `prisma/migrations/[timestamp]_init/`
- ✅ Dentro dela: `migration.sql`

### 3.2 Verificar conteúdo da migration inicial
```bash
cat prisma/migrations/*/migration.sql | head -30
```

**Esperado:**
```sql
CREATE TABLE "User" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "email" TEXT NOT NULL UNIQUE,
  ...
);

CREATE TABLE "UserRole" (
  ...
);

CREATE TABLE "Post" (
  ...
);

-- Mais 4 tabelas
```

❌ **NÃO deve ter:**
- Criação de tabelas SQLite
- Sem estrutura clara

### 3.3 Validar syntax SQL
```bash
# Verificar se arquivo é válido (abrir e inspecionar manualmente)
cat prisma/migrations/*/migration.sql
```

---

## ✅ VERIFICAÇÃO 4: Arquivo auth.ts

### 4.1 Verificar localização
```bash
ls -la auth.ts
```

**Esperado:**
- ✅ Arquivo `auth.ts` existe na raiz do projeto

### 4.2 Verificar imports corretos
```bash
head -20 auth.ts
```

**Esperado:**
```typescript
import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { compare } from 'bcryptjs'
import { prisma } from '@/lib/prisma'
```

### 4.3 Verificar configuração NextAuth
```bash
grep -A 5 "NextAuth({" auth.ts
```

**Esperado:**
```typescript
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      ...
    })
  ],
  // callbacks, pages, session config
})
```

### 4.4 Verificar callbacks JWT e Session
```bash
grep -A 10 "async jwt" auth.ts
grep -A 10 "async session" auth.ts
```

**Esperado:**
```typescript
// JWT callback - adiciona roles ao token
async jwt({ token, user }) {
  if (user) {
    token.id = user.id
    token.roles = user.roles || []  // ← IMPORTANTE
  }
  return token
}

// Session callback - adiciona roles à session
async session({ session, token }) {
  if (session.user) {
    session.user.id = token.id
    session.user.roles = token.roles  // ← IMPORTANTE
  }
  return session
}
```

### 4.5 Verificar authorize() com queries PostgreSQL
```bash
grep -A 30 "async authorize" auth.ts
```

**Esperado:**
```typescript
async authorize(credentials) {
  // Query User + UserRole do PostgreSQL
  const user = await prisma.user.findUnique({
    where: { email: credentials.email },
    include: { roles: true }  // ← IMPORTANTE: trazer roles
  })
  
  if (!user) return null
  
  // Validar senha com bcryptjs
  const isValid = await compare(credentials.password, user.password_hash)
  if (!isValid) return null
  
  // Retornar user com roles
  return {
    id: user.id,
    email: user.email,
    roles: user.roles.map(r => r.role)
  }
}
```

---

## ✅ VERIFICAÇÃO 5: Cliente Prisma

### 5.1 Verificar arquivo lib/prisma.ts
```bash
ls -la lib/prisma.ts
```

**Esperado:**
- ✅ Arquivo `lib/prisma.ts` existe

### 5.2 Verificar conteúdo
```bash
cat lib/prisma.ts
```

**Esperado:**
```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

✅ **Deve ser singleton pattern** (evitar múltiplas instâncias)

---

## ✅ VERIFICAÇÃO 6: Sistema de Permissões (RBAC)

### 6.1 Verificar arquivo lib/permissions.ts
```bash
ls -la lib/permissions.ts
```

**Esperado:**
- ✅ Arquivo existe

### 6.2 Verificar roles definidos
```bash
grep -E "ADMIN|EDITOR|AUTHOR" lib/permissions.ts
```

**Esperado:**
```typescript
export const ROLES = {
  ADMIN: 'admin',
  EDITOR: 'editor',
  AUTHOR: 'author'
} as const
```

### 6.3 Verificar permissões por role
```bash
grep -A 20 "PERMISSIONS =" lib/permissions.ts
```

**Esperado:**
- ADMIN: manage_users, manage_roles, delete_post, etc
- EDITOR: create_post, publish_post, edit_all_posts, etc
- AUTHOR: create_post, edit_own_post, delete_own_post

### 6.4 Verificar funções helpers
```bash
grep "^export function" lib/permissions.ts
```

**Esperado:**
```typescript
export function hasPermission(userRoles, requiredPermission)
export function hasRole(userRoles, role)
```

---

## ✅ VERIFICAÇÃO 7: Rate Limiting

### 7.1 Verificar arquivo lib/rate-limit.ts
```bash
ls -la lib/rate-limit.ts
```

**Esperado:**
- ✅ Arquivo existe

### 7.2 Verificar função checkRateLimit
```bash
grep "export" lib/rate-limit.ts
```

**Esperado:**
```typescript
export function checkRateLimit(key: string, action: string, options: RateLimitOptions)
```

### 7.3 Verificar se retorna objeto correto
```bash
grep -A 5 "return {" lib/rate-limit.ts
```

**Esperado:**
```typescript
return {
  limited: boolean,
  remaining: number,
  resetAt: Date
}
```

---

## ✅ VERIFICAÇÃO 8: CSRF Protection

### 8.1 Verificar arquivo lib/csrf.ts
```bash
ls -la lib/csrf.ts
```

**Esperado:**
- ✅ Arquivo existe

### 8.2 Verificar funções CSRF
```bash
grep "^export" lib/csrf.ts
```

**Esperado:**
```typescript
export function generateCsrfToken()
export function validateCsrfToken()
```

---

## ✅ VERIFICAÇÃO 9: Middleware

### 9.1 Verificar arquivo middleware.ts
```bash
ls -la middleware.ts
```

**Esperado:**
- ✅ Arquivo existe na raiz

### 9.2 Verificar proteção de rotas admin
```bash
grep -A 10 "/admin" middleware.ts
```

**Esperado:**
```typescript
if (request.nextUrl.pathname.startsWith('/admin')) {
  if (!session) return redirect('/login')
}
```

### 9.3 Verificar validação de roles
```bash
grep -A 10 "hasRole\|requireRole" middleware.ts
```

**Esperado:**
```typescript
const hasAccess = hasRole(session.user.roles, 'admin')
if (!hasAccess) return new Response('Forbidden', { status: 403 })
```

### 9.4 Verificar rate limit no middleware
```bash
grep "checkRateLimit\|rateLimit" middleware.ts
```

**Esperado:**
- ✅ Verificação de rate limit implementada

---

## ✅ VERIFICAÇÃO 10: API Routes

### 10.1 Verificar rotas de auth
```bash
ls -la app/api/auth/
```

**Esperado:**
```
app/api/auth/
├── [...nextauth]/
│   └── route.ts
├── login/
│   └── route.ts (NOVO)
└── register/
    └── route.ts (NOVO)
```

### 10.2 Verificar route.ts do NextAuth
```bash
cat app/api/auth/\[...nextauth\]/route.ts
```

**Esperado:**
```typescript
import { handlers } from '@/auth'
export const { GET, POST } = handlers
```

### 10.3 Verificar /login route
```bash
cat app/api/auth/login/route.ts
```

**Esperado:**
```typescript
export async function POST(req: Request) {
  // Rate limit check
  // Validar credentials
  // Retornar token ou erro
}
```

### 10.4 Verificar rotas de usuários
```bash
ls -la app/api/users/
```

**Esperado:**
```
app/api/users/
├── route.ts (CRUD de usuários)
└── [id]/
    └── route.ts (GET/PUT/DELETE específico)
```

### 10.5 Verificar rotas de roles
```bash
ls -la app/api/roles/
```

**Esperado:**
```
app/api/roles/
└── route.ts (POST/GET/DELETE roles)
```

### 10.6 Verificar rotas de comentários
```bash
ls -la app/api/comments/
```

**Esperado:**
```
app/api/comments/
└── route.ts (CRUD comentários)
```

---

## ✅ VERIFICAÇÃO 11: Páginas Admin

### 11.1 Verificar layout do admin
```bash
ls -la app/admin/
```

**Esperado:**
```
app/admin/
├── layout.tsx (NOVO)
├── page.tsx (Dashboard)
├── users/
│   ├── page.tsx (Lista)
│   └── [id]/
│       └── page.tsx (Editar)
└── posts/
    └── page.tsx (Gerenciar posts)
```

### 11.2 Verificar se layout.tsx protege rotas
```bash
grep -A 10 "auth()" app/admin/layout.tsx
```

**Esperado:**
```typescript
import { auth } from '@/auth'

export default async function AdminLayout() {
  const session = await auth()
  
  if (!session) {
    redirect('/login')
  }
  
  // Renderizar layout admin
}
```

### 11.3 Verificar dashboard page
```bash
grep "require\|useSession" app/admin/page.tsx
```

**Esperado:**
- ✅ Verificação de autenticação
- ✅ Exibição de estatísticas

---

## ✅ VERIFICAÇÃO 12: Login Page

### 12.1 Verificar arquivo
```bash
ls -la app/login/page.tsx
```

**Esperado:**
- ✅ Arquivo existe

### 12.2 Verificar form de login
```bash
grep -E "form|input|email|password" app/login/page.tsx
```

**Esperado:**
```typescript
<form onSubmit={handleSubmit}>
  <input type="email" name="email" required />
  <input type="password" name="password" required />
  <button type="submit">Login</button>
</form>
```

### 12.3 Verificar validação e envio
```bash
grep "fetch\|signIn" app/login/page.tsx
```

**Esperado:**
```typescript
// Submeter para /api/auth/login ou usar signIn()
const response = await fetch('/api/auth/login', {
  method: 'POST',
  body: JSON.stringify({ email, password })
})
```

---

## ✅ VERIFICAÇÃO 13: Docker

### 13.1 Verificar Dockerfile
```bash
cat Dockerfile | head -50
```

**Esperado:**
```dockerfile
# Build stage
FROM node:20-alpine AS builder
...
RUN npx prisma generate  # ← IMPORTANTE

# Production stage
FROM node:20-alpine AS runner
...
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/scripts ./scripts
ENTRYPOINT ["/app/scripts/entrypoint.sh"]  # ← IMPORTANTE
```

### 13.2 Verificar script entrypoint.sh
```bash
cat scripts/entrypoint.sh
```

**Esperado:**
```bash
#!/bin/bash
set -e

echo "🔄 Running Prisma migrations..."
npx prisma migrate deploy

echo "🚀 Starting Next.js server..."
exec node server.js
```

### 13.3 Verificar permissões do script
```bash
ls -la scripts/entrypoint.sh
```

**Esperado:**
```
-rwxr-xr-x  (755 ou similar com execute)
```

Se não tiver:
```bash
chmod +x scripts/entrypoint.sh
```

### 13.4 Verificar docker-compose.yml
```bash
cat docker-compose.yml
```

**Esperado:**
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
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      # ... outras env vars
    restart: unless-stopped
```

❌ **NÃO deve ter:**
- Serviço `postgres:` (é do EasyPanel)
- Hardcoded DATABASE_URL

---

## ✅ VERIFICAÇÃO 14: Environment Variables

### 14.1 Verificar .env.example
```bash
cat .env.example
```

**Esperado:**
```
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=generated_secret
CONTENTFUL_SPACE_ID=your_space_id
CONTENTFUL_ACCESS_TOKEN=your_token
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NODE_ENV=development
```

❌ **NÃO deve ter:**
- DATABASE_URL hardcoded
- NEXTAUTH_SECRET hardcoded
- Senhas reais

### 14.2 Verificar .env.local (local apenas)
```bash
ls -la .env.local 2>/dev/null || echo "Arquivo não existe (normal)"
```

⚠️ **Importante:**
- ✅ `.env.local` NUNCA deve estar no Git
- ✅ Deve estar em `.gitignore`

### 14.3 Verificar .gitignore
```bash
grep "env.local" .gitignore
```

**Esperado:**
```
.env.local
.env.*.local
```

---

## ✅ VERIFICAÇÃO 15: Types TypeScript

### 15.1 Verificar tipos de auth
```bash
ls -la types/auth.ts
```

**Esperado:**
- ✅ Arquivo existe

### 15.2 Verificar conteúdo
```bash
grep "^export" types/auth.ts
```

**Esperado:**
```typescript
export interface User
export interface Session
export type UserRole
export type Permission
```

### 15.3 Verificar tipos de roles
```bash
ls -la types/roles.ts
```

**Esperado:**
- ✅ Arquivo existe
- ✅ Define Role enum/type
- ✅ Define Permission type

---

## ✅ VERIFICAÇÃO 16: Seed Script

### 16.1 Verificar arquivo seed
```bash
ls -la prisma/seed.ts
```

**Esperado:**
- ✅ Arquivo `prisma/seed.ts` existe

### 16.2 Verificar conteúdo
```bash
grep -E "admin@|editor@|author@" prisma/seed.ts
```

**Esperado:**
```typescript
// Criar 3 usuários teste
await prisma.user.create({
  data: {
    email: 'admin@cryptoacademy.com',
    password_hash: hashedPassword,
    name: 'Admin',
    roles: {
      create: { role: 'admin' }
    }
  }
})
// ... editor e author
```

### 16.3 Verificar comando seed em package.json
```bash
grep "seed" package.json
```

**Esperado:**
```json
"seed": "node --require ts-node/register prisma/seed.ts"
```

---

## ✅ VERIFICAÇÃO 17: Testes Locais - Compilação

### 17.1 Verificar build TypeScript
```bash
npm run build
```

**Esperado:**
```
✓ Compiled successfully
✓ Next.js built successfully
```

❌ **Se falhar:**
```bash
npm run build 2>&1 | tail -50
# Procurar por erros de Type ou Syntax
```

### 17.2 Verificar lint
```bash
npm run lint 2>&1 | head -20
```

**Esperado:**
```
✓ No linting issues
```

---

## ✅ VERIFICAÇÃO 18: Testes Locais - Database

### 18.1 Preparar banco local
```bash
# Garantir PostgreSQL está rodando
psql --version

# Criar banco de desenvolvimento
createdb crypto_academy_dev
```

### 18.2 Configurar .env.local
```bash
cat > .env.local << 'EOF'
DATABASE_URL="postgresql://user:password@localhost:5432/crypto_academy_dev"
NEXTAUTH_SECRET=$(openssl rand -base64 32)
CONTENTFUL_SPACE_ID=seu_space_id
CONTENTFUL_ACCESS_TOKEN=seu_token
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NODE_ENV=development
EOF
```

### 18.3 Rodar migrações locais
```bash
npx prisma migrate dev
```

**Esperado:**
```
✓ Migrations applied successfully
✓ Tables created
```

### 18.4 Fazer seed
```bash
npm run seed
```

**Esperado:**
```
✓ Seeded database successfully
✓ 3 users created
```

### 18.5 Verificar dados no BD
```bash
psql crypto_academy_dev -c "SELECT email, name FROM \"User\";"
```

**Esperado:**
```
 email                      | name
----------------------------+--------
 admin@cryptoacademy.com    | Admin
 editor@cryptoacademy.com   | Editor
 author@cryptoacademy.com   | Author
```

---

## ✅ VERIFICAÇÃO 19: Testes Locais - Runtime

### 19.1 Iniciar servidor dev
```bash
npm run dev
```

**Esperado:**
```
▲ Next.js 16.x.x
- Local:        http://localhost:3000
- Environments: .env.local

✓ Ready in 2.5s
```

### 19.2 Testar página inicial
```bash
curl http://localhost:3000
```

**Esperado:**
- Status: 200
- HTML contém conteúdo da página

### 19.3 Testar login page
```bash
curl http://localhost:3000/login
```

**Esperado:**
- Status: 200
- HTML contém form de login

### 19.4 Testar admin (sem auth)
```bash
curl http://localhost:3000/admin
```

**Esperado:**
- Status: 307 (redirect)
- Location: /login (ou similar)

### 19.5 Testar login POST
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@cryptoacademy.com",
    "password": "admin123"
  }'
```

**Esperado:**
```json
{
  "success": true,
  "token": "eyJ...",
  "user": {
    "id": "...",
    "email": "admin@cryptoacademy.com",
    "roles": ["admin"]
  }
}
```

### 19.6 Testar login inválido
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@test.com", "password": "wrong"}'
```

**Esperado:**
```json
{
  "error": "Invalid credentials"
}
```

### 19.7 Testar rate limit (6 tentativas)
```bash
for i in {1..6}; do
  curl -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email": "admin@test.com", "password": "wrong"}'
  echo "Tentativa $i"
done
```

**Esperado:**
- Primeiras 5: 401 Unauthorized
- 6ª: 429 Too Many Requests

### 19.8 Testar GET /api/users (admin only)
```bash
# Sem auth - deve falhar
curl http://localhost:3000/api/users
# Status: 401

# Com token válido de admin - deve retornar lista
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/users
# Status: 200, JSON com usuários
```

---

## ✅ VERIFICAÇÃO 20: Testes de Segurança

### 20.1 Testar CSRF
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"email": "test@test.com"}' \
  # SEM csrf token
```

**Esperado:**
- Status: 403 Forbidden (ou 400)
- Mensagem: "Invalid CSRF token"

### 20.2 Testar permissões (author vs admin)
```bash
# Login como author
TOKEN_AUTHOR=$(curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "author@cryptoacademy.com", "password": "author123"}' \
  | jq -r '.token')

# Tentar acessar /admin/users (requer admin)
curl -H "Authorization: Bearer $TOKEN_AUTHOR" \
  http://localhost:3000/api/users
```

**Esperado:**
- Status: 403 Forbidden
- Mensagem: "Insufficient permissions"

### 20.3 Testar HTTPS em produção (EasyPanel)
Será verificado após deploy, mas deve:
- ✅ Usar HTTPS (certificado automático EasyPanel)
- ✅ Redirecionar HTTP → HTTPS
- ✅ Cookies com Secure + SameSite flags

---

## ✅ VERIFICAÇÃO 21: Documentação

### 21.1 Verificar README atualizado
```bash
grep -E "Admin|NextAuth|PostgreSQL" README.md
```

**Esperado:**
- ✅ Explicação de admin dashboard
- ✅ Credenciais de teste (apenas local)
- ✅ Link para docs de setup

### 21.2 Verificar SETUP_DATABASE.md
```bash
ls -la SETUP_DATABASE.md
```

**Esperado:**
- ✅ Arquivo existe
- ✅ Instrui como rodar migrations
- ✅ Como fazer seed

### 21.3 Verificar AUTH_ARCHITECTURE.md
```bash
ls -la AUTH_ARCHITECTURE.md
```

**Esperado:**
- ✅ Arquivo existe
- ✅ Explica sistema de roles
- ✅ Diagrama de permissões

---

## ✅ VERIFICAÇÃO 22: Git e Commits

### 22.1 Verificar histórico de commits
```bash
git log --oneline | head -10
```

**Esperado:**
- ✅ Commits descritivos (feat: implement auth, etc)
- ✅ Sem commits "work in progress"

### 22.2 Verificar se arquivos sensíveis estão ignorados
```bash
git status
```

**Esperado:**
- ✅ Nenhum `.env.local` listado
- ✅ Nenhuma `.env.production` listada
- ✅ Nenhuma `node_modules/` listada

### 22.3 Verificar se Prisma client está compilado
```bash
ls -la node_modules/.prisma/client/
```

**Esperado:**
- ✅ Pasta existe
- ✅ Arquivos .js e .d.ts presentes

---

## ✅ VERIFICAÇÃO 23: Pronto para EasyPanel

### 23.1 Checklist final antes de push
- [ ] `npm run build` passa sem erros
- [ ] `npm run lint` passa (ou warnings apenas)
- [ ] Banco local funciona (migrações rodaram)
- [ ] `npm run seed` rodou e criou 3 usuários
- [ ] `npm run dev` inicia sem erros
- [ ] Login funciona com admin@cryptoacademy.com / admin123
- [ ] /admin está protegido (redireciona para /login)
- [ ] Rate limit funciona (6ª tentativa = 429)
- [ ] CSRF token validado
- [ ] Permissões funcionam (author não acessa /admin/users)
- [ ] Dockerfile compila sem erros: `docker build -t test .`
- [ ] scripts/entrypoint.sh tem permissão 755
- [ ] .env.local está em .gitignore
- [ ] Nenhum arquivo sensível no Git
- [ ] Documentação completa (README, SETUP_DATABASE.md, AUTH_ARCHITECTURE.md)

### 23.2 Fazer commit final
```bash
git add .
git commit -m "feat: complete NextAuth.js v5 + PostgreSQL implementation

- Implement authentication with NextAuth.js v5
- Add PostgreSQL schema with Prisma ORM
- Create admin dashboard with role-based access control
- Implement rate limiting and CSRF protection
- Add seed script for test users
- Configure Docker for automatic migrations
- Add comprehensive documentation"

git push origin main
```

### 23.3 Preparar para EasyPanel
Antes de fazer deploy em EasyPanel:
- [ ] Criou Database PostgreSQL no EasyPanel
- [ ] Copiou DATABASE_URL fornecido pelo EasyPanel
- [ ] Gerou NEXTAUTH_SECRET: `openssl rand -base64 32`
- [ ] Configurou Environment Variables no EasyPanel:
  - DATABASE_URL
  - NEXTAUTH_SECRET
  - CONTENTFUL_SPACE_ID
  - CONTENTFUL_ACCESS_TOKEN
  - NEXT_PUBLIC_SITE_URL
  - NODE_ENV=production
- [ ] Conectou GitHub ao EasyPanel (auto-deploy)
- [ ] Verificou que Dockerfile compila: `docker build -t app .`

---

## 🎯 Se Algo Falhar

### Erros Comuns:

**Erro: "DATABASE_URL not set"**
```bash
# Verificar .env.local existe
cat .env.local

# Se não existir, criar
cp .env.example .env.local
# Editar com valores corretos
```

**Erro: "Prisma migrations not applied"**
```bash
# Rodar migrations
npx prisma migrate dev

# Se problema persistir, resetar (CUIDADO - deleta dados!)
npx prisma migrate reset
```

**Erro: "Port 3000 already in use"**
```bash
# Matar processo usando port 3000
lsof -ti:3000 | xargs kill -9

# Ou usar outra port
PORT=3001 npm run dev
```

**Erro: "Cannot find module @prisma/client"**
```bash
# Regenerar cliente Prisma
npx prisma generate

# Ou reinstalar dependências
rm -rf node_modules package-lock.json
npm install
```

**Erro: "NextAuth callback error"**
```bash
# Verificar auth.ts tem import correto do Prisma
grep "import.*prisma" auth.ts

# Verificar query do User
grep -A 15 "async authorize" auth.ts
```

---

## ✅ Próximo Passo: Deploy

**Quando TODAS as verificações acima passarem:**

1. ✅ Fazer push para GitHub
2. ✅ Verificar que Dockerfile está correto
3. ✅ No EasyPanel, conectar repositório
4. ✅ EasyPanel faz deploy automaticamente
5. ✅ Migrations rodam automaticamente (entrypoint.sh)
6. ✅ App disponível no domínio

**Verificações no EasyPanel após deploy:**
```bash
# Ver logs
docker logs crypto-academy

# Verificar migrations rodaram
docker logs crypto-academy | grep "Prisma migrations"

# Testar em produção
curl https://seu-dominio.com/login

# Testar login
curl -X POST https://seu-dominio.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@cryptoacademy.com", "password": "admin123"}'
```

---

## 📊 Resultado Final

Se todas as 23 verificações passarem:

✅ Autenticação implementada corretamente  
✅ PostgreSQL integrado com Prisma  
✅ Sistema de roles e permissões funcionando  
✅ Rate limiting e CSRF protection ativas  
✅ Docker configurado para migrations automáticas  
✅ Código testado localmente  
✅ Documentação completa  
✅ **Pronto para produção no EasyPanel!** 🚀
