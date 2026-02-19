# Regras do Agente GEMINI

## Visão Geral

Este documento define as regras obrigatórias para o agente GEMINI durante o desenvolvimento do projeto **thecryptostartblog** (um blog Next.js com integração Contentful, autenticação, comentários e SEO avançado). Essas regras garantem consistência, qualidade e alinhamento com o contexto do projeto.

**Objetivo**: Padronizar comportamentos para versionamento, commits, análise de contexto, segurança e qualidade de código.

**Público-alvo**: Desenvolvedores e agentes AI que interagem com o repositório.

**Arquivos relacionados**:
- [`.context/AGENTS.md`](.context/AGENTS.md): Descrição dos agentes disponíveis.
- [`CLAUDE.md`](.context/CLAUDE.md): Diretrizes gerais do projeto.
- [`docs/`](docs/): Documentação técnica (ex: tipos em `types/`, utils em `lib/`).
- [`plans/`](plans/): Planos de implementação existentes.
- [`prevc-template.md`](prevc-template.md): Template para novos planos.

Sempre consulte esses arquivos **antes** de qualquer ação.

## Regras Detalhadas

### 1. Idioma
- **Regra**: Todas as conversas, respostas, comentários de código e documentação devem ser em **português-BR**.
- **Razão**: Facilita comunicação com a equipe brasileira e mantém consistência no projeto.
- **Exemplo**:
  ```
  // ❌ Incorreto
  console.log('User registered successfully');

  // ✅ Correto
  console.log('Usuário registrado com sucesso');
  ```
- **Exceções**: Nomes de variáveis, funções e APIs seguem convenções inglesas (ex: `getPostBySlug` em `lib/contentful.ts`).

### 2. Versionamento
- **Regra**: Use semântica `vMAJOR.MINOR.PATCH`:
  | Tipo     | Descrição              | Exemplo |
  |----------|------------------------|---------|
  | **MAJOR** | Breaking changes (quebra compatibilidade) | `v2.0.0` (mudança em schema do Contentful) |
  | **MINOR** | Nova feature          | `v1.1.0` (adicionar componente `CommentsList`) |
  | **PATCH** | Bugfix                | `v1.0.1` (corrigir rate-limit em `lib/spam-prevention.ts`) |
- **Changelog obrigatório**: Gere com data, seções `Added`, `Changed`, `Fixed`. Nomeie como `changelog-v1.1.0-nova-feature-comments.md`.
- **Exemplo de Changelog**:
  ```markdown
  # Changelog v1.1.0 - Adicionar sistema de comentários

  ## Added
  - Novo endpoint `app/api/comments/route.ts`
  - Componente `CommentsList` em `components/`

  ## Changed
  - Atualização em `lib/contentful.ts` para suportar comentários

  ## Fixed
  - Correção de spam detection em `lib/spam-prevention.ts`

  Data: 2024-10-01
  ```

### 3. Commits
- **Regra**: Commits simples, seguindo versionamento. Use `git commit -m "tipo: descrição vMAJOR.MINOR.PATCH"`.
- **Tipos comuns**: `feat:`, `fix:`, `docs:`, `refactor:`, `chore:`.
- **Exemplo**:
  ```
  git commit -m "feat: adicionar CommentsList v1.1.0"
  git push origin main
  ```
- **Evite**: Commits genéricos como "updates" ou múltiplas mudanças por commit.

### 4. Contexto do Projeto
- **Regra**: **Sempre** analise `.context/` antes de planejar:
  1. Leia `AGENTS.md` (funções dos agentes).
  2. Leia `CLAUDE.md` (diretrizes).
  3. Consulte `docs/` (ex: `types/blog.ts` para `BlogPost`).
  4. Verifique `plans/` para evitar duplicatas.
  5. Use `prevc-template.md` para novos planos.
- **Ferramentas úteis** (para análise):
  - `listFiles("lib/**/*.ts")` → Lista utils como `contentful.ts`, `seo.ts`.
  - `analyzeSymbols("types/blog.ts")` → Interfaces como `BlogPost`, `BlogCategory`.
- **Exemplo de checklist pré-execução**:
  - ✅ `AGENTS.md` lido?
  - ✅ Plano não duplicado em `plans/`?

### 5. Ações Destrutivas
- **Regra**: Nunca delete sem confirmação explícita. Backup obrigatório para `env`, schemas Prisma (`lib/prisma.ts`), configs.
- **Exemplo**:
  ```
  // Antes de alterar lib/prisma.ts
  cp lib/prisma.ts lib/prisma.ts.backup
  ```

### 6. Dependências
- **Regra**: Liste pacotes, versões estáveis e confirme antes de `npm install`. Verifique `package.json` primeiro.
- **Exemplo**:
  ```
  Proponho instalar: @contentful/rich-text-types@6.3.0 (estável)
  Confirmar? [Y/n]
  ```
- **Verificação**: Busque similaridades (ex: já existe `next-auth` para auth?).

### 7. Escopo Controlado
- **Regra**: Uma tarefa por vez. Divida complexas em etapas.
- **Exemplo**:
  1. Etapa 1: Implementar `POST /api/comments`.
  2. Confirmar.
  3. Etapa 2: Adicionar `CommentsList`.

### 8. Qualidade de Código
- **Regra**: Mantenha padrões existentes:
  | Aspecto     | Padrão no Projeto                  |
  |-------------|------------------------------------|
  | Naming     | CamelCase (ex: `getPostBySlug`)   |
  | Estrutura  | `lib/` para utils, `components/` para UI |
  | Estilo     | TypeScript estrito, sem `any`     |
- **Limpeza**: Remova `console.log` antes de commit.
- **Comentários**: Apenas para lógica não-óbvia (ex: spam detection em `lib/spam-prevention.ts`).

### 9. Tratamento de Erros
- **Regra**: Sempre trate erros em API/DB/auth. Use classes de `lib/errors.ts` (`AppError`, `RateLimitError`).
- **Exemplo**:
  ```ts
  // app/api/comments/route.ts
  try {
    // lógica
  } catch (error) {
    throw new RateLimitError('Tentativas excedidas');
  }
  ```

### 10. Documentação
- **Regra**: Atualize `.context/docs/` para novas features. Mantenha `CLAUDE.md` com decisões técnicas.
- **Exemplo**: Após adicionar SEO, atualize `docs/seo.md` com `generateMetadata` de `lib/seo.ts`.

## Conformidade e Auditoria
- **Violação**: Pare imediatamente e justifique.
- **Atualizações**: Proponha mudanças via PR com changelog.
- **Data de última revisão**: 2024-10-01

Para dúvidas, consulte desenvolvedores ou revise contexto do projeto.
