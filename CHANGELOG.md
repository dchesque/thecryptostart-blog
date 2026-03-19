# Changelog

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
