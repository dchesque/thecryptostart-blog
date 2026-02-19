```yaml
type: agent
name: Test Writer
description: Write comprehensive unit and integration tests
agentType: test-writer
phases: [E, V]
generated: 2026-02-17
status: filled
scaffoldVersion: "2.0.0"
```

# Test Writer Agent Playbook

## Mission

The Test Writer agent ensures code reliability by authoring high-quality unit and integration tests across the codebase. Engage this agent whenever new features are implemented, bugs are fixed, or refactors occur in key areas like API routes, utilities, and pages. It covers:

- Unit tests for pure functions and utilities in `lib/`.
- Integration tests for API controllers in `app/api/`.
- End-to-end tests for critical user flows (e.g., auth, user management).
- Test coverage for dynamic generation functions like `generateStaticParams`.

Prioritize tests for exported symbols and high-impact areas to maintain >80% coverage.

## Responsibilities

- Write unit tests for utilities in `lib/` (e.g., `calculateReadingTime`, `slugify`, validation schemas).
- Author integration tests for API routes (e.g., `GET /api/users`, `POST /api/auth/register`).
- Test dynamic page generation (e.g., `generateStaticParams` in `page.tsx`).
- Validate database interactions using scripts like `scripts/test-query.js` (e.g., `testNestedQuery`).
- Refactor and expand existing tests to match new code changes.
- Generate test reports and fix flakiness.
- Update mocks for external dependencies (e.g., NextAuth, database).

Do **not** write E2E browser tests (delegate to E2E agent) or performance tests.

## Best Practices

Derived from codebase analysis:

- **Testing Framework**: Use Vitest (inferred from Next.js + modern TS setup). Run with `vitest` or `npm test`.
- **Matchers**: Prefer `@vitest/expect` with `toBe`, `toEqual`, `toMatchObject`. For async, use `await expect().resolves`.
- **Mocking**:
  - API routes: Mock `next-auth` with `vi.mock('next-auth/jwt')`.
  - DB: Mock Prisma or query functions via `vi.mock('./db')`.
  - Utils: No mocks needed for pure functions.
- **Structure**:
  | Test Type | File Location | Naming |
  |-----------|---------------|--------|
  | Unit (utils) | `lib/{file}.test.ts` | `describe('functionName', () => { test('scenario', ...) })` |
  | Integration (API) | `app/api/{route}/{file}.test.ts` | `test('GET /api/users', async () => { ... })` |
  | Pages | `__tests__/pages/{page}.test.tsx` | Use `generateStaticParams` mocks. |

- **Conventions**:
  - AAA pattern: Arrange, Act, Assert.
  - Test edge cases: empty inputs, invalid data (use `LoginInput`, `RegisterInput` schemas).
  - Coverage: Aim for 90%+ branches; use `vitest --coverage`.
  - Inputs: Leverage Zod schemas for test data generation (e.g., `LoginInput.parse({})`).
  - Async: Always `await` handlers; mock `NextRequest`/`NextResponse`.
- **Patterns from Codebase**:
  - Slugify/truncate: Test with real blog titles.
  - SEO: Test `generateMetadata` outputs match OpenGraph standards.
  - Auth: Mock sessions in `app/api/auth/[...nextauth]/route.ts`.

Avoid `any`; use inferred types from symbols.

## Key Project Resources

- [Agent Handbook](../AGENTS.md) – Full agent workflows.
- [Contributor Guide](../CONTRIBUTING.md) – PR and testing standards.
- [Documentation Index](../docs/) – API specs and schemas.
- Vitest Docs: [vitest.dev](https://vitest.dev/guide/)
- Testing Library: [testing-library.com](https://testing-library.com/docs/)

## Repository Starting Points

| Directory | Description | Focus for Tests |
|-----------|-------------|-----------------|
| `lib/` | Shared utils/validations/seo | Unit tests for all exports (100% coverage). |
| `app/api/` | API controllers (users, auth) | Integration tests for routes. |
| `app/` | Pages and dynamic routes | Static param generation tests. |
| `scripts/` | Query testing utils | DB integration validation. |
| `__tests__/` or `tests/` | Existing test suite | Expand/align new tests here. |

## Key Files

- [`scripts/test-query.js`](../scripts/test-query.js) – DB query tester; extend `testNestedQuery` for schema validation.
- `lib/validations.ts` – Test Zod schemas (`LoginInput`, etc.).
- `lib/utils.ts` – Core utils (`slugify`, `calculateReadingTime`).
- `lib/seo.ts` – Metadata generators.
- `app/api/users/route.ts` – User API handler.
- `app/api/auth/register/route.ts` – Registration endpoint.
- `app/page.tsx` – Entry page with `generateStaticParams`.

## Architecture Context

| Layer | Directories | Symbol Count | Key Exports for Testing |
|-------|-------------|--------------|-------------------------|
| **Utils** | `lib/` | 10+ | `LoginInput`, `slugify`, `generateMetadata` – Pure functions, full unit coverage. |
| **Controllers** | `app/api/users/`, `app/api/auth/` | 4 routes | `GET`, `POST` handlers – Integration with mocks. |
| **Pages** | `app/` | Dynamic | `generateStaticParams` – Test param arrays. |

No frontend components detected; focus backend/API.

## Key Symbols for This Agent

- `generateStaticParams` (function) @ `page.tsx:25` – Test returns array of path objects.
- `testNestedQuery` (function) @ `test-query.js:16` – Validate nested DB results.
- All lib exports: Test with varied inputs (valid/invalid).

## Documentation Touchpoints

- Update `README.md` with test run instructions post-changes.
- Add inline JSDoc to new test utils.
- Reference `./docs/testing.md` (create if missing) for patterns.
- Link tests to features in PR descriptions.

## Collaboration Checklist

1. [ ] Confirm feature spec with Engineer agent (e.g., "Test POST /api/auth/register with invalid input").
2. [ ] Analyze target file(s) with `analyzeSymbols` or `readFile`.
3. [ ] Write tests → Run locally → Fix failures.
4. [ ] Review coverage report; patch gaps.
5. [ ] Submit PR with test-only changes; tag @reviewer.
6. [ ] Update docs if new patterns emerge.
7. [ ] Capture learnings in `AGENTS.md` (e.g., "Mock NextAuth with vi.fn()").

## Hand-off Notes

- **Outcomes**: New/updated tests with >90% coverage; CI passing.
- **Risks**: Flaky DB mocks – Use fixed seeds.
- **Follow-ups**:
  - Engineer: Merge and run full suite.
  - Reviewer: Spot-check assertions.
  - E2E Agent: Extend to browser flows if needed.
  - Monitor coverage drift in future PRs.
