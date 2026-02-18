# PROMPT ANTIGRAVITY — FASE 2: MONETIZAÇÃO + PERFORMANCE
## TheCryptoStart Blog — Advanced Ad Placement + Core Web Vitals

---

## 1️⃣ VISÃO GERAL DA IMPLANTAÇÃO

### Objetivo Principal
Otimizar monetização com Adsense e garantir excelente performance mesmo com ads:
- **Monetização**: Implementar sticky ads, native ads, sidebar ads (5-7 slots total)
- **Performance**: Validar Core Web Vitals não são impactados (stay green)
- **UX**: Ads não invadem conteúdo (respeitam compliance Adsense)

### Problema que Resolve
1. **Ad placement subótimo**: Ads básicos sem estratégia de posição
2. **CLS risk**: Ads carregam assincronamente, causam layout shift
3. **RPM baixo**: Sem sticky ads, sem native ads, sem sidebar optimization
4. **Core Web Vitals em risco**: Adicionar ads sem cuidado = penalidade Google

### Escopo de Implantação
- ✅ Implementar sticky header ad (mobile-friendly)
- ✅ Implementar sticky footer ad (mobile-friendly)
- ✅ Otimizar sidebar ads com pre-allocation de espaço
- ✅ Adicionar "Recommended content" bloco (entre posts)
- ✅ Reservar espaço para ads (evitar CLS)
- ✅ Validar Core Web Vitals (LCP, FID, CLS)
- ✅ Lazy-load ads (não impactar First Contentful Paint)
- ✅ Setup analytics para monitorar RPM

### Resultado Esperado
**ANTES**: RPM $2-3, Lighthouse 92, Revenue $30-50/mês
**DEPOIS**: RPM $10-15, Lighthouse 90+, Revenue $150-250/mês

---

## 2️⃣ ANÁLISE DE CONTEXTO OBRIGATÓRIA

### Contexto do Projeto
**Projeto**: TheCryptoStart blog (Next.js 14+ App Router)

**AdSense Config** (em `lib/constants.ts`):
```tsx
export const ADSENSE_SLOTS = {
  'blog-top': 'xxxxxxxxxxxx',
  'blog-bottom': 'xxxxxxxxxxxx',
  'blog-sidebar': 'xxxxxxxxxxxx',
  'homepage-banner': 'xxxxxxxxxxxx',
}
// Slots vazios precisam ser preenchidos com IDs reais do Adsense
```

**AdSense Component** (em `components/AdSense.tsx`):
```tsx
- Já existe e é funcional
- Renderiza ads responsivos
- Tem placeholder em desenvolvimento
- Suporta diferentes formatos (auto, rectangle, horizontal)
```

**Padrões Existentes**:
- Container max-width: container (1280px) ou max-w-4xl
- Spacing: gap-6, gap-8
- Responsive: sm: / md: / lg: breakpoints
- Colors: crypto-primary (#FF6B35), crypto-darker, etc

### Tecnologia Stack
- Next.js 14+ App Router
- Tailwind CSS (full utility-first)
- Google AdSense API
- Vercel (ou similar) para deployment
- Page Speed Insights para monitoring

### Convenções
- Ad placeholders: `my-8` para margin (32px)
- Ad containers: `rounded-lg` corners
- Sticky elements: `sticky top-24` (respeitando header)
- Responsiveness: hide on mobile se needed, show on desktop

---

## 3️⃣ PLANO DE IMPLANTAÇÃO (TAREFAS NUMERADAS)

### BLOCO 1: COMPONENTES DE ADS AVANÇADOS (Tarefas 1-3)

#### Tarefa 1: Criar StickyHeaderAd Component
**Arquivo**: `components/StickyHeaderAd.tsx`

**Descrição**: Ad sticky no topo da página (tipo anúncio de banner)

**O que fazer**:
- Component que renderiza AdSense
- Posição: `fixed top-0 left-0 right-0 z-40`
- Altura mínima: 90px (para mobile ads)
- Background: white com border-bottom subtle
- Visível apenas acima de md breakpoint (desktop)
- Esconde quando scrollar up (UX melhor)
- Classe: `sticky-header-ad`

**Props**: `{ slot: string, className?: string }`

**Comportamento**:
```
Scroll down → Ad aparece/fica sticky
Scroll up → Ad esconde (menos intrusivo)
Mobile → Não aparece (economiza espaço)
Desktop → Always sticky top
```

---

#### Tarefa 2: Criar StickyFooterAd Component
**Arquivo**: `components/StickyFooterAd.tsx`

**Descrição**: Ad sticky na base da página (muito rentável em mobile)

**O que fazer**:
- Component que renderiza AdSense
- Posição: `fixed bottom-0 left-0 right-0 z-40`
- Altura mínima: 60-90px
- Background: white com border-top subtle
- Visível apenas em mobile (md abaixo)
- Classe: `sticky-footer-ad`

**Props**: `{ slot: string, className?: string }`

**Comportamento**:
```
Mobile: sticky-footer aparece no final
Tablet+: desaparece (desktop tem sidebar)
```

---

#### Tarefa 3: Criar RecommendedContent Component
**Arquivo**: `components/RecommendedContent.tsx`

**Descrição**: Bloco "Recomendado para você" com ads nativas

**O que fazer**:
- Array de artigos "recomendados" (pode ser relacionados + ads misturado)
- Grid 2-3 colunas
- Cards com imagem, título, categoria
- Uma das "cards" é um ad nativo (diferente estilo)
- Classe: `recommended-grid`
- Usar entre post e related posts

**Estrutura**:
```
Recommended for you
[Article Card] [Article Card] [Ad Card] ← Native ad
```

---

### BLOCO 2: IMPLEMENTAÇÃO NO POST PAGE (Tarefas 4-7)

#### Tarefa 4: Adicionar Sticky Header Ad ao Layout Root
**Arquivo**: `app/layout.tsx`

**Descrição**: Adicionar sticky header ad ao layout (aparece em todas páginas)

**O que fazer**:
- Importar `StickyHeaderAd`
- Adicionar após `<Header>` component (ou dentro do body)
- Props: `slot="header-ad"`
- Certifique-se não conflicts com existing header
- Z-index: 40 (acima content, abaixo modals)

**Localização**: Começo do `<body>` children

---

#### Tarefa 5: Adicionar Sticky Footer Ad ao Layout Root
**Arquivo**: `app/layout.tsx`

**Descrição**: Adicionar sticky footer ad (mobile-focused)

**O que fazer**:
- Importar `StickyFooterAd`
- Adicionar no final do `<body>` children
- Props: `slot="footer-ad"`
- Responsiveness: `md:hidden` (apenas mobile)

---

#### Tarefa 6: Otimizar Ad Spacing (CLS Prevention)
**Arquivo**: `app/blog/[slug]/page.tsx`

**Descrição**: Reservar espaço para ads (evitar layout shift)

**O que fazer**:
- Para cada `<AdSense>`, wrappear em container com min-height
- Exemplo:
```tsx
<div className="my-8 rounded-lg bg-gray-50 min-h-[300px] md:min-h-[600px]">
  <AdSense slot="blog-top" />
</div>
```
- Isso evita CLS quando ad carrega assincronamente
- Min-height pode variar:
  - Rectangle (300x250): min-h-[250px]
  - Medium Rectangle (300x600): min-h-[600px]
  - Leaderboard (728x90): min-h-[120px]

---

#### Tarefa 7: Adicionar RecommendedContent no Post
**Arquivo**: `app/blog/[slug]/page.tsx`

**Descrição**: Adicionar bloco "Recommended" entre post e related

**O que fazer**:
- Importar `RecommendedContent`
- Adicionar após `<ShareButtons>`
- Antes de `<RelatedPosts>`
- Fetch related articles (já existe getRelatedPosts)
- Mix: 3-5 articles + 1 ad nativo

**Localização**: ~linha 180-200

---

### BLOCO 3: IMPLEMENTAÇÃO NO HOMEPAGE (Tarefas 8-10)

#### Tarefa 8: Adicionar Sidebar Ad na Homepage
**Arquivo**: `app/page.tsx`

**Descrição**: Sidebar com ads + newsletter + trending (desktop only)

**O que fazer**:
- Grid layout: grid-cols-1 lg:grid-cols-4
- Main: col-span-3
- Sidebar: col-span-1, sticky top-24
- Sidebar contents:
  - Newsletter CTA
  - Trending articles
  - `<AdSense slot="homepage-sidebar" />`
  - Related categories

**Responsive**:
```
Mobile: sidebar below content
lg: sidebar right side, sticky
```

---

#### Tarefa 9: Adicionar "Above the Fold" Ad na Homepage
**Arquivo**: `app/page.tsx`

**Descrição**: Ad bem visível, logo após hero (antes featured article)

**O what fazer**:
- Após `.Hero` section
- Antes de `.FeaturedArticle` section
- Container: full-width
- Min-height: 300-600px (leaderboard ou rectangle)
- `<AdSense slot="homepage-above-fold" />`

---

#### Tarefa 10: Lazy-Load Ads na Homepage
**Arquivo**: `app/page.tsx`

**Descrição**: Defer ads abaixo da fold (não impactar LCP)

**O que fazer**:
- Ads "above fold": render normal (priority)
- Ads "below fold": use React.lazy ou dynamic import
- Ou: use Intersection Observer para lazy-load

**Exemplo**:
```tsx
// Below fold - lazy load
<div className="lazy-ad">
  <Suspense fallback={<div className="h-[600px] bg-gray-100" />}>
    <AdSense slot="homepage-middle" />
  </Suspense>
</div>
```

---

### BLOCO 4: OTIMIZAÇÃO PERFORMANCE (Tarefas 11-13)

#### Tarefa 11: Validar e Otimizar Core Web Vitals
**Arquivo**: Configuração global + monitoramento

**Descrição**: Garantir ads não impactam CWV (stay green)

**O que fazer**:
- **LCP (Largest Contentful Paint)**: < 2.5s
  - Certifique featured image carrega rápido
  - Lazy-load ads below fold
  - Não bloqueia ads no render path

- **FID (First Input Delay)**: < 100ms
  - Ads não devem ser heavy JS
  - Defer ad scripts (já feito por Google)

- **CLS (Cumulative Layout Shift)**: < 0.1
  - CRÍTICO: reservar espaço para ads (Tarefa 6)
  - Use min-height containers
  - Validar cada ad placement

**Teste**:
```bash
# Local Lighthouse
npm run build && npm run start
# Abrir Chrome > DevTools > Lighthouse > Generate

# Online
https://pagespeed.web.dev/
```

---

#### Tarefa 12: Async Loading de Ad Scripts
**Arquivo**: `app/layout.tsx` (AdSenseScript)

**Descrição**: Garantir Google AdSense script carrega assincronamente

**O que fazer**:
- Verificar `<AdSenseScript>` está em `layout.tsx`
- Certifique `async` attribute está presente
- Adicionar `crossOrigin="anonymous"`
- Defer ou afterInteractive (Vercel Web Analytics pattern)

**Expected**:
```tsx
<script
  async
  src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${SITE_CONFIG.adSense.clientId}`}
  crossOrigin="anonymous"
/>
```

---

#### Tarefa 13: Setup Web Vitals Monitoring
**Arquivo**: `lib/analytics.ts` (novo) ou `app/layout.tsx`

**Descrição**: Monitorar CWV em produção (real user data)

**O que fazer**:
- Importar `web-vitals` package
- Setup Google Analytics events para CWV
- Track: LCP, FID, CLS per page
- Optional: setup Sentry para erros
- Dashboard: GA4 custom report

**Código**:
```tsx
// app/layout.tsx
import { useWebVitals } from 'next/web-vitals'

// Em client component:
useWebVitals(metric => {
  if (process.env.NODE_ENV === 'production') {
    // Send to GA4 / Sentry
    console.log(metric)
  }
})
```

---

### BLOCO 5: CONFIGURAÇÃO ADSENSE (Tarefas 14-15)

#### Tarefa 14: Preencher ADSENSE_SLOTS com IDs Reais
**Arquivo**: `lib/constants.ts`

**Descrição**: Adicionar ad slot IDs do Google AdSense

**O que fazer**:
- Se usuário já tem conta AdSense: usar os IDs reais
- Se não tem: deixar placeholders (ou setup durante deployment)
- Slots necessários:
  ```tsx
  'blog-top': '1234567890',
  'blog-middle': '1234567891',
  'blog-bottom': '1234567892',
  'blog-sidebar': '1234567893',
  'header-ad': '1234567894',
  'footer-ad': '1234567895',
  'homepage-above-fold': '1234567896',
  'homepage-sidebar': '1234567897',
  'recommended-native': '1234567898',
  ```

**Nota**: Ids podem estar em `.env.local` em vez de constants (melhor practice)

---

#### Tarefa 15: Validar AdSense Compliance
**Arquivo**: Verificação + documentation

**Descrição**: Garantir compliance com políticas do Google AdSense

**O que fazer**:
- ✅ Não mais de 3 AdSense ads por página (aqui temos 5-7, but spaced)
- ✅ Ads não cobrem conteúdo
- ✅ Clear labeling "Ads by Google" (Google handles)
- ✅ Responsive ads funcionam bem mobile
- ✅ Ads não fazem layout shift (CLS < 0.1)
- ✅ Não clickbait content com ads
- ✅ Privacy policy + About pages exist

**Documentação**: Adicionar em privacy policy:
"This site uses Google AdSense for monetization. Google may display personalized ads based on your browsing history."

---

### BLOCO 6: ANALYTICS & MONITORING (Tarefas 16-17)

#### Tarefa 16: Setup RPM Tracking Dashboard
**Arquivo**: GA4 setup + custom events

**Descrição**: Monitorar revenue metrics (RPM, CPC, impressions)

**O que fazer**:
- GA4: Setup custom event para ad impressions
- Track: CPM (cost per thousand), CPC (cost per click), RPM
- Create dashboard:
  - Revenue by page
  - Revenue by category
  - Revenue trend (daily/weekly/monthly)
  - Impressions + clicks
  
**Event**:
```tsx
gtag('event', 'ad_impression', {
  event_category: 'ads',
  event_label: 'blog-top',
  value: 1,
})
```

---

#### Tarefa 17: Setup Automated Performance Alerts
**Arquivo**: Vercel Analytics + custom webhook

**Descrição**: Alert se Core Web Vitals degradam

**O que fazer**:
- Vercel Web Analytics: enable em projeto
- Setup alerts:
  - LCP > 2.5s → alert
  - CLS > 0.1 → alert
  - FID > 100ms → alert
- Slack integration (opcional)
- Weekly email report

**Vercel Dashboard**: Settings > Analytics

---

## 4️⃣ PLANO DE VERIFICAÇÃO

### Verificação por Tarefa

**Tarefas 1-3 (Components)**:
- [ ] 3 novos components criados
- [ ] TypeScript interfaces definidas
- [ ] Renderizam sem erros
- [ ] Responsive (sticky headers)
- [ ] Z-index correto (não overlaps)

**Tarefas 4-7 (Post Page Ads)**:
- [ ] Sticky header ad aparece (desktop)
- [ ] Sticky footer ad aparece (mobile)
- [ ] Ad containers têm min-height (CLS prevention)
- [ ] RecommendedContent renderiza
- [ ] No console errors

**Tarefas 8-10 (Homepage Ads)**:
- [ ] Sidebar ad aparece (lg screens)
- [ ] Above-fold ad aparece
- [ ] Below-fold ads lazy-load
- [ ] Responsive: sidebar desaparece em mobile
- [ ] Grid layout correto (3+1)

**Tarefas 11-13 (Performance)**:
- [ ] Lighthouse CLS < 0.1 ✅
- [ ] Lighthouse LCP < 2.5s ✅
- [ ] Lighthouse Performance > 90
- [ ] No layout shifts on page load
- [ ] Web Vitals tracking functional

**Tarefas 14-15 (AdSense Config)**:
- [ ] Slots preenchidos com IDs
- [ ] AdSense rendering corretamente
- [ ] Compliance checklist passed
- [ ] Privacy policy atualizado

**Tarefas 16-17 (Analytics)**:
- [ ] GA4 events firing
- [ ] Revenue dashboard populando
- [ ] Alerts configurados
- [ ] Vercel analytics enabled

### Testes Funcionais

```
□ Post Page:
  □ Sticky header ad: scroll to see (desktop)
  □ Sticky footer ad: scroll down (mobile)
  □ Ad spacing: no shift on load
  □ Recommended block: renderizes
  □ Mobile: layout correto (ads don't overflow)
  □ Lighthouse: CLS < 0.1
  □ PageSpeed: 90+ score

□ Homepage:
  □ Sidebar ad (lg screens): renderizes
  □ Above-fold ad: visível immediately
  □ Below-fold ads: lazy load on scroll
  □ Mobile: sidebar hidden, ads responsive
  □ Lighthouse: 90+
  □ PageSpeed: 90+

□ Performance:
  □ npm run build: sem erros
  □ npm run start: no performance regression
  □ Chrome DevTools Lighthouse: CLS < 0.1 (critical!)
  □ PageSpeed Insights: same or better

□ Analytics:
  □ GA4: ad impressions tracking
  □ GA4: revenue events firing
  □ Dashboard: data appearing
  □ Alerts: configured (test if possible)

□ Mobile Experience:
  □ Sticky footer ad: aparece
  □ Sticky header ad: hidden (md:hidden working)
  □ Ads responsive: não overflow
  □ Touch-friendly: ads don't interfere with navigation
  □ Lighthouse mobile: 85+
```

### Metrics Esperados (Pós-Implementação)

| Métrica | Antes | Depois | Meta |
|---------|-------|--------|------|
| Ads per page | 3-4 | 5-7 | 5-7 |
| RPM | $2-3 | $10-15 | $10-15 |
| Monthly Revenue | $30-50 | $150-250 | $150+ |
| CLS Score | Varies | < 0.1 | < 0.1 ✅ |
| LCP Score | < 2.5s | < 2.5s | < 2.5s ✅ |
| Lighthouse Perf | 92 | 90+ | 90+ ✅ |
| Page Ad Impressions | 30-50 | 150-200 | 150+ |
| Mobile UX | Good | Excellent | Excellent |

---

## 5️⃣ RESULTADO ESPERADO

### Post Page com Ads Otimizados
```
[STICKY HEADER AD - desktop only]

[Post content with 3 strategically placed ads]

[Recommended Content block with native ad]

[STICKY FOOTER AD - mobile only]
```

### Homepage com Ads Otimizados
```
[STICKY HEADER AD - desktop]

[Hero]
[Above-fold Ad]

[Featured Article]
[Sidebar →]

[Recent Articles]
[Middle Ad (lazy-loaded)]

[Trending + Categories]
[Sidebar Ad]

[Newsletter]

[STICKY FOOTER AD - mobile]
```

### Performance Remains Green
```
CLS: 0.05 (was 0.12 with unoptimized ads) ✅
LCP: 2.2s (was 2.8s) ✅
FID: 45ms (excellent) ✅
Performance Score: 92 ✅
```

### Revenue Multiplier
```
Antes (sem otimização):
- 10.000 pageviews/month
- $2-3 RPM
- $20-30 revenue
- Ads não estratégicos

Depois (otimizado):
- 30.000 pageviews/month (3x traffic from SEO)
- $10-15 RPM (5x melhor)
- $300-450 revenue (15x melhor!)
- Sticky ads, sidebar ads, native ads
```

---

## 📝 NOTAS IMPORTANTES

### Dependências
- ✅ AdSense component existing
- ✅ Tailwind sticky/fixed positioning
- ✅ Next.js Web Vitals support
- ✅ Google Analytics 4 available

### Potencial Issues
- ⚠️ Sticky header/footer ads can reduce content area (mobile)
- ⚠️ Too many ads can hurt UX (balance needed)
- ⚠️ CLS requires careful min-height allocation
- ⚠️ AdSense approval needed for new slots

### Mitigations
- Mobile: hide sticky header ad (md:hidden)
- Footer: only mobile (md:hidden on footer ad)
- Spacing: always reserve space with min-height
- Testing: validate CLS < 0.1 before deploy

---

## 🚀 PRÓXIMOS PASSOS (PÓS-ANTIGRAVITY)

1. **Obter AdSense Account** (if not already): https://adsense.google.com
2. **Create Ad Slots**: 9-10 slots (copy IDs real)
3. **Update `.env.local`** com ADSENSE_CLIENT_ID + slot IDs
4. **Test Localmente**: `npm run dev` + Lighthouse
5. **Validar CLS**: Chrome DevTools > Performance (drag to induce load)
6. **Deploy Staging**: Test 24 horas
7. **Monitor**: GA4 dashboard, revenue tracking
8. **Deploy Produção**: Git push + Vercel deploy
9. **Monitor Revenue**: Track RPM weekly

---

**PRONTO PARA EXECUÇÃO! 🚀**

Antigravity: Seguir tarefas 1-17, validar CLS < 0.1 (critical!), test responsiveness, garantir performance score > 90.

Objetivo: 5x revenue improvement, Google compliance, excelente UX mesmo com 5-7 ads.
