# Configuração do Banco de Dados (PostgreSQL)

Este projeto utiliza **Prisma ORM** com **PostgreSQL**. Em produção, o banco de dados é gerenciado automaticamente pelo **EasyPanel**.

## 🚀 Setup Local

### 1. Pré-requisitos
- Node.js 20+
- PostgreSQL rodando localmente (ou via Docker)

### 2. Variáveis de Ambiente
Crie ou atualize o seu arquivo `.env.local`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/crypto_blog?schema=public"
```

### 3. Sincronizar Banco de Dados
Para rodar as migrações e gerar o cliente Prisma:

```bash
npx prisma migrate dev --name init
```

### 4. Popular com Dados Iniciais (Seed)
Para criar os usuários administradores padrão:

```bash
npm run prisma db seed
# Ou diretamente:
npx prisma db seed
```

**Usuários Criados:**
- **Admin:** admin@cryptoacademy.com / admin123
- **Editor:** editor@cryptoacademy.com / editor123
- **Author:** author@cryptoacademy.com / author123

## ☁️ Produção (EasyPanel)

No **EasyPanel**, você não precisa rodar comandos manuais. O sistema está configurado para:
1. Receber a `DATABASE_URL` via variáveis de ambiente.
2. Rodar `prisma migrate deploy` automaticamente no startup do container via `entrypoint.sh`.
3. Gerar o cliente Prisma durante o build via `Dockerfile`.

### Variáveis Obrigatórias no EasyPanel:
- `DATABASE_URL`: URL de conexão do PostgreSQL.
- `AUTH_SECRET`: Segredo para o NextAuth (gerado com `openssl rand -base64 32`).
