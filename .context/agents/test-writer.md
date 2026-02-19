# Test Writer Agent Playbook

## Mission

The Test Writer agent maintains codebase reliability by authoring, expanding, and refactoring comprehensive unit, integration, and edge-case tests. Engage this agent after new code is added, during refactors, or when coverage drops below 80%. It focuses on:

- Unit tests for pure utilities and validations in `lib/`.
- Integration tests for API routes in `app/api/`.
- Edge cases for auth, user management, comments, and spam prevention.
- Ensuring test maintainability through mocks, schemas, and coverage reports.

Prioritize exported symbols from utils and controllers to support rapid iteration while minimizing regressions.

## Responsibilities

- Author unit tests for all exported functions and types in `lib/` (e.g., `calculateReadingTime`, `slugify`, `LoginInput`).
- Create integration tests for API handlers (e.g., `GET /api/users`, `POST /api/auth/register`, `POST /api/comments`).
- Test dynamic route generation like `generateStaticParams` in pages.
- Validate Zod schemas with parse/fail scenarios using `RegisterInput`, `UpdateProfileInput`.
- Mock external dependencies (NextAuth, DB queries, IP detection) for reproducible tests.
- Refactor flaky or outdated tests; generate coverage reports with `vitest --coverage`.
- Test spam prevention logic (`validateEmail`, `checkRateLimit`) with varied inputs.
- Ensure tests cover admin routes (`app/api/admin/comments`) and user mutations (`PATCH /api/users/[id]`).

Delegate E2E browser tests to specialized agents.

## Best Practices

- Use Vitest as the primary framework; structure tests with `describe` blocks per module and `test/it` for scenarios.
- Follow AAA pattern: Arrange (setup mocks/data), Act (call function/handler), Assert (expect outcomes).
- Leverage Zod schemas for test data: `const validData = LoginInput.parse({ email: 'test@example.com', password: 'pass' })`.
- Mock strategies:
  | Dependency | Mock Pattern |
  |------------|--------------|
  | NextAuth | `vi.mock('next-auth/jwt', () => ({ decode: vi.fn() }))` |
  | DB/Prisma | `vi.mock('@/lib/db', () => ({ query: vi.fn().mockResolvedValue(mockData) }))` |
  | Request | `new NextRequest('http://localhost/api/users', { headers: { 'x-forwarded-for': '1.2.3.4' } })` |
- Name tests descriptively: `test('calculateReadingTime returns correct minutes for 500 words', () => { ... })`.
- Cover branches: happy path, edge (empty/null inputs), errors (invalid email via `validateEmail`).
- Async handling: `await expect(handler(req)).resolves.toMatchObject({ data: [...] })`.
- Run tests: `npm test` or `vitest lib/utils.test.ts`; aim for 90%+ coverage, no globals.
- Pure functions (e.g., `formatDate`, `truncate`): No mocks, exhaustive input ranges.
- Maintainability: Use `beforeEach` for resets; snapshot sparingly for complex objects.

## Key Project Resources

- [Agent Handbook](../../AGENTS.md) – Agent collaboration protocols.
- [Documentation Index](../docs/README.md) – Schemas, API specs.
- [Main README](../README.md) – Setup and run instructions.
- [Contributor Guide](../CONTRIBUTING.md) – PR standards including test requirements.

## Repository Starting Points

- `lib/` – Utilities, validations, spam prevention; focus on 100% unit test coverage for exports.
- `app/api/` – Controllers for users, auth, comments, admin; integration tests for all HTTP methods.
- `app/` – Pages and dynamic routes; test metadata and param generation.
- `scripts/` – DB query testers; extend for schema validation.
- `__tests__/` or colocated `*.test.ts` – Existing tests; align new ones here.

## Key Files

- `lib/validations.ts` – Zod schemas (`LoginInput`, `RegisterInput`, `UpdateProfileInput`); test parse/safeParse.
- `lib/utils.ts` – Helpers (`calculateReadingTime`, `formatDate`, `slugify`, `truncate`); unit tests with real-world inputs.
- `lib/spam-prevention.ts` – Rate limiting (`validateEmail`, `getClientIP`, `checkRateLimit`); mock IP headers.
- `app/api/users/route.ts` – `GET` and `POST` handlers; test pagination and auth.
- `app/api/auth/register/route.ts` – `POST` registration; validate inputs and conflicts.
- `app/api/comments/route.ts` – `POST`/`GET`; test nesting and moderation.
- `app/api/admin/comments/[id]/route.ts` – `PATCH`/`DELETE`; admin auth mocks.

## Architecture Context

- **Utils** (`lib/`): 10+ symbols; pure functions and types; full unit tests, no external deps.
- **Controllers** (`app/api/users`, `app/api/comments`, `app/api/auth`, `app/api/admin`): 10+ handlers; integration tests with request/response mocks; 5-8 symbols per route file.

## Key Symbols for This Agent

- `LoginInput` (type) @ `lib/validations.ts:20` – Test schema validation failures.
- `RegisterInput` (type) @ `lib/validations.ts:21` – Parse with duplicate emails.
- `calculateReadingTime` (function) @ `lib/utils.ts:1` – Vary word counts (0-5000).
- `slugify` (function) @ `lib/utils.ts:14` – Special chars, lengths.
- `validateEmail` (function) @ `lib/spam-prevention.ts:20` – Invalid formats, disposable domains.
- `checkRateLimit` (function) @ `lib/spam-prevention.ts:34` – IP-based throttling.
- `GET` (handler) @ `app/api/users/route.ts:15` – Authenticated lists.
- `POST` (handler) @ `app/api/auth/register/route.ts:12` – Full flow with mocks.

## Documentation Touchpoints

- Reference and update `../README.md` for test commands and coverage thresholds.
- Add JSDoc to test utilities in `scripts/test-query.js`.
- Consult `../docs/README.md` for API contracts before testing.
- Create/extend `./docs/testing.md` with new mock patterns.
- Link tests to specs in PRs via `AGENTS.md` updates.

## Collaboration Checklist

1. [ ] Confirm task with Engineer agent: "Generate tests for new `POST /api/comments` handler using `RegisterInput`."
2. [ ] Gather context: Use `listFiles('**/*.ts')`, `analyzeSymbols('lib/utils.ts')`, `searchCode('export.*function')`.
3. [ ] Write tests in colocated `*.test.ts`; run `vitest --run --coverage`.
4. [ ] Fix failures, add edges; validate >90% coverage.
5. [ ] Propose PR: Test-only changes, reference feature PR.
6. [ ] Review feedback from Reviewer agent; iterate.
7. [ ] Update `../../AGENTS.md` with new patterns (e.g., "Spam mocks via `getClientIP`").

## Hand-off Notes

Upon completion, deliver passing tests with coverage report. Risks: External API changes (mitigate with mocks). Follow-ups: Notify Engineer for integration; E2E agent for user flows; monitor CI for drift.
