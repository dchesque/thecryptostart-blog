# PROMPT ANTIGRAVITY — FASE 1: LAYOUT REFACTORING
## TheCryptoStart Blog — UX/Legibilidade + SEO Técnico + Ad Placement

---

## 1️⃣ VISÃO GERAL DA IMPLANTAÇÃO

### Objetivo Principal
Refatorar completamente o layout do blog TheCryptoStart para alcançar padrão AAA profissional:
- **UX**: Aumentar legibilidade de conteúdo (reduzir bounce rate de 50% para 28%)
- **SEO**: Otimizar metadata e breadcrumbs visuais
- **Monetização**: Implementar 3-5 ad placements estratégicos

### Problema que Resolve
1. **Bounce rate CRÍTICO**: 50% (parágrafos muito longos, sem espaçamento)
2. **SEO incompleto**: Faltam breadcrumbs visuais, meta descriptions otimizadas
3. **Revenue não realizado**: Zero ads estratégicos = -60% de potencial revenue
4. **UX fraca**: Sem author info, sem reading time, sem visual breaks

### Escopo de Implantação
- ✅ Refatorar `app/blog/[slug]/page.tsx` (POST PAGE - CRÍTICO)
- ✅ Refatorar `app/page.tsx` (HOMEPAGE - IMPORTANTE)
- ✅ Refatorar `app/blog/page.tsx` (CATEGORY PAGE - IMPORTANTE)
- ✅ Criar 5 novos componentes UI
- ✅ Implementar spacing Tailwind standards
- ✅ Adicionar 5-7 ad placements
- ✅ Otimizar metadata/SEO

### Resultado Esperado
**ANTES**: 6.5/10 (bounce rate 50%, session 1min, revenue $20-30/mês)
**DEPOIS**: 8.5/10 (bounce rate 28%, session 3.5min, revenue $100-150/mês)

---

## 2️⃣ ANÁLISE DE CONTEXTO OBRIGATÓRIA

### Contexto do Projeto
**Stack**: Next.js 14+ App Router | TypeScript | Tailwind CSS | Contentful CMS | Prisma ORM | NextAuth.js

**Estrutura Chave**:
```
app/
  ├── page.tsx              ← HOMEPAGE (refatorar)
  ├── blog/
  │   ├── page.tsx          ← CATEGORY PAGE (refatorar)
  │   └── [slug]/page.tsx   ← POST PAGE (CRÍTICO - refatorar MUITO)
  └── layout.tsx            ← Root layout
  
components/
  ├── BlogCard.tsx
  ├── RelatedPosts.tsx
  ├── ShareButtons.tsx      ← JÁ EXISTE, mas não renderizado
  ├── AdSense.tsx           ← JÁ EXISTE, usar strategicamente
  └── NewsletterForm.tsx
  
lib/
  ├── seo.ts                ← ANALISAR E OTIMIZAR
  ├── constants.ts          ← ADSENSE_SLOTS já definidos
  ├── contentful.ts
  └── utils.ts              ← calculateReadingTime() JÁ EXISTE
```

### Padrões Existentes
- **SEO**: Metadata API + Schema.org JSON-LD já implementados
- **Components**: TypeScript interfaces bem definidas
- **Styling**: Tailwind CSS com cores customizadas (crypto-primary: #FF6B35)
- **Typography**: `prose` classes já configuradas (mas não otimizadas)
- **Responsiveness**: Grid/flex patterns estabelecidos

### Dependências Disponíveis
```
next/image ✓
next/link ✓
contentful/rich-text-react-renderer ✓
tailwindcss ✓
lucide-react ✓ (para ícones)
```

### Convenções do Projeto
- Components em `components/` (PascalCase)
- Utility functions em `lib/` (camelCase)
- Pages em `app/` seguem App Router convention
- Tailwind classes: sm: (640px), md: (768px), lg: (1024px), xl: (1280px)
- Colors: crypto-primary, crypto-secondary, crypto-darker, etc

---

## 3️⃣ PLANO DE IMPLANTAÇÃO (TAREFAS NUMERADAS)

### BLOCO 1: NOVOS COMPONENTES (Tarefas 1-5)

#### Tarefa 1: Criar Breadcrumb Component
**Arquivo**: `components/Breadcrumb.tsx`

**Descrição**: Component visual para breadcrumbs de navegação (schema.org já existe, só falta render)

**O que fazer**:
- Criar component React que aceita array de `{ name, url }`
- Renderizar breadcrumb com separadores `/`
- Último item (current page) sem link
- Classes Tailwind: flex gap-2, text-sm, border-bottom
- Acessibilidade: `aria-current="page"` no último item

**Resultado esperado**:
```
HOME > BLOG > BITCOIN > POST
```

---

#### Tarefa 2: Criar PostMeta Component
**Arquivo**: `components/PostMeta.tsx`

**Descrição**: Exibe informações do post (author, data, reading time, category)

**O que fazer**:
- Props: `{ author, publishedAt, readingTime, category, categoryColor, updatedAt }`
- Exibir avatar do autor (se existe)
- Nome do autor em negrito
- Data formatada (pt-BR)
- Reading time com ícone ⏱️
- Category badge com cor dinâmica
- Updated date (opcional)

**Exemplo de saída**:
```
🔷 BITCOIN | 👤 John Doe • 📅 Jan 15, 2025 • ⏱️ 8 min read
```

---

#### Tarefa 3: Criar FeaturedImage Component
**Arquivo**: `components/FeaturedImage.tsx`

**Descrição**: Imagem hero otimizada para posts

**O que fazer**:
- Usar Next.js `<Image>` component
- Aspect ratio 16:9 (CRÍTICO)
- Min width 1200px
- Lazy loading automático
- Responsive sizes
- Optional caption

**CSS**: `rounded-lg overflow-hidden shadow-md`

---

#### Tarefa 4: Criar AuthorCard Component
**Arquivo**: `components/AuthorCard.tsx`

**Descrição**: Card com informações detalhadas do autor (credibilidade)

**O que fazer**:
- Props: `{ author, className }`
- Avatar + nome + title/bio
- Social links (if available)
- "Follow" button ou "See more articles" CTA
- Styled: bg-gray-50, rounded-lg, p-6

---

#### Tarefa 5: Criar InfoBox Component (Callout)
**Arquivo**: `components/InfoBox.tsx`

**Descrição**: Boxes para destacar conteúdo importante (tips, warnings, notes)

**O que fazer**:
- Props: `{ type: 'tip' | 'warning' | 'info' | 'success', title, children }`
- Cores diferentes por tipo:
  - tip: blue-50 / blue-500
  - warning: amber-50 / amber-500
  - info: cyan-50 / cyan-500
  - success: green-50 / green-500
- Ícone à esquerda (lucide-react)
- Border-left 4px

---

### BLOCO 2: REFATORAR POST PAGE (Tarefas 6-10)

#### Tarefa 6: Adicionar Breadcrumb + PostMeta no Header
**Arquivo**: `app/blog/[slug]/page.tsx`

**Descrição**: Adicionar navegação visual + metadados do post

**O que fazer**:
- Importar `Breadcrumb` e `PostMeta` components
- Adicionar após o `HeroHeader` ou dentro dele
- Breadcrumb com: Home > Blog > Category > Post
- PostMeta com: author, publishedAt, readingTime, category

**Localização no código**: ~linha 80-120 (após header, antes de featured image)

---

#### Tarefa 7: Otimizar Featured Image
**Arquivo**: `app/blog/[slug]/page.tsx`

**Descrição**: Fazer hero image ficar GRANDE e bem posicionada

**O que fazer**:
- Substituir `<img>` tag por `<FeaturedImage>` component
- Aspectratio 16:9
- Width mínimo 1200px
- Container com margin: my-8
- Rounded corners + shadow

**Antes**:
```tsx
<img src={post.featuredImage.url} alt={post.title} width={400} />
```

**Depois**:
```tsx
<FeaturedImage 
  src={post.featuredImage.url}
  alt={post.title}
  priority
/>
```

---

#### Tarefa 8: Adicionar Ad Placements Estratégicos
**Arquivo**: `app/blog/[slug]/page.tsx`

**Descrição**: Implementar 3-5 slots de ads no post

**O que fazer**:
- Adicionar `<AdSense slot="blog-top" />` após featured image
- Adicionar `<AdSense slot="blog-middle" />` no meio do conteúdo (após ~3 min de leitura)
- Adicionar `<AdSense slot="blog-bottom" />` antes de related posts
- Adicionar `<AdSense slot="blog-sidebar" />` na sidebar (se houver)
- Wrapping: `<div className="my-8 rounded-lg">` para spacing + estilo

**Localização**: 
- #1: após featured image
- #2: entre primeira e segunda seção de conteúdo (split rich text)
- #3: antes de AuthorCard
- #4: (opcional) sidebar sticky

---

#### Tarefa 9: Refatorar Spacing do Conteúdo Rich Text
**Arquivo**: `app/blog/[slug]/page.tsx` ou novo `richTextOptions.ts`

**Descrição**: Fazer parágrafos e headings respeitarem spacing standards

**O que fazer**:
- Parágrafos max-width: 65ch (ideal reading width)
- Line-height: 1.6-1.8
- Margin bottom: 1rem entre parágrafos
- H2: margin-top 2rem, margin-bottom 1rem, padding-bottom 0.5rem, border-bottom
- H3: margin-top 1.5rem, margin-bottom 0.75rem
- Lists: gap-3 entre items
- Blockquotes: border-left 4px crypto-primary, italic, padding-left 1.5rem
- Code blocks: bg-gray-900, text-gray-100, rounded, p-4

**Tailwind classes**:
```tsx
// Usar no prose wrapper
<div className="prose prose-lg max-w-none space-y-6">
  {documentToReactComponents(content, richTextOptions)}
</div>
```

---

#### Tarefa 10: Renderizar ShareButtons Visível
**Arquivo**: `app/blog/[slug]/page.tsx`

**Descrição**: Tornar ShareButtons visível (component já existe, só precisa adicionar)

**O que fazer**:
- Importar `ShareButtons` component
- Adicionar após conteúdo principal
- Wrapping: `<div className="border-t border-b border-gray-200 py-6 my-8">`
- Props: url (post URL), title (post title)

**Antes**: ShareButtons existe mas não é renderizado
**Depois**: Visível com styling adequado

---

### BLOCO 3: REFATORAR HOMEPAGE (Tarefas 11-13)

#### Tarefa 11: Expandir Featured Article
**Arquivo**: `app/page.tsx`

**Descrição**: Fazer featured article (Start Here) MAIOR e mais impactante

**O que fazer**:
- Featured article deve ser full-width do container
- Imagem 16:9 (hero-sized)
- Overlay com gradient black/transparent
- Título + excerpt sobre a imagem
- "Featured" badge em laranja
- Hover effect: zoom image + shadow elevation

**Container**: max-w-3xl mx-auto

---

#### Tarefa 12: Criar Grid de Recent Articles
**Arquivo**: `app/page.tsx`

**Descrição**: Recent articles em grid responsivo (não só 1)

**O que fazer**:
- Grid: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- 6 artigos no máximo (2 linhas x 3 colunas)
- BlogCard para cada artigo
- "View more articles" button no final
- Gap: gap-6

---

#### Tarefa 13: Adicionar Ad Placements na Homepage
**Arquivo**: `app/page.tsx`

**Descrição**: Ads em pontos-chave da homepage

**O que fazer**:
- Ad #1: Após hero (antes de Featured Article)
- Ad #2: Depois de Recent Articles
- Ad #3: Na footer (ou depois de Categories)

**Localização**: `<AdSense slot="homepage-banner" />`

---

### BLOCO 4: REFATORAR CATEGORY PAGE (Tarefas 14-16)

#### Tarefa 14: Adicionar Category Header
**Arquivo**: `app/blog/page.tsx`

**Descrição**: Header com contexto da categoria

**O que fazer**:
- Ícone + cor da categoria
- Título da categoria (grande, H1)
- Descrição/subtitle
- Badge com "X articles"
- Se vazio: mensagem amigável + CTAs

---

#### Tarefa 15: Adicionar Filters + Search
**Arquivo**: `app/blog/page.tsx`

**Descrição**: Controles para filtrar e buscar

**O que fazer**:
- Sort dropdown: "Newest" | "Popular" | "Trending"
- Search input com placeholder
- Categorias navegáveis (as tabs)

---

#### Tarefa 16: Criar Sidebar para Category Page
**Arquivo**: `app/blog/page.tsx`

**Descrição**: Sidebar com trending + related categories + CTA

**O que fazer**:
- Grid: lg:grid-cols-4 (3 cols main, 1 col sidebar)
- Sidebar sticky
- Trending articles section
- Related categories
- Newsletter CTA
- Ad slot

---

### BLOCO 5: OTIMIZAÇÕES TÉCNICAS (Tarefas 17-19)

#### Tarefa 17: Otimizar Meta Descriptions e Titles
**Arquivo**: `lib/seo.ts`

**Descrição**: Refatorar function `generateMetadata` para padrão AAA

**O que fazer**:
- Title: `${title} | TheCryptoStart` (keyword-first format)
- Description: 155-160 chars com CTA ("Learn more...", "Discover...")
- Para homepage: incluir keyword principal (ex: "Crypto Academy for Beginners")
- Para categorias: incluir nome da categoria no title
- OpenGraph: og:type, og:image, og:title, og:description

**Padrão**:
```
Title (60 chars): "How to Qualify Crypto Airdrops | TheCryptoStart"
Description (155 chars): "Complete guide to finding and claiming crypto airdrops safely. Learn verification steps, avoid scams, and maximize your airdrop earnings."
```

---

#### Tarefa 18: Adicionar Breadcrumb Schema + FAQSchema
**Arquivo**: `lib/seo.ts`

**Descrição**: Completar Schema.org para SEO avançado

**O que fazer**:
- Já existe `generateBreadcrumbSchema()` - validar e usar
- Adicionar `generateFAQSchema()` para FAQ section na homepage
- Adicionar schema para Author em posts
- Usar em: app/page.tsx, app/blog/[slug]/page.tsx

---

#### Tarefa 19: Configurar Tailwind Typography Plugin
**Arquivo**: `tailwind.config.ts`

**Descrição**: Customizar prose classes para blog ideal

**O que fazer**:
- Estender tema: `typography` plugin
- Customizar: h1, h2, h3, p, blockquote, code, links
- Max-width: 65ch para parágrafo
- Colors: usar crypto-primary para links/highlights
- Spacing: gaps adequados

**Exemplo**:
```ts
typography: ({ theme }) => ({
  DEFAULT: {
    css: {
      maxWidth: '65ch',
      h2: { borderBottom: `1px solid ${theme('colors.gray.200')}` },
      // ... mais customizações
    }
  }
})
```

---

## 4️⃣ PLANO DE VERIFICAÇÃO

### Verificação por Tarefa

**Tarefas 1-5 (Componentes):**
- [ ] Arquivo criado em `components/`
- [ ] Tipos TypeScript definidos
- [ ] Component renderiza sem erros
- [ ] Tailwind classes aplicadas
- [ ] Responsive em mobile (sm:, md:)

**Tarefas 6-10 (Post Page):**
- [ ] Breadcrumb visível (Home > Blog > Cat > Post)
- [ ] Author info renderizado (avatar, name, date, reading time)
- [ ] Featured image 16:9 aspect ratio
- [ ] 3 ads aparecem sem erro
- [ ] Parágrafos em max-w-2xl ou 65ch
- [ ] Share buttons visível
- [ ] No console errors

**Tarefas 11-13 (Homepage):**
- [ ] Featured article grande (full-width section)
- [ ] Recent articles em grid 2-3 colunas
- [ ] 3 ads aparecem (top, middle, bottom)
- [ ] "View more articles" button funcional
- [ ] Responsive: 1 col mobile, 2 tablet, 3 desktop

**Tarefas 14-16 (Category Page):**
- [ ] Category header com titulo + descrição
- [ ] Sort dropdown funcionando
- [ ] Search input funcionando
- [ ] Sidebar aparecendo (lg screens)
- [ ] Pagination ou infinite scroll
- [ ] Trending/related sections populadas

**Tarefas 17-19 (SEO/Tech):**
- [ ] Meta descriptions: 155-160 chars
- [ ] Titles: keyword-first format
- [ ] Schema.org validando (sem erros estruturados)
- [ ] Breadcrumb schema renderizando
- [ ] Tailwind prose classes aplicadas

### Testes Funcionais

```
□ Post Page:
  □ Abrir /blog/[qualquer-slug]
  □ Breadcrumb visível
  □ Author info (avatar, name, date, reading time) visível
  □ Featured image aparece grande
  □ 3 ads aparecem em posições corretas
  □ ShareButtons visível
  □ RelatedPosts aparece no final
  □ Responsive: testar em mobile (320px), tablet (768px), desktop (1024px)
  □ Lighthouse > 90

□ Homepage:
  □ Abrir /
  □ Featured article >= 50% viewport
  □ Recent articles em grid correto
  □ Ads aparecem
  □ Categories section visual
  □ Newsletter visible
  □ Responsive mobile
  □ Lighthouse > 90

□ Category:
  □ Abrir /blog?category=bitcoin
  □ Category header visível
  □ Filters/search funcionando
  □ Grid de articles responsive
  □ Sidebar (lg screens)
  □ Pagination/infinite scroll
  □ Lighthouse > 85 (com ads)

□ SEO:
  □ Meta descriptions: abrir DevTools > Elements > <head>
  □ Verificar og: tags
  □ Schema.org: https://validator.schema.org/
  □ Google Search Console simulation (se possível)

□ Performance:
  □ npm run build (sem erros)
  □ Bundle size aceitável (check next.config)
  □ Images otimizadas (WebP/AVIF)
  □ Lazy loading funciona
  □ Core Web Vitals (PageSpeed): LCP < 2.5s, FID < 100ms, CLS < 0.1
```

### Metrics Esperados (Pós-Implementação)

| Métrica | Meta |
|---------|------|
| Bounce Rate | < 35% (era 50%) |
| Time on Page | 2.5+ min (era 1 min) |
| Lighthouse Performance | 90+ |
| Lighthouse UX | 90+ |
| Lighthouse SEO | 95+ |
| Meta descriptions | 100% coverage |
| Breadcrumb visual | Presente em 100% posts |
| Ads visibility | 3-5 por página |
| Mobile responsiveness | Perfeita em sm/md/lg |

---

## 5️⃣ RESULTADO ESPERADO

### Transformação Visual

#### POST PAGE ANTES (Problema):
```
[Hero Image Pequena]
[Título]
[8-12 linhas de texto denso]
[8-12 linhas de texto denso]
[8-12 linhas de texto denso]
[Sem breadcrumb, sem author, sem reading time]
[Sem ads]
[Related posts]
```

#### POST PAGE DEPOIS (Solução):
```
[HOME > BLOG > BITCOIN > POST] ← Breadcrumb
[🔷 BITCOIN | 👤 John Doe | 📅 Jan 15 | ⏱️ 8 min] ← Meta info
[Grande Hero Image 16:9]
[AD #1]
[Breadcrumb visual + Author Card no lado]
[= Parágrafo 1 (3-4 linhas max)]
[= Parágrafo 2 (3-4 linhas max)]
[> Blockquote estilizado]
[= Parágrafo 3 (3-4 linhas max)]
[AD #2]
[= H2 Heading com visual break]
[= Parágrafo 4]
[📌 Info box (tip/warning)]
[= Parágrafo 5]
[AD #3]
[AUTHOR CARD com avatar + bio]
[SHARE BUTTONS]
[RELATED POSTS]
```

### Métricas Finais

**SEO Score**: 5/10 → 8/10 (+3 pontos)
**UX Score**: 5/10 → 8.5/10 (+3.5 pontos)
**Bounce Rate**: 50% → 28% (-44%)
**Session Duration**: 1 min → 3.5 min (+250%)
**Lighthouse**: 70 → 92 (+22 pontos)
**Monthly Revenue**: $20-30 → $100-150 (5x melhor)

### Comportamento Esperado

✅ Usuários ficam mais tempo lendo (session duration +250%)
✅ Bounce rate cai drasticamente (menos saídas imediatas)
✅ Engajamento sobe (shares, comments)
✅ SEO melhora (breadcrumbs, metadata, schema)
✅ Monetização sobe (5x mais ads impressions)
✅ Mobile experience melhora (responsive, readable)
✅ Credibilidade aumenta (author info, professional design)

---

## 📝 NOTAS IMPORTANTES

### Dependências
- ✅ Todos os components necessários já estão no projeto
- ✅ Tailwind CSS configurado
- ✅ Contentful rich text já setup
- ✅ AdSense component pronto
- ✅ calculateReadingTime() function existe

### Conversões Necessárias
- `calculateReadingTime()` pode precisar de ajuste (aceitar conteúdo como param)
- Rich text options podem precisar de customização para spacing
- Category colors podem estar em `lib/constants.ts` ou hardcoded

### Riscos
- ⚠️ Adicionar muitos ads pode impactar Core Web Vitals (CLS)
- ⚠️ Imagens grandes sem otimização podem impactar LCP
- ⚠️ Rich text customization complexo

### Fallbacks
- Se richtext não renderizar corretamente: revisar `BLOCKS.PARAGRAPH` no renderer options
- Se ads não carregarem: validar ADSENSE_SLOTS em constants
- Se categories sem cores: usar default color #FF6B35

---

## 🚀 PRÓXIMOS PASSOS (PÓS-ANTIGRAVITY)

1. **Testes Locais**: `npm run dev` e validar cada tarefa
2. **Build Test**: `npm run build` (sem erros)
3. **Lighthouse**: PageSpeed Insights > 90
4. **Deploy Staging**: Testar em ambiente de staging
5. **A/B Testing**: Monitorar bounce rate, session duration
6. **Deploy Produção**: Git push + deploy automático

---

**PRONTO PARA EXECUTAR! 🚀**

Antigravity: Analisar `.context` do projeto, seguir tarefas 1-19 exatamente, testar cada uma, garantir responsiveness, validar no Lighthouse.

Objetivo: Transformar blog de 6.5/10 para 8.5/10 em layout/UX/SEO.
