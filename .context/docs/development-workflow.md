## Development Workflow

This document outlines the day-to-day engineering processes for contributing to TheCryptoStartBlog, a Next.js-powered blog platform with admin tools, SEO optimization, AI content analysis, and Prisma-backed data management. Follow these guidelines to maintain code quality, ensure smooth collaboration, and align with the project's architecture (e.g., API routes in `app/api`, utils in `lib`, and components in `components` and `app`).

Key principles:
- Write clean, type-safe code using TypeScript interfaces like `BlogPost`, `Author`, and `SEOAnalysis`.
- Leverage utilities such as `cn` for class merging, `calculateReadingTime`, and `analyzeSEO` for consistent functionality.
- Always consider SEO, spam prevention (`detectSpam`, `checkRateLimit`), and permissions (`hasPermission`).
- Use Prisma for database operations via `lib/prisma.ts`.

Start your workflow by cloning the repo, setting up your environment, and running checks before every commit or PR.

## Branching & Releases

**Branching Model**: Trunk-based development with short-lived feature branches off `main`.

- `main` — Always deployable production code. Contains the latest stable releases.
- `feature/<name>` — New features (e.g., `feature/ai-optimization-dashboard`).
- `fix/<name>` — Hotfixes (e.g., `fix/gsc-client-auth`).
- `chore/<name>` — Refactors, tooling updates (e.g., `chore/prisma-migrations`).
- `release/vX.Y.Z` — Temporary branches for preparing releases (rarely used).

**Release Cadence**: Continuous deployment on `main` merges via GitHub Actions or Vercel. Weekly minor releases for features; patches as needed for bugs.

**Tagging Conventions**:
- Use semantic versioning: `git tag v1.2.3 && git push --tags`.
- Annotate tags: `git tag -a v1.2.3 -m "Release v1.2.3: Added AI expansion tools"`.
- Automated changelog generation via commit messages following Conventional Commits (e.g., `feat: add keyword gap analysis`).

Merge via squash or rebase to keep history linear. Delete branches post-merge.

## Local Development

**Prerequisites**:
- Node.js 18+ and pnpm/npm/yarn.
- Docker (optional, for DB testing).
- Google Search Console API credentials for GSC features.

**Setup Commands**:
```bash
# Clone and install
git clone <repository-url>
cd thecryptostartblog
cp .env.example .env.local
npm install  # or pnpm install

# Database setup (Prisma)
npx prisma generate
npx prisma db push  # Or migrate for production-like setup
npx prisma studio  # Optional: Open DB explorer
```

**Daily Commands**:
```bash
- Dev server: `npm run dev` (runs `next dev` at http://localhost:3000)
- Production build: `npm run build` (runs `next build`)
- Start production: `npm run start`
- Lint: `npm run lint` (ESLint + TypeScript checks)
- Type check: `npm run type-check`
- Test: `npm test` (unit/integration tests; see [testing-strategy.md](./testing-strategy.md))
```

**Pre-Commit Hooks** (via Husky, if configured):
```bash
npm run lint && npm run type-check && npm test -- --watchAll=false && npm run build
```

**Database Seeding** (for dev/testing):
```bash
npx prisma db seed  # Runs prisma/seed.ts
node scripts/test-db.ts  # Test DB connectivity
```

**Useful Scripts**:
- `npm run seo-monitor` — Run daily SEO checks (`scripts/seo-monitor.ts`).
- Tailwind rebuild on changes via `npm run dev`.

See [tooling.md](./tooling.md) for editor configs, VS Code extensions, and advanced tooling.

## Code Review Expectations

Code reviews ensure reliability, especially for SEO-critical features (e.g., `analyzeSEO`, GSC integrations) and security (e.g., auth routes, rate limiting).

**PR Requirements**:
- Descriptive title and body: Link issues, explain changes, include screenshots for UI (e.g., admin dashboards).
- Linked issues: Use "Fixes #123".
- Tests: Add unit tests for utils (`lib`), integration for API routes (`app/api`).
- Docs: Update types (`types/`), READMEs, or this workflow for breaking changes.
- CI must pass: Lint, types, build, tests.

**Review Checklist**:
- Does code use existing patterns (e.g., `transformPrismaPost` for posts, error classes like `AppError`)?
- Permissions and validation handled (`hasRole`, Zod schemas in `lib/validations`)?
- SEO/AI utils integrated where relevant (`calculateAIOptimizationScore`)?
- No regressions in core flows (posts, comments, admin CRUD)?
- Performance: No unnecessary DB queries; use `getAllPosts`, pagination.
- Security: Spam checks, rate limits, no hardcoded secrets.

Require 1+ approving review. Self-review OK for trivial changes. Use "Approve" or "Request Changes". Reference [AGENTS.md](../../AGENTS.md) for collaborating with AI agents on reviews (e.g., auto-generating test cases).

## Onboarding Tasks

Welcome! Get up to speed quickly:

1. Complete local setup and verify `npm run dev` loads the blog + admin (`/admin`).
2. Run `npm test` and fix any failures.
3. Browse issues labeled `good-first-issue` or `help-wanted` (e.g., utils improvements, component tweaks).
4. Seed DB and test key flows: Create a post, analyze SEO, check GSC dashboard.
5. Read [testing-strategy.md](./testing-strategy.md) and add a test to an existing util like `slugify`.

**Starter Tickets**:
- Polish `components/admin` UIs.
- Extend `lib/ai-optimization.ts` for new metrics.
- Add tests for `app/api/admin` routes.

**Dashboards/Resources**:
- [Vercel/Netlify dashboard] for previews.
- Prisma Studio for data exploration.
- GitHub Projects for workflow tracking.

## Related Resources

- [testing-strategy.md](./testing-strategy.md)
- [tooling.md](./tooling.md)
