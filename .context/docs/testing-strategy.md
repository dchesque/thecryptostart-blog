## Testing Strategy

Quality in the codebase is maintained through a combination of automated testing, linting, type checking, and CI/CD pipelines integrated into the development workflow. Although the project is in an early stage with limited test coverage currently, the strategy emphasizes comprehensive unit and integration testing for critical paths like authentication, API routes, Contentful data fetching, and permission checks. TypeScript's strict mode enforces type safety, while ESLint and Prettier ensure code consistency. All pull requests must pass quality gates before merging, including minimum test coverage thresholds. As the codebase grows, end-to-end (E2E) tests will be introduced for user flows such as blog post rendering and admin dashboards. Developers are encouraged to follow [development-workflow.md](./development-workflow.md) for local setup and contribution guidelines.

## Test Types

- **Unit**: Jest with TypeScript support (`*.test.ts` or `*.spec.ts` files colocated with source files). Used for testing pure functions (e.g., `lib/utils.ts`, `lib/permissions.ts`), utilities like `calculateReadingTime`, and custom hooks. Requires `@jest/globals`, `ts-jest`, and `@types/jest`. Mock external dependencies like Contentful client using `jest.mock`.
- **Integration**: Jest for API routes and database interactions (e.g., Prisma queries in `app/api` routes). Files named `*.integration.test.ts`. Test real handler functions like `GET` in `app/api/users/route.ts` with `msw` for mocking external services and `prisma` in-memory client for database isolation.
- **E2E**: Playwright planned for browser-based flows (e.g., login, blog navigation). Files in `e2e/` directory named `*.spec.ts`. Uses `playwright` for cross-browser testing on Next.js app server, with fixtures for authenticated sessions and Contentful mocks.

## Running Tests

- All tests: `npm run test`
- Watch mode: `npm run test:watch`
- Coverage: `npm run test:coverage`
- Update snapshots: `npm run test -- --updateSnapshot`
- Specific file: `npm run test -- lib/utils.test.ts`
- E2E tests: `npm run test:e2e` (headless) or `npm run test:e2e:ui` (interactive)

Install dependencies first: `npm install`. Ensure `CONTENTFUL_SPACE_ID` and `CONTENTFUL_ACCESS_TOKEN` env vars are set for integration tests.

## Quality Gates

- **Test Coverage**: Minimum 80% statements, branches, functions, and lines across the codebase. Enforced via `jest --coverage --collectCoverageFrom="['lib/**', 'app/api/**', 'components/**']"`.
- **Linting**: `npm run lint` must pass (ESLint with `@typescript-eslint` rules). Fix automatically with `npm run lint:fix`.
- **Formatting**: `npm run format` (Prettier). Run before commits via Husky pre-commit hook.
- **Type Checking**: `npm run type-check` (TypeScript strict mode).
- **CI/CD**: GitHub Actions workflow requires all gates to pass on PRs. No merges without approvals and passing status.

## Troubleshooting

- **Flaky Contentful Tests**: Mock `getClient` in `lib/contentful.ts` explicitly. Use `jest.retryTimes(3)` for network-dependent suites.
- **Long-Running Prisma Tests**: Use in-memory SQLite for integration tests via `prisma:generate --schema=./prisma/test.schema.prisma`.
- **Environment Issues**: Set `NODE_ENV=test` and `DATABASE_URL` to a test DB. Clear Jest cache with `jest --clearCache` if mocks fail.
- **No Tests Found**: Current codebase has minimal tests (e.g., `scripts/test-query.js`). Add unit tests for exports like `hasPermission` and `getPostBySlug` first.

## Related Resources

- [development-workflow.md](./development-workflow.md)
