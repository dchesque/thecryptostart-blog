# Arquitetura de Autenticação

Este documento descreve como o sistema de autenticação e autorização funciona.

## 🧱 Componentes Principais

- **NextAuth.js v5:** Core da autenticação, gerenciando sessões e tokens.
- **Prisma ORM:** Adaptador para o banco de dados PostgreSQL.
- **RBAC (Role-Based Access Control):** Sistema de permissões baseado em funções (ADMIN, EDITOR, AUTHOR).
- **JWT (JSON Web Tokens):** Sessões persistidas em tokens assinados e criptografados.

## 🔄 Fluxo de Login

1. Usuário envia credenciais para `/api/auth/login`.
2. Middleware NextAuth intercepta e chama o provider `Credentials`.
3. `auth.ts` busca o usuário no PostgreSQL via Prisma.
4. Senha é comparada usando `bcryptjs`.
5. Se válido, os papéis (roles) do usuário são injetados no JWT e na Sessão.
6. Usuário é redirecionado para a origem ou `/admin`.

## 🛡️ Segurança

### Proteção de Rotas
- **Middleware:** Intercepta todas as requisições para `/admin/*`.
- **RBAC:** Valida se o usuário tem a role necessária para acessos específicos (ex: `/admin/users` requer `ADMIN`).

### Rate Limiting
- Implementado em `lib/rate-limit.ts`.
- Protege contra ataques de força bruta limitando tentativas de login por IP.

### CSRF Protection
- **Integrado:** NextAuth protege automaticamente suas rotas internas.
- **Customizado:** Utilitários em `lib/csrf.ts` para proteção de APIs de escrita customizadas.

## 🔑 Roles e Permissões

| Role | Descrição | Permissões Principais |
| :--- | :--- | :--- |
| **ADMIN** | Acesso total ao sistema | Gerenciar usuários, roles, moderar tudo. |
| **EDITOR** | Gestor de conteúdo | Gerenciar todos os posts e comentários. |
| **AUTHOR** | Criador de conteúdo | Gerar e editar seus próprios posts. |
