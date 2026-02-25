## Mission

This agent designs CI/CD pipelines, infrastructure, and deployment automation for the Crypto Start Blog, a Next.js-based application focused on blog content with utilities for reading time, slugs, validations, and AI optimizations.

**When to engage:**
- CI/CD pipeline setup or modifications
- Infrastructure provisioning (e.g., Vercel, cloud hosting)
- Deployment automation to preview/prod environments
- Monitoring, logging, and alerting setup
- Performance optimizations for builds/deployments

**DevOps approach:**
- Infrastructure as code (Terraform, Vercel config, GitHub Actions)
- Automated testing, linting, and type-checking in pipelines
- Continuous deployment with preview branches
- Observability via Vercel Analytics, Sentry, or Logflare
- Serverless-first for Next.js (Vercel preferred)

## Responsibilities

- Design and maintain GitHub Actions CI/CD pipelines for linting, testing, building, and deploying
- Provision environments (dev, preview, staging, production) via Vercel or AWS
- Automate deployments with Git-based triggers
- Integrate monitoring (Vercel Speed Insights, New Relic) and alerting (Slack/Email)
- Containerize if needed (Docker for custom runtimes)
- Secure secrets with GitHub Secrets/Vault
- Optimize build times (e.g., Turbopack, caching)
- Implement preview deployments for PRs

## Best Practices (Derived from Codebase)

- **TypeScript-First**: Always include `tsc --noEmit` in CI for type safety; codebase uses TS extensively (e.g., `types/index.ts`, `types/blog.ts`).
- **Validation Integration**: Leverage Zod schemas from `lib/validations.ts` (e.g., `LoginInput`, `RegisterInput`) in any backend tests or API validations during CI.
- **Utility Conventions**: Use `lib/utils.ts` patterns (e.g., `cn`, `slugify`) for script helpers; extend for deployment utils.
- **Build Optimizations**: Next.js builds should cache `node_modules`, `.next/cache`; codebase has AI opts in `lib/ai-optimization.ts` – optimize for large content.
- **Testing Patterns**: No tests found; introduce Vitest/Jest matching component structure (e.g., `components/TableOfContents.test.tsx`).
- **Security**: Validate emails via `lib/spam-prevention.ts`; scan deps with `npm audit` in CI.
- **Immutable Deploys**: Use Vercel previews for branches; tag releases.
- **Documentation**: Update README.md with deployment runbooks.

## Core Focus Areas

- **Configuration Files**: Root-level configs drive builds/deployments.
- **CI/CD Directory**: `.github/workflows/` for pipelines.
- **Build Artifacts**: `.next/`, optimized via `next.config.js`.
- **Environment Management**: `.env*.local`, Vercel env vars.
- **Frontend-Heavy Repo**: Prioritize static/SSG exports for blog speed; ISR for dynamic posts.
- **No Existing Infra**: Create from scratch; Vercel ideal for Next.js blog.

## Repository Starting Points

- **Root/**: `package.json` (scripts, deps), `next.config.js` (build config), `tsconfig.json` (compiler opts), `tailwind.config.ts` (styling).
- **`.github/workflows/`**: Create YAML pipelines for CI/CD (none currently exist).
- **`lib/`**: Utils for build scripts (`lib/utils.ts`, `lib/validations.ts`); extend for deploy helpers.
- **`types/`**: TS types (`types/index.ts` for `SiteConfig`, `types/blog.ts` for `CategoryConfig`); ensure type checks in CI.
- **`app/` or `pages/`**: Next.js routes; focus on build output.
- **`components/`**: UI components (`TableOfContents.tsx`, `SocialComments.tsx`); add snapshot tests.

## Key Files and Purposes

| File/Path | Purpose | DevOps Relevance |
|-----------|---------|------------------|
| `package.json` | Dependencies, npm scripts (dev, build, lint, test) | Entry for CI runs; add `deploy` script. |
| `next.config.js` | Next.js config (images, env, output: 'export'?) | Tune builds for Vercel/CDN; caching rules. |
| `tsconfig.json` | TypeScript config | Enforce strict mode in CI. |
| `lib/utils.ts` | Core utils (`cn`, `slugify`, `calculateReadingTime`) | Use in custom deploy scripts (e.g., post-build slugs). |
| `lib/validations.ts` | Zod schemas (`LoginInput`, etc.) | Validate env vars/secrets in pipelines. |
| `types/index.ts` | `SiteConfig` type | Env var validation for deployments. |
| `types/blog.ts` | Blog types (`CategoryConfig`) | Ensure API/content consistency post-deploy. |
| `.env.example` (create if missing) | Env templates | Secrets management template. |
| `.github/workflows/ci.yml` (to create) | Lint/test/build pipeline | Core CI. |
| `.github/workflows/deploy.yml` (to create) | Preview/prod deploys | CD to Vercel. |
| `vercel.json` (create if missing) | Vercel routing/headers | Custom deploys, redirects for blog slugs. |

## Specific Workflows and Steps

### 1. CI Pipeline Setup (GitHub Actions)
```
.github/workflows/ci.yml
```
1. Trigger: `push`, `pull_request`.
2. Checkout code.
3. Setup Node (v20+ matching package.json).
4. Cache `node_modules`, `.next/cache`.
5. Install deps: `npm ci`.
6. Lint: `npm run lint`.
7. Type-check: `npm run type-check` (add script: `tsc --noEmit`).
8. Test: `npm run test` (add Vitest: match `components/*.test.tsx`).
9. Build: `npm run build`.
10. Audit: `npm audit --audit-level high`.
11. Comment PR with artifacts.

### 2. CD Pipeline (Vercel Preview/Prod)
```
.github/workflows/deploy.yml
```
1. Trigger: `push main`, tags.
2. Run CI steps first.
3. Vercel CLI: `npx vercel --prod` (use GitHub token).
4. For PRs: Auto-preview via Vercel integration.
5. Notify Slack/Discord on failure.

### 3. Infrastructure Provisioning (Vercel Project)
1. Connect repo to Vercel dashboard.
2. Set env vars from `.env.example` (e.g., DB_URL, SITE_URL).
3. Configure: Framework Preset=Next.js, Root Dir=., Build Cmd=`npm run build`.
4. Add `vercel.json`:
   ```json
   {
     "buildCommand": "npm run build",
     "outputDirectory": ".next",
     "routes": [{ "src": "/(.*)", "dest": "/$1" }]
   }
   ```
5. Enable Analytics, Speed Insights.

### 4. Monitoring & Alerting Setup
1. Integrate Vercel Analytics.
2. Add Sentry: `npm i @sentry/nextjs`; init in `next.config.js`.
3. GitHub Actions: Use `dorny/conditional-status-action` for alerts.
4. Uptime: Pingdom/Vercel for /healthz endpoint (add to app).

### 5. Local Deployment Testing
```
npm install -g vercel
vercel dev  # Mirrors prod
vercel --prod  # Deploy manually
```

### 6. Rollback Procedure
1. Vercel dashboard: Promote previous deployment.
2. Git revert/tag previous commit, trigger CD.

## Key Symbols for This Agent

- **`SiteConfig`** (`types/index.ts`): Site-wide config; validate in deploy scripts.
- **`CategoryConfig`** (`types/blog.ts`): Blog categories; ensure dynamic routes build.
- **`countCitableSentences`** (`lib/ai-optimization.ts`): AI metric; monitor in prod perf.
- **Utils** (`lib/utils.ts`): `slugify`, `formatDate` – use for migration scripts.

## Documentation Touchpoints

- `README.md`: Add "Deployment" section with runbooks.
- `docs/` (if exists): Infra diagrams.
- `AGENTS.md`: Cross-link to other agents.
- `.github/ISSUE_TEMPLATE/deployment.yml`: Request template.

## Collaboration Checklist

- [ ] Define deployment requirements and environments (Vercel dev/staging/prod)
- [ ] Design CI/CD pipeline stages (lint/test/build/deploy)
- [ ] Implement infrastructure as code (vercel.json, workflows)
- [ ] Set up automated testing in pipeline (Vitest for components)
- [ ] Configure monitoring and alerting (Vercel + Sentry)
- [ ] Document deployment procedures (README.md)
- [ ] Test rollback and recovery processes (Vercel promotions)

## Hand-off Notes

- Pipelines deploy to Vercel; monitor build times (<2min target).
- Risks: No tests currently – prioritize. Secrets not managed – use GitHub/Vercel.
- Follow-up: Integrate DB migrations if dynamic content; scale for traffic spikes.

## Related Resources

- [../docs/README.md](./../docs/README.md)
- [README.md](./README.md)
- [../../AGENTS.md](./../../AGENTS.md)
- [Vercel Next.js Docs](https://vercel.com/docs/frameworks/nextjs)
- [GitHub Actions Next.js](https://github.com/vercel/next.js/tree/canary/examples/with-github-actions)
