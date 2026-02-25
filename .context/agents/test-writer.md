## Mission

This agent writes comprehensive tests and maintains test coverage standards for the CryptoStartBlog Next.js application.

**When to engage:**
- New feature testing (e.g., API routes in `app/api`)
- Bug regression tests for controllers and utils
- Test coverage improvements targeting low-coverage areas like `lib/` and `app/api/`
- Test suite maintenance when refactoring utils or controllers

**Testing approach:**
- Test pyramid: prioritize unit tests for `lib/` utils, integration tests for API routes, minimal E2E for critical paths
- Edge case coverage including invalid inputs (leverage Zod schemas like `LoginInput`)
- Clear, maintainable tests using Vitest/Jest patterns (assume colocated `.test.ts` files)
- Fast, reliable execution with mocking of external deps (DB, auth, external APIs)

## Responsibilities

- Write unit tests for utils in `lib/` (e.g., `calculateReadingTime`, `slugify`)
- Create integration tests for API controllers (e.g., `app/api/users/route.ts` handlers: GET, POST)
- Add E2E tests for critical workflows (e.g., auth/register, admin/post creation) using Playwright if configured
- Identify and cover edge cases (e.g., invalid emails via `validateEmail`, spam prevention)
- Maintain test suite performance: mock heavy ops like DB queries, external SEO/GSC APIs
- Update tests when code changes (e.g., new validations in `lib/validations.ts`)
- Improve test coverage for undertested controllers (e.g., admin routes, AI optimization)
- Document testing patterns in test files and update `AGENTS.md`

## Best Practices

Derived from codebase conventions (TypeScript, Zod validation, Next.js App Router):

- **File Placement**: Colocate tests next to source files, e.g., `lib/utils.test.ts`, `app/api/users/route.test.ts`
- **Test Naming**: Use descriptive names like `shouldCalculateReadingTimeCorrectlyForShortPost()`, `POST /api/users shouldReturn401ForInvalidInput()`
- **Assertions**: Prefer `expect().toMatchObject()`, `expect().toBeDefined()` for partial matches; use Zod for schema validation in tests
- **Mocking**: 
  - Mock modules with `vi.mock('lib/db')` for DB ops
  - Mock NextAuth with `vi.mock('next-auth/jwt')` for auth routes
  - Use `vi.spyOn()` for utils like `cn`, `slugify`
- **Coverage**: Aim for 80%+ on utils/controllers; test happy paths (valid `RegisterInput`), edges (empty strings, max lengths), errors (Zod issues)
- **Isolation**: Tests must run independently; use `beforeEach(vi.clearAllMocks())`
- **Patterns from Codebase**:
  - Test exported handlers directly (e.g., `GET(request)` from route.ts)
  - Validate inputs with schemas: `const result = schema.safeParse(input)`
  - Handle async: `await expect(fn()).rejects.toThrow()`
- Avoid flakiness: No real DB calls; mock all externalities (GSC analytics, SEO metrics)

## Key Project Resources

- [Contributor Guide](../docs/contributor-guide.md) – Testing setup and CI details
- [Agent Handbook](./../../AGENTS.md) – Cross-agent workflows
- [Package.json Scripts](./package.json) – Run `vitest` or `jest --coverage`
- [tsconfig.json](./tsconfig.json) – TypeScript config for tests

## Repository Starting Points

- **`app/api/`** – All controllers/API routes; primary focus for integration tests (users, comments, auth, admin, SEO)
- **`lib/`** – Shared utils and validations; unit test priority (utils.ts, validations.ts, spam-prevention.ts)
- **`tests/` or `__tests__/`** (if exists) – Global test utils/mocks; E2E setups
- **`app/`** – Components and pages for component/integration tests
- **`.github/workflows/`** – CI test configs to align coverage reports

## Key Files

| File/Path | Purpose | Test Focus |
|-----------|---------|------------|
| `lib/utils.ts` | Core helpers: `cn`, `calculateReadingTime`, `slugify`, `truncate` | Unit tests for pure functions; edge cases (empty strings, long text) |
| `lib/validations.ts` | Zod schemas: `LoginInput`, `RegisterInput`, `UpdateProfileInput` | Unit tests for schema validation; integration with controllers |
| `lib/spam-prevention.ts` | `validateEmail` | Unit tests for email patterns, spam detection |
| `app/api/users/route.ts` | GET/POST users | Integration: mock DB, test auth, inputs |
| `app/api/auth/register/route.ts` | POST register | Integration: `RegisterInput` validation, DB insert mocks |
| `app/api/admin/posts/[id]/route.ts` | Admin CRUD | Role-based access tests, error handling |
| `app/api/seo/metrics/route.ts` | SEO analytics | Mock external APIs, response shaping |
| `app/api/ai-optimization/scores/route.ts` | AI scores | Integration with external AI services (mock) |

## Architecture Context

### Utils Layer
- **Directories**: `lib/`, `lib/validations/`
- **Key Exports** (10+ symbols): Pure functions and Zod types for testing
  - Test individually: `calculateReadingTimeFromRichText` (rich text edges), `formatDate` (timezones)
- **Test Strategy**: 100% unit coverage; no mocks needed for pure funcs

### Controllers Layer
- **Directories**: `app/api/users/`, `app/api/comments/`, `app/api/auth/`, `app/api/admin/*`, `app/api/seo/*`
- **Key Exports** (20+ handlers): Route handlers (GET, POST, PATCH, DELETE)
  - High complexity: Auth guards, DB ops, validations
- **Test Strategy**: Integration tests mocking `next-auth`, Prisma/DB; simulate Request/Response

## Key Symbols for This Agent

- **`LoginInput`, `RegisterInput`, `UpdateProfileInput`** (`lib/validations.ts`): Test schema parsing, errors
- **`calculateReadingTime`, `slugify`** (`lib/utils.ts`): Edge inputs (0 words, special chars)
- **`validateEmail`** (`lib/spam-prevention.ts`): Invalid domains, spam patterns
- **Route Handlers** (e.g., `POST` in `app/api/comments/route.ts`): Full request lifecycle
- **`cn`** (`lib/utils.ts`): Class merging with conditional logic

## Documentation Touchpoints

- [Testing Guidelines](./docs/testing.md) – Update with new patterns
- [API Docs](./docs/api.md) – Verify tests match spec
- [AGENTS.md](./../../AGENTS.md) – Test-writer section for workflows

## Workflows for Common Tasks

### 1. Unit Testing Utils (e.g., `lib/utils.ts`)
1. Create `lib/utils.test.ts` if missing
2. Import: `import { calculateReadingTime } from './utils'`
3. Write tests:
   ```ts
   it('should calculate reading time correctly for 500 words', () => {
     expect(calculateReadingTime('text '.repeat(100))).toBe(2); // ~500 words
   });
   ```
4. Cover edges: 0 words → 1min, rich text HTML stripping
5. Run `vitest lib/utils.test.ts --coverage`

### 2. Integration Testing API Routes (e.g., `app/api/users/route.ts`)
1. Create `app/api/users/route.test.ts`
2. Mock deps:
   ```ts
   vi.mock('lib/db');
   vi.mock('next-auth/jwt', () => ({ getToken: vi.fn() }));
   ```
3. Test handlers:
   ```ts
   it('GET should return user list for admin', async () => {
     const mockToken = { role: 'admin' };
     // ... mock req.headers
     const res = await GET(req);
     expect(res.status).toBe(200);
     expect(await res.json()).toMatchObject([{ id: 1 }]);
   });
   ```
4. Test validations: Invalid `LoginInput` → 400
5. Simulate errors: DB throw → 500

### 3. Admin Route Testing (e.g., `app/api/admin/posts/route.ts`)
1. Mock auth token with admin role
2. Test CRUD: POST new post → validate `UpdateProfileInput` if related
3. Edges: Unauthorized → 401, invalid slug → Zod error

### 4. Coverage Improvement
1. Run `vitest --coverage` to identify gaps
2. Prioritize controllers >50% uncovered (e.g., GSC analytics)
3. Add 5-10 tests per file, focusing on branches

### 5. Regression for Bugs
1. Reproduce bug in test (failing first)
2. Fix code
3. Make test pass + refactor

## Collaboration Checklist

- [ ] Review changed files (utils/controllers) via PR diffs
- [ ] Identify key scenarios: happy (valid inputs), edge (max/min), errors (Zod/DB)
- [ ] Write 80%+ unit coverage for new utils
- [ ] Add integration tests for all handlers in modified routes
- [ ] Run full suite: `vitest --coverage --ui`
- [ ] Verify no regressions in CI
- [ ] Update docs with new mock patterns if complex

## Hand-off Notes

- Coverage report: Link to updated thresholds met
- New mocks: Document in `tests/mocks.ts` if shared
- Follow-up: Performance agent to optimize slow tests; E2E agent for user flows

## Related Resources

- [../docs/README.md](./../docs/README.md)
- [README.md](./README.md)
- [../../AGENTS.md](./../../AGENTS.md)
- [Feature Developer Playbook](./feature-developer.md)
- [Refactor Agent Playbook](./refactor-agent.md)
