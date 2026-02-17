## Development Workflow

This repository follows a streamlined, collaborative development process optimized for a small team or solo maintainers working on a Next.js blog platform integrated with Contentful and Prisma. The day-to-day cycle emphasizes rapid iteration, automated testing, and continuous deployment:

1. **Plan and Branch**: Identify work from GitHub issues. Create a feature branch from `main` (e.g., `git checkout -b feature/add-user-analytics`).
2. **Develop Locally**: Implement changes using the local setup (see [Local Development](#local-development)). Focus on TypeScript types, Zod validations, and Contentful data fetching utilities in `lib/contentful.ts`.
3. **Test Iteratively**: Run tests locally (`npm test`) and ensure UI changes render correctly in dev mode. Update SEO metadata generators in `lib/seo.ts` and permissions in `lib/permissions.ts` as needed.
4. **Commit and Push**: Use conventional commits (e.g., `feat: add reading time to blog posts`). Push to open a draft PR.
5. **Review and Iterate**: Request reviews, address feedback, and re-run CI checks.
6. **Merge and Deploy**: Squash-merge to `main` after approvals. Vercel (or your host) auto-deploys on push.
7. **Monitor**: Check production logs, Contentful previews, and analytics post-deploy.

Prioritize small, atomic PRs (<300 lines) to maintain velocity. Use GitHub Actions for CI/CD pipelines that run linting, type-checking, and tests on every PR.

## Branching & Releases

- **Model**: Trunk-based development with short-lived feature branches.
  - `main`: Always deployable production branch.
  - `feature/*`: For new features (e.g., `feature/blog-search`).
  - `fix/*`: For bugs (e.g., `fix/auth-rate-limit`).
  - `release/*`: Rare hotfixes on stable releases.
- **Workflow**:
  - Branch from `main`.
  - No long-running `develop` or release branches.
  - Delete branches after merge.
- **Releases**:
  - Cadence: Continuous (deploy on `main` push).
  - Tagging: Semantic versioning (`v1.2.0`) on major changes. Use `git tag v1.2.0 && git push --tags`.
  - Automated: GitHub Releases draft from tags; changelog via conventional commits.

## Local Development

- **Prerequisites**:
  - Node.js 20+.
  - PostgreSQL (local or Docker) for Prisma.
  - Contentful space ID, access token, and preview token.
  - NextAuth secret and provider credentials.

```
# Clone and setup
git clone https://github.com/yourorg/thecryptostartblog.git
cd thecryptostartblog

# Copy env
cp .env.example .env.local  # Edit with your CONTENTFUL_SPACE_ID, DATABASE_URL, NEXTAUTH_SECRET, etc.

# Install dependencies
npm install

# Database setup
npx prisma db push  # Migrate schema
npx prisma generate  # Generate client
npm run db:seed      # Optional: node prisma/seed.ts

# Run dev server (http://localhost:3000)
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Lint and type-check
npm run lint
```

Hot-reload enabled in dev. Contentful fetches cache in dev; clear with `npm run dev -- --turbo` if needed. For admin features, log in via `/admin`.

## Code Review Expectations

Code reviews ensure high-quality, secure contributions aligned with the app's architecture (App Router, server components, RSC patterns). Every PR requires:

- **Checklists**:
  - [ ] Linting and types pass (`npm run lint && tsc --noEmit`).
  - [ ] Tests updated/passing (unit for utils like `lib/contentful.ts`; E2E for pages).
  - [ ] No console.logs or `any` types.
  - [ ] Security: Rate limiting (`lib/rate-limit.ts`), CSRF (`lib/csrf.ts`), permissions (`lib/permissions.ts`).
  - [ ] SEO/docs: Metadata via `lib/seo.ts`; update types in `types/`.
  - [ ] Performance: No blocking fetches; use `generateStaticParams` for dynamic routes.
- **Approvals**: At least 1 maintainer approval. Self-review drafts for WIP.
- **Agent Collaboration**: Use AI agents (e.g., via Cursor or GitHub Copilot) for initial drafts, but always human-review. See [AGENTS.md](AGENTS.md) for prompts on reviewing Contentful integrations and Prisma queries.

PRs auto-block on failing CI. Aim for <24h turnaround.

## Onboarding Tasks

New contributors:
- [ ] Run local setup and deploy a test change to `/about`.
- [ ] Fix a "good first issue" like enhancing `calculateReadingTime` in `lib/utils.ts`.
- [ ] Add a test for `getPostBySlug` in `lib/contentful.ts`.
- Resources: [testing-strategy.md](./testing-strategy.md), [tooling.md](./tooling.md), Contentful dashboard for blog posts.

## Related Resources

- [testing-strategy.md](./testing-strategy.md)
- [tooling.md](./tooling.md)
