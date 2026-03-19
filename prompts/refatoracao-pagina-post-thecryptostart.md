# 🚀 Prompt de Implantação — Refatoração da Página de Post (UI/UX + AdSense + E-E-A-T)
**Projeto:** TheCryptoStart  
**Ferramenta:** Antigravity  
**Escopo:** Refatoração completa da página individual de artigo  
**Prioridade:** Alta  

---

## 1. Visão Geral da Implantação

### Objetivo
Refatorar a página de artigo individual do TheCryptoStart com foco em quatro frentes:

1. **Hero do artigo** — Reduzir altura excessiva, adicionar imagem featured, metadados e layout em duas colunas
2. **Layout com sidebar** — Introduzir sidebar sticky com slots AdSense e Table of Contents (TOC)
3. **AdSense in-content** — Inserir blocos de anúncio estratégicos dentro do corpo do artigo
4. **E-E-A-T e engajamento** — Fortalecer author box, breadcrumb, artigos relacionados e schema markup

### Problema que resolve
A página de post atual apresenta:
- Hero com altura de viewport inteira desperdiçando conteúdo above-the-fold
- Sem imagem featured visível no topo (só gradiente genérico)
- Metadados de autor/data/tempo de leitura ausentes ou pouco visíveis
- Layout coluna única sem sidebar — perda do slot AdSense de maior RPM
- Sem Table of Contents para artigos longos — bounce rate elevado
- Sem in-content ads no corpo do artigo — principal oportunidade de monetização não explorada
- Author box e artigos relacionados com design insuficiente para E-E-A-T

### Escopo
- Arquivo de rota da página de artigo (ex: `app/[slug]/page.tsx`, `app/blog/[slug]/page.tsx`)
- Componentes de layout do post (hero, body, sidebar, author, related)
- Componente AdSense existente — extensão para novos slots
- Nenhuma alteração em banco de dados, autenticação ou APIs de conteúdo

---

## 2. Análise de Contexto Obrigatória

> ⚠️ **Antes de qualquer implementação, o Antigravity DEVE executar todas as etapas abaixo.**

### 2.1 Análise do repositório
- Ler o arquivo `.context` do projeto (raiz e subpastas)
- Localizar o arquivo de rota da página de artigo individual
- Mapear todos os componentes usados nessa página atualmente
- Identificar como os dados do artigo são buscados (server component, API route, Prisma query)
- Verificar se já existe componente de sidebar, TOC ou progress bar

### 2.2 Componentes a mapear obrigatoriamente

| Componente esperado | O que verificar |
|---|---|
| `ArticleHero` / `PostHeader` | Props recebidas: título, excerpt, imagem, categoria, autor, data |
| `ArticleBody` / `PostContent` | Como o markdown/HTML é renderizado, classes aplicadas |
| `ArticleSidebar` | Existe? Se sim, o que contém? |
| `TableOfContents` / `TOC` | Existe? É sticky? Gerado dinamicamente do conteúdo? |
| `AuthorBox` / `AuthorCard` | Existe? Quais dados do autor exibe? |
| `RelatedArticles` | Existe? Como seleciona os artigos relacionados? |
| `AdSenseBlock` / `AdUnit` | Slots disponíveis, como é invocado, responsividade |
| `ReadingProgressBar` | Existe? |
| Schema/JSON-LD do artigo | Existe? Quais tipos: Article, BreadcrumbList, FAQPage? |

### 2.3 Padrões a respeitar
- Stack: Next.js + TypeScript + Tailwind CSS
- Sistema de cores existente (dark/laranja do TheCryptoStart)
- Padrão Server Components vs Client Components (sidebar com TOC provavelmente precisa ser Client)
- Não quebrar renderização de markdown/MDX existente
- Respeitar largura máxima de conteúdo do projeto (`max-w-*` do Tailwind)

---

## 3. Plano de Implantação

### Tarefa 1 — Refatoração do Hero do artigo
**O que fazer:**
- Reduzir a altura máxima do hero para entre **380px e 440px em desktop**
- Implementar layout de **duas colunas no hero**:
  - Coluna esquerda (~60%): badge de categoria + H1 + excerpt + metadados
  - Coluna direita (~40%): imagem featured do artigo com `aspect-ratio: 16/9` e `object-fit: cover`
- Adicionar metadados obrigatórios visíveis no hero:
  - Avatar + nome do autor (linkado para página/bio do autor)
  - Data de publicação formatada (ex: "March 15, 2026")
  - Tempo estimado de leitura (ex: "8 min read")
  - Número de visualizações (se disponível no modelo de dados)
- Em **mobile**: layout coluna única — imagem em cima, metadados e título abaixo
- Background: manter o dark gradient, mas garantir que a imagem featured seja exibida (com overlay dark se necessário para legibilidade)

**Critério de conclusão:** Hero renderiza com ≤440px de altura em desktop, imagem featured visível, todos os metadados presentes

---

### Tarefa 2 — Implementar layout com sidebar
**O que fazer:**
- Reestruturar o layout da página de artigo para **duas colunas**:
  - **Coluna principal** (conteúdo): `max-w` adequado para legibilidade (~680-720px, ~65-72 chars por linha)
  - **Sidebar direita**: largura fixa de 300px, com `position: sticky` a partir de um offset do topo
- A sidebar deve conter (de cima para baixo):
  1. **Table of Contents** (TOC) — gerado dinamicamente dos headings H2/H3 do artigo
  2. **Ad Unit** — slot `article-sidebar-top` (300x250)
  3. **Ad Unit** — slot `article-sidebar-bottom` (300x600) abaixo do TOC
- Em **mobile e tablet** (< 1024px): sidebar colapsa, TOC vira accordion no topo do conteúdo
- A sidebar deve ser um **Client Component** para suportar highlight de seção ativa no TOC

**Critério de conclusão:** Layout dois colunas em desktop, sidebar sticky funcional, sidebar colapsada em mobile

---

### Tarefa 3 — Table of Contents (TOC) dinâmico
**O que fazer:**
- Criar componente `TableOfContents` que:
  - Extrai automaticamente todos os headings H2 e H3 do conteúdo do artigo
  - Gera lista de links âncora com scroll suave (`scroll-behavior: smooth`)
  - Destaca visualmente o heading da seção atualmente visível na viewport (usando `IntersectionObserver`)
  - Mostra hierarquia visual: H2 normal, H3 com indent
- Adicionar `id` automático nos headings H2/H3 renderizados no corpo do artigo (se não existir)
- Estilo deve seguir o design system do projeto (cores, tipografia)

**Critério de conclusão:** TOC exibe todos os H2/H3, links funcionam, seção ativa é destacada ao rolar

---

### Tarefa 4 — In-content AdSense no corpo do artigo
**O que fazer:**
- Inserir blocos AdSense em **3 posições estratégicas** dentro do corpo do artigo:
  1. **Após o 2º parágrafo** — slot `article-in-content-top` (responsivo, largura do conteúdo)
  2. **No meio do artigo** (após ~50% do conteúdo) — slot `article-in-content-mid` (responsivo)
  3. **Antes da seção de artigos relacionados** — slot `article-in-content-bottom` (responsivo)
- Cada slot deve ter:
  - Label discreta acima: "Advertisement" ou "Publicidade" (exigência do AdSense)
  - Altura mínima definida para não colapsar quando não renderizar
  - Fallback de conteúdo quando o slot não carrega (ex: card de artigo relacionado)
- A inserção dos blocos deve ser feita de forma programática, **não manual no markdown**

**Critério de conclusão:** 3 slots in-content presentes, label de anúncio visível, fallback funcional

---

### Tarefa 5 — Barra de progresso de leitura
**O que fazer:**
- Criar componente `ReadingProgressBar` que:
  - Exibe uma barra fina (3-4px) fixada no topo da página, abaixo da navbar
  - Cor: laranja principal do projeto
  - Largura da barra aumenta proporcionalmente ao scroll (0% no topo, 100% no fim do artigo)
  - Deve ser um Client Component com `useEffect` + `scroll event listener`
- Aplicar apenas na rota de artigo, não na homepage

**Critério de conclusão:** Barra de progresso aparece e anima corretamente ao rolar o artigo

---

### Tarefa 6 — Author Box aprimorado
**O que fazer:**
- Posicionar o Author Box **abaixo do corpo do artigo**, antes dos artigos relacionados
- O Author Box deve conter:
  - Foto do autor (avatar circular, 80x80px mínimo)
  - Nome completo linkado
  - Cargo/especialidade (ex: "Bitcoin Trader & Alpha Hunter")
  - Bio curta (2-3 linhas)
  - Links de redes sociais (Twitter/X, LinkedIn se disponíveis)
  - Número de artigos publicados (se disponível no modelo)
- Adicionar também um **author box compacto no hero** (avatar pequeno + nome + data)
- Verificar se os dados do autor estão disponíveis na query atual e adicionar os campos faltantes à query se necessário

**Critério de conclusão:** Author box completo abaixo do artigo com foto, bio e links sociais

---

### Tarefa 7 — Artigos Relacionados com design aprimorado
**O que fazer:**
- Manter a seção de artigos relacionados no fim do artigo
- Redesenhar os cards para exibir:
  - Imagem thumbnail (obrigatório)
  - Badge de categoria
  - Título (máximo 2 linhas, truncado com `line-clamp-2`)
  - Tempo de leitura
  - Nome do autor
- Grid: **3 colunas em desktop**, 2 em tablet, 1 em mobile
- Mínimo 3 artigos relacionados, máximo 4
- Lógica de seleção: mesma categoria prioritariamente, depois mais recentes

**Critério de conclusão:** Grid de 3 artigos relacionados com imagem, categoria, título e metadados

---

### Tarefa 8 — Breadcrumb visual e schema
**O que fazer:**
- Adicionar breadcrumb visual no topo da página (acima do hero), com links:  
  `Home > [Categoria] > [Título do artigo truncado]`
- Verificar se já existe schema `BreadcrumbList` JSON-LD — se não, criar
- Verificar se já existe schema `Article` JSON-LD — se não, criar com campos:
  - `headline`, `description`, `image`, `author`, `datePublished`, `dateModified`, `publisher`
- Verificar se existe schema `FAQPage` — se o artigo tiver FAQ, incluir automaticamente

**Critério de conclusão:** Breadcrumb visual presente, schemas Article e BreadcrumbList no `<head>`

---

### Tarefa 9 — Verificação de responsividade e performance
**O que fazer:**
- Testar a página de artigo nas breakpoints: 390px (mobile), 768px (tablet), 1280px (desktop), 1440px (wide)
- Em mobile:
  - Hero coluna única (imagem acima do título)
  - Sidebar ausente, TOC como accordion antes do conteúdo
  - In-content ads com largura 100%
  - Author box empilhado verticalmente
- Garantir que a imagem featured use `next/image` com `priority` (LCP)
- Garantir que os in-content ads usem `loading="lazy"`
- Verificar que a leitura do artigo não sofre overflow horizontal em nenhuma breakpoint

**Critério de conclusão:** Sem erros visuais nas 4 breakpoints, imagem featured com `priority`

---

## 4. Plano de Verificação

### Frontend
- [ ] Hero com altura ≤440px em desktop (1440px)
- [ ] Imagem featured visível no hero (coluna direita desktop, topo mobile)
- [ ] Metadados completos no hero: autor, data, tempo de leitura
- [ ] Layout duas colunas em desktop (conteúdo + sidebar)
- [ ] Sidebar sticky funcional
- [ ] TOC gerado dinamicamente com highlight de seção ativa
- [ ] 3 slots AdSense in-content presentes com label "Advertisement"
- [ ] Fallback nos slots AdSense quando não renderizam
- [ ] Barra de progresso de leitura funcional
- [ ] Author box completo com foto, bio e links sociais
- [ ] Grid de 3 artigos relacionados com imagem e metadados
- [ ] Breadcrumb visual presente e linkado
- [ ] Responsividade validada nas 4 breakpoints

### Dados
- [ ] Query do artigo retorna dados do autor (foto, bio, social links)
- [ ] Query retorna artigos relacionados por categoria
- [ ] Imagem featured sendo retornada e renderizada via `next/image`

### Schema / SEO
- [ ] Schema `Article` presente no `<head>` com campos completos
- [ ] Schema `BreadcrumbList` presente no `<head>`
- [ ] IDs de âncora nos headings H2/H3 do artigo

### AdSense
- [ ] Slots com IDs semânticos: `article-sidebar-top`, `article-sidebar-bottom`, `article-in-content-top`, `article-in-content-mid`, `article-in-content-bottom`
- [ ] Label "Advertisement" visível acima de cada slot
- [ ] Altura mínima definida em todos os slots
- [ ] Fallback ativo quando slot não carrega

---

## 5. Resultado Esperado

### Comportamento final da página de artigo
- Usuário acessa o artigo e imediatamente vê: título, imagem, categoria, autor e tempo de leitura — tudo above-the-fold
- Hero compacto permite que o início do conteúdo fique próximo da dobra
- TOC na sidebar permite navegar pelo artigo longo sem se perder
- Barra de progresso de leitura reforça engajamento
- Anúncios aparecem de forma natural entre seções, sem espaços vazios
- Ao final, author box reforça credibilidade e artigos relacionados reduzem bounce rate

### Impacto no usuário
- Melhor orientação no artigo (TOC + progress bar)
- Percepção de maior qualidade e autoridade (author box, metadados)
- Experiência sem "buracos" visuais de anúncios não carregados

### Impacto no sistema
- RPM significativamente maior: sidebar ads (maior CTR) + 3 in-content ads por artigo
- Melhoria de E-E-A-T com schema Article completo e author box
- Redução de bounce rate via artigos relacionados e TOC

---

## 6. Restrições e Alertas

> ⚠️ **Não alterar:**
> - Sistema de renderização de markdown/MDX do corpo do artigo (apenas envolver com lógica de inserção de ads)
> - Queries de banco de dados existentes (apenas estender para trazer campos faltantes do autor)
> - Sistema de autenticação e rotas de admin
> - Homepage e outros componentes não relacionados à página de artigo

> ⚠️ **Atenção especial:**
> - `TableOfContents` e `ReadingProgressBar` devem ser **Client Components** (`"use client"`)
> - A página de artigo em si pode permanecer como **Server Component** — apenas os subcomponentes interativos são Client
> - Imagem featured deve usar `<Image priority />` do `next/image` para otimização de LCP
> - Não duplicar schemas JSON-LD se já existirem — verificar antes de criar
> - Sidebar ads (300x600) não devem ser renderizados em mobile para não impactar performance

---

*Prompt gerado para execução via Antigravity — TheCryptoStart v2026*
