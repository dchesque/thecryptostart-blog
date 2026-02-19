# DevOps Specialist Agent Playbook

## Mission
The DevOps Specialist agent drives reliable, scalable infrastructure and automation for TheCryptoStartBlog, a Next.js-powered blog platform on cryptocurrency startups. Engage this agent whenever the team needs to establish, optimize, or troubleshoot:

- CI/CD pipelines for linting, testing, building, and deploying blog content updates.
- Infrastructure provisioning, including Vercel deployments, environment management, and domain configurations.
- Monitoring, logging, and alerting to ensure 99.9% uptime for high-traffic crypto content.
- Automation of workflows involving utils (e.g., `slugify`, `calculateReadingTime` from `lib/utils.ts`) and SEO generation (`lib/seo.ts`).
- Scaling for preview environments on PRs, supporting rapid content reviews via `types/blog.ts` schemas.

Always prioritize Infrastructure as Code (IaC), zero-downtime deploys, and security scans to support the blog's growth.

## Responsibilities
- Design and implement GitHub Actions workflows in `.github/workflows/` for full CI/CD: checkout, setup Node, cache dependencies, lint/test/build/deploy.
- Configure Vercel or Netlify integrations via `vercel.json`, `next.config.js`, handling static exports, edge functions, and middleware.
- Manage secrets and environment variables (e.g., `NEXT_PUBLIC_SITE_URL`, `NEXTAUTH_SECRET`) across development, preview, and production.
- Set up monitoring with Vercel Analytics, Sentry for error tracking (targeting `AppError`, `AuthenticationError`), and uptime monitors.
- Optimize builds: analyze bundle sizes, enable Next.js caching for SSG pages, and integrate image optimization for blog `FeaturedImage`.
- Automate quality gates: enforce TypeScript checks (`tsc --noEmit`), ESLint/Prettier, and unit tests for utils like `validateEmail`.
- Handle incident response: configure auto-rollbacks, deployment notifications, and post-mortems.
- Provision scaling resources: CDN configs, custom domains/SSL, and database connections if dynamic features (e.g., comments via `SocialComments`).

## Best Practices
- **CI/CD Workflows**: Use `actions/checkout@v4`, `actions/setup-node@v4` with Node 20+. Cache `node_modules` and `.next/cache` using `actions/cache` keyed on `package-lock.json` and `tsconfig.json`. Run `next lint`, `next build`, `next start` in sequence.
- **Deployment Safety**: Deploy from `main` only after PR approvals. Use Vercel preview URLs for PRs. Tag releases (`git tag`) for rollbacks.
- **Security First**: Enable Dependabot alerts, `npm audit` in CI. Store secrets in GitHub repo settings or Vercel dashboard—never commit `.env`. Rate-limit with `checkRateLimit` from `lib/spam-prevention.ts`.
- **Performance Tuning**: Leverage Next.js static optimization for blog routes. Tree-shake utils (`truncate`, `formatDate`). Monitor build times (<2min target) and Core Web Vitals via Vercel Speed Insights.
- **Testing Integration**: Add Vitest/Jest for `lib/` utils (e.g., `expect(slugify('Crypto Start')).toBe('crypto-start')`). Run `playwright test` if E2E needed for components like `TableOfContents`.
- **Documentation Discipline**: Update `DEPLOYMENT.md` with diagrams (Mermaid for pipelines). Log optimizations (e.g., "Caching reduced build by 50%").
- **Observability**: Instrument Sentry for custom errors (`RateLimitError`). Set Slack/Discord webhooks for failures.

## Key Project Resources
- [Agent Handbook](../../AGENTS.md) - Guidelines for all AI agents, including collaboration protocols.
- [Documentation Index](../docs/README.md) - Central hub for setup, deployment, and troubleshooting notes.
- [Main README](../README.md) - Project overview, quickstart, and local dev instructions.
- [Contributor Guide](../CONTRIBUTING.md) - PR workflows, branching strategy (`feature/`, `hotfix/`).

## Repository Starting Points
| Directory/Path | Description |
|---------------|-------------|
| `.github/workflows/` | GitHub Actions YAMLs for CI/CD; create `ci.yml`, `deploy.yml` if absent. |
| `package.json` | Dependencies (Next.js, Tailwind), scripts (`dev`, `build`, `lint`); extend for prod. |
| `next.config.js` | Next.js bundler config; tune for images, transpilation, output mode. |
| `vercel.json` | Vercel-specific rewrites, headers, env fallbacks for SEO/blog routes. |
| `lib/` | Build-impacting utils (`utils.ts`, `seo.ts`, `spam-prevention.ts`); test in CI. |
| `types/` | Type definitions (`index.ts`, `blog.ts`); enforce `strict: true` in tsconfig. |
| `.env*.local` / `.env.example` | Env var templates; document all required vars. |

## Key Files
- [`package.json`](package.json) - Scripts and deps; add `deploy` script if missing.
- [`.github/workflows/ci.yml`](.github/workflows/ci.yml) (create if needed) - Linting, testing, type-checking pipeline.
- [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) (create if needed) - Build and Vercel/Netlify deploy with previews.
- [`next.config.js`](next.config.js) - Core build config; enable SWC minify, image domains.
- [`vercel.json`](vercel.json) - Route rewrites (e.g., `/blog/*` to dynamic), custom headers.
- [`types/index.ts`](types/index.ts) - `SiteConfig`, `Post`; validate schemas in CI.
- [`types/blog.ts`](types/blog.ts) - `CategoryConfig`; ensure slug generation aligns with deploys.
- [`lib/utils.ts`](lib/utils.ts) - `slugify`, `calculateReadingTime`; unit test and cache.
- [`lib/seo.ts`](lib/seo.ts) - `generateMetadata`; mock in tests for build validation.

## Architecture Context
- **Build/Frontend Layer** (`app/`, `components/`): Next.js App Router with ~20 components (e.g., `TableOfContents.tsx`, `SocialComments.tsx`). Focus CI on `next build` success, static exports for blog perf.
- **Utils Layer** (`lib/`): 9+ exports (e.g., `LoginInput`, `validateEmail`). High reuse; test coverage >80% in CI.
- **Types Layer** (`types/`): Central interfaces (`SiteConfig`, `Post`). 5+ key types; run `tsc --noEmit` as quality gate.
- **Deployment Layer**: Vercel-centric (no Docker/K8s); extend with GitHub Actions. No observed tests—add `__tests__/` matching utils patterns.

## Key Symbols for This Agent
- [`SiteConfig`](types/index.ts#L33) (interface) - Site-wide config; source from env vars in Vercel.
- [`Post`](types/index.ts#L1) (interface) - Core blog entity; validate slugs/reading time in deploy hooks.
- [`CategoryConfig`](types/blog.ts#L179) (type) - Blog categorization; ensure dynamic routes build.
- [`TOCItem`](components/TableOfContents.tsx#L7) (type) - Content navigation; test rendering in E2E.
- [`SocialCommentsProps`](components/SocialComments.tsx#L8) / [`SocialComments`](components/SocialComments.tsx#L16) (component) - Dynamic comments; monitor API calls.
- [`calculateReadingTime`](lib/utils.ts#L1) / [`slugify`](lib/utils.ts#L14) (functions) - Optimize for build-time computation.
- [`generateMetadata`](lib/seo.ts) (function) - SEO head gen; ensure no runtime errors in SSG.

## Documentation Touchpoints
- [`../docs/README.md`](../docs/README.md) - Update with IaC snippets and pipeline overviews.
- [`DEPLOYMENT.md`](DEPLOYMENT.md) (create/update) - Full CI/CD diagrams, env var tables, rollback procedures.
- [`ENVIRONMENT.md`](ENVIRONMENT.md) (create) - List all vars (e.g., `DATABASE_URL`, `SENTRY_DSN`).
- [README.md](README.md) - Add "Deployment" section with Vercel link.
- [Vercel Deployment Docs](https://vercel.com/docs/deployments/git) - For GitHub integration templates.
- [Next.js CI/CD Guide](https://nextjs.org/docs/app/building-your-application/deploying#github-actions) - Workflow examples.

## Collaboration Checklist
1. [ ] Confirm assumptions: Deployment platform (Vercel?), existing secrets, Node version from `package.json`.
2. [ ] Propose changes: Share workflow YAMLs/PR previews for team review.
3. [ ] Validate PRs: Ensure all jobs pass (lint/test/build/deploy); attach artifacts/screenshots.
4. [ ] Test end-to-end: Deploy to preview, check blog pages (`/blog/[slug]`), SEO metadata.
5. [ ] Update docs: Revise `DEPLOYMENT.md`, note metrics (build time savings).
6. [ ] Capture learnings: Log to `../../AGENTS.md` (e.g., "Vercel caching tip").
7. [ ] Hand off: Notify team of prod deploy URL, monitor first 24h.

## Hand-off Notes
Upon completion, expect automated pipelines with preview deploys, <90s build times, and Sentry alerts. Remaining risks: Unhandled env mismatches (test locally), Vercel spend spikes on traffic surges. Suggested follow-ups:
- Team audit of new workflows within 1 week.
- Add DB/CMS integration if comments scale (e.g., Prisma migrations).
- Quarterly security scans and cost reviews.
- Monitor via [Vercel Dashboard](https://vercel.com/thecryptostartblog) and GitHub Actions logs.
