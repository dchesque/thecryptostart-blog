# Changelog

## [1.4.0] - 2026-03-20
### Fixed
- **APIs**: Corrigido erro 500 na rota de diagnóstico (uso indevido de NextResponse.next()).
- **Logs**: Tratamento para a ausência da tabela `SystemLog` em produção, evitando que o sistema trave.
- **Diagnostics**: Adicionada verificação de integridade da tabela de logs no painel administrativo.
- **Debugging**: Adicionados logs de depuração em `lib/posts.ts` para investigar renderização de posts em produção.

### Fixed
- **Homepage**: Corrigido desaparecimento dos posts na página inicial causado por redundância de conexões com o banco de dados.
- **Performance**: Implementado `cache()` do React em `lib/posts.ts` para deduplicar queries ao Prisma em uma mesma requisição.
- **Layout**: Simplificação do `RootLayout` removendo wrappers desnecessários e otimizando o carregamento de categorias globais.


## [1.3.8] - 2026-03-20
### Added
- **Menus Dinâmicos**: O menu superior (Header) e o rodapé (Footer) agora são 100% dinâmicos, buscando as categorias diretamente do banco de dados Prisma em vez de usar links estáticos.
- **Auditoria de Categorias**: Migração completa e verificação da integridade das categorias em todas as páginas do blog, garantindo consistência entre o Admin e a UI pública.


## [1.3.7] - 2026-03-20
### Added
- **Expansão de Diagnóstico**: Novo painel "API Module Health" que monitora em tempo real a saúde dos módulos de Posts, SEO, Google Search Console e Comentários.
- **Auditoria Visual**: Verificação visual de conectividade e status operacional de cada subsistema da API diretamente na interface administrativa.

## [1.3.6] - 2026-03-20
### Added
- **Auditoria de Segurança completa da API**: Verificação lógica de todos os 21 endpoints do blog.
- **Relatório de Auditoria**: Geração do documento `api_audit_report_final.md` com veredito de segurança.
- **Integração de Logs no Proxy**: Middleware `proxy.ts` agora integrado ao sistema de logs para auditoria de acesso persistente.


## [1.3.5] - 2026-03-20 — Diagnóstico e Monitoramento Admin

### Added
- **Admin**: Nova página de Diagnóstico (`/admin/diagnostics`) com monitoramento de status do banco de dados, variáveis de ambiente e saúde do Google Search Console.
- **Admin**: Sistema de Logs de API persistente no banco de dados (`SystemLog`) com interface para visualização em tempo real no painel administrativo.
- **Backend**: Utilitário `lib/logger.ts` integrado ao Prisma para rastreio centralizado de eventos e erros do sistema.
- **Prisma**: Adicionado modelo `SystemLog` ao schema para suporte a auditoria e logs de sistema.

### Changed
- **UI**: Sidebar administrativo atualizado com link direto para "Diagnostics & Status" para usuários ADMIN.

## [1.3.4] - 2026-03-20 — Correção React #310 + Estabilidade Blog

### Fixed
- **UI**: Corrigido erro "Minified React error #310" no componente `TableOfContents` causado por violação das regras de Hooks (hooks chamados após retorno condicional).
- **Scripts**: Corrigida sintaxe quebrada no script JSON-LD de FAQ na página de posts do blog.

### Changed
- **UI**: Removida a barra de progresso de leitura (`ReadingProgressBar`) redundante da página de posts, mantendo apenas a versão global injetada via layout.
- **Admin**: Criado script de emergência `reset-admin.js` para recuperação de acesso administrativo via CLI direto no VPS.

## [1.3.3] - 2026-03-19 — Correção de Build Crítica

### Fixed
- **Build**: Resolvido erro de função duplicada (`calculateReadingTime`) em `lib/utils.ts` que impedia o build em produção.

## [1.3.2] - 2026-03-19 — Limpeza Contentful + Hidratação + Hero

### Added
- **Auth**: Suporte a `ADMIN_API_KEY` via query param (`?key=`) ou header (`x-api-key`) nas rotas de diagnóstico e health check.

### Changed
- **UI**: Hero da homepage reduzido de `pt-48` para `pt-32` no desktop, tornando a dobra inicial mais próxima do conteúdo.
- **Limpeza**: Remoção total do legacy do Contentful (scripts de inspeção, pasta contentful/, comentários e tipos obsoletos).

### Fixed
- **React #310**: Corrigido erro de hidratação na página do artigo (`FAQSection` injetando JSON-LD redundante em Client Component).

## [1.3.1] - 2026-03-19 — Correções Críticas: Homepage + GSC 500

### Fixed
- **Homepage**: Adicionado `revalidatePath('/')`, `revalidatePath('/blog')` e `revalidatePath('/blog/[slug]')` na rota de publicação de posts (`/api/admin/posts/[id]/publish`). O cache ISR agora é invalidado imediatamente ao publicar ou despublicar um post, sem esperar o TTL de 1h.
- **GSC**: Adicionada validação explícita das variáveis `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY` e `GOOGLE_CLOUD_PROJECT_ID` no construtor do `GSCClient` — erros de credencial agora têm mensagem clara nos logs em vez de falha silenciosa.
- **GSC**: Processamento da `GOOGLE_PRIVATE_KEY` tornado robusto para ambientes Docker/EasyPanel, tratando escape duplo (`\\n`) e escape triplo (`\\\\n`) além do simples.
- **GSC API**: Rota `/api/gsc/analytics` agora retorna `503` com mensagem acionável quando as credenciais GSC estão ausentes, em vez de `500` genérico.

### Added
- **Diagnóstico**: Nova rota `GET /api/admin/diagnostics` (autenticada) que verifica o estado do banco de dados (total de posts, publicados, visíveis na homepage) e todas as variáveis de ambiente críticas. Essencial para debug na VPS sem acesso direto ao banco.
- **GSC Health**: Nova rota `GET /api/gsc/health` (autenticada) que valida cada credencial GSC individualmente sem consumir cota da API Google. Retorna `200` (healthy) ou `503` (degraded) com diagnóstico por variável.

## [1.3.0] - 2026-03-19

### Added
- **Blog Post**: Implementada barra de progresso de leitura (`ReadingProgressBar`) fixa no topo.
- **Blog Post**: Adicionado Table of Contents (TOC) dinâmico na sidebar (desktop) e como accordion (mobile).
- **Blog Post**: Novos slots de AdSense in-content: `article-in-content-top`, `article-in-content-mid`, `article-in-content-bottom`.
- **Blog Post**: Breadcrumbs visuais acima do conteúdo para navegação facilitada.
- **SEO**: Adicionado schema JSON-LD de `BreadcrumbList` e `FAQPage` gerados automaticamente do conteúdo.

### Changed
- **Blog Post**: Refatoração completa do Hero para layout de duas colunas (Texto | Imagem) com altura reduzida para desktop.
- **Blog Post**: Implementada Sidebar Sticky com TOC e anúncios fixos (`article-sidebar-top`, `article-sidebar-bottom`).
- **Blog Post**: `AuthorCard` redesenhado com foco em E-E-A-T, incluindo links sociais (LinkedIn) e biografia estendida.
- **Blog Post**: Grid de `RelatedPosts` atualizado para 3 colunas com exibição obrigatória de thumbnails e metadados.
- **Monetização**: Componente `InContentAd` criado para padronizar a inserção de anúncios no corpo do texto.
- **SEO**: Schema `Article` (JSON-LD) enriquecido com metadados detalhados de autor e sinais otimizados para IA.

## [1.2.0] - 2026-03-19

### Added
- **Homepage**: Introduzida versão compacta do CTA de Newsletter (`InlineNewsletter`) entre seções.
- **Homepage**: Expandida a seção de FAQ para 6+ perguntas cobrindo tópicos fundamentais de cripto.
- **Homepage**: Aumentado o número de Artigos Recentes visíveis para 6.

### Changed
- **Homepage**: Reestruturação completa da hierarquia visual e ordem das seções para melhor conversão e fluxo de conteúdo.
- **Homepage**: Seção Hero atualizada com maior impacto visual e CTAs mais claros.
- **Homepage**: Seção Featured of the Week refatorada para ocupar largura total, eliminando espaços vazios.
- **Monetização**: Componente `AdSense` otimizado com lógica de fallback para evitar espaços brancos quando anúncios não carregam.
- **Monetização**: Novos slots semânticos adicionados: `homepage-leaderboard`, `homepage-in-content`, `homepage-sidebar`.

## [1.1.0] - 2026-03-19

### Added
- **Privacidade**: Implementado Google CMP e Consent Mode v2 para conformidade com EEE, Reino Unido e Suíça.
- **Componentes**: Novo componente `GoogleCMP` para gerenciar estados de consentimento padrão (denied) antes do carregamento de tags.

### Changed
- **Layout**: Integração do `GoogleCMP` no layout raiz para garantir execução prioritária das regras de privacidade.

## [1.0.4] - 2026-03-13

### Fixed
- **Build**: Corrigido erro de duplicidade de propriedades em `lib/api-error.ts` que impedia o build de produção no Next.js 16/TS 5+.

## [1.0.3] - 2026-03-13

### Added
- **Monetização**: Adicionado arquivo `public/ads.txt` para autorização e verificação de propriedade no Google AdSense.

### Changed
- **Configuração**: Adicionada a variável `NODE_ENV` ao arquivo `.env.example` para facilitar a gestão de ambientes.

## [1.0.3] - 2026-02-27

### Fixed
- **API**: Corrigido problema de autenticação via API Key nos endpoints `/api/admin/*` causado por variável `ADMIN_API_KEY` ausente no runtime Docker.
- **Docker**: Adicionada documentação explícita de variáveis de ambiente obrigatórias no estágio runner do Dockerfile.
- **Docs**: Corrigida referência incorreta `[ENCRYPTION_KEY]` para `ADMIN_API_KEY` em `docs/API_AUTOMATION.md`.

### Added
- **API**: Novo endpoint `GET /api/health` para diagnóstico público de conexão, banco e variáveis de ambiente.
- **API**: Adicionado logging de diagnóstico no middleware (`proxy.ts`) para facilitar debug de autenticação.
- **Config**: Módulo `lib/env.ts` com validação de variáveis de ambiente no startup — emite `console.warn` com mensagens claras para variáveis ausentes.
- **Config**: `ADMIN_API_KEY` adicionado ao `.env.example` como single source of truth para configuração.
- **Docs**: Seção de Troubleshooting adicionada ao `docs/API_AUTOMATION.md` com exemplos de diagnóstico via cURL.
