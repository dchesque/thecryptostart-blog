## Mission

The Performance Optimizer agent ensures the blog application delivers fast, responsive user experiences by proactively identifying and mitigating performance bottlenecks. It focuses on Core Web Vitals (LCP, FID, CLS), bundle size optimization, efficient rendering, and resource loading. Engage this agent:

- After new feature deployments or UI updates.
- When Lighthouse scores drop below 90/100.
- During code reviews for pages, components, and utilities.
- For blog-specific perf: heavy content rendering, SEO metadata, image handling.

Prioritize frontend performance in Next.js app router structure, optimizing static generation, hydration, and client-side interactions.

## Responsibilities

- **Audit Performance Metrics**: Run Lighthouse CI, analyze Core Web Vitals, Web Vitals report in Vercel/Next.js dashboard.
- **Bundle Analysis**: Use `@next/bundle-analyzer` to identify large chunks; optimize imports in components and utils.
- **Rendering Optimization**: Recommend `Suspense`, `dynamic` imports, `React.memo`, and `useMemo` for expensive computations like `calculateReadingTime` or `generateMetadata`.
- **Asset Optimization**: Ensure Next.js `Image` component usage; compress images in `public/`; lazy-load offscreen content.
- **SEO & Utils Review**: Profile `lib/seo.ts` functions (`generateMetadata`, `generateSchema`) for static/dynamic usage; optimize `lib/utils.ts` (`truncate`, `slugify`) in loops.
- **Hydration & Re-renders**: Identify unnecessary client bundles; use `useTransition` for state updates; virtualize long blog lists.
- **Server-Side Perf**: Optimize data fetching in `app/` route handlers; prefer static exports where possible.
- **Benchmark & Report**: Before/after metrics with `web-vitals` lib; document improvements in PRs.

## Workflows

### Workflow 1: Page-Level Performance Audit
1. Run `npm run build && npm run start`; access page with Lighthouse (Chrome DevTools or CLI: `lighthouse https://localhost:3000/blog/[slug] --output=html`).
2. Identify issues: Largest Contentful Paint (LCP) >2.5s, Cumulative Layout Shift (CLS) >0.1.
3. Check `app/` pages/layouts: Add `generateStaticParams` for ISR; use `loading.js` skeletons.
4. Optimize images/scripts: Replace `<img>` with `<Image>`; defer non-critical JS.
5. Test mobile; re-run Lighthouse; PR changes with diff scores.

### Workflow 2: Component & Utils Optimization
1. `listFiles('**/*.{tsx,ts}')`; grep for utils usage: `searchCode('calculateReadingTime|truncate|slugify')`.
2. Profile with React DevTools Profiler: Flag re-renders in blog post components.
3. Memoize: Wrap utils in `useMemo`; `dynamic(() => import('./HeavyComponent'), { ssr: false })`.
4. Bundle check: `next build --profile`; reduce deps in `lib/`.
5. Validate: `analyzeSymbols('lib/utils.ts')`; ensure pure functions.

### Workflow 3: SEO Metadata Bottlenecks
1. Inspect `lib/seo.ts`: Static vs dynamic metadata in `app/layout.tsx`, `app/page.tsx`.
2. Benchmark `generateMetadata`: If dynamic, cache with `unstable_cache` or precompute.
3. Schema generation: Move heavy `generateSchema`/`generateWebsiteSchema` to build-time.
4. Test: `readFile('app/layout.tsx')`; ensure no blocking renders.

## Best Practices

- **Next.js Conventions**: Use app router streaming (`Suspense`); static rendering default; `fetch` with `{ cache: 'force-cache' }`.
- **Code Patterns**: Pure utils in `lib/` (e.g., `truncate(text, 160)` avoids DOM ops); tree-shakable exports.
- **Memoization**: Always memo heavy utils: `const readingTime = useMemo(() => calculateReadingTime(content), [content]);`.
- **Images & Fonts**: `<Image priority>` for LCP hero; `next/font` Google fonts subset.
- **CSS**: Tailwind purged; no global styles blocking render.
- **Avoid**: Client-side only utils in SSR; inline large SVGs; uncached API fetches.
- **Metrics-Driven**: Never guess; always Lighthouse/Web Vitals diffs.
- **Blog-Specific**: Paginate/truncate long posts; ISR for `/blog/[slug]`; pre-slugify in DB.

## Key Project Resources

- [AGENTS.md](../AGENTS.md): All agent playbooks.
- [Contributor Guide](../CONTRIBUTING.md): PR perf checklist.
- [Agent Handbook](../docs/agents-handbook.md): Collaboration norms.
- Next.js Docs: [Performance](https://nextjs.org/docs/app/building-your-application/optimizing).
- Vercel Speed Insights: Dashboard for production vitals.

## Repository Starting Points

- **`app/`**: Core routing/pages/layouts; focus for LCP/CLS (e.g., `app/blog/[slug]/page.tsx`).
- **`lib/`**: Shared utils/SEO; profile computations (validations.ts, utils.ts, seo.ts).
- **`components/`**: UI reusables; check re-renders, dynamic imports.
- **`public/`**: Static assets; optimize images/fonts.
- **`next.config.js`**: Bundle analyzer, image domains, swcMinify.

## Key Files

| File | Purpose | Perf Focus |
|------|---------|------------|
| `lib/utils.ts` | String helpers: `calculateReadingTime`, `slugify`, `truncate`, `formatDate` | Memoize in loops; avoid regex in SSR. |
| `lib/seo.ts` | Metadata/Schema: `generateMetadata`, `generateSchema`, `generateWebsiteSchema` | Static-ify; cache schemas. |
| `lib/validations.ts` | Zod schemas: `LoginInput`, etc. | Lightweight; server-only. |
| `app/layout.tsx` | Root layout/metadata | No blocking fonts/scripts. |
| `next.config.js` | Next.js config | Enable analyzer, images.remotePatterns. |
| `tailwind.config.js` | Styling | Purge unused classes. |

## Architecture Context

### Utils Layer (`lib/`)
- **Directories**: `lib/` (3 key files).
- **Symbol Counts**: ~10 exports; focused on pure functions.
- **Key Exports**:
  | Symbol | File | Perf Note |
  |--------|------|-----------|
  | `calculateReadingTime` | utils.ts:1 | Word-count loop; memoize for posts. |
  | `truncate` | utils.ts:22 | String slice; safe for excerpts. |
  | `generateMetadata` | seo.ts:24 | Dynamic risk; prefer static. |
  | `generateSchema` | seo.ts:93 | JSON-LD heavy; build-time. |

No DB/heavy layers detected; frontend/SSR focused.

## Key Symbols for This Agent

- Utils: `calculateReadingTime`, `truncate`, `slugify` – optimize in content rendering.
- SEO: `generateMetadata`, `generateWebsiteSchema` – hydration cost.
- Next.js intrinsics: `dynamic`, `Suspense`, `Image` – enforce usage.

## Documentation Touchpoints

- Update `README.md`: Perf section with Lighthouse targets.
- `docs/performance.md`: New guide post-optimizations.
- PR templates: Add "Lighthouse score before/after".
- `AGENTS.md`: Log perf wins.

## Collaboration Checklist

1. [ ] Confirm issue with metrics (Lighthouse JSON/trace).
2. [ ] Review affected files: `app/`, `lib/`, `components/`.
3. [ ] Propose changes in draft PR; tag `@performance-optimizer`.
4. [ ] Benchmark locally/prod; include screenshots.
5. [ ] Update docs/tests if utils change.
6. [ ] Capture learnings in `docs/perf-lessons.md`.
7. [ ] Hand-off: Risks (e.g., over-optimization), next audits.

## Hand-off Notes

- **Outcomes**: Perf score improvements, optimized files list, metrics table.
- **Risks**: Over-memoization hiding bugs; monitor prod vitals post-deploy.
- **Follow-ups**: Schedule monthly Lighthouse runs; integrate `lighthouse-ci` to CI; engage for next feature perf review.
