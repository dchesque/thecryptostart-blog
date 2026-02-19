## Mission

The Performance Optimizer agent proactively identifies and resolves performance bottlenecks in the Crypto Start Blog application, ensuring fast load times, smooth interactions, and high Core Web Vitals scores (LCP < 2.5s, FID < 100ms, CLS < 0.1). It emphasizes measurement-driven optimizations, focusing on actual bottlenecks via tools like Lighthouse and bundle analyzers, and implements caching strategies for repeated computations, data fetches, and static assets. Engage this agent whenever:

- Lighthouse scores fall below 90/100 on desktop/mobile.
- New features or UI changes are introduced (e.g., blog post rendering, auth forms).
- Production metrics from Vercel Speed Insights degrade.
- Code reviews involve heavy components, utils, or SEO metadata generation.

Prioritize Next.js app router optimizations: static rendering, dynamic imports, memoization, and ISR for blog pages.

## Responsibilities

- Run comprehensive audits using Lighthouse CI, Web Vitals telemetry, and `@next/bundle-analyzer` to pinpoint bundle bloat, render blocking, and resource inefficiencies.
- Profile and optimize utils in `lib/` (e.g., `calculateReadingTime`, `slugify`, `truncate`) for use in loops or SSR contexts, applying memoization and precomputation.
- Analyze and enhance SEO/metadata functions in `lib/seo.ts` (e.g., `generateMetadata`, `generateSchema`) by shifting to static generation or `unstable_cache`.
- Optimize asset loading: Enforce Next.js `Image` component, lazy-loading, and font optimization in `public/` and layouts.
- Review server-side data fetching in `app/` routes/handlers for caching (`{ cache: 'force-cache' }`), revalidation, and avoiding waterfalls.
- Benchmark client-side interactions (auth forms, spam checks) for hydration mismatches and unnecessary re-renders using React DevTools.
- Implement caching layers: Redis/memcache for rate limits (`checkRateLimit`), precomputed slugs/reading times, and ISR for `/blog/[slug]`.
- Document before/after metrics in PRs, including Lighthouse JSON diffs and bundle size reductions.

## Best Practices

- Always base optimizations on metrics: Run `lighthouse <url> --output=json --only-categories=performance` before/after changes; target 95+ scores.
- Favor static over dynamic: Use `generateStaticParams` for blog slugs; static metadata exports; precompute utils like `slugify` at build-time.
- Memoize aggressively: Wrap `lib/utils.ts` calls in `useMemo` or `useCallback` (e.g., `const readingTime = useMemo(() => calculateReadingTime(post.content), [post.content])`).
- Bundle hygiene: Dynamic imports for heavy components (`dynamic(() => import('./BlogPost'), { ssr: false })`); tree-shake utils; analyze with `next build --profile`.
- Image/asset handling: `<Image>` with `priority` for above-fold; `sizes` prop; `next/font` for subsets; compress `public/` assets.
- Caching first: `fetch` with `cache: 'force-cache'` or `revalidate`; `unstable_cache` for dynamic metadata; ISR for content pages.
- Avoid pitfalls: No uncached API calls in SSR; pure functions in `lib/` (no side-effects); Tailwind purge; no inline critical CSS/JS.
- Blog-specific: Virtualize long post lists; truncate excerpts server-side; cache spam checks (`getClientIP`, `checkRateLimit`).
- Test across devices: Mobile-first Lighthouse; simulate slow networks.

## Key Project Resources

- [AGENTS.md](../../AGENTS.md): Directory of all agent playbooks and collaboration guidelines.
- [Contributor Guide](../CONTRIBUTING.md): Includes performance review checklists for PRs.
- [Agent Handbook](../docs/agents-handbook.md): Standard workflows and hand-off protocols.
- [Docs README](../docs/README.md): Central documentation index.
- [Project README](README.md): High-level repo overview and setup instructions.
- Next.js Performance Guide: [Optimizing](https://nextjs.org/docs/app/building-your-application/optimizing).

## Repository Starting Points

- **`app/`**: App router pages, layouts, and loading states; primary focus for rendering perf, metadata, and data fetching (e.g., `app/blog/[slug]/page.tsx`).
- **`lib/`**: Pure utilities, validations, SEO, and spam prevention; optimize computations and caching here.
- **`components/`**: Reusable UI elements; audit for re-renders, dynamic loading, and memoization.
- **`public/`**: Static assets like images and fonts; ensure optimization and lazy-loading readiness.
- **`next.config.js`** and **`tailwind.config.js`**: Configuration for bundling, images, SWC minification, and CSS purging.

## Key Files

| File | Purpose | Perf Focus |
|------|---------|------------|
| `lib/utils.ts` | Utilities like `calculateReadingTime`, `formatDate`, `slugify`, `truncate` | Memoize for content loops; precompute where possible; avoid SSR regex overhead. |
| `lib/validations.ts` | Zod schemas: `LoginInput`, `RegisterInput`, `UpdateProfileInput` | Keep lightweight; server-only validation to minimize client bundle. |
| `lib/spam-prevention.ts` | `validateEmail`, `getClientIP`, `checkRateLimit` | Cache rate limits; avoid client-side execution. |
| `lib/seo.ts` | `generateMetadata`, `generateSchema`, `generateWebsiteSchema` | Static-ify or cache; benchmark JSON-LD generation. |
| `app/layout.tsx` | Root layout and metadata | Eliminate render-blocking resources; optimize fonts/scripts. |
| `next.config.js` | Next.js configuration | Enable bundle analyzer, image domains, experimental features like `swcMinify`. |
| `tailwind.config.js` | Tailwind setup | Ensure content paths for purging; minimize unused CSS. |

## Architecture Context

### Utils Layer (`lib/`)
- **Directories**: `lib/` contains focused utility modules.
- **Symbol Counts**: Approximately 10 key exported symbols across files.
- **Key Exports**:
  | Symbol | File | Perf Note |
  |--------|------|-----------|
  | `calculateReadingTime` | `lib/utils.ts:1` | Word-count intensive; memoize for multiple post renders. |
  | `formatDate` | `lib/utils.ts:6` | Pure; safe for SSR but cache in lists. |
  | `slugify` | `lib/utils.ts:14` | Regex-based; precompute slugs at build/DB level. |
  | `truncate` | `lib/utils.ts:22` | String ops; use server-side for excerpts. |
  | `LoginInput`, `RegisterInput`, `UpdateProfileInput` | `lib/validations.ts:20-22` | Schema validation; bundle-strip for client. |
  | `validateEmail` | `lib/spam-prevention.ts:20` | Regex; server-only. |
  | `getClientIP` | `lib/spam-prevention.ts:24` | Request-derived; cache per session. |
  | `checkRateLimit` | `lib/spam-prevention.ts:34` | DB/Redis call; implement sliding window cache. |

Frontend/SSR-focused with no heavy DB layers; emphasize client hydration and static exports.

## Key Symbols for This Agent

- **`calculateReadingTime`** ([lib/utils.ts](lib/utils.ts)): Memoize in post components to avoid recomputes.
- **`slugify`** ([lib/utils.ts](lib/utils.ts)): Precompute for routes; avoid client-side generation.
- **`truncate`** ([lib/utils.ts](lib/utils.ts)): Server-side for SEO excerpts; pure function.
- **`checkRateLimit`** ([lib/spam-prevention.ts](lib/spam-prevention.ts)): Cache results to reduce DB hits.
- **`generateMetadata`** (likely [lib/seo.ts](lib/seo.ts)): Convert to static; profile execution time.
- **`generateSchema`** (likely [lib/seo.ts](lib/seo.ts)): Build-time JSON-LD to cut LCP.
- Next.js: `dynamic`, `Suspense`, `Image`, `unstable_cache` – Mandate in audits.

## Documentation Touchpoints

- [README.md](README.md): Add/update performance section with Lighthouse targets and optimization tips.
- [../docs/README.md](../docs/README.md): Link to new `performance.md` guide.
- [../../AGENTS.md](../../AGENTS.md): Log optimizations and agent usage examples.
- PR templates: Append "Performance Metrics: Before/After Lighthouse scores".
- Create/update `docs/performance.md`: Detailed audit workflows and caching strategies.

## Collaboration Checklist

1. [ ] Confirm bottleneck with metrics (Lighthouse JSON, bundle analysis, Vercel vitals).
2. [ ] List affected files/areas (`app/`, `lib/`, `components/`) and baseline perf data.
3. [ ] Propose optimizations in a draft PR; include code diffs and expected gains.
4. [ ] Benchmark locally (`npm run build && lighthouse`) and simulate prod; attach reports.
5. [ ] Review with other agents (e.g., frontend-dev for React changes); resolve feedback.
6. [ ] Update tests/docs if utils or configs change; add perf regression tests.
7. [ ] Capture learnings in `docs/perf-lessons.md`; hand-off with risks/metrics summary.

## Hand-off Notes

Upon completion, summarize outcomes in PR description: list optimized files, metric improvements (e.g., LCP -1.2s, bundle -15%), and code snippets. Flag remaining risks like over-caching invalidating dynamic content or platform-specific perf (e.g., Vercel edge). Suggest follow-ups: Integrate `lighthouse-ci` into GitHub Actions, schedule quarterly audits, or re-engage for upcoming features like search or newsletters. Monitor prod vitals for 48h post-deploy.
