# Core Web Vitals Optimization Guide

## Target Scores
- **Performance**: 95+
- **Accessibility**: 95+
- **Best Practices**: 95+
- **SEO**: 100

## Already Implemented ✓

### 1. Image Optimization
```javascript
// next.config.mjs
images: {
  domains: ['images.ctfassets.net'],
  formats: ['image/avif', 'image/webp'],
}
```

### 2. Font Loading
```typescript
// app/layout.tsx
const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})
```

### 3. Code Splitting
- `output: 'standalone'` enabled
- Dynamic imports where needed
- Tree-shaking automatic

### 4. Security Headers
```javascript
headers: async () => [{
  source: '/:path*',
  headers: [
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'X-Frame-Options', value: 'DENY' },
    { key: 'X-XSS-Protection', value: '1; mode=block' },
  ],
}]
```

### 5. SEO
- Dynamic sitemap
- robots.txt
- Structured data (JSON-LD)
- Open Graph tags
- Twitter cards

## Additional Optimizations (Optional)

### 6. Reduce JavaScript Bundle

**Analyze bundle:**
```bash
npm run build -- --analyze
```

**Lazy load heavy components:**
```typescript
const TableOfContents = dynamic(() => import('@/components/TableOfContents'), {
  loading: () => <div className="animate-pulse h-64 bg-gray-800 rounded" />,
  ssr: false,
})
```

### 7. Enable Compression

**Vercel**: Automatic
**Docker**:
```dockerfile
# Dockerfile
RUN npm install compression
```

### 8. Implement Service Worker (PWA)

```bash
npm install next-pwa
```

```javascript
// next.config.mjs
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
})

module.exports = withPWA(nextConfig)
```

### 9. Optimize Critical CSS

```css
/* globals.css - Critical CSS first */
/* Above-the-fold styles */
.critical { /* ... */ }

/* Non-critical - defer */
.non-critical { /* ... */ }
```

### 10. Preload Key Resources

```typescript
// app/layout.tsx
<link
  rel="preload"
  href="/fonts/Inter.woff2"
  as="font"
  type="font/woff2"
  crossOrigin="anonymous"
/>
```

## Core Web Vitals Targets

### Largest Contentful Paint (LCP) < 2.5s
- ✓ Image formats (WebP/AVIF)
- ✓ Lazy loading below-fold images
- ✓ Font display: swap

### First Input Delay (FID) < 100ms
- ✓ Minimize main-thread work
- ✓ Split code (standalone mode)
- ✓ Defer non-critical JS

### Cumulative Layout Shift (CLS) < 0.1
- ✓ Image aspect ratios
- ✓ Reserved space for ads
- ✓ Font display: swap

## Testing

### Lighthouse (CI)
```bash
npm install -g @lhci/cli
lhci autorun --collect.url=http://localhost:3000
```

### PageSpeed Insights
1. https://pagespeed.web.dev/
2. Enter URL
3. Review "Opportunities"

### Web Vitals Extension
1. Install Chrome Extension: "Web Vitals"
2. Navigate to site
3. Check real-user metrics

## Monitoring

### Log Web Vitals
```typescript
// app/layout.tsx
import { onCLS, onFID, onLCP } from 'web-vitals'

onCLS(console.log)
onFID(console.log)
onLCP(console.log)
```

### Analytics Integration
```typescript
// Send to GA4
onCLS((metric) => gtag('event', metric.name, { value: metric.value}))
```

## Checklist

- [x] WebP/AVIF images
- [x] Font optimization (swap display)
- [x] Security headers
- [x] Dynamic sitemap
- [x] robots.txt
- [x] Structured data
- [x] GA4 tracking ready
- [x] Code splitting (standalone)
- [ ] Lighthouse CI (optional)
- [ ] PWA/Service Worker (optional)
- [ ] Bundle analyzer (optional)

## Next Steps

1. **Run Lighthouse** locally:
   ```bash
   npm run build
   npm run start
   # Open Chrome DevTools → Lighthouse
   ```

2. **Deploy to staging**
   ```bash
   vercel --prod
   # or
   docker-compose up -d
   ```

3. **Test on production**
   - Use PageSpeed Insights
   - Check Web Vitals in GA4
   - Validate SEO with Google Search Console

## Resources

- Web Vitals: https://web.dev/vitals/
- Next.js Performance: https://nextjs.org/docs/app/building-your-application/optimizing
- Lighthouse CI: https://github.com/GoogleChrome/lighthouse-ci
