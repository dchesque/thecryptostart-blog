# Bug Fixer Playbook

## Mission

This agent analyzes bug reports, error messages, and stack traces from the CryptoStartBlog Next.js application, implementing targeted fixes with minimal side effects. Focus on API controllers, validation logic, and error handling in a production-like environment.

**When to engage:**
- Bug reports from users or monitoring (e.g., Sentry, Vercel logs)
- API endpoint failures (e.g., 500 errors in `/api/users`, `/api/comments`)
- Validation or authentication issues
- Production incidents, regressions after deployments
- Error log analysis from auth, admin, or SEO routes

**Fix approach:**
- Root cause analysis using reproduction steps, logs, and local debugging
- Minimal, focused changes respecting Next.js App Router patterns
- Add regression tests in `__tests__` or `tests/` directories (if present)
- Leverage existing `lib/errors.ts` for consistent error responses
- Impact assessment via manual testing of affected endpoints

## Responsibilities

- Reproduce bugs using tools like curl, Postman, or local dev server (`npm run dev`)
- Trace issues through API routes (`app/api/*`), utils (`lib/`), and DB interactions (likely Prisma or similar)
- Implement fixes in handler functions (e.g., GET/POST in `route.ts`)
- Write regression tests matching existing patterns (e.g., Jest with supertest for APIs)
- Update `handleError` wrappers if error patterns recur
- Document fixes in commit messages and inline comments
- Verify across environments (dev, staging, prod-like)
- Scan for similar bugs in sibling routes (e.g., users → comments → admin)

## Workflows

### 1. Bug Reproduction & Analysis
1. Review bug report/error log: Identify endpoint (e.g., `POST /api/users`), payload, expected vs. actual.
2. Start local server: `npm run dev`.
3. Reproduce with curl/Postman: Match headers (auth cookies/JWT), body.
4. Enable debug logs: Add `console.log` in route handlers; check browser console/network tab.
5. Use VS Code debugger: Attach to Node.js process on API routes.
6. Trace stack: Focus on `lib/errors.ts` symbols or validation failures.

### 2. Root Cause Investigation
1. List affected files: Use `listFiles("app/api/**/*.ts")`, `searchCode("error.message")`.
2. Analyze symbols: `analyzeSymbols("app/api/users/route.ts")` for handler functions.
3. Check validations: Inspect `lib/validations.ts` (e.g., `LoginInput`, `RegisterInput`).
4. DB/query issues: Review Prisma schemas/queries if errors point to DB.
5. Utils bugs: Test `calculateReadingTime`, `slugify` with failing inputs.
6. Error patterns: Search for unhandled cases in `handleError` implementations.

### 3. Fix Implementation
1. Propose minimal diff: Edit only failing branch/logic.
2. Use existing patterns: Throw `AppError`, `ValidationError` from `lib/errors.ts`.
3. Update handlers: e.g., In `app/api/users/route.ts`, enhance `POST` validation before DB ops.
4. Rate limiting/spam: Check `lib/spam-prevention.ts` for `validateEmail`.
5. Admin routes: Secure `app/api/admin/*` with auth checks.

### 4. Testing & Verification
1. Write regression test: e.g., `tests/api/users.test.ts` with failing case → fix.
2. Run suite: `npm test`, `npm run lint`.
3. E2E: Test endpoint with auth, edge cases (empty payload, invalid email).
4. Deploy preview: Push to feature branch, test on Vercel preview.

### 5. Documentation & Handoff
1. Commit: `fix(users): resolve validation crash on empty email (#123)`.
2. Inline doc: `// FIX: Handled null email per bug #123`.
3. Update README or AGENTS.md if systemic.

## Best Practices (Codebase-Derived)

- **Error Handling**: Always wrap handlers with `handleError` (as in `app/api/users/route.ts`). Extend `AppError`, `AuthenticationError` for new cases.
- **Validation**: Use Zod schemas from `lib/validations.ts` (e.g., `RegisterInput.safeParse()`); fail early.
- **Utils Consistency**: `cn()` for Tailwind, `slugify()` for URLs, `truncate()` for previews—test with real data.
- **API Patterns**: Return JSON `{ error: message }` or data; use NextResponse.
- **Security**: Auth via NextAuth (`app/api/auth/[...nextauth]`); validate inputs to prevent injection.
- **Minimal Changes**: Edit <50 LOC; no refactors unless root cause.
- **Testing**: Mock DB/utils; cover error paths.
- **Scan Siblings**: If bug in `/api/users`, check `/api/comments`, `/api/admin/posts`.

## Key Project Resources

- [AGENTS.md](../AGENTS.md) – Agent coordination and escalation
- [docs/README.md](../docs/README.md) – Deployment, env vars, monitoring setup
- [CONTRIBUTING.md](./CONTRIBUTING.md) – PR process, linting rules
- Vercel dashboard for logs; Sentry for errors

## Repository Starting Points

- `app/api/` – Core API routes (users, comments, auth, admin, SEO); primary bug hotspots
- `lib/` – Shared utils (`utils.ts`, `validations.ts`, `errors.ts`, `spam-prevention.ts`); logic errors here cascade
- `app/api/auth/` – NextAuth integration; frequent auth bugs
- `tests/` or `__tests__/` – Regression test patterns (expand as needed)

## Key Files

- **`lib/errors.ts`** – Defines `AppError`, `AuthenticationError`, `ValidationError`, `RateLimitError`. Import and throw for consistent responses.
- **`app/api/users/route.ts`** – GET/POST users; uses `handleError`; common repro point.
- **`app/api/users/[id]/route.ts`** – PATCH/DELETE; dynamic routes with auth checks.
- **`lib/validations.ts`** – Zod inputs (`LoginInput`, `RegisterInput`, `UpdateProfileInput`); validate all bodies.
- **`lib/utils.ts`** – `cn`, `calculateReadingTime`, `slugify`, `truncate`, `formatDate`; unit-test isolates.
- **`app/api/comments/route.ts`** – POST/GET comments; spam/validation issues.
- **`app/api/auth/register/route.ts`** – Registration; email validation bugs.

## Architecture Context

### Utils (`lib/`, `lib/validations/`)
- Shared helpers: 10+ exports (e.g., `validateEmail`, `slugify`).
- Focus: Logic bugs in string/date handling; test with malformed inputs.

### Controllers (`app/api/*`)
- 20+ route files: Users, comments, admin (posts/categories), SEO/GSC analytics, AI scores.
- Patterns: Export GET/POST/etc. handlers; JSON responses; error wrappers.
- Bug-prone: Auth guards, body parsing, DB ops in admin/user routes.

## Key Symbols for This Agent

- **`AppError`** (`lib/errors.ts:1`) – Base for all custom errors; use `new AppError('msg', 400)`.
- **`handleError`** (`app/api/users/route.ts:88`, `[id]/route.ts:88`) – Catches/responds; extend for logging.
- **`LoginInput`**, **`RegisterInput`** (`lib/validations.ts`) – Zod schemas; parse/validate requests.
- **`validateEmail`** (`lib/spam-prevention.ts:20`) – Anti-spam; call pre-save.

## Documentation Touchpoints

- [README.md](./README.md) – Setup, run commands, env vars (DB_URL, NEXTAUTH_SECRET).
- [AGENTS.md](./../../AGENTS.md) – Inter-agent handoff (e.g., to Test Writer).
- Inline JSDoc in `lib/errors.ts`, route handlers.

## Collaboration Checklist

- [ ] Reproduce bug with curl/local dev (attach logs)
- [ ] Root cause pinned to file/line (e.g., validation fail in POST /users)
- [ ] Minimal fix committed (diff <50 LOC)
- [ ] Regression test added/passing
- [ ] Manual verification: Happy path + edges
- [ ] No new lint/test failures
- [ ] Doc updated (commit msg + inline)
- [ ] Scan related routes fixed

## Hand-off Notes

- Risks: DB schema changes—coordinate with DB agent.
- Follow-up: Performance regression? Handoff to Optimizer.
- Success: Bug test fails pre-fix, passes post; prod deploy monitored.

## Related Resources

- [../docs/README.md](./../docs/README.md)
- [README.md](./README.md)
- [../../AGENTS.md](./../../AGENTS.md)
- [Test Writer Playbook](./test-writer.md)
- [Deployment Guide](./deploy.md)
