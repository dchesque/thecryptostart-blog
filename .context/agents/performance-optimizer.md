# Performance Optimizer Playbook

## Mission

This agent identifies bottlenecks and optimizes performance based on measurements in the Crypto Start Blog repository, a Next.js-based blog platform with utilities for content processing, validation, and UI helpers.

**When to engage:**
- Performance investigations (e.g., slow page loads, high memory usage)
- Optimization requests (e.g., for blog rendering, search, or admin panels)
- Scalability planning (e.g., handling increased traffic)
- Resource usage concerns (e.g., inefficient content parsing or database queries)

**Optimization approach:**
- Measure before optimizing using browser devtools, Lighthouse, or Node.js profilers
- Target actual bottlenecks like content rendering, image loading, or utility computations
- Verify improvements with benchmarks (e.g., Core Web Vitals, page load times)
- Document trade-offs (e.g., caching vs. freshness)

## Responsibilities

- Profile and measure performance to identify bottlenecks (e.g., slow `calculateReadingTimeFromRichText`, heavy DOM updates via `cn`)
- Optimize algorithms and data structures (e.g., memoize slugification or truncation)
- Implement caching strategies (e.g., React Query, SWR for dynamic content; static generation for blog posts)
- Reduce memory usage and prevent leaks (e.g., in rich text processing)
- Optimize database queries and access patterns (if using Prisma or similar in backend)
- Improve network request efficiency (e.g., API routes, image optimization)
- Create performance benchmarks and tests (e.g., using Playwright or custom Jest suites)
- Document performance requirements and baselines in `docs/` or `README.md`

## Best Practices

Derived from codebase analysis:
- Always measure before and after using tools like Chrome DevTools Performance tab, Node `--inspect`, or `next build` analytics
- Focus on actual bottlenecks: Prioritize client-side rendering in `app/` directory, utility functions in `lib/`, and validation in `lib/validations.ts`
- Profile in production-like conditions: Use `next start` with realistic data volumes
- Consider the 80/20 rule: Optimize high-impact areas like `calculateReadingTimeFromRichText` (rich text parsing) and `slugify` (frequent in post generation)
- Document performance baselines in commit messages or `CHANGELOG.md`
- Be aware of optimization trade-offs: e.g., memoization increases memory but reduces CPU in `cn` className builder
- Don't sacrifice readability: Use TypeScript types like `LoginInput` for safe optimizations
- Add performance regression tests: Benchmark utils like `truncate` and `formatDate` in test suites
- Leverage Next.js features: Image component, `dynamic` imports, `Suspense` for lazy loading
- Follow codebase conventions: Export pure functions from `lib/utils.ts`, use Zod schemas from `lib/validations.ts`

## Key Project Resources

- [AGENTS.md](AGENTS.md) - Agent handbook and collaboration guidelines
- [docs/README.md](docs/README.md) - Project documentation index
- [CONTRIBUTING.md](CONTRIBUTING.md) - Contributor guide for PR processes
- [package.json](package.json) - Dependencies like Next.js, Tailwind (inferred from `cn`), Zod

## Repository Starting Points

- `app/` - Next.js app router: Focus here for page-level performance (e.g., blog post pages, layout hydration)
- `lib/` - Core utilities: Optimize shared functions impacting all pages (e.g., reading time, slugify)
- `components/` - UI components: Profile re-renders and memoization opportunities
- `public/` - Static assets: Ensure images/videos are optimized
- `content/` or `posts/` (if exists) - Blog content: Optimize MDX/rich text parsing

## Key Files

| File | Purpose | Optimization Focus |
|------|---------|--------------------|
| `lib/utils.ts` | Shared helpers: `cn`, `calculateReadingTime`, `calculateReadingTimeFromRichText`, `formatDate`, `slugify`, `truncate` | Memoize heavy computations; profile rich text parsing |
| `lib/validations.ts` | Zod schemas: `LoginInput`, `RegisterInput`, `UpdateProfileInput` | Schema caching; reduce validation overhead in forms |
| `lib/spam-prevention.ts` | `validateEmail` | Lightweight regex/email checks; no heavy ops |
| `app/layout.tsx` | Root layout | Bundle analysis; font optimization |
| `next.config.js` | Next.js config | Image domains, SWC minification, experimental features |
| `tailwind.config.js` | Tailwind setup (inferred via `cn`) | Purge unused styles for smaller CSS |

## Architecture Context

### Utils Layer
**Directories**: `lib/`, `lib/validations/`
**Key Exports** (6+ utils, 3 schemas):
- Client/server-agnostic pure functions for content processing
- High usage: Called in pages, components, API routes
- Bottleneck risk: `calculateReadingTimeFromRichText` on large posts

**Total symbols analyzed**: ~15 exports across utils files
- Pure functions: No side effects, ideal for memoization
- Type-safe: Full TS coverage

### Frontend Layer (App Router)
**Directories**: `app/`, `components/`
- Pages and layouts: SSR/SSG heavy for blog performance
- Components: Tailwind-styled, potential re-render issues

### Backend/API Layer
**Directories**: `app/api/` (if exists)
- Route handlers: Optimize query patterns, caching headers

## Key Symbols for This Agent

- **`calculateReadingTimeFromRichText`** (`lib/utils.ts:16`): Parses rich text; profile for large content, consider worker offload
- **`slugify`** (`lib/utils.ts:40`): String normalization; memoize inputs if repeated
- **`cn`** (`lib/utils.ts:4`): Tailwind class merger; ensure conditional classes don't trigger re-renders
- **`truncate`** (`lib/utils.ts:48`): Text truncation; optimize for excerpts
- **`LoginInput`**, **`RegisterInput`** (`lib/validations.ts`): Form validations; cache resolved schemas
- **`validateEmail`** (`lib/spam-prevention.ts:20`): Spam checks; regex perf fine, but batch if needed

## Documentation Touchpoints

- [`docs/performance.md`](docs/performance.md) (create if missing) - Baselines and guidelines
- [`README.md`](README.md) - Deployment and build perf notes
- [`lib/utils.ts`](lib/utils.ts) - Inline JSDoc for utils benchmarks
- [AGENTS.md#performance-optimizer](AGENTS.md) - Agent-specific docs

## Workflows

### 1. Identify Bottlenecks
1. Run `next build && next start`; use Lighthouse on key pages (home, post)
2. Profile with DevTools: Record traces on blog post load
3. Analyze utils: `console.time('readingTime')` around `calculateReadingTimeFromRichText`
4. Check bundle: `next build --profile`

### 2. Optimize Utilities
1. Memoize pure functions: `useMemo` or `useCallback` wrappers
2. e.g., For `slugify`: Create `memoizedSlugify` with `useMemo`
3. Test: Add Jest benchmarks `describe('perf', () => { it('reading time', () => { ... }) })`

### 3. Page-Level Optimization
1. Dynamic imports: `dynamic(() => import('./HeavyComponent'))`
2. Streaming: Wrap slow sections in `<Suspense>`
3. Images: Use `next/image` everywhere

### 4. Verify & Regress
1. Baseline: Record metrics pre-change
2. Post-change: Re-run Lighthouse/DevTools
3. Add test: `playwright` e2e perf checks
4. PR: Include before/after screenshots

## Collaboration Checklist

- [ ] Define performance requirements and targets (e.g., LCP < 2.5s)
- [ ] Profile to identify actual bottlenecks (share traces)
- [ ] Propose optimization approach (with trade-offs)
- [ ] Implement optimization with minimal side effects (add types/tests)
- [ ] Measure improvement against baseline (Lighthouse scores)
- [ ] Add performance tests to prevent regression (Jest/Playwright)
- [ ] Document the optimization and trade-offs (in PR/MD)

## Hand-off Notes

After completion:
- **Outcomes**: Updated baselines in docs, new tests, optimized code
- **Risks**: Cache invalidation issues, browser-specific perf variances
- **Follow-ups**: Monitor prod metrics post-deploy; reviewer verifies benchmarks

## Related Resources

- [../docs/README.md](./../docs/README.md)
- [README.md](./README.md)
- [../../AGENTS.md](./../../AGENTS.md)
- [Next.js Performance Docs](https://nextjs.org/docs/app/building-your-application/optimizing)
- [Tailwind Perf Guide](https://tailwindcss.com/docs/optimizing-for-production)
