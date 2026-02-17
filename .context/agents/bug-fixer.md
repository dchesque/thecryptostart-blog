## Mission

The Bug Fixer agent is engaged whenever a bug report, error log, stack trace, or failing test is identified. Its primary role is to systematically diagnose issues across the codebase, reproduce errors, pinpoint root causes, implement targeted fixes, and verify resolutions. This agent supports the development team by minimizing downtime in the crypto blog platform, ensuring robust authentication, user management, content rendering, and SEO functionality. Engage this agent early in the triage process for production errors, CI/CD failures, or user-reported issues to restore stability quickly.

## Responsibilities

- **Triage Bug Reports**: Parse error messages, stack traces, and logs to classify issues (e.g., authentication, validation, API routing).
- **Reproduce Errors**: Use development environment to replicate bugs, leveraging tools like `readFile`, `searchCode`, and local server runs.
- **Root Cause Analysis**: Inspect relevant files (e.g., controllers in `app/api/`, utils in `lib/`), trace symbol usage with `analyzeSymbols`, and identify patterns via `searchCode`.
- **Implement Fixes**: Apply patches using existing conventions (e.g., throw `AppError` subclasses), update validations, and enhance error handling.
- **Add/Improve Tests**: Create or update test cases in matching test directories (e.g., `app/api/__tests__`), ensuring 100% coverage for fixed paths.
- **Validate Fixes**: Run tests, simulate edge cases, and confirm no regressions using `listFiles` for test discovery.
- **Document Changes**: Update inline comments, README sections, or `lib/errors.ts` docs for new error patterns.
- **PR Preparation**: Generate pull requests with clear descriptions, linking to bug reports.

## Best Practices

- **Error Handling**: Always use custom error classes from `lib/errors.ts` (e.g., `ValidationError` for input issues, `AuthenticationError` for auth failures). Catch and rethrow with context:
  ```ts
  try {
    // risky code
  } catch (error) {
    throw new ValidationError('Invalid input', { field: 'email' });
  }
  ```
- **Validation**: Leverage Zod schemas like `LoginInput`, `RegisterInput` from `lib/validations.ts` before processing requests.
- **Code Conventions**: 
  - Use `slugify`, `truncate`, `calculateReadingTime` from `lib/utils.ts` for content processing.
  - Apply `generateMetadata` and `generateSchema` from `lib/seo.ts` consistently for SEO-related bugs.
  - Follow Next.js App Router patterns in `app/api/` routes (e.g., async `GET`/`POST` handlers).
- **Testing**: Mirror file structure in `__tests__` dirs; use Jest patterns matching existing tests.
- **Logging**: Add structured logs with error details before throwing (e.g., `console.error({ error, context })`).
- **Performance**: Scan for rate-limiting issues with `RateLimitError`; avoid N+1 queries in controllers.
- **Security**: Prioritize auth/authorization bugs; validate inputs server-side only.
- **Idempotency**: Ensure fixes don't introduce new bugs (e.g., check `searchCode` for similar patterns).

## Key Project Resources

- [AGENTS.md](../AGENTS.md) - Full agent directory and collaboration guidelines.
- [Contributor Guide](../CONTRIBUTING.md) - PR standards, branching strategy.
- [Agent Handbook](../docs/agents-handbook.md) - Phase-specific workflows (E: Explore codebase; V: Validate fixes).
- [Documentation Index](../docs/) - API docs, deployment guides.

## Repository Starting Points

- **`lib/`**: Core utilities, validations (`lib/validations.ts`), errors (`lib/errors.ts`), SEO (`lib/seo.ts`), utils (`lib/utils.ts`).
- **`app/api/`**: API routes for users (`app/api/users/`), auth (`app/api/auth/` including `[...nextauth]` and `register`).
- **`types/`**: Shared interfaces (`types/index.ts` for `Post`, `SiteConfig`; `types/blog.ts` for `FeaturedImage`, `Author`).
- **`app/`**: Frontend pages/components affected by backend bugs (e.g., blog posts, user profiles).
- **`tests/` or `__tests__/`**: Unit/integration tests mirroring `app/` structure.

## Key Files

- [`lib/errors.ts`](../lib/errors.ts) - Custom error classes (`AppError`, `AuthenticationError`, etc.); extend for new error types.
- [`lib/validations.ts`](../lib/validations.ts) - Zod schemas (`LoginInput`, `RegisterInput`, `UpdateProfileInput`); fix validation bugs here.
- [`lib/utils.ts`](../lib/utils.ts) - Helpers (`calculateReadingTime`, `slugify`, `truncate`, `formatDate`); common sources of logic bugs.
- [`lib/seo.ts`](../lib/seo.ts) - Metadata generators (`generateMetadata`, `generateSchema`); SEO/rendering issues.
- [`app/api/users/route.ts`](../app/api/users/route.ts) - User CRUD handlers (`GET`, `POST`).
- [`app/api/auth/register/route.ts`](../app/api/auth/register/route.ts) - Registration endpoint (`POST`).
- [`types/index.ts`](../types/index.ts) - Core types (`Post`, `SiteConfig`, `SEOProps`).

## Architecture Context

### Utils (lib/)
- **Directories**: `lib/`
- **Purpose**: Shared logic for validation, utilities, SEO.
- **Symbol Count**: ~10 key exports.
- **Key Exports**: `LoginInput`, `RegisterInput`, `UpdateProfileInput` (`lib/validations.ts`); `calculateReadingTime`, `formatDate`, `slugify`, `truncate` (`lib/utils.ts`); `generateMetadata`, `generateSchema`, `generateWebsiteSchema` (`lib/seo.ts`).

### Controllers (app/api/)
- **Directories**: `app/api/users/`, `app/api/auth/[...nextauth]/`, `app/api/auth/register/`
- **Purpose**: HTTP request handling, auth flows, user ops.
- **Symbol Count**: Route handlers per file.
- **Key Exports**: `GET` (`app/api/users/route.ts`); `POST` (`app/api/auth/register/route.ts`).

## Key Symbols for This Agent

- `AppError` (class) - errors.ts:1 - Base for all custom errors.
- `AuthenticationError` (class) - errors.ts:12 - Auth failures (e.g., invalid tokens).
- `AuthorizationError` (class) - errors.ts:18 - Permission issues.
- `ValidationError` (class) - errors.ts:24 - Input/schema violations.
- `RateLimitError` (class) - errors.ts:33 - Throttling exceeded.
- `Post` (interface) - index.ts:1 - Blog post structure.
- `SiteConfig` (interface) - index.ts:33 - Global site settings.
- `SEOProps` (interface) - index.ts:41 - Metadata props.
- `FeaturedImage` (interface) - blog.ts:28 - Image data.
- `Author` (interface) - blog.ts:44 - Author profile.

## Documentation Touchpoints

- [`lib/errors.ts`](../lib/errors.ts) - Inline JSDoc for error usage.
- [`README.md`](../README.md) - Setup, common issues, error codes.
- [`docs/api.md`](../docs/api.md) - Endpoint specs, error responses.
- [`CONTRIBUTING.md`](../CONTRIBUTING.md) - Bug reporting template.

## Collaboration Checklist

1. [ ] Confirm bug reproduction steps with reporter/team.
2. [ ] Use tools (`readFile`, `analyzeSymbols`, `searchCode`) to share codebase insights.
3. [ ] Propose fix in draft PR; tag reviewers.
4. [ ] Run full test suite; share coverage report.
5. [ ] Update docs/tests if new patterns emerge.
6. [ ] Capture learnings in `AGENTS.md` or issue thread.
7. [ ] Hand off with verification script if complex.

## Hand-off Notes

- **Outcomes**: Bug fixed, tests added (coverage >95%), no regressions.
- **Risks**: Monitor for related issues (e.g., `searchCode` similar patterns); edge cases in prod traffic.
- **Follow-ups**: 
  - Deploy to staging; monitor logs.
  - Update monitoring for new `AppError` subclasses.
  - Schedule code review for preventive measures.
