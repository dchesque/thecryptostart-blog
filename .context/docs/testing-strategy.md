# Testing Strategy

Quality in the codebase is maintained through automated testing, linting, type checking, and CI/CD pipelines. While the project is in an early stage with limited test coverage (primarily `scripts/test-query.js` for ad-hoc queries), the strategy prioritizes comprehensive coverage for critical paths: authentication (`app/api/auth`), API routes (`app/api/users`, `app/api/comments`, `app/api/admin`), Contentful data fetching (`lib/contentful.ts`), permissions (`lib/permissions.ts`), spam prevention (`lib/spam-prevention.ts`), and SEO utilities (`lib/seo.ts`). TypeScript strict mode, ESLint, and Prettier enforce consistency. All PRs require passing quality gates, including 80% test coverage threshold. As the project matures, introduce E2E tests for key user flows (e.g., blog rendering in `app/blog/[slug]/page.tsx`, admin dashboards in `app/admin`).

## Test Types

### Unit Tests
Focus on pure functions, utilities, and hooks. Use Jest with TypeScript (`*.test.ts` or `*.spec.ts` colocated with source files). Mock externals (e.g., Contentful client, Prisma).

**Example: Testing `lib/utils.ts`**  
```ts
// lib/utils.test.ts
import { describe, expect, test } from '@jest/globals';
import { calculateReadingTime, formatDate, slugify } from './utils';

describe('Utils', () => {
  test('calculateReadingTime returns correct estimate', () => {
    expect(calculateReadingTime('Sample text. About 250 words here.')).toBe('1 min');
  });

  test('formatDate formats ISO string', () => {
    expect(formatDate('2024-01-01T00:00:00Z')).toBe('Jan 1, 2024');
  });

  test('slugify creates valid slugs', () => {
    expect(slugify('My Blog Post!')).toBe('my-blog-post');
  });
});
```

**Example: Mocking Contentful in `lib/contentful.test.ts`**  
```ts
jest.mock('./contentful', () => ({
  getPostBySlug: jest.fn().mockResolvedValue(mockPost),
}));

test('getPostBySlug transforms data correctly', async () => {
  const post = await getPostBySlug('test-slug');
  expect(post.title).toBe('Test Post');
});
```

Target: 90% coverage for `lib/` (utils, seo, permissions, spam-prevention, contentful, constants).

### Integration Tests
Test API handlers (`app/api/*/route.ts`), database interactions (Prisma via `lib/prisma.ts`), and service layers. Use `*.integration.test.ts`. Mock HTTP with MSW, use in-memory SQLite for Prisma.

**Example: Testing `app/api/users/route.ts`**  
```ts
// app/api/users/route.integration.test.ts
import { GET, POST } from './route';
import { createRequest } from 'next-test-api-route-handler'; // or supertest
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({ datasources: { db: { url: 'file:./test.db' } } });

test('GET /api/users returns users', async () => {
  const req = createRequest({ method: 'GET' });
  const res = await GET(req);
  expect(res.status).toBe(200);
  expect(await res.json()).toHaveLength(0); // Empty initially
});
```

Mock externals: `msw` for NextAuth, Contentful; `jest.mock('../lib/contentful')`.

Target: 80% coverage for `app/api/` routes (users, comments, auth, admin).

### E2E Tests (Planned)
Browser flows with Playwright (`e2e/*.spec.ts`). Test rendering (`app/blog/page.tsx`, `app/about/page.tsx`), auth (`app/login/page.tsx`), admin CRUD.

**Example Fixture Setup**  
```ts
// e2e/auth.spec.ts
import { test, expect, Page } from '@playwright/test';

test.describe('User Login', () => {
  test('logs in successfully', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/dashboard/);
  });
});
```

Uses `playwright` config for Next.js dev server, session fixtures, Contentful mocks via MSW.

## Running Tests

Prerequisites: `npm install`. Set `CONTENTFUL_SPACE_ID`, `CONTENTFUL_ACCESS_TOKEN`, `DATABASE_URL` (test DB), `NODE_ENV=test`.

| Command | Description |
|---------|-------------|
| `npm run test` | Run all unit/integration tests |
| `npm run test:watch` | Watch mode for development |
| `npm run test:coverage` | Generate coverage report (HTML in `coverage/`) |
| `npm run test -- lib/utils.test.ts` | Run specific file |
| `npm run test -- --updateSnapshot` | Update snapshots |
| `npm run test:e2e` | E2E headless |
| `npm run test:e2e:ui` | E2E interactive UI |
| `npm run lint` / `npm run lint:fix` | ESLint |
| `npm run format` | Prettier |
| `npm run type-check` | TypeScript |

Husky pre-commit runs `lint`, `format`, `type-check`, `test`.

## Coverage & Quality Gates

- **Minimum Coverage**: 80% statements/branches/functions/lines (`jest --coverage --collectCoverageFrom="['lib/**', 'app/api/**', 'components/**', 'types/**']"`).
  - `lib/`: 90% (critical utils).
  - `app/api/`: 80%.
  - `components/`: 70% (UI logic).
- **Enforced in CI**: GitHub Actions ([.github/workflows/ci.yml]) blocks merges on failures.
- **Threshold Alerts**: SonarQube integration planned for PR comments.

## Best Practices

- **Colocation**: `lib/utils.test.ts` next to `lib/utils.ts`.
- **Mocks**: Explicit `jest.mock('lib/contentful')`; avoid over-mocking.
- **Permissions Testing**: Cover `hasPermission`, `hasRole` with `UserWithRoles` mocks.
- **Error Handling**: Test custom errors (`AppError`, `RateLimitError`) in API routes.
- **Seeds**: Use Prisma `seed.ts` for test data.
- **Flaky Tests**: `jest.retryTimes(2)`; isolate network calls.

## Troubleshooting

- **No Tests Found**: Start with units for exports like `getPostBySlug`, `detectSpam`, `generateMetadata`. Existing: `scripts/test-query.js`.
- **Contentful Flakes**: `jest.mock('lib/contentful', () => ({ getClient: jest.fn() }))`; `jest.retryTimes(3)`.
- **Prisma Slow/Conflicts**: In-memory SQLite (`prisma generate --schema=prisma/test.schema.prisma`); `npx prisma migrate reset --force`.
- **Auth Mocks Fail**: Mock `next-auth` providers; use `Session` type.
- **Jest Cache**: `npx jest --clearCache`.
- **Coverage Ignores**: Update `jest.config.js` excludes.

## Roadmap

1. Add units for top exports: `calculateReadingTime`, `getAllPosts`, `checkRateLimit`.
2. Integration suite for all API routes (e.g., `POST /api/comments` spam checks).
3. E2E for blog (`app/blog/[slug]`), admin (`app/admin/comments`).
4. Visual regression with Playwright.

## Related Resources

- [development-workflow.md](./development-workflow.md)
- [lib/contentful.ts](../lib/contentful.ts) – Mock examples
- [app/api/users/route.ts](../app/api/users/route.ts) – Integration target
- Jest docs: [Testing Next.js App Router](https://nextjs.org/docs/app/building-your-application/testing/testing-app-router)
