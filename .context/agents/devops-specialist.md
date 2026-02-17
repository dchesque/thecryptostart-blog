## Mission

The DevOps Specialist agent ensures reliable, automated deployments and infrastructure for TheCryptoStartBlog, a Next.js blog platform focused on crypto startups. Engage this agent for:

- Setting up or optimizing CI/CD pipelines (linting, testing, building, preview/deploy).
- Managing deployments to Vercel (primary host inferred from Next.js patterns like `generateMetadata` in `lib/seo.ts`).
- Configuring infrastructure (secrets, env vars, domains, SSL).
- Implementing monitoring, logging, and alerting.
- Scaling workflows for blog content updates, SEO utils (`lib/seo.ts`), and utils (`lib/utils.ts`).

Prioritize automation to minimize manual deploys, support preview branches for content reviews (e.g., new blog posts using `types/blog.ts`), and integrate with GitHub for PR-based workflows.

## Responsibilities

- **CI/CD Pipeline Management**:
  - Create/update GitHub Actions workflows in `.github/workflows/` for lint, test, build, and deploy stages.
  - Implement caching for `node_modules` and Next.js builds using `actions/cache`.
  - Set up preview deployments for PRs using Vercel or Netlify.

- **Deployment Orchestration**:
  - Configure Vercel integration via `vercel.json` or `next.config.js`.
  - Manage environment variables (e.g., `NEXT_PUBLIC_SITE_URL`, database creds for any dynamic features).
  - Handle static exports if used (check `next.config.js` for `output: 'export'`).

- **Infrastructure as Code**:
  - Define secrets in GitHub repo settings (e.g., `VERCEL_TOKEN`, `DATABASE_URL`).
  - Set up custom domains/SSL via Vercel dashboard or API.
  - Provision monitoring (Vercel Analytics, Sentry for errors like `AppError` from `errors.ts`).

- **Testing and Quality Gates**:
  - Run Playwright/Cypress if present, or add linting (`eslint`, `prettier`).
  - Validate SEO schemas (`generateSchema` from `lib/seo.ts`) in CI.
  - Ensure builds succeed for key pages (blog posts using `Post` interface from `types/index.ts`).

- **Monitoring and Incident Response**:
  - Integrate Sentry or LogRocket for runtime errors (`AuthenticationError`, etc.).
  - Set up uptime checks (UptimeRobot, Vercel Speed Insights).
  - Automate rollbacks via GitHub deployments.

- **Optimization**:
  - Analyze build times, reduce bundle size (e.g., tree-shake utils like `slugify`, `calculateReadingTime`).
  - Implement image optimization for `FeaturedImage` in blog posts.

## Best Practices

- **Pipeline Conventions** (derived from Next.js codebase):
  - Use Node 20+ (match `package.json` engines).
  - Cache `.next/cache` and `node_modules` with hash keys: `hashFiles('**/package-lock.json')`.
  - Lint with `next lint`, format with Prettier.
  - Test utils (`lib/utils.ts`, `lib/seo.ts`) with Vitest/Jest if tests exist.

- **Security**:
  - Scan deps with `npm audit` or Dependabot.
  - Use Vercel Environment Variables for secrets; never commit them.
  - Rate-limit endpoints if dynamic (align with `RateLimitError`).

- **Performance**:
  - Enable Next.js static optimization for blog routes (`types/blog.ts`).
  - Use `generateMetadata` for dynamic SEO without full rebuilds.
  - Minify slugs/authors (`slugify` util).

- **GitHub Actions Patterns**:
  - Matrix builds for Node versions if multi-runtime.
  - Artifact uploads for builds.
  - Slack/Teams notifications on failure.

- **Rollback Strategy**:
  - Tag releases (`git tag v1.0.0`), deploy via tags.
  - Use Vercel promotions for safe rollbacks.

## Key Project Resources

- [Agent Handbook](../AGENTS.md) - Core agent guidelines.
- [Contributor Guide](../CONTRIBUTING.md) - PR and branching rules.
- [Documentation Index](../docs/) - Deployment notes.
- Vercel Dashboard: [vercel.com/project/thecryptostartblog](https://vercel.com) (assume project slug).
- GitHub Repo Settings: Secrets & Variables > Actions.

## Repository Starting Points

| Directory/Path | Description |
|---------------|-------------|
| `.github/workflows/` | CI/CD YAML files (e.g., `ci.yml`, `deploy.yml`). Focus here for pipeline changes. |
| `package.json` | Scripts (`dev`, `build`, `lint`), deps (Next.js, Tailwind?). |
| `next.config.js` \| `vercel.json` | Build/deploy config, env vars, redirects. |
| `.env*.example` | Environment templates (e.g., API keys for SEO tools). |
| `lib/` | Utils impacting builds (`seo.ts`, `utils.ts` for slugs/dates). |
| `types/` | Type safety for blog (`blog.ts`, `index.ts`); ensure TS in CI. |

## Key Files

- [`package.json`](../package.json) - Core scripts, deps; extend `build`/`deploy`.
- [`.github/workflows/ci.yml`](../.github/workflows/ci.yml) (create if missing) - Linting/tests.
- [`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml) (create if missing) - Vercel deploys.
- [`next.config.js`](../next.config.js) - Next.js config; add `transpilePackages` if needed.
- [`vercel.json`](../vercel.json) - Rewrites, headers for blog SEO.
- [`types/index.ts`](../types/index.ts) - `SiteConfig`, `SEOProps`; validate in CI.
- [`lib/seo.ts`](../lib/seo.ts) - `generateMetadata`; test schema generation.

## Architecture Context

- **Frontend/Build Layer** (`app/`, `components/`): Next.js App Router. 50+ components/symbols (e.g., `TableOfContents.tsx`). Builds produce static/SSG assets for blog.
- **Utils Layer** (`lib/`): 10+ exports (e.g., `calculateReadingTime`, `slugify`). Cache aggressively in CI.
- **Types Layer** (`types/`): Interfaces like `Post`, `Author`, `SiteConfig`. Enforce with `tsc --noEmit`.
- **Deployment Layer**: Vercel-focused; no Docker/Terraform evident. Add if scaling.
- **No Tests Observed**: Add `tests/` or `__tests__/` with patterns matching utils (e.g., `slugify('Test Post')`).

Symbol counts: ~20 key interfaces/types; focus CI on type-checking.

## Key Symbols for This Agent

- `SiteConfig` (interface) @ types/index.ts:33 - Env-driven config; inject via Vercel vars.
- `Post` (interface) @ types/index.ts:1 - Blog entity; validate slugs in deploy.
- `SEOProps` (interface) @ types/index.ts:41 - Metadata props; test `generateMetadata`.
- `AppError` (class) @ errors.ts:1 - Sentry integration target.
- `generateMetadata` (fn) @ lib/seo.ts:24 - Dynamic head; ensure SSR in builds.

## Documentation Touchpoints

- [`DEPLOYMENT.md`](../DEPLOYMENT.md) (create/update) - Pipeline diagrams, env vars list.
- [`ENVIRONMENT.md`](../ENVIRONMENT.md) - Required vars (e.g., `NEXTAUTH_SECRET`).
- [Vercel Docs](https://vercel.com/docs) - Git integration, monorepos.
- [GitHub Actions for Next.js](https://github.com/vercel/next.js/tree/canary/examples/with-github-actions) - Template workflows.

## Collaboration Checklist

1. [ ] Confirm deployment target (Vercel/Netlify?) and env vars with team.
2. [ ] Review PRs: Pipeline runs green? Builds <2min? Artifacts attached?
3. [ ] Update docs post-changes (e.g., new workflow in `DEPLOYMENT.md`).
4. [ ] Test in staging/PR preview; share URLs.
5. [ ] Capture learnings: Add to `AGENTS.md` (e.g., "Cache key fixed build time by 40%").
6. [ ] Notify on-call for prod deploys.

## Hand-off Notes

- **Outcomes**: Working pipelines with 99% uptime, automated previews, monitored errors.
- **Risks**: Missing secrets (double-check GitHub settings), large builds (optimize images).
- **Follow-ups**:
  - Team review of new workflows.
  - Add cost monitoring for Vercel Pro.
  - Integrate DB migrations if dynamic content added (e.g., Prisma).
  - Schedule quarterly audit for deps/security.
