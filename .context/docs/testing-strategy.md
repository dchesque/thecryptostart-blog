## Testing Strategy

Quality is maintained through a layered testing approach emphasizing fast, reliable tests that verify behavior across the Next.js application, including API routes, server actions, components, utilities, and database interactions via Prisma. We follow the test pyramid: prioritize unit tests for isolated logic (e.g., `lib/utils.ts`, `lib/seo-analyzer.ts`), integration tests for data flows and API endpoints (e.g., `app/api/admin/posts/route.ts`), and selective E2E tests for critical user workflows like admin dashboards and blog rendering.

Key principles:
- Tests are co-located with source files (e.g., `lib/posts.test.ts` next to `lib/posts.ts`).
- Use mocks for external services (Prisma, Google Search Console client, rate limiters).
- Every new feature or bug fix requires corresponding tests.
- CI enforces coverage and blocks merges on failures.
- Cross-reference: See [development-workflow.md](./development-workflow.md) for local setup and PR processes.

## Test Types

- **Unit**: Jest with React Testing Library for components and Vitest/Jest for pure functions. Files named `*.test.ts` or `*.test.tsx` co-located with source (e.g., `lib/seo-analyzer.test.ts`). Mock dependencies like PrismaClient using `@prisma/client` mocks or `msw` for HTTP. Example: Test `analyzeSEO` exports for edge cases in headings, links, and word counts.
- **Integration**: Jest, files named `*.integration.test.ts`. Test API routes (e.g., `app/api/admin/posts/[id]/route.ts`), database ops via test DB (scripted from `scripts/test-db.ts`), and component-server interactions. Use `supertest` for API and in-memory Prisma for isolation.
- **E2E**: Playwright (if implemented), files in `e2e/*.spec.ts`. Test user journeys like login (`app/api/auth/register`), post creation in admin (`app/admin/posts/new`), and blog rendering (`app/blog/[slug]`). Run against full stack with test DB and mocked external APIs (GSC, auth).

## Running Tests

- All tests: `npm run test`
- Watch mode: `npm run test -- --watch`
- Coverage: `npm run test -- --coverage`
- Specific file: `npm run test -- lib/posts.test.ts`
- Integration only: `npm run test -- integration`
- Update snapshots: `npm run test -- -u`
- Typecheck + lint (pre-test): `npm run lint && npm run typecheck`

Coverage reports generated in `coverage/` with HTML viewer; thresholds enforced in `jest.config.ts`.

## Quality Gates

- **Coverage**: 80% statements/branches overall; 90% for lib/ (utils, posts, seo-analyzer); 100% for critical paths (auth, permissions, rate limiting).
- **Linting/Formatting**: `npm run lint -- --fix` must pass; Prettier enforced via Husky pre-commit.
- **TypeScript**: `npm run typecheck` (strict mode).
- **Build**: `npm run build` succeeds without errors.
- **CI Checks** (GitHub Actions):
  - All tests + coverage > baseline.
  - No flaky suites (retries limited to 2).
  - Security scan + dependency updates.
- PR Requirements: Tests pass, coverage not regressed, approvals from 2 devs.

## Troubleshooting

**Flaky Tests**:
- Database: Reset test DB with `npx prisma db push --schema=./prisma/test-schema.prisma` or use `scripts/test-db.ts`.
- Timeouts: Increase Jest timeout for Prisma queries; mock slow libs like `gsc-client.ts`.
- Mocks: Ensure `vi.mock('lib/prisma')` or MSW handlers cover all routes.

**Long-Running Tests**:
- Profile with `--collectCoverageFrom` excluding heavy paths.
- Parallelize with Jest `--runInBand=false`.

**Environment Quirks**:
- Node 20+ required; use `.nvmrc`.
- Clear `node_modules/.cache/jest` for stale mocks.
- Prisma: Run `npx prisma generate` after schema changes.

For workflow integration, see [development-workflow.md](./development-workflow.md).
