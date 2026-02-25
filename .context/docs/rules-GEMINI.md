# Regras do Agente GEMINI

## Visão Geral

Este documento define as **regras obrigatórias** para o agente GEMINI durante o desenvolvimento do projeto **thecryptostartblog** — um blog Next.js com integração Prisma/PostgreSQL próprio, autenticação NextAuth, sistema de comentários, painel admin, SEO avançado (GSC, AI optimization), spam prevention e mais.

**Objetivo**: Garantir consistência no versionamento, commits, análise de contexto, segurança, qualidade de código e alinhamento com a arquitetura existente.

**Público-alvo**: Desenvolvedores, agentes AI (ex: GEMINI, CLAUDE) e contribuidores.

**Status**: Ativo | **Última revisão**: 2024-10-15 (atualizado com symbols e exports do codebase)

**Arquivos relacionados** (cross-references):
- [`.context/AGENTS.md`](.context/AGENTS.md): Funções dos agentes AI.
- [`.context/CLAUDE.md`](.context/CLAUDE.md): Diretrizes gerais do projeto.
- [`docs/types.md`](docs/types.md): Detalhes de tipos (ex: `BlogPost`, `Author` em `types/blog.ts`).
- [`docs/lib.md`](docs/lib.md): Utils (ex: `lib/seo-analyzer.ts`, `lib/ai-optimization.ts`).
- [`plans/`](plans/): Planos de implementação (verifique duplicatas).
- [`prevc-template.md`](prevc-template.md): Template para novos planos.

**Sempre consulte esses arquivos antes de qualquer ação**. Use ferramentas como `listFiles("lib/**/*.ts")` ou `analyzeSymbols("types/blog.ts")` para contexto.

## Sumário

- [1. Idioma](#1-idioma)
- [2. Versionamento](#2-versionamento)
- [3. Commits](#3-commits)
- [4. Contexto do Projeto](#4-contexto-do-projeto)
- [5. Ações Destrutivas](#5-ações-destrutivas)
- [6. Dependências](#6-dependências)
- [7. Escopo Controlado](#7-escopo-controlado)
- [8. Qualidade de Código](#8-qualidade-de-código)
- [9. Tratamento de Erros](#9-tratamento-de-erros)
- [10. Documentação](#10-documentação)
- [Conformidade e Auditoria](#conformidade-e-auditoria)

## Regras Detalhadas

### 1. Idioma

- **Regra**: Todas conversas, respostas, comentários de código, logs e documentação em **português-BR**.
- **Razão**: Alinhamento com equipe brasileira e padronização.
- **Exceções**: Nomes de funções/variáveis em inglês (ex: `calculateAIOptimizationScore` em `lib/ai-optimization.ts`, `getPostBySlug` em `lib/posts.ts`).
- **Exemplo**:
  ```ts
  // ❌ Incorreto
  console.log('User authenticated');

  // ✅ Correto
  console.log('Usuário autenticado com sucesso');
  ```

### 2. Versionamento

- **Regra**: Use semântica `vMAJOR.MINOR.PATCH`. Crie changelog obrigatório em `docs/changelog-vX.Y.Z-descricao.md`.
- **Tabela de tipos**:

  | Tipo    | Descrição                          | Exemplo                          |
  |---------|------------------------------------|----------------------------------|
  | **MAJOR** | Mudanças breaking (ex: schema Prisma) | `v2.0.0` (update `types/blog.ts`) |
  | **MINOR** | Nova feature (ex: novo endpoint)  | `v1.1.0` (adicionar `app/api/ai-optimization/scores`) |
  | **PATCH** | Correções (ex: bug em rate-limit) | `v1.0.1` (fix `lib/spam-prevention.ts`) |

- **Exemplo de Changelog**:
  ```markdown
  # Changelog v1.1.0 - Sistema de AI Optimization

  ## Added
  - `calculateAIOptimizationScore` em `lib/ai-optimization.ts`
  - Endpoint `app/api/ai-optimization/scores/route.ts`

  ## Changed
  - Atualização em `app/admin/ai-optimization/page.tsx`

  ## Fixed
  - Melhoria em `lib/errors.ts` (novas classes `RateLimitError`)

  **Data**: 2024-10-15
  ```

### 3. Commits

- **Regra**: Commits atômicos com Conventional Commits: `tipo: descrição curta vMAJOR.MINOR.PATCH`.
- **Tipos**: `feat:`, `fix:`, `docs:`, `refactor:`, `chore:`, `test:`.
- **Exemplo**:
  ```bash
  git add .
  git commit -m "feat: adicionar AIOptimizationScore v1.1.0"
  git push origin main
  ```
- **Evite**: Commits vagos como "updates" ou múltiplas features.

### 4. Contexto do Projeto

- **Regra**: **Sempre** analise `.context/` + codebase antes de planejar:
  1. `AGENTS.md`: Escolha agente correto (GEMINI para SEO/AI tasks).
  2. `CLAUDE.md`: Diretrizes gerais.
  3. `docs/`: Tipos (`types/blog.ts`: `BlogPost`, `BlogCategory`), utils (`lib/seo-analyzer.ts`: `analyzeSEO`).
  4. Arquitetura: Controllers em `app/api/*`, Components em `components/admin/*`.
  5. Verifique `plans/` para duplicatas.
  6. Use template `prevc-template.md`.

- **Checklist pré-execução**:
  | Item | Status |
  |------|--------|
  | `AGENTS.md` lido? | ✅ |
  | Plano único? | ✅ |
  | Symbols analisados (ex: `analyzeSymbols("lib/errors.ts")`)? | ✅ |

- **Ferramentas recomendadas**:
  - `listFiles("app/api/admin/**/*.ts")` → Endpoints admin.
  - `searchCode("calculateReadingTime")` → Usado em `lib/utils.ts` e `lib/posts.ts`.

### 5. Ações Destrutivas

- **Regra**: **Nunca delete sem confirmação**. Backup obrigatório para:
  - `lib/prisma.ts` (PrismaClientSingleton).
  - `.env` (secrets).
  - Schemas Types (`types/blog.ts`).
- **Exemplo**:
  ```bash
  cp lib/errors.ts lib/errors.ts.backup  # Antes de editar classes como AppError
  ```

### 6. Dependências

- **Regra**: Verifique `package.json` primeiro. Proponha versões estáveis, confirme instalação.
- **Exemplo** (baseado em deps existentes como `react-markdown`):
  ```bash
  # Verificar existentes
  grep "next-auth" package.json

  # Propor
  Proponho: prisma@5.14.0 (compatível com lib/prisma.ts)
  Confirmar? [Y/n]
  npm install prisma@5.14.0
  ```

### 7. Escopo Controlado

- **Regra**: Uma feature por tarefa. Divida em etapas confirmadas.
- **Exemplo** (implementar comentários):
  1. `POST /api/comments/route.ts` + `lib/spam-prevention.ts`.
  2. Confirmar.
  3. `components/CommentsList.tsx` + `app/blog/[slug]/page.tsx`.

### 8. Qualidade de Código

- **Regra**: Siga padrões do projeto:
  | Aspecto    | Padrão Exemplo                          |
  |------------|-----------------------------------------|
  | **Naming** | CamelCase: `getAllPosts` (`lib/posts.ts`) |
  | **Estrutura** | Utils: `lib/`; UI: `components/`; API: `app/api/` |
  | **TypeScript** | Estrito, sem `any`; use `BlogPost` (`types/blog.ts`) |
  | **Estilo** | ESLint/Prettier; `cn` utility (`lib/utils.ts`) |

- **Limpeza**: Remova `console.log`. Comentários só para lógica complexa (ex: `detectSpam` em `lib/spam-prevention.ts`).
- **Exemplo prático**:
  ```ts
  // ✅ Bom: Usa types e utils
  import { BlogPost } from '@/types/blog';
  import { calculateReadingTime } from '@/lib/utils';

  export async function getPostBySlug(slug: string): Promise<BlogPost> {
    // Lógica com try-catch
  }
  ```

### 9. Tratamento de Erros

- **Regra**: Trate **todos** erros em API/DB/auth. Use classes de `lib/errors.ts`.
- **Classes disponíveis**:
  - `AppError`
  - `AuthenticationError`
  - `AuthorizationError`
  - `ValidationError`
  - `RateLimitError`
- **Exemplo** (em `app/api/comments/route.ts`):
  ```ts
  import { RateLimitError, AppError } from '@/lib/errors';
  import { checkRateLimit } from '@/lib/spam-prevention';

  export async function POST(req: Request) {
    try {
      await checkRateLimit(req);
      // Lógica
    } catch (error) {
      if (error instanceof RateLimitError) {
        return Response.json({ error: 'Rate limit excedido' }, { status: 429 });
      }
      throw new AppError('Erro interno');
    }
  }
  ```

### 10. Documentação

- **Regra**: Atualize `docs/` para novas features. Registre decisões em `CLAUDE.md`.
- **Exemplo**: Após AI Optimization, adicione `docs/ai-optimization.md` referenciando `AIOptimizationScore` (`lib/ai-optimization.ts`).

## Conformidade e Auditoria

- **Violação**: Pare, justifique e corrija imediatamente.
- **Auditoria**: Todo commit/PR deve referenciar esta doc.
- **Atualizações**: Proponha via PR com changelog.
- **Versão do Codebase**: Baseado em exports como `analyzeSEO` (`lib/seo-analyzer.ts`), `GSCClient` (`lib/gsc-client.ts`).

**Para dúvidas**: Consulte devs ou revise `.context/`. Sempre priorize qualidade e contexto!
