# Changelog

## [0.14.0] - 2026-02-19

### Added
- **SEO Intelligence Dashboard**: Novo painel administrativo em `/admin/seo` com métricas em tempo real, análise de densidade de keywords e sugestões de links.
- **Link Builder**: Algoritmo de sugestão de links internos baseado em relevância semântica (`lib/link-builder.ts`).
- **SEO Analyzer**: Utilitário robusto para análise de conteúdo do Contentful (`lib/seo-analyzer.ts`).
- **Content Expansion**: Ferramenta que identifica posts curtos e sugere tópicos para atingir a meta de 1500+ palavras.
- **Guest Post System**: Página pública de diretrizes em `/guest-post-guidelines` com design premium para atrair backlinks.
- **Content Clusters**: Nova estrutura de organização temática de posts em `/blog/clusters`.
- **Broken Link Detection**: Scanner de links quebrados integrado (`lib/broken-link-finder.ts`).
- **Monitoring**: Script de monitoramento diário em `scripts/seo-monitor.ts` e modelos de e-mail para outreach.

### Changed
- **Admin Layout**: Adicionado link direto para o SEO Intelligence Dashboard no painel principal.
- **SEO API**: Novo endpoint `/api/seo/metrics` para alimentar o dashboard administrativo.


## [0.13.0] - 2026-02-19

### Added
- **AI Search Optimization**: Implementação completa de otimizações para ChatGPT, Claude e Perplexity.
- **Quick Answers**: Bloco visual e técnico de respostas rápidas (40-60 palavras) no topo dos posts.
- **FAQ Automático**: Geração dinâmica de FAQ (JSON-LD + UI) baseada em categorias e tags.
- **Admin Dashboard**: Painel administrativo em `/admin/ai-optimization` para monitoramento de AI Scores.
- **SEO AI**: Novo Schema `Article` estendido com sinais de autoridade (E-E-A-T) e abstratos citáveis.
- **Documentação**: Guia técnico para editores em `docs/AI_SEARCH_OPTIMIZATION.md`.

### Changed
- **SEO Utility**: Melhoria no `lib/seo.ts` para suportar `generateAIOptimizedArticleSchema`.
- **UI Admin**: Menu lateral do painel admin atualizado com acesso rápido ao AI Search Dashboard.

## [0.12.1] - 2026-02-19

### Added
- Google Search Console integration with `GSCClient` using `googleapis`.
- New API endpoint `/api/gsc/analytics` to fetch search metrics.
- Admin dashboard at `/admin/gsc-dashboard` with visual stats and recommendations.
- Detailed setup documentation at `docs/GSC_SETUP.md`.

## [0.12.0] - 2026-02-19
### Added
- **Imagens**: Contentful Image Transformation API customizada (`lib/contentful-image-transform.ts`) para otimização automática de imagens (redução de ~87% no tamanho).

### Changed
- **Performance**: Integração nativa em `lib/contentful.ts` para servir automaticamente formatos modernos (`AVIF`/`WebP`) via Contentful Image API.

### Fixed
- **Build**: Removido `ssr: false` de `next/dynamic` em Server Component (`app/blog/[slug]/page.tsx`) para corrigir erro crítico de compilação.
- **Build**: Substituídos `revalidate` exports dinâmicos por valores literais em `app/page.tsx` e `app/blog/[slug]/page.tsx` para garantir otimização de build de produção no Next.js.

## [0.11.0] - 2026-02-19
### Added
- **Performance**: Suporte nativo a Progressive Web App (PWA) via `next-pwa`.
- **Monitoramento**: Componente `WebVitals` integrado ao GA4 para captura de métricas reais (LCP, CLS, INP).
- **Tooling**: Integração do `@next/bundle-analyzer` para análise de pacotes e otimização de bundle.

### Changed
- **Imagens**: Configuração avançada no `next.config.mjs` com suporte a `AVIF`, `WebP`, sub-dimensionamento reativo e cache agressivo de 1 ano.
- **Fontes**: Otimização do Google Fonts com `font-display: swap`, preload e redução seletiva de pesos (Montserrat/Open Sans).
- **Arquitetura**: Implementação sistemática de `dynamic imports` e `Suspense boundaries` em componentes pesados para melhorar o TTI.
- **Caching**: Estratégia ISR otimizada com revalidação de 24h para posts e 1h para páginas estáticas (Grade AA Strategy).
- **Core Web Vitals**: Aplicação de `aspect-ratio` e placeholders no AdSense e imagens para garantir CLS zero.

### Fixed
- **CLS**: Saltos de layout corrigidos em anúncios e carregamento de imagens dinâmicas.
- **Hidratação**: Erros de mismatch entre CSR/SSR em componentes interativos.

## [0.10.0] - 2026-02-19
### Added
- **Comentários**: Sistema robusto de discussão integrado com Prisma (PostgreSQL).
- **Anti-Spam**: Camada "Vanguard" com 5 níveis de proteção (Honeypot, Rate Limiting, Keyword Detection, IP Tracking, Email Validation).
- **Moderador**: Dashboard administrativo premium para gestão de engajamento e combate a spam.
- **UI**: Componentes `CommentForm` e `CommentsList` com design AAA e micro-animações.


## [0.9.0] - 2026-02-19
### Added
- **i18n**: Padronização completa do blog para Inglês Americano (en-US).
- **UX**: Refatoração da seção de comentários para layout de coluna única com formulário no topo.
- **UI**: Espaçamento entre linhas dos posts ajustado para `leading-tight` para maior densidade.
- **UI**: Melhoria no espaçamento e balanceamento visual do `ExitIntentPopup`.

### Fixed
- **Typography**: Corrigido alinhamento e espaçamento de bullet points em artigos do Contentful.
- **Build**: Corrigidos erros de sintaxe no renderizador de rich text.

## [0.8.1] - 2026-02-19
### Fixed
- **Comentários**: Corrigido erro de runtime `comments.map is not a function` ao lidar com respostas de erro da API.
- **i18n**: Ajustada localidade de exibição de data para `pt-BR` em todo o sistema de comentários.

## [0.8.0] - 2026-02-19
### Added
- Refatoração da Blog Listing Page (`app/blog/page.tsx`) para layout Triple-Column (Grade + Sidebar).
- Integração de `BlogCardCompact`, `PopularPosts` e `CategoryLinks` na listagem do blog.
- Novos espaços de anúncio na sidebar da página de listagem.
- Largura ultra-wide de 1440px aplicada à página `/blog`.

## [0.7.0] - 2026-02-19
### Added
- Novo Layout Triple-Column para Post Page (`app/blog/[slug]/page.tsx`).
- Redesenho completo da Homepage com funil de conversão AAA de 7 seções.
- Componente `CompactTableOfContents` (Variantes minimal e tradicional).
- Componente `CategoryLinks` para sidebar.
- Componente `PopularPosts` para sidebar.
- Componente `TrendingList` com ranking para homepage.
- Componente `CategoryCard` e `BlogCardCompact` para grade da homepage.
- Componente `FeaturedArticleCard` para destaque da homepage.
- Componente `FAQAccordion` para homepage.
- Componente `NewsletterCTALarge` com gradiente premium.
- Inclusão de novos slots de anúncio (High CPM): `blog-sidebar-top`, `blog-sidebar-middle`, `blog-sidebar-bottom`, `homepage-hero`, `homepage-featured-ad`, etc.

### Changed
- Configuração do Tailwind estendida para suportar `maxWidth: 1440px`, `1000px` (post) e novos espaçamentos.
- Layout da Homepage migrado para estrutura de 1440px de largura máxima.
- Substituição da TOC lateral grande por versão flutuante/compacta.

## [0.6.1] - 2026-02-19

### Fixed
- **Build Docker**: Ativado `output: 'standalone'` no `next.config.mjs` para corrigir falha no deploy via Docker/EasyPanel.

## [0.6.0] - 2026-02-18

### Added
- **Lead Gen Avançado**: Criado `GatedContent.tsx` para entrega de recursos exclusivos (PDFs/E-books) mediante inscrição.
- **Polish**: Refinamento visual de todos os componentes de engajamento.

## [0.5.0] - 2026-02-18

### Added
- **UX de Retenção**: Criado `ReadingProgressBar.tsx` (global no topo) e aprimorado `TableOfContents.tsx` com scroll sync e estados ativos premium.
- **Social**: `ShareButtons.tsx` agora suporta layout vertical e foi integrado como barra sticky na sidebar dos posts.
- **Interação**: Criado `SocialComments.tsx` com integração Giscus para discussões.
- **Conversão**: Criados `InlineNewsletter.tsx` (corpo do post) e `ExitIntentPopup.tsx` (captura de saída).
- **Componentes**: `NewsletterForm.tsx` e `PostMeta.tsx` otimizados com novos estilos e funcionalidades (Trending badge, Last Updated).

---

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
