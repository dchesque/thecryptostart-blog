# Development Workflow

This repository implements a modern Next.js 14+ blog platform (App Router, TypeScript, Tailwind CSS) integrated with Contentful for content management, Prisma for PostgreSQL user data/comments, NextAuth for authentication, and advanced features like SEO optimization, spam prevention, rate limiting, and analytics. The workflow supports rapid iteration for solo maintainers or small teams, emphasizing trunk-based development, automated CI/CD, and production-ready deploys.

## Quickstart Commands

```bash
# Clone, setup, and run locally
git clone https://github.com/yourorg/thecryptostartblog.git
cd thecryptostartblog
cp .env.example .env.local  # Set CONTENTFUL_SPACE_ID, DATABASE_URL, NEXTAUTH_SECRET, etc.
npm install
npx prisma db push
npx prisma generate
npm run db:seed  # Optional: Seed users/comments via prisma/seed.ts
npm run dev      # http://localhost:3000
```

Key ports: Dev server (`3000`), Prisma Studio (`3333` via `npx prisma studio`).

## Branching Strategy

**Trunk-based development** with short-lived branches (<2 days):

| Branch Type | Prefix     | Purpose                          | Example                  |
|-------------|------------|----------------------------------|--------------------------|
| Main        | `main`     | Production-ready (always deployable) | - |
| Feature     | `feature/*` | New functionality                | `feature/blog-search`    |
| Bugfix      | `fix/*`    | Hotfixes/bugs                    | `fix/auth-rate-limit`    |
| Hotfix      | `hotfix/*` | Urgent production issues         | `hotfix/spam-detection`  |

**Workflow**:
1. `git checkout main && git pull origin main`
2. `git checkout -b feature/your-feature`
3. Commit with [Conventional Commits](https://www.conventionalcommits.org/): `feat: add post reading time`, `fix: resolve CSRF validation`
4. `git push origin feature/your-feature` → Creates draft PR
5. Merge via squash to `main` after review/CI
6. Delete branch: `git branch -d feature/your-feature`

**Releases**: Continuous deployment on `main` push (Vercel/Netlify). Tag majors: `git tag v1.2.0 && git push --tags`. Changelog auto-generated from commits.

## Local Development

### Prerequisites
- Node.js 20+
- PostgreSQL 15+ (Docker: `docker run -p 5432:5432 -e POSTGRES_PASSWORD=password postgres`)
- Contentful account (space ID, access token, preview token)
- Google Analytics/OAuth creds for NextAuth

### Scripts
```bash
npm run dev          # Development server with hot reload
npm run build        # Production build (checks types/lint)
npm run start        # Production server
npm run lint         # ESLint + Prettier
npm run type-check   # tsc --noEmit
npm test             # Vitest unit/integration tests
npm run test:e2e     # Playwright E2E
npm run db:studio    # Prisma Studio (http://localhost:3333)
npm run db:seed      # Seed dev data
```

**Tips**:
- Contentful data caches in dev; restart for changes or use preview mode.
- Test admin routes (`/admin`) after login (seed creates test users).
- Debug API routes: `curl http://localhost:3000/api/comments`.
- Clear Next.js cache: `rm -rf .next`.

**Example: Adding a new blog utility**
Edit `lib/contentful.ts` (e.g., extend `getPostsByCategory`):
```typescript
// lib/contentful.ts
export async function getPostsByCategory(category: string, options: PaginationOptions = {}) {
  // Fetch from Contentful using getClient()
  // Transform with transformPost()
}
```
Test: `npm test`, then verify in `/blog/[slug]`.

## Testing Strategy

- **Unit**: Utils (`lib/utils.ts`: `calculateReadingTime`, `formatDate`), Contentful fetchers (`lib/contentful.ts`: `getPostBySlug`), validations (`lib/validations.ts`).
- **Integration**: API routes (`app/api/comments/route.ts`: POST/GET handlers), auth (`lib/permissions.ts`: `hasRole`).
- **E2E**: User flows (login → comment → admin approve) via Playwright.
- Coverage: >85% enforced in CI.

Run specific: `npm test -- lib/contentful.test.ts`.

See [testing-strategy.md](./testing-strategy.md) for mocks (Contentful/Prisma).

## Code Review Checklist

Every PR must pass GitHub Actions CI (lint, types, tests, build). Reviewers check:

- [ ] **Types/Security**: No `any`; Zod schemas (`lib/validations.ts`); rate limits (`lib/rate-limit.ts`, `lib/spam-prevention.ts`: `detectSpam`); CSRF (`lib/csrf.ts`); permissions (`lib/permissions.ts`).
- [ ] **Performance/SEO**: Streaming fetches; static params (`app/blog/[slug]/page.tsx`); metadata (`lib/seo.ts`: `generateMetadata`).
- [ ] **Accessibility**: ARIA on components (`components/CommentsList.tsx`).
- [ ] **Contentful**: Type-safe (`types/blog.ts`: `BlogPost`, `ContentfulBlogPost`); handle empty states.
- [ ] **Changes**: <400 LOC/PR; atomic commits.

**Example PR Feedback**:
```
Great use of `generateStaticParams`! Add test for `getAllPostSlugs` and update `types/blog.ts`.
```

Self-review drafts; 1+ approval required.

## Deployment & Monitoring

- **Platforms**: Vercel (auto-deploys `main`), preview deploys per PR.
- **Environment Vars**: Same as `.env.local` + analytics keys.
- **Post-Deploy**:
  - Check build logs, Core Web Vitals (`lib/analytics.ts`: `sendWebVital`).
  - Validate sitemap (`app/sitemap.ts`), schemas (`lib/seo.ts`).
  - Monitor spam logs, comment approvals (`/api/admin/comments`).

## Onboarding for Contributors

1. Setup local env, run `npm run dev`.
2. Deploy a test PR changing `/app/about/page.tsx` (uses `generateMetadata`).
3. Fix a "good first issue": e.g., enhance `components/CategoryLinks.tsx`.
4. Add test for `lib/contentful.ts#getRelatedPosts`.

**Key Files to Know**:
- Content: `lib/contentful.ts` (queries: `getAllPosts`, `getPostBySlug`)
- Auth/Users: `app/api/users/route.ts`, `app/api/admin/users/page.tsx`
- UI: `components/` (e.g., `CommentsList`, `FAQAccordion`)
- Utils: `lib/utils.ts`, `lib/errors.ts` (custom errors like `RateLimitError`)

See [tooling.md](./tooling.md), [AGENTS.md](./AGENTS.md) for AI-assisted reviews (prompts for Prisma/Contentful).

## Common Pitfalls
- **Contentful**: Ensure `transformPost` handles missing fields.
- **Prisma**: Use transactions for comments/users.
- **Next.js**: Prefer server components; `use client` sparingly.
- **Rate Limiting**: Test `checkRateLimit` with multiple IPs.

Happy coding! 🚀
