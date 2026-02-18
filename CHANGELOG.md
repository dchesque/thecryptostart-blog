# Changelog

## [0.4.0] - 2026-02-18

### Added
- **Componentes**: Criados `StickyHeaderAd` (desktop, aparece ao scrollar para cima), `StickyFooterAd` (mobile, dismissível) e `RecommendedContent` (grid 2 artigos + native ad).
- **Layout**: `StickyHeaderAd` e `StickyFooterAd` adicionados ao `app/layout.tsx` (globais em todas as páginas).
- **Post Page**: `RecommendedContent` adicionado entre ShareButtons e Related Posts.
- **Performance**: CLS prevention — containers de ads com `min-height` (blog-top: 120px, blog-middle: 280px) para evitar layout shift.
- **Analytics**: Criado `lib/analytics.ts` com `sendWebVital()`, `trackAdImpression()` e `trackAdClick()` para monitoramento de Core Web Vitals e revenue no GA4.
- **Constants**: Adicionados slots `homepage-sidebar`, `header-ad`, `footer-ad` e `recommended-native` em `ADSENSE_SLOTS` (total: 10 slots).

---

## [0.3.0] - 2026-02-18

### Added
- **Componentes**: Criados 5 novos componentes UI — `Breadcrumb`, `PostMeta`, `FeaturedImage`, `AuthorCard` e `InfoBox` (callout boxes).
- **Monetização**: Adicionados ad slots `blog-top` e `blog-middle` na Post Page (split do rich text ao meio para inserção do ad).
- **Monetização**: Adicionados ad slots `homepage-banner` (após hero) e `homepage-mid` (após recent articles) na Homepage.
- **Monetização**: Adicionado ad slot `blog-top` no topo da listagem da Category Page.
- **UX**: Adicionado `AuthorCard` detalhado (avatar, bio, social links, CTA) após o conteúdo do post.
- **UX**: Adicionado category header contextual na Category Page quando uma categoria está selecionada.
- **SEO**: Adicionada `generateFAQSchema()` em `lib/seo.ts` para schema FAQPage.
- **SEO**: Metadata dinâmica keyword-first na Homepage e Category Page.
- **Tailwind**: Customizadas prose classes — H2 com border-bottom, blockquote com border-left colorida, code blocks com fundo escuro.

### Changed
- **Post Page**: Melhorado espaçamento do rich text para maior legibilidade (prose-p:my-4, leading-8).
- **SEO**: `generateMetadata()` agora trunca descriptions para 155-160 chars com CTA.
- **Constants**: Adicionados slots `blog-middle` e `homepage-mid` em `ADSENSE_SLOTS`.

---

## [0.2.5] - 2026-02-18

### Fixed
- **Dev**: Corrigido Turbopack panic loop causado por `output: 'standalone'` no `next.config.mjs` (opção exclusiva para builds de produção/Docker, incompatível com Turbopack no modo dev).

## [0.2.4] - 2026-02-18
 
### Fixed
- **Deploy**: Corrigido `Dockerfile` para capturar e utilizar variáveis de ambiente do Contentful durante o build (`next build`), essencial para geração de páginas estáticas e ISR.
 
## [0.2.3] - 2026-02-18
 
### Changed
- **Dev**: Desativado Turbopack temporariamente para evitar crashes no Windows.
- **Debug**: Refinados logs de data e query no Contentful para diagnóstico de produção.
 
## [0.2.2] - 2026-02-18
 
### Added
- **Debug**: Adicionados logs de diagnóstico em `lib/contentful.ts` para rastrear conexão com CMS e filtragem de posts em produção.
 
## [0.2.1] - 2026-02-18
 
### Fixed
- **Build**: Corrigido erro de tipagem TypeScript em `lib/constants.ts` que impedia o build em produção (conversão inválida de `readonly []`).
 
## [0.2.0] - 2026-02-18
 
### Added
- **Contentful**: Implementada busca dinâmica de categorias diretamente do CMS via nova função `getAllCategories` em `lib/contentful.ts`.
 
### Changed
- **Performance**: Reduzido tempo de revalidação (ISR) de 1 hora para 5 minutos (300 segundos) nas páginas Home, Blog e Post [slug].
- **UI**: Páginas Home e Blog atualizadas para renderizar categorias dinamicamente a partir do Contentful.
- **BlogCard**: Adicionado mapeamento de estilos para novas categorias e fallbacks visuais para categorias futuras.
 
### Fixed
- **Sincronização**: Resolvido problema de categorias e posts "travados" devido a dados estáticos no código e cache excessivo.
 
## [0.1.13] - 2026-02-18

### Fixed
- **Deploy**: Adicionados pacotes `effect` e `@effect` ao runner stage do Dockerfile, necessários pelo Prisma v6.19.2 para executar migrations.

### Changed
- **Security**: Gerado e configurado `AUTH_SECRET` seguro para autenticação.

## [0.1.12] - 2026-02-17

### Fixed
- **Deploy**: Corrigido erro de carregamento de arquivos `.wasm` do Prisma (`ENOENT prisma_schema_build_bg.wasm`) ao chamar o Prisma build diretamente no entrypoint, evitando problemas de resolução de caminhos do wrapper `.bin`.


## [0.1.11] - 2026-02-17

### Fixed
- **Deploy**: Adicionada biblioteca `libc6-compat` ao estágio runner (essencial para rodar Prisma no Alpine Linux).
- **Deploy**: Ajustada a cópia de binários do Prisma para incluir o diretório `.bin`.
- **Scripts**: Melhorado o `entrypoint.sh` para usar o binário local do Prisma prioritariamente.


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
