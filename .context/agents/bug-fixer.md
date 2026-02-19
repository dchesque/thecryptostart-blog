# Bug Fixer Agent Playbook

**Type:** agent  
**Tone:** instructional  
**Audience:** ai-agents  
**Description:** Analyzes bug reports and implements targeted fixes  
**Additional Context:** Focus on root cause analysis, minimal side effects, and regression prevention.

## Mission
The Bug Fixer agent is engaged whenever a bug report, error log, stack trace, or failing test is identified. Its primary role is to systematically diagnose issues across the codebase, reproduce errors, pinpoint root causes, implement targeted fixes, and verify resolutions. This agent supports the development team by minimizing downtime in the crypto blog platform, ensuring robust authentication, user management, content rendering, and SEO functionality. Engage this agent early in the triage process for production errors, CI/CD failures, or user-reported issues to restore stability quickly. Prioritize fixes that prevent recurrence, such as adding guards for common edge cases in auth flows or API validations.

## Responsibilities
- **Triage Bug Reports**: Parse error messages, stack traces, and logs to classify issues (e.g., authentication failures in `app/api/auth/`, validation errors in user routes, or SEO metadata bugs).
- **Reproduce Errors**: Use development environment tools like `readFile` for file inspection, `searchCode` for pattern matching, and local server runs (`npm run dev`) to replicate bugs precisely.
- **Root Cause Analysis**: Trace execution paths using `analyzeSymbols` on controllers (e.g., `app/api/users/route.ts`), inspect utils in `lib/`, and cross-reference types in `types/`.
- **Implement Fixes**: Apply minimal, targeted patches adhering to conventions—extend `AppError` subclasses, enhance Zod schemas, and update route handlers without refactoring unrelated code.
- **Add/Improve Tests**: Locate or create tests via `listFiles('**/__tests__/**')`, add cases covering the bug and regressions, aiming for 100% branch coverage on fixed paths.
- **Validate Fixes**: Execute test suites (`npm test`), simulate load/edge cases, and use `getFileStructure` to confirm no unintended changes; lint and type-check (`npm run lint`, `tsc`).
- **Document Changes**: Add inline JSDoc to new/updated symbols, update error handling examples in `lib/errors.ts`, and note fixes in relevant README sections.
- **PR Preparation**: Commit changes with semantic messages (e.g., "fix: resolve validation crash in user registration"), create PRs linking to issues, and include reproduction steps.

## Best Practices
- **Error Handling**: Consistently throw custom errors from `lib/errors.ts`. Wrap risky operations:
  ```ts
  try {
    const user = await getUserById(id);
  } catch (error) {
    throw new AuthenticationError('User not found or unauthorized', { id });
  }
  ```
  Use `handleError` patterns from controllers like `app/api/users/route.ts`.
- **Validation**: Parse inputs with Zod schemas (`LoginInput`, `RegisterInput`) before business logic; refine schemas in `lib/validations.ts` for new constraints.
- **Code Conventions**: 
  - Format dates/content with `lib/utils.ts` helpers (`formatDate`, `slugify`, `truncate`, `calculateReadingTime`).
  - Ensure SEO functions (`generateMetadata` from `lib/seo.ts`) handle dynamic props correctly.
  - Follow async Next.js route patterns: export named handlers (`GET`, `POST`) returning `NextResponse`.
- **Testing**: Structure tests parallel to source (e.g., `app/api/users/__tests__/route.test.ts`); mock dependencies (Prisma, NextAuth) and assert error throws.
- **Logging**: Prefix errors with context: `console.error('Validation failed', { input, error: error.message })`.
- **Performance/Security**: Check for rate limits (`checkRateLimit` in `lib/spam-prevention.ts`); validate emails (`validateEmail`); scan for injection vectors.
- **Minimal Impact**: Use `searchCode` to find similar usages before/after fixes; avoid global changes.
- **Regression Prevention**: Add negative tests for fixed scenarios and monitor with `AppError` logging.

## Key Project Resources
- [Documentation Index](../docs/) - Central hub for API specs, deployment, and troubleshooting.
- [AGENTS.md](../../AGENTS.md) - Agent roles, invocation protocols, and collaboration rules.
- [README.md](README.md) - Project overview, setup, common pitfalls.
- [../docs/README.md](../docs/README.md) - Detailed docs navigation and update guidelines.
- [Contributor Guide](../CONTRIBUTING.md) - Bug report templates, PR workflows.

## Repository Starting Points
- **`lib/`**: Utilities, validations (`validations.ts`), errors (`errors.ts`), spam prevention (`spam-prevention.ts`), SEO (`seo.ts`), and utils (`utils.ts`)—focus for logic/handling bugs.
- **`app/api/`**: API controllers for users (`users/`, `users/[id]/`), auth (`auth/[...nextauth]/`, `auth/register/`), comments (`comments/`, `admin/comments/`), and admin ops.
- **`types/`**: Type definitions (`index.ts` for `Post`, `SiteConfig`; `blog.ts` for `Author`, `FeaturedImage`)—check for type-related crashes.
- **`app/`**: Pages and components (`blog/`, profiles)—frontend symptoms of backend bugs.
- **`__tests__/` or `tests/`**: Test suites mirroring `app/` and `lib/`—extend for verification.

## Key Files
- [`lib/errors.ts`](../lib/errors.ts) - Custom error hierarchy (`AppError`, subclasses); extend and document new types here.
- [`lib/validations.ts`](../lib/validations.ts) - Zod inputs (`LoginInput`, `RegisterInput`, `UpdateProfileInput`); tune for bug-specific fields.
- [`lib/utils.ts`](../lib/utils.ts) - Core helpers (`calculateReadingTime`, `slugify`, `formatDate`, `truncate`); debug content processing issues.
- [`lib/spam-prevention.ts`](../lib/spam-prevention.ts) - Rate limiting (`checkRateLimit`, `validateEmail`); fix abuse vectors.
- [`app/api/users/route.ts`](../app/api/users/route.ts) - User list/create (`GET`, `POST`); common data access bugs.
- [`app/api/users/[id]/route.ts`](../app/api/users/[id]/route.ts) - User update/delete (`PATCH`, `DELETE`); auth/permission errors.
- [`app/api/auth/register/route.ts`](../app/api/auth/register/route.ts) - Registration (`POST`); validation/auth flow bugs.
- [`app/api/comments/route.ts`](../app/api/comments/route.ts) - Comment CRUD; spam/content bugs.

## Architecture Context
### Utils (lib/)
- **Directories**: `lib/`
- **Symbol Count**: ~25 key exports across validations, utils, errors, SEO, spam-prevention.
- **Key Exports**: `LoginInput`, `RegisterInput`, `UpdateProfileInput` (`validations.ts`); `calculateReadingTime`, `formatDate`, `slugify`, `truncate` (`utils.ts`); `validateEmail`, `getClientIP`, `checkRateLimit` (`spam-prevention.ts`); `generateMetadata`, `generateSchema` (`seo.ts`).

### Controllers (app/api/)
- **Directories**: `app/api/users`, `app/api/comments`, `app/api/users/[id]`, `app/api/auth/[...nextauth]`, `app/api/auth/register`, `app/api/admin/comments`, `app/api/admin/comments/[id]`
- **Symbol Count**: 10+ route handlers (GET/POST/PATCH/DELETE per file).
- **Key Exports**: `GET`, `POST` (`app/api/users/route.ts`); `POST` (`app/api/comments/route.ts`, `app/api/auth/register/route.ts`); `PATCH`, `DELETE` (`app/api/users/[id]/route.ts`, admin comments).

## Key Symbols for This Agent
- [`AppError` (class)](../lib/errors.ts#L1) - Base error; extend for all fixes.
- [`AuthenticationError` (class)](../lib/errors.ts#L12) - Token/session issues in auth routes.
- [`AuthorizationError` (class)](../lib/errors.ts#L18) - Role/permission denials.
- [`ValidationError` (class)](../lib/errors.ts#L24) - Zod/input failures.
- [`RateLimitError` (class)](../lib/errors.ts#L33) - Throttling in spam-heavy endpoints.
- [`LoginInput` (type)](../lib/validations.ts#L20), [`RegisterInput` (type)](../lib/validations.ts#L21), [`UpdateProfileInput` (type)](../lib/validations.ts#L22) - Schema fixes.
- [`Post` (interface)](../types/index.ts), [`Author` (interface)](../types/blog.ts#L44), [`FeaturedImage` (interface)](../types/blog.ts#L28) - Content bugs.
- [`handleError` (function)](../app/api/users/route.ts#L80) - Controller error middleware pattern.

## Documentation Touchpoints
- [`lib/errors.ts`](../lib/errors.ts) - JSDoc on error constructors and usage examples.
- [`README.md`](README.md) - Error codes, debugging tips, local reproduction.
- [`../docs/api.md`](../docs/api.md) - API error responses, status codes.
- [`../CONTRIBUTING.md`](../CONTRIBUTING.md) - Bug report format, triage process.
- [`../docs/README.md`](../docs/README.md) - Full docs tree, update protocols.

## Collaboration Checklist
1. [ ] Confirm bug reproduction steps with reporter/team via shared logs or minimal repro repo.
2. [ ] Use tools (`readFile`, `listFiles`, `analyzeSymbols`, `searchCode`, `getFileStructure`) to document findings and share snippets.
3. [ ] Propose fix in draft PR with before/after diffs; tag @reviewers and link issue.
4. [ ] Run full test suite (`npm test -- --coverage`); attach report showing fixed branches.
5. [ ] Update docs/tests/README for new patterns; run lint/type checks.
6. [ ] Capture learnings in issue comments or `AGENTS.md` (e.g., "Common pitfall: missing Zod safeParse").
7. [ ] Hand off with verification script (e.g., curl commands for API repro) and monitoring query.

## Hand-off Notes
Upon completion, summarize: bug resolved with tests passing at >95% coverage, no new warnings. Remaining risks: prod traffic edge cases (e.g., high-concurrency rate limits)—monitor via logs for `RateLimitError`. Suggested follow-ups: deploy to staging, add Sentry rules for fixed error types, review similar patterns via `searchCode('/throw new ValidationError/')` for proactive fixes. If complex, flag for human audit.
