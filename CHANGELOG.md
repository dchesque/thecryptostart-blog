# Changelog

## [0.1.10] - 2026-02-17

### Fixed
- **Deploy**: Restaurado o acesso ao serviço corrigindo a execução de migrações do Prisma no Docker.
- **Docker**: Adicionadas dependências seletivas do Prisma (`@prisma` e `prisma`) no estágio runner para permitir migrações sem a `node_modules` completa.
- **Runtime**: Melhorada a resiliência do `entrypoint.sh` com logs e verificações de binários.


## [0.1.9] - 2026-02-17

### Fixed
- **Docker**: Otimizado o processo de build para reduzir consumo de disco (resolvido erro "No space left on device").
- **Docker**: Adicionado `.dockerignore` para reduzir o contexto de build.
- **Docker**: Removida cópia redundante de `node_modules` na imagem final (aproveitando o modo `standalone`).


## [0.1.8] - 2026-02-17

### Fixed
- **Admin**: Corrigido o botão "Create Post" no dashboard para redirecionar para o painel do Contentful.

### Changed
- **Version**: Incrementada versão para `v0.1.8`.


## [0.1.7] - 2026-02-17

### Fixed
- **Build**: Corrigida falha no deploy causada pela tipagem de `params` e `searchParams` no Next.js 15+ (agora são Promises).
- **API**: Atualizadas as rotas em `/api/users/[id]` para lidar com parâmetros assíncronos.
- **Blog**: Atualizadas as páginas `PostPage` e `BlogPage` para conformidade com Next.js 15+.

### Changed
- **Version**: Incrementada versão para `v0.1.7`.

## [0.1.6] - 2026-02-17

### Added
- **Admin CRUD**: Implementado gerenciamento completo de usuários via modal (Criação, Edição, Exclusão).
- **Admin API**: Adicionadas rotas `POST`, `PATCH` e `DELETE` em `/api/users`.
- **Dashboard**: Links reais para "Quick Actions" e estatísticas em tempo real (Users, Posts, Comments).

### Changed
- **Version**: Incrementada versão para `v0.1.6`.

## [0.1.5] - 2026-02-17

### Fixed
- **Auth**: Resolvido erro `UntrustedHost` adicionando `trustHost: true` na configuração do NextAuth para ambientes Docker/EasyPanel.
- **Admin**: Adicionada verificação rigorosa de sessão no `AdminLayout` para evitar Erro 500 (`Cannot read properties of undefined reading roles`) quando o host não é confiável.

### Changed
- **Version**: Incrementada versão para `v0.1.5`.

## [0.1.4] - 2026-02-17

### Added
- **Dependencies**: Adicionado `ts-node` às `devDependencies` para permitir a execução do `prisma db seed`.

### Changed
- **Version**: Incrementada versão para `v0.1.4`.

## [0.1.3] - 2026-02-17

### Fixed
- **Auth**: Corrigido erro de "module augmentation" em `types/auth.ts` que impedia o build no Docker (next-auth/jwt not found).

### Changed
- **Version**: Incrementada versão para `v0.1.3`.

## [0.1.2] - 2026-02-17

### Added
- **Configuration**: Criado arquivo `.env.example` com template de variáveis de ambiente do projeto.
- **Verification**: Executada verificação técnica completa (16 itens) da implementação de NextAuth.js v5 e PostgreSQL.

### Changed
- **Version**: Incrementada versão para `v0.1.2`.

## [0.1.1] - 2026-02-14

### Changed
- **Blog Typography**: Ajustado o ritmo vertical no container `prose` (prose-p:my-3, prose-h2:mt-10, prose-h3:mt-8).
- **Layout**: Aumentada a largura máxima do container de `max-w-3xl` para `max-w-4xl` no blog post.
- **Reading Experience**: Reduzido o `line-height` para `leading-7` para uma leitura mais densa e elegante.
