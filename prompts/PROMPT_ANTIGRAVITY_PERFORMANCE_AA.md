# PROMPT ANTIGRAVITY — PERFORMANCE GRADE AA (PageSpeed + GTmetrix)
## TheCryptoStart Blog — Alcançar 95+ Performance com Core Web Vitals Otimizados

---

## 🎯 OBJETIVO

Atingir **Grade AA** em PageSpeed Insights e GTmetrix:
- ✅ PageSpeed: 95+ (Performance), 95+ (Accessibility), 95+ (Best Practices), 100 (SEO)
- ✅ GTmetrix: A (< 1s Load), A (< 1s FCP)
- ✅ Core Web Vitals: LCP < 2.5s, FID < 100ms, CLS < 0.1
- ✅ Responsiveness: 320-1920px perfeito

---

## 📋 44 TAREFAS ESTRUTURADAS

### BLOCO 1: IMAGE OPTIMIZATION (8 Tarefas)

#### Tarefa 1: Otimizar FeaturedImage
- Add `priority={priority}` param
- Add `sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1000px"`
- Add `quality={85}`
- Add `loading={priority ? 'eager' : 'lazy'}`

#### Tarefa 2: Otimizar BlogCardCompact
- Add `sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"`
- Add `loading="lazy"`
- Ensure width/height are set

#### Tarefa 3: Otimizar CategoryCard
- Se emoji: OK. Se image: aplicar Tarefa 2 pattern

#### Tarefa 4: Priority para Hero Images
- `app/page.tsx`: featured post → priority={true}
- `app/blog/[slug]/page.tsx`: post hero → priority={true}

#### Tarefa 5: Remove Images Desnecessárias
- Verificar Sidebar.tsx
- Verificar RelatedPosts
- Remover se não essencial

#### Tarefa 6: AdSense Aspect Ratios
- Todos containers ad tem aspect-ratio ou min-height
- Previne Cumulative Layout Shift (CLS)

#### Tarefa 7: Todas Imagens com <Image>
- Find: grep "<img" app/ components/
- Replace: <Image> com sizes, loading, quality

#### Tarefa 8: Configurar next.config.mjs
```javascript
images: {
  domains: ['images.ctfassets.net'],
  formats: ['image/avif', 'image/webp'],
  deviceSizes: [320, 640, 750, 1080, 1280, 1536],
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  minimumCacheTTL: 31536000,
}
```

---

### BLOCO 2: FONT OPTIMIZATION (5 Tarefas)

#### Tarefa 9: Preload Google Fonts
- Add link rel=preload em app/layout.tsx
- Fonts: Montserrat, Open Sans

#### Tarefa 10: Subset Fonts
- weight: ['400', '700', '900'] para Montserrat
- weight: ['400', '600'] para Open Sans
- subsets: ['latin'] only

#### Tarefa 11: System Fonts Fallback
- tailwind.config.ts:
  - fontFamily.heading: ['var(--font-montserrat)', 'system-ui', 'sans-serif']
  - fontFamily.body: ['var(--font-open-sans)', 'system-ui', 'sans-serif']

#### Tarefa 12: Remove Unused Weights
- Verificar quais weights realmente usado
- Keep: 400, 600, 700, 900 only

#### Tarefa 13: Variable Font (Optional)
- Se Google Fonts tiver "variable", trocar
- Reduz de 3 files para 1

---

### BLOCO 3: LAZY LOADING & SUSPENSE (7 Tarefas)

#### Tarefa 14: Dynamic Import - SocialComments
```typescript
const SocialComments = dynamic(() => import('@/components/SocialComments'), {
  loading: () => <div className="py-20">Loading discussion...</div>,
  ssr: false,
})
```
- app/blog/[slug]/page.tsx

#### Tarefa 15: Dynamic Import - RelatedPosts
```typescript
const RelatedPosts = dynamic(() => import('@/components/RelatedPosts'), {
  loading: () => <div className="py-12">Loading...</div>,
})
```

#### Tarefa 16: Lazy Load - TableOfContents
```typescript
'use client'
const [mounted, setMounted] = useState(false)
useEffect(() => setMounted(true), [])
if (!mounted) return null
```

#### Tarefa 17: Lazy Load - ShareButtons
- Same pattern como Tarefa 16
- Load após hydration

#### Tarefa 18: Lazy Load - AdSense
- Same pattern
- Load após user interação se possível

#### Tarefa 19: Lazy Load - CommentsList
- Use Intersection Observer
- Load só quando próximo à viewport

#### Tarefa 20: Suspense Boundaries
- app/blog/[slug]/page.tsx
- Wrap RelatedPosts, SocialComments em Suspense
- Fallback skeletons

---

### BLOCO 4: JAVASCRIPT & CSS OPTIMIZATION (8 Tarefas)

#### Tarefa 21: Bundle Analyzer
```javascript
// next.config.mjs
import { BundleAnalyzerPlugin } from '@next/bundle-analyzer'
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})
export default withBundleAnalyzer(nextConfig)
```

#### Tarefa 22: Tree-shake Unused
- Rodar ANALYZE=true npm run build
- Remove large unused deps

#### Tarefa 23: Optimize lib/utils.ts
- Separar em múltiplos arquivos se > 5KB
- strings.ts, dates.ts, calculations.ts

#### Tarefa 24: Memoize Calculations
- calculateReadingTime: memoize
- Evitar recalcular

#### Tarefa 25: Remove Unused CSS
- tailwind.config.ts: content paths corretos
- Purge unused classes

#### Tarefa 26: Optimize Tailwind
- Remove unused breakpoints
- Remove unused colors
- Keep apenas usado

#### Tarefa 27: Defer Non-Critical JS
```typescript
// app/layout.tsx
<Script
  src="https://www.googletagmanager.com/gtag/js?id=..."
  strategy="afterInteractive"
/>
<Script
  async
  src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"
  strategy="lazyOnload"
/>
```

#### Tarefa 28: Code Splitting
- FAQ, TrendingList, etc → dynamic imports
- Loadingcomponent para cada

---

### BLOCO 5: CACHING & CDN (6 Tarefas)

#### Tarefa 29: Configure ISR
- app/page.tsx: export const revalidate = 3600
- app/blog/[slug]/page.tsx: revalidate = 86400
- app/blog/page.tsx: revalidate = 1800

#### Tarefa 30: Cache Headers
```javascript
// next.config.mjs
headers: async () => [{
  source: '/:path*.webp',
  headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
}]
```

#### Tarefa 31: Setup PWA (Optional)
```bash
npm install next-pwa
```
- next.config.mjs: withPWA(nextConfig)

#### Tarefa 32: CDN Setup
- Deploy em Vercel (automático)
- Ou Cloudflare Workers

#### Tarefa 33: Stale-While-Revalidate
- API routes: 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=86400'

#### Tarefa 34: Database Query Caching
```typescript
// lib/contentful.ts
import { unstable_cache } from 'next/cache'
export const getCachedPosts = unstable_cache(
  async () => getAllPosts(),
  ['posts'],
  { revalidate: 3600 }
)
```

---

### BLOCO 6: CORE WEB VITALS (6 Tarefas)

#### Tarefa 35: Optimize LCP
- Priority images ✅
- Preload hero image
- Minimize render-blocking JS
- Remove unused fonts

#### Tarefa 36: Optimize FID
- Code splitting ✅
- Lazy components ✅
- Minimize main thread
- Break long tasks

#### Tarefa 37: Optimize CLS
- Aspect-ratio em TODAS images
- Min-height em TODOS ads
- Skeleton loaders com altura correta
- Font-display: swap

#### Tarefa 38: Monitor Web Vitals
```typescript
// app/layout.tsx
'use client'
import { onCLS, onFID, onLCP } from 'web-vitals'
onCLS(m => console.log('CLS:', m.value))
onFID(m => console.log('FID:', m.value))
onLCP(m => console.log('LCP:', m.value))
```

#### Tarefa 39: Setup Analytics
- Send Web Vitals to GA4
- Track Performance metrics

#### Tarefa 40: Mobile Performance Test
- Test em 4G slow
- Test em Mid-range Android
- Chrome DevTools Lighthouse

---

### BLOCO 7: RESPONSIVENESS (4 Tarefas)

#### Tarefa 41: Mobile Design Review
- Test: 320px, 768px, 1024px, 1440px
- [ ] Texto readable
- [ ] Botões touchable (48px)
- [ ] Images scale correto
- [ ] Sidebar hidden mobile
- [ ] Sem horizontal scroll

#### Tarefa 42: Fix Mobile Layout
- Sidebar: className="hidden lg:block"
- Grids: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- Padding: px-4 md:px-8 lg:px-12

#### Tarefa 43: Touch Interactions
- Botões: min-h-12 min-w-12
- Links: min-h-11 min-w-11

#### Tarefa 44: Responsive Images
- Todos images com sizes prop
- Srcset automático pelo <Image>

---

## 🎯 VERIFICATION CHECKLIST

- [ ] npm run build (0 errors)
- [ ] ANALYZE=true npm run build (bundle < 500KB)
- [ ] npm run start
- [ ] Chrome DevTools Lighthouse: Performance > 90
- [ ] PageSpeed Insights: 95+
- [ ] GTmetrix: A grade
- [ ] Core Web Vitals: LCP < 2.5s
- [ ] Mobile test: responsive
- [ ] Test 4G: still fast
- [ ] Test offline: PWA works

---

## 📊 EXPECTED RESULTS

### Performance Score
- BEFORE: 65-72
- AFTER: 95+

### Load Time
- BEFORE: 3-5s
- AFTER: < 1.5s

### Bundle Size
- BEFORE: 600-800KB
- AFTER: 300-400KB

### Core Web Vitals
- LCP: 3.2s → < 2.0s
- FID: 200ms → < 50ms
- CLS: 0.2 → < 0.05

---

## 🚀 EXECUTION ORDER

1. **BLOCO 1** (8 tarefas): Image optimization
2. **BLOCO 3** (7 tarefas): Lazy loading
3. **BLOCO 4** (8 tarefas): JS/CSS optimization
4. **BLOCO 5** (6 tarefas): Caching
5. **BLOCO 2** (5 tarefas): Font optimization
6. **BLOCO 6** (6 tarefas): Web Vitals
7. **BLOCO 7** (4 tarefas): Responsiveness

---

**OBJETIVO: Grade AA em PageSpeed + GTmetrix! 🎊**

Antigravity: Execute 44 tarefas, otimize performance, atingindo 95+ scores.
