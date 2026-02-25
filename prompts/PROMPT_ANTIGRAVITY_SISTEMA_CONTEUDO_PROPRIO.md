# 🚀 Prompt de Implantação — Sistema de Conteúdo Próprio (PostgreSQL/Prisma)

## Visão Geral da Implantação

### Objetivo
Substituir o Contentful por um **sistema de conteúdo próprio** baseado em PostgreSQL/Prisma, com estrutura otimizada para SEO e monetização com AdSense. Todo o conteúdo será criado do zero — não há migração de dados.

### Problema que Resolve
- Contentful é complexo para automação programática
- Latência de ~300ms por request ao Contentful
- Limites de API calls e entries que bloqueiam escala
- Duas fontes de dados separadas complicam o stack
- Rich Text JSON do Contentful é difícil de gerar/manipular programaticamente

### Escopo
- Remover completamente o Contentful e todas as suas dependências
- Criar models Prisma para Post, Category e Author com estrutura otimizada para SEO e monetização
- Criar `lib/posts.ts` como novo data layer usando Prisma queries
- Criar API REST completa para CRUD de conteúdo
- Criar painel admin para gerenciamento de posts com editor Markdown
- Atualizar todas as páginas e componentes do blog para consumir dados do PostgreSQL
- Implementar renderização de Markdown/MDX no lugar do Rich Text do Contentful

### Formato de Conteúdo
O conteúdo será armazenado em **Markdown/MDX** no banco de dados. A renderização usará `react-markdown` com plugins `rehype`/`remark`. Isso permite:
- Automação simples via API (conteúdo é string de texto)
- Internal linking automático via string manipulation
- Componentes React embeddados via MDX quando necessário
- Portabilidade total do conteúdo

---

## Análise de Contexto Obrigatória

> ⚠️ **ANTES DE QUALQUER IMPLEMENTAÇÃO**, o Antigravity DEVE:

1. **Analisar o arquivo `.context`** do projeto para entender:
   - Arquitetura atual (monolito Next.js 14+ com App Router)
   - Padrões existentes de código, TypeScript e nomenclaturas
   - Decisões técnicas documentadas

2. **Analisar o repositório GitHub** conectado à base de conhecimento:
   - `.context/docs/architecture.md` — Arquitetura e trade-offs
   - `.context/docs/project-overview.md` — Stack e entry points
   - `lib/contentful.ts` — Implementação atual que será **completamente substituída**. Mapear todas as funções exportadas (`getPostBySlug`, `getAllPosts`, `getPostsByCategory`, `getRelatedPosts`, `searchPosts`, `getAllPostSlugs`, `getAllCategories`, `getTotalPostsCount`, `transformPost`) para recriar com a mesma interface via Prisma.
   - `types/blog.ts` — Tipos atuais (`BlogPost`, `ContentfulBlogPost`, `ContentfulBlogPostFields`, `BlogCategory`, `Author`, `FeaturedImage`, `CategoryConfig`, etc.). Os tipos específicos do Contentful serão removidos; os tipos genéricos serão mantidos e adaptados.
   - `types/index.ts` — Tipo legado `Post` com formato Contentful (será removido)
   - `app/blog/[slug]/page.tsx` — Página de post que usa Rich Text renderer, TOC, FAQ, Quick Answer, schemas. **Toda a renderização de conteúdo será reescrita para Markdown.**
   - `app/blog/page.tsx` — Listagem de posts com paginação e filtros
   - `app/page.tsx` — Homepage com posts em destaque
   - `app/sitemap.ts` — Geração de sitemap
   - `lib/seo.ts` — Geração de metadata e schemas JSON-LD (será atualizado para aproveitar novos campos)
   - `lib/constants.ts` — `ADSENSE_SLOTS`, `BLOG_CONFIG`, `SITE_CONFIG`
   - `components/` — Todos os componentes que consomem dados de posts (`BlogCard`, `BlogPost`, `PostMeta`, `FeaturedImage`, `TableOfContents`, `FAQSection`, `RelatedPosts`, `RecommendedContent`, `Sidebar`)
   - `prisma/schema.prisma` — Schema atual (users, comments, roles)
   - `CHANGELOG.md` — Histórico de mudanças

3. **Mapear TODAS as importações de `lib/contentful.ts`** em todos os arquivos do projeto para garantir que nenhum import fique quebrado.

4. **Mapear TODOS os usos de `@contentful/rich-text-react-renderer`** e `@contentful/rich-text-types` em todo o projeto para garantir a substituição completa por renderização Markdown.

---

## Plano de Implantação

---

### FASE 1 — Remover Contentful Completamente

> ⚠️ **Esta fase deve ser executada PRIMEIRO** para limpar o terreno antes de construir o novo sistema.

#### Tarefa 1.1: Remover dependências npm

```bash
npm uninstall contentful @contentful/rich-text-react-renderer @contentful/rich-text-types @contentful/rich-text-plain-text-renderer
```

#### Tarefa 1.2: Remover arquivos do Contentful

- Deletar `lib/contentful.ts`
- Deletar `scripts/test-query.js`
- Deletar `CONTENTFUL_SETUP.md` (se existir na raiz ou em docs/)

#### Tarefa 1.3: Remover variáveis de ambiente

Remover de `.env.local`, `.env.example`, e qualquer configuração de deploy (Dockerfile, docker-compose, EasyPanel):
- `CONTENTFUL_SPACE_ID`
- `CONTENTFUL_ACCESS_TOKEN`
- `NEXT_PUBLIC_CONTENTFUL_SPACE_ID`
- `NEXT_PUBLIC_CONTENTFUL_ACCESS_TOKEN`
- `NEXT_PUBLIC_CONTENTFUL_PREVIEW_ACCESS_TOKEN`
- `CONTENTFUL_PREVIEW_TOKEN`

#### Tarefa 1.4: Remover tipos específicos do Contentful

Em `types/blog.ts`, remover:
- `ContentfulBlogPost`
- `ContentfulBlogPostFields`
- `ContentfulSys`

Em `types/index.ts`, remover:
- O tipo legado `Post` (que tem `sys` e `fields` no formato Contentful)

> ⚠️ **NÃO remover** os tipos genéricos que serão reutilizados: `BlogPost`, `Author`, `FeaturedImage`, `BlogCategory`, `CategoryConfig`, `PaginationOptions`, `SearchOptions`, `TagOptions`, `BlogMetadata`, `SEOProps`, `SiteConfig`.

#### Tarefa 1.5: Limpar Dockerfile

Se o `Dockerfile` passa variáveis do Contentful durante o build (ARG/ENV para `CONTENTFUL_SPACE_ID`, etc.), remover essas referências.

#### Tarefa 1.6: Instalar novas dependências

```bash
npm install react-markdown remark-gfm rehype-slug rehype-autolink-headings rehype-highlight
```

Para o editor no admin:
```bash
npm install @uiw/react-md-editor
```

> **Nota**: Neste ponto o projeto NÃO vai compilar. Isso é esperado. As próximas fases vão reconstruir o que foi removido.

---

### FASE 2 — Modelagem de Dados no Prisma

#### Tarefa 2.1: Criar Enums no Prisma Schema

Adicionar ao `prisma/schema.prisma`:

```
enum PostStatus {
  DRAFT
  PUBLISHED
}

enum ContentType {
  ARTICLE
  GUIDE
  TUTORIAL
  GLOSSARY
  REVIEW
  NEWS
}

enum Difficulty {
  BEGINNER
  INTERMEDIATE
  ADVANCED
}

enum SchemaType {
  ARTICLE
  HOW_TO
  REVIEW
  NEWS_ARTICLE
}

enum AdDensity {
  LOW
  NORMAL
  HIGH
}
```

#### Tarefa 2.2: Criar Model `Author`

```
model Author {
  id          String   @id @default(cuid())
  name        String
  slug        String   @unique
  bio         String?  @db.Text
  avatar      String?
  socialLinks Json?
  posts       Post[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

O campo `socialLinks` armazena um JSON com a estrutura: `{ twitter?: string, github?: string, linkedin?: string, website?: string }`

#### Tarefa 2.3: Criar Model `Category`

```
model Category {
  id          String   @id @default(cuid())
  name        String
  slug        String   @unique
  description String?  @db.Text
  icon        String   @default("📚")
  color       String?
  order       Int      @default(0)
  posts       Post[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

#### Tarefa 2.4: Criar Model `Post` — Estrutura Otimizada para SEO e Monetização

```
model Post {
  id        String     @id @default(cuid())
  status    PostStatus @default(DRAFT)

  // ═══════════════════════════════════════════
  // BLOCO: CONTEÚDO CORE
  // ═══════════════════════════════════════════
  title              String
  slug               String      @unique
  excerpt            String      @db.Text
  content            String      @db.Text          // Conteúdo principal em Markdown/MDX
  body               String?     @db.Text          // Conteúdo secundário/complementar em Markdown/MDX
  featuredImageUrl   String?
  featuredImageAlt   String?
  featuredImageWidth  Int?
  featuredImageHeight Int?
  publishDate        DateTime?
  updatedDate        DateTime?                     // Data editorial de atualização (separada do updatedAt do Prisma)
  readingTime        Int         @default(0)
  wordCount          Int         @default(0)
  isFeatured         Boolean     @default(false)
  contentType        ContentType @default(ARTICLE)
  difficulty         Difficulty  @default(BEGINNER)

  // ═══════════════════════════════════════════
  // BLOCO: SEO
  // ═══════════════════════════════════════════
  seoTitle           String?
  seoDescription     String?
  seoImageUrl        String?
  seoNoindex         Boolean     @default(false)
  targetKeyword      String?
  secondaryKeywords  String[]    @default([])
  schemaType         SchemaType  @default(ARTICLE)
  canonicalUrl       String?
  lastReviewedAt     DateTime?
  tags               String[]    @default([])

  // ═══════════════════════════════════════════
  // BLOCO: STRUCTURED DATA
  // ═══════════════════════════════════════════
  faq                Json?
  howToSteps         Json?
  pros               String[]    @default([])
  cons               String[]    @default([])

  // ═══════════════════════════════════════════
  // BLOCO: INTERNAL LINKING & STRATEGY
  // ═══════════════════════════════════════════
  relatedPostsSlugs  String[]    @default([])
  pillarPageSlug     String?
  internalLinks      Json?

  // ═══════════════════════════════════════════
  // BLOCO: MONETIZAÇÃO
  // ═══════════════════════════════════════════
  adDensity             AdDensity @default(NORMAL)
  monetizationDisabled  Boolean   @default(false)
  sponsoredBy           String?

  // ═══════════════════════════════════════════
  // RELAÇÕES
  // ═══════════════════════════════════════════
  category    Category @relation(fields: [categoryId], references: [id])
  categoryId  String
  author      Author   @relation(fields: [authorId], references: [id])
  authorId    String

  // ═══════════════════════════════════════════
  // TIMESTAMPS AUTOMÁTICOS
  // ═══════════════════════════════════════════
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // ═══════════════════════════════════════════
  // INDEXES
  // ═══════════════════════════════════════════
  @@index([status, publishDate])
  @@index([categoryId])
  @@index([authorId])
  @@index([isFeatured])
  @@index([contentType])
  @@index([targetKeyword])
  @@index([pillarPageSlug])
}
```

Sobre os campos Json:
- `faq` → Array de `{ question: string, answer: string }`
- `howToSteps` → Array de `{ step: string, description: string }`
- `internalLinks` → Array de `{ anchorText: string, slug: string }`
- `socialLinks` (Author) → `{ twitter?: string, github?: string, linkedin?: string, website?: string }`

#### Tarefa 2.5: Verificar relação com Comments

Analisar o model `Comment` existente no `prisma/schema.prisma`. Se usa `postSlug` como string simples, considerar adicionar uma relação formal:

```
// No model Post, adicionar:
comments    Comment[]

// No model Comment, atualizar:
post        Post?    @relation(fields: [postSlug], references: [slug])
postSlug    String
```

> ⚠️ **Só fazer essa mudança se não quebrar queries existentes de comments.** Analisar `app/api/comments/route.ts` antes.

#### Tarefa 2.6: Executar Migration

```bash
npx prisma migrate dev --name add_content_models
npx prisma generate
```

#### Tarefa 2.7: Criar Seed Inicial

Criar ou atualizar `prisma/seed.ts` para incluir dados iniciais:

1. **Categorias** — criar as mesmas categorias que existiam no Contentful. Consultar `lib/constants.ts` para ver a lista de `BlogCategory` e `CategoryConfig` atuais, e criar cada uma no banco com name, slug, icon, color e order correspondentes.

2. **Autor padrão** — criar ao menos 1 autor para poder criar posts:
   ```
   {
     name: "TheCryptoStart",
     slug: "thecryptostart",
     bio: "Your crypto education hub.",
     avatar: null
   }
   ```

3. **Post de exemplo** (opcional) — criar 1 post de teste para validar a renderização:
   ```
   {
     title: "Welcome to TheCryptoStart",
     slug: "welcome-to-thecryptostart",
     excerpt: "Your journey into crypto starts here.",
     content: "## What is TheCryptoStart?\n\nTheCryptoStart is your go-to resource for cryptocurrency education...\n\n## Getting Started\n\n1. Learn the basics\n2. Understand the risks\n3. Start small\n\n> Crypto is a marathon, not a sprint.",
     status: "PUBLISHED",
     publishDate: new Date(),
     contentType: "ARTICLE",
     difficulty: "BEGINNER",
     isFeatured: true,
     readingTime: 2,
     wordCount: 50,
     tags: ["crypto", "beginner", "education"]
   }
   ```

Executar: `npx prisma db seed`

---

### FASE 3 — Novo Data Layer (`lib/posts.ts`)

#### Tarefa 3.1: Criar `lib/posts.ts`

Criar o arquivo com **as mesmas funções exportadas** que o antigo `lib/contentful.ts`, mantendo a mesma interface para que as páginas e componentes existentes continuem funcionando com mudanças mínimas.

**Funções obrigatórias:**

1. **`getAllPosts(options?: PaginationOptions & TagOptions): Promise<BlogPost[]>`**
   - Query Prisma com filtros: `status: PUBLISHED`, `publishDate <= now()`
   - Suporte a `limit`, `skip`, `category` (via relação com `category.slug`), `tags` (via array contains)
   - Ordenação por `publishDate DESC`, fallback `createdAt DESC`
   - Include: `author`, `category`

2. **`getPostBySlug(slug: string): Promise<BlogPost | null>`**
   - `prisma.post.findUnique({ where: { slug }, include: { author: true, category: true } })`
   - Não filtrar por status (admin pode querer ver drafts via preview)

3. **`getPostsByCategory(category: string, options?): Promise<BlogPost[]>`**
   - Filtrar por `category.slug`
   - Reutilizar `getAllPosts` internamente

4. **`getRelatedPosts(currentSlug: string, categorySlug: string, limit?: number): Promise<BlogPost[]>`**
   - Se `relatedPostsSlugs` do post atual não está vazio, buscar esses slugs específicos (prioridade)
   - Senão, buscar posts da mesma categoria excluindo o post atual
   - Limit default: 3

5. **`searchPosts(query: string, options?: SearchOptions): Promise<BlogPost[]>`**
   - Prisma full-text search em `title`, `excerpt`, `content`
   - Ou fallback com `contains` (case insensitive) em `title` e `excerpt`
   - Apenas posts `PUBLISHED`

6. **`getAllPostSlugs(): Promise<string[]>`**
   - Para `generateStaticParams` no SSG
   - Apenas posts `PUBLISHED`

7. **`getAllCategories(): Promise<CategoryConfig[]>`**
   - `prisma.category.findMany({ orderBy: [{ order: 'asc' }, { name: 'asc' }] })`
   - Retornar no formato `CategoryConfig` existente: `{ slug, name, description, icon, color }`

8. **`getTotalPostsCount(category?: string): Promise<number>`**
   - `prisma.post.count({ where: { status: 'PUBLISHED', publishDate: { lte: new Date() }, ... } })`
   - Filtro opcional por `category.slug`

9. **`getFeaturedPosts(limit?: number): Promise<BlogPost[]>`** (NOVA)
   - Posts com `isFeatured: true` e `status: PUBLISHED`
   - Ordenados por `publishDate DESC`

10. **`getPostsByPillar(pillarSlug: string): Promise<BlogPost[]>`** (NOVA)
    - Posts com `pillarPageSlug` igual ao slug fornecido
    - Para montar pages de topic clusters no futuro

#### Tarefa 3.2: Criar função de transformação `transformPrismaPost`

Criar uma função que converte o resultado do Prisma para o tipo `BlogPost` existente em `types/blog.ts`.

**Isso é crucial**: as páginas e componentes existentes esperam o tipo `BlogPost`. A transformação deve garantir compatibilidade.

Mapeamento necessário (analisar `types/blog.ts` para confirmar nomes exatos):
- `post.featuredImageUrl` → montar objeto `FeaturedImage`: `{ url, description (usar featuredImageAlt), width, height }`
- `post.author` (Prisma Author) → montar objeto `Author`: `{ name, image (usar avatar), slug }`
- `post.category.slug` → campo `category` (tipo `BlogCategory`)
- `post.content` → campo `content` (agora é Markdown string, não Rich Text Document)
- `post.publishDate` → campo `publishedAt` (verificar nome no tipo BlogPost)
- `post.updatedDate` → campo `updatedAt`
- `post.excerpt` → campo `description` (verificar se BlogPost usa `description` ou `excerpt`)

> ⚠️ **Analisar cuidadosamente `types/blog.ts`** para mapear os nomes exatos dos campos. O tipo `BlogPost` pode usar nomes diferentes dos campos do Prisma.

#### Tarefa 3.3: Atualizar tipos em `types/blog.ts`

- **Manter e adaptar**: `BlogPost`, `Author`, `FeaturedImage`, `BlogCategory`, `CategoryConfig`, `PaginationOptions`, `SearchOptions`, `TagOptions`, `BlogMetadata`
- **Adicionar campos novos ao `BlogPost`** se componentes/páginas precisarem acessá-los: `targetKeyword`, `contentType`, `difficulty`, `schemaType`, `adDensity`, `monetizationDisabled`, `sponsoredBy`, `pillarPageSlug`, `relatedPostsSlugs`, `faq`, `howToSteps`, `pros`, `cons`, `wordCount`, `canonicalUrl`, `lastReviewedAt`, `secondaryKeywords`
- **Garantir** que `BlogPost.content` aceita `string` (Markdown) — antes era `Document` do Contentful

---

### FASE 4 — Atualização das Páginas e Componentes do Blog

> ⚠️ **Esta fase faz o blog voltar a compilar e funcionar.**

#### Tarefa 4.1: Atualizar imports em todos os arquivos

Em **todos os arquivos** que importavam de `lib/contentful.ts`, trocar para `lib/posts.ts`:

Arquivos conhecidos (fazer grep para encontrar todos):
- `app/blog/page.tsx`
- `app/blog/[slug]/page.tsx`
- `app/page.tsx`
- `app/sitemap.ts`
- Qualquer outro que use `getPostBySlug`, `getAllPosts`, `getAllCategories`, etc.

#### Tarefa 4.2: Reescrever renderização de conteúdo na página de post

Em `app/blog/[slug]/page.tsx`:

1. **Remover** todas as referências a `@contentful/rich-text-react-renderer` e `@contentful/rich-text-types` (`BLOCKS`, `INLINES`, `Document`)
2. **Remover** o objeto `renderOptions` inteiro que configura renderização de Rich Text
3. **Criar** um componente `MarkdownRenderer` (pode ser inline ou em `components/MarkdownRenderer.tsx`) usando `react-markdown` com:
   - Plugin `remark-gfm` (tabelas, strikethrough, task lists)
   - Plugin `rehype-slug` (IDs automáticos nos headings para anchor links)
   - Plugin `rehype-autolink-headings` (links nos headings)
   - Plugin `rehype-highlight` (syntax highlighting em code blocks)
   - Components customizados:
     - `h2`, `h3` → com ID para TOC (rehype-slug já cuida disso)
     - `img` → usar `next/image` com otimização (lazy loading, srcset, WebP)
     - `a` → links externos com `target="_blank" rel="noopener noreferrer"`, links internos com `next/link`
     - `pre`/`code` → estilizados com syntax highlighting
     - `blockquote` → estilizados conforme design existente (border-left colorida)
     - `table` → responsivas com wrapper `overflow-x-auto`
4. **Substituir** a chamada de renderização Rich Text pela chamada do novo `MarkdownRenderer`:
   ```
   // Antes (Contentful):
   {documentToReactComponents(post.content, renderOptions)}

   // Depois (Markdown):
   <MarkdownRenderer content={post.content} />
   ```

#### Tarefa 4.3: Reescrever extração de headings para TOC

A função `extractHeadingsFromRichText(content)` deve ser substituída por `extractHeadingsFromMarkdown(content: string)`:

- Fazer parse do Markdown para encontrar linhas que começam com `## ` (H2) e `### ` (H3)
- Para cada heading, gerar:
  - `text` → conteúdo do heading (sem o `##`)
  - `id` → slugified (mesma lógica do `slugify` existente)
  - `level` → 2 ou 3
- Tratar IDs duplicados (mesma lógica do `seenIds` que já existe)
- Retornar `Heading[]` no mesmo formato de antes

#### Tarefa 4.4: Reescrever `extractQuickAnswer`

Se `extractQuickAnswer(post.content)` hoje analisa Rich Text Document, reescrever para Markdown:
- Extrair o primeiro parágrafo após o primeiro heading (ou o primeiro parágrafo do conteúdo)
- Retornar como string simples (strip markdown formatting)
- Manter a mesma interface de retorno

#### Tarefa 4.5: Atualizar `generateFAQFromPost`

Atualizar a lógica:
1. Se `post.faq` existe e não está vazio → usar diretamente (já é array de `{question, answer}`)
2. Se não existe → gerar automaticamente a partir dos headings do Markdown (H2s como perguntas, primeiro parágrafo após cada H2 como resposta) — ou retornar array vazio

#### Tarefa 4.6: Atualizar `generateMetadata` na página de post

Aproveitar os novos campos SEO:
- Título: `post.seoTitle || post.title`
- Description: `post.seoDescription || post.excerpt` (ou `post.description`, verificar nome)
- Imagem: `post.seoImageUrl || post.featuredImage?.url`
- Robots: usar `post.seoNoindex`
- Canonical: usar `post.canonicalUrl` se existir
- Keywords: usar `post.targetKeyword` + `post.secondaryKeywords` + `post.tags`

#### Tarefa 4.7: Atualizar schemas JSON-LD

Atualizar a chamada de `generateAIOptimizedArticleSchema()` e criar schemas dinâmicos baseados em `post.schemaType`:

- `ARTICLE` → schema `Article` padrão (já existe)
- `HOW_TO` → gerar schema `HowTo` usando `post.howToSteps`
- `REVIEW` → gerar schema `Review` usando `post.pros` e `post.cons`
- `NEWS_ARTICLE` → gerar schema `NewsArticle`

Adicionar `post.targetKeyword` ao schema como keyword principal.

#### Tarefa 4.8: Implementar controle de Ad Density

Na página de post, usar `post.adDensity` e `post.monetizationDisabled`:

- `monetizationDisabled === true` → não renderizar nenhum componente `AdSense`
- `adDensity === 'LOW'` → apenas 1 ad (blog-top)
- `adDensity === 'NORMAL'` → ads padrão (blog-top + blog-middle + sidebar)
- `adDensity === 'HIGH'` → todos os ads + ads extras entre seções longas

Implementar isso como lógica condicional nos locais onde `<AdSense>` é renderizado na página de post.

#### Tarefa 4.9: Implementar Sponsored Disclosure

Se `post.sponsoredBy` estiver preenchido, renderizar banner de disclosure **abaixo do título, antes do conteúdo**:

```
"Sponsored by [sponsoredBy]" ou "This content is sponsored by [sponsoredBy]"
```

Estilizar com design sutil mas visível — obrigatório para compliance com políticas do Google AdSense.

#### Tarefa 4.10: Atualizar sitemap

Em `app/sitemap.ts`, trocar as chamadas de `getAllPosts`/`getAllPostSlugs` (que antes vinham do Contentful) para as novas funções de `lib/posts.ts`. Usar `updatedDate` ou `lastReviewedAt` como `lastmod`.

#### Tarefa 4.11: Verificar e atualizar todos os componentes

Percorrer cada componente que consome dados de post e verificar compatibilidade:

- `components/BlogCard.tsx` — verifica se acessa `post.content` (Rich Text) em algum lugar
- `components/BlogPost.tsx` — pode ter renderização de Rich Text
- `components/PostMeta.tsx` — verifica campos de author, date, readingTime
- `components/FeaturedImage.tsx` — verifica formato do objeto FeaturedImage
- `components/TableOfContents.tsx` — pode depender do formato Rich Text
- `components/FAQSection.tsx` — verifica formato de FAQ items
- `components/RelatedPosts.tsx` — verifica campos usados
- `components/RecommendedContent.tsx` — verifica campos usados
- `components/Sidebar.tsx` — verifica se consome dados de posts
- `components/AuthorCard.tsx` — verifica formato do Author

> ⚠️ **Testar cada componente individualmente** após as mudanças.

#### Tarefa 4.12: Verificar compilação

Neste ponto, o blog deve compilar e funcionar com dados do PostgreSQL:

```bash
npm run build
npm run lint
npm run type-check
```

Se houver posts no banco (do seed), o blog deve renderizá-los corretamente.

---

### FASE 5 — API REST para CRUD de Conteúdo

#### Tarefa 5.1: API de Posts

Criar rotas em `app/api/admin/posts/`:

**`app/api/admin/posts/route.ts`**:
- `GET` — Listar posts com filtros (status, category, author, search, contentType, page, limit). Retornar com paginação: `{ posts, total, page, limit, totalPages }`.
- `POST` — Criar post. Validar com Zod. Calcular `wordCount` e `readingTime` automaticamente a partir do `content`. Proteger com `hasRole('admin')` ou `hasRole('editor')`.

**`app/api/admin/posts/[id]/route.ts`**:
- `GET` — Detalhe do post por ID (include author, category)
- `PUT` — Atualizar post completo. Recalcular `wordCount` e `readingTime` se `content` mudar.
- `DELETE` — Deletar post

**`app/api/admin/posts/[id]/publish/route.ts`**:
- `PATCH` — Alternar status DRAFT ↔ PUBLISHED. Se publicando e `publishDate` não existir, definir como `new Date()`.

**Todas as rotas devem:**
- Verificar autenticação via NextAuth session
- Verificar permissões via `hasRole('admin')` ou `hasRole('editor')`
- Validar inputs com Zod schemas
- Retornar erros usando classes de `lib/errors.ts` (`AppError`, `AuthenticationError`, `AuthorizationError`, `ValidationError`)
- Chamar `revalidatePath('/blog')`, `revalidatePath('/')`, e `revalidatePath(`/blog/${post.slug}`)` após criar/editar/deletar

#### Tarefa 5.2: API de Categorias

Criar `app/api/admin/categories/route.ts` e `app/api/admin/categories/[id]/route.ts`:

- `GET` — Listar todas (com contagem de posts por categoria)
- `POST` — Criar categoria (validar slug único)
- `PUT` — Atualizar
- `DELETE` — Deletar (rejeitar se existem posts vinculados; retornar erro informando quantos posts usam a categoria)

#### Tarefa 5.3: API de Autores

Criar `app/api/admin/authors/route.ts` e `app/api/admin/authors/[id]/route.ts`:

- `GET` — Listar todos (com contagem de posts por autor)
- `POST` — Criar autor (validar slug único)
- `PUT` — Atualizar
- `DELETE` — Deletar (rejeitar se existem posts vinculados)

#### Tarefa 5.4: Criar Zod Schemas de Validação

Adicionar a `lib/validations.ts` (ou criar arquivo separado `lib/validations/posts.ts`):

- `CreatePostSchema`:
  - `title` → string, min 1, max 200
  - `slug` → string, regex `/^[a-z0-9]+(?:-[a-z0-9]+)*$/`, max 200
  - `excerpt` → string, min 1, max 500
  - `content` → string, min 1
  - `categoryId` → string (cuid)
  - `authorId` → string (cuid)
  - `status` → enum optional (default DRAFT)
  - Todos os outros campos opcionais com validações específicas

- `UpdatePostSchema`:
  - Todos os campos opcionais (partial do Create)

- `CreateCategorySchema`:
  - `name` → string, min 1, max 100
  - `slug` → string, regex, max 100
  - `description` → string optional, max 500
  - `icon` → string optional, max 10
  - `color` → string optional, regex hex color
  - `order` → number optional

- `CreateAuthorSchema`:
  - `name` → string, min 1, max 100
  - `slug` → string, regex, max 100
  - `bio` → string optional, max 2000
  - `avatar` → string optional, url
  - `socialLinks` → object optional

Validações especiais:
- `seoTitle` → max 60 caracteres
- `seoDescription` → max 160 caracteres
- `targetKeyword` → max 100 caracteres
- `faq` → array de `{ question: string, answer: string }`
- `howToSteps` → array de `{ step: string, description: string }`

#### Tarefa 5.5: Funções auxiliares para cálculos automáticos

Criar em `lib/posts.ts` ou `lib/utils.ts`:

- `calculateWordCount(markdown: string): number` — strip markdown syntax, contar palavras
- `calculateReadingTime(wordCount: number): number` — `Math.ceil(wordCount / 200)`
- `generateSlugFromTitle(title: string): string` — gerar slug a partir do título (lowercase, replace spaces com hyphens, remove special chars)

---

### FASE 6 — Painel Admin de Conteúdo

#### Tarefa 6.1: Página de listagem `/admin/posts`

Criar `app/admin/posts/page.tsx`:

- Tabela com colunas: Status (badge colorido DRAFT/PUBLISHED), Título (link para editar), Categoria, Autor, Publish Date, Word Count, Target Keyword, Content Type, Ações (Editar, Publicar/Despublicar, Deletar)
- Filtros no topo: por status (select), por categoria (select), por content type (select), busca por título (input)
- Paginação
- Botão "Novo Post" no topo
- Usar o mesmo design system do admin existente (`crypto-*` color palette, Tailwind)
- Proteger com `hasRole('admin')` ou `hasRole('editor')`

#### Tarefa 6.2: Página de criação `/admin/posts/new`

Criar `app/admin/posts/new/page.tsx` com formulário dividido em abas ou seções:

**Aba "Conteúdo":**
- Title (input text) — ao sair do campo, auto-gerar slug se slug estiver vazio
- Slug (input text, editável)
- Excerpt (textarea)
- Content (editor Markdown — `@uiw/react-md-editor` com preview lado a lado)
- Body (editor Markdown secundário, colapsável, opcional)
- Featured Image URL (input text + preview da imagem ao lado)
- Featured Image Alt (input text)

**Aba "SEO":**
- SEO Title (input text, com contador de caracteres ao lado, highlight vermelho se > 60)
- SEO Description (textarea, com contador de caracteres, highlight vermelho se > 160)
- SEO Image URL (input text)
- SEO Noindex (toggle/checkbox)
- Target Keyword (input text)
- Secondary Keywords (input de tags/chips — digitar e pressionar Enter para adicionar)
- Canonical URL (input text)
- Schema Type (select: Article, HowTo, Review, NewsArticle)

**Aba "Metadata":**
- Category (select, populado da API `/api/admin/categories`)
- Author (select, populado da API `/api/admin/authors`)
- Tags (input de tags/chips)
- Content Type (select: Article, Guide, Tutorial, Glossary, Review, News)
- Difficulty (select: Beginner, Intermediate, Advanced)
- Is Featured (toggle/checkbox)
- Publish Date (date picker)
- Updated Date (date picker)
- Reading Time (número, auto-calculado ao digitar content, mas editável)
- Word Count (número, auto-calculado, readonly)

**Aba "Structured Data":**
- FAQ (editor dinâmico: botão "Add FAQ", campos question + answer para cada item, botão remover)
- HowTo Steps (editor dinâmico: botão "Add Step", campos step + description, botão remover, drag-and-drop para reordenar se possível)
- Pros (input de lista/chips)
- Cons (input de lista/chips)

**Aba "Linking & Monetização":**
- Related Posts Slugs (input de tags/chips ou autocomplete buscando slugs existentes)
- Pillar Page Slug (input com autocomplete de slugs existentes)
- Internal Links (editor dinâmico: botão "Add Link", campos anchorText + slug)
- Ad Density (select: Low, Normal, High)
- Monetization Disabled (toggle/checkbox)
- Sponsored By (input text)

**Botões de ação (fixos no topo ou bottom):**
- "Salvar como Rascunho" → `POST` com `status: DRAFT`
- "Publicar" → `POST` com `status: PUBLISHED`
- "Cancelar" → voltar para `/admin/posts`

#### Tarefa 6.3: Página de edição `/admin/posts/[id]/edit`

Mesmo formulário da criação, mas:
- Pré-populado com os dados do post (buscar via `GET /api/admin/posts/[id]`)
- Botões: "Salvar Alterações", "Publicar/Despublicar", "Deletar", "Cancelar"
- Aba extra "Revisão" com:
  - Last Reviewed At (date picker + botão "Marcar como revisado agora")
  - Preview do post (abre em nova aba ou renderiza inline o Markdown como ficará no blog)

#### Tarefa 6.4: Páginas de Categorias

Criar `app/admin/categories/page.tsx`:
- Tabela: Nome, Slug, Icon, Color, Order, Nº de Posts, Ações
- Modal ou página para criar/editar (formulário simples)
- Proteção com RBAC

#### Tarefa 6.5: Páginas de Autores

Criar `app/admin/authors/page.tsx`:
- Tabela: Nome, Slug, Avatar (thumbnail), Nº de Posts, Ações
- Modal ou página para criar/editar (formulário com campos de social links)
- Proteção com RBAC

#### Tarefa 6.6: Atualizar navegação do admin

Adicionar links no menu/sidebar do admin dashboard existente:
- 📝 Posts (`/admin/posts`)
- 📂 Categories (`/admin/categories`)
- ✍️ Authors (`/admin/authors`)

Manter os links existentes (Users, Comments, Dashboard).

---

### FASE 7 — Atualização da Documentação

#### Tarefa 7.1: Atualizar documentação do projeto

Atualizar os seguintes arquivos para refletir a nova arquitetura sem Contentful:

- **`.context/docs/architecture.md`** — Remover Contentful do diagrama, trade-offs e architectural layers. Substituir por PostgreSQL/Prisma como fonte única de dados. Atualizar o mermaid diagram.
- **`.context/docs/project-overview.md`** — Atualizar stack (remover Contentful, atualizar data flow), atualizar Quick Facts, atualizar Key Exports (remover funções do Contentful, adicionar funções do `lib/posts.ts`).
- **`.context/docs/glossary.md`** — Atualizar definição de BlogPost (não vem mais do Contentful), remover "Contentful Integration", adicionar "Internal Content System".
- **`.context/docs/README.md`** — Remover setup do Contentful do Quick Start, adicionar instruções de seed.
- **`CLAUDE.md`** — Atualizar todas as referências.
- **`.cursor/rules/README.md`** — Atualizar referências ao data layer e padrões.
- **`README.md`** (raiz) — Atualizar setup instructions, remover prerequisites do Contentful.
- **`CHANGELOG.md`** — Adicionar entrada detalhada para esta migração.

#### Tarefa 7.2: Verificação final completa

```bash
# Verificar que não há NENHUMA referência ao Contentful
grep -ri "contentful" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.json" --include="*.md" --include="*.env*" .

# Build completo
npm run build

# Lint
npm run lint

# Type check
npm run type-check

# Testar seed
npx prisma db seed

# Verificar no browser
# - Homepage carrega
# - /blog lista posts
# - /blog/[slug] renderiza post com Markdown
# - TOC funciona
# - FAQ renderiza
# - Ads aparecem conforme adDensity
# - /admin/posts lista posts
# - Criar novo post funciona
# - Editar post funciona
# - Publicar/despublicar funciona
```

---

## Plano de Verificação Consolidado

### Fase 1 — Remoção do Contentful
- [ ] Dependências npm do Contentful removidas do `package.json`
- [ ] `lib/contentful.ts` deletado
- [ ] Variáveis de ambiente do Contentful removidas
- [ ] Tipos específicos do Contentful removidos de `types/`
- [ ] Novas dependências (react-markdown, rehype, remark) instaladas

### Fase 2 — Modelagem
- [ ] `npx prisma generate` sem erros
- [ ] `npx prisma migrate dev` cria migration sem erros
- [ ] Prisma Studio mostra Post, Category, Author com todos os campos
- [ ] Enums criados corretamente
- [ ] Indexes verificados
- [ ] Seed executa e cria categorias + autor + post de exemplo

### Fase 3 — Data Layer
- [ ] `getAllPosts()` retorna posts publicados ordenados por data
- [ ] `getPostBySlug()` retorna post com author e category incluídos
- [ ] `getPostsByCategory()` filtra corretamente
- [ ] `getRelatedPosts()` exclui post atual e respeita `relatedPostsSlugs`
- [ ] `searchPosts()` retorna resultados relevantes
- [ ] `getAllPostSlugs()` retorna slugs para SSG
- [ ] `getAllCategories()` retorna no formato `CategoryConfig`
- [ ] `getTotalPostsCount()` conta corretamente
- [ ] Tipo de retorno compatível com `BlogPost`

### Fase 4 — Páginas e Componentes
- [ ] Homepage (`/`) carrega sem erros
- [ ] Listagem (`/blog`) funciona com paginação e filtros
- [ ] Post (`/blog/[slug]`) renderiza Markdown corretamente
- [ ] Headings têm IDs para anchor links
- [ ] Table of Contents funciona
- [ ] Quick Answer box funciona
- [ ] FAQ renderiza do campo `faq` do banco
- [ ] JSON-LD Article schema gerado corretamente
- [ ] HowTo schema gerado quando `schemaType === HOW_TO`
- [ ] Review schema gerado quando `schemaType === REVIEW`
- [ ] OpenGraph e Twitter cards com dados corretos
- [ ] Sitemap gerado com dados do PostgreSQL
- [ ] Ads respeitam `adDensity` e `monetizationDisabled`
- [ ] Sponsored disclosure aparece quando `sponsoredBy` preenchido
- [ ] `generateStaticParams` funciona para SSG
- [ ] ISR revalida corretamente
- [ ] `npm run build` sem erros
- [ ] `npm run lint` sem erros
- [ ] `npm run type-check` sem erros

### Fase 5 — API REST
- [ ] `POST /api/admin/posts` cria post com validação
- [ ] `PUT /api/admin/posts/[id]` atualiza post
- [ ] `DELETE /api/admin/posts/[id]` deleta post
- [ ] `PATCH /api/admin/posts/[id]/publish` alterna status
- [ ] Rotas 401 para não autenticados
- [ ] Rotas 403 para sem permissão
- [ ] `wordCount` e `readingTime` calculados automaticamente
- [ ] `revalidatePath` chamado após mudanças
- [ ] CRUD de categorias funciona (com proteção contra delete com posts)
- [ ] CRUD de autores funciona (com proteção contra delete com posts)

### Fase 6 — Painel Admin
- [ ] `/admin/posts` lista posts com filtros e paginação
- [ ] Criar post com todas as abas funciona
- [ ] Editor Markdown renderiza preview
- [ ] Auto-cálculo de wordCount e readingTime funciona
- [ ] Auto-geração de slug funciona
- [ ] FAQ editor dinâmico funciona
- [ ] HowTo Steps editor funciona
- [ ] Tags/chips inputs funcionam
- [ ] Contadores de caracteres SEO funcionam
- [ ] Editar post existente carrega dados corretamente
- [ ] Publicar/despublicar via botão funciona
- [ ] CRUD de categorias no admin funciona
- [ ] CRUD de autores no admin funciona
- [ ] Navegação do admin atualizada

### Fase 7 — Documentação
- [ ] `grep -ri "contentful"` retorna zero resultados em código
- [ ] Documentação `.context` atualizada
- [ ] `CLAUDE.md` atualizado
- [ ] `README.md` atualizado
- [ ] `CHANGELOG.md` com entrada da migração
- [ ] Build final em produção funciona

---

## Resultado Esperado

### Comportamento Final
- Blog funciona com dados do PostgreSQL (sem Contentful)
- Todo conteúdo é criado/editado via painel admin com editor Markdown
- API REST completa permite automação total de conteúdo
- Estrutura de dados otimizada com campos de SEO, monetização, internal linking e structured data
- Schemas JSON-LD dinâmicos baseados no tipo de conteúdo (Article, HowTo, Review, NewsArticle)
- Controle granular de ads por post (density, disable, sponsored)

### Impacto no Sistema
- Data layer unificado (PostgreSQL/Prisma para tudo)
- Zero dependência de vendor externo
- Stack simplificado para manutenção
- Base para automação: criação de posts via API, internal linking automático, SEO programático
- Base para escala: 1500+ artigos sem limites

### Impacto no SEO
- `targetKeyword` + `secondaryKeywords` → tracking de rankings
- `pillarPageSlug` + `relatedPostsSlugs` → topic clusters
- `schemaType` dinâmico → rich snippets diferenciados (HowTo steps, Review pros/cons)
- `contentType` + `difficulty` → segmentação e UX
- `canonicalUrl` → controle de conteúdo duplicado
- `lastReviewedAt` → sinal de freshness

### Impacto na Monetização
- `adDensity` → otimizar RPM por tipo de conteúdo
- `monetizationDisabled` → páginas sem ads
- `sponsoredBy` → compliance com Google AdSense
- `contentType` → estratégias diferenciadas (guides monetizam mais)

---

## Ordem de Execução Recomendada

1. **Fase 1** → Remover Contentful (limpa o terreno)
2. **Fase 2** → Modelagem + Seed (cria a base de dados)
3. **Fase 3** → Novo data layer (recria as funções)
4. **Fase 4** → Atualizar páginas e componentes (**blog volta a funcionar**)
5. **Fase 5** → API REST (habilita automação)
6. **Fase 6** → Painel admin (habilita gestão visual)
7. **Fase 7** → Documentação e verificação final

> **Importante**: Após a Fase 4, o blog já está funcional. As Fases 5 e 6 adicionam capacidades de gestão. A Fase 7 é limpeza final.

---

## Dependências npm

### Adicionar:
- `react-markdown` — renderização de Markdown para React
- `remark-gfm` — suporte a tabelas, strikethrough, task lists no Markdown
- `rehype-slug` — IDs automáticos nos headings (para TOC e anchor links)
- `rehype-autolink-headings` — anchor links clicáveis nos headings
- `rehype-highlight` — syntax highlighting em code blocks
- `@uiw/react-md-editor` — editor Markdown com preview para o admin

### Remover:
- `contentful`
- `@contentful/rich-text-react-renderer`
- `@contentful/rich-text-types`
- `@contentful/rich-text-plain-text-renderer` (se existir)
