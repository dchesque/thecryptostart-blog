# Security Auditor Playbook

## Mission

This agent conducts thorough security audits on the CryptoStartBlog codebase, a Next.js application focused on blog management, user interactions, SEO analytics, and admin functionalities. It identifies vulnerabilities, enforces OWASP Top 10 compliance, and ensures robust authentication/authorization using NextAuth.js.

**When to engage:**
- Before merging PRs involving API routes, auth changes, or user data handling
- During vulnerability scans or dependency updates
- When adding new endpoints (e.g., admin or public APIs)
- Post-incident reviews or penetration testing simulations

**Security approach:**
- OWASP Top 10 (Injection, Broken Auth, Sensitive Data Exposure, etc.)
- Defense in depth: Validation + Auth + Rate limiting + Logging
- Least privilege: Admin routes gated by session checks
- Automated checks + manual reviews

## Responsibilities

- Audit API routes for input validation, auth checks, and error handling
- Verify NextAuth.js configurations for secure JWT/session management
- Scan for XSS/SQL/NoSQL injection in user inputs (comments, posts, authors)
- Review sensitive data flows (e.g., user profiles, SEO metrics)
- Check dependency vulnerabilities (e.g., Next.js, Prisma if used)
- Implement/enforce security headers (CSP, HSTS) in Next.js config
- Audit admin endpoints for privilege escalation risks
- Recommend logging with structured security events (e.g., failed logins)

## Workflows and Common Tasks

### 1. API Endpoint Security Audit
**Steps:**
1. List all `app/api/*/route.ts` files using `listFiles('app/api/**/*.ts')`.
2. For each route (GET/POST/PUT/DELETE):
   - Check for `getServerSession` or session validation at the top.
   - Verify input validation (zod/prisma-safe, no raw `req.body`).
   - Scan for `eval()`, `new Function()`, or unsafe deserialization.
   - Ensure `AuthenticationError`/`AuthorizationError` from `lib/errors.ts` are thrown appropriately.
   - Test for rate limiting (e.g., Upstash Redis if integrated).
3. Output: Markdown report with vuln severity (CVSS score), PoC, fix.

**Example Command:** `analyzeSymbols('app/api/admin/authors/route.ts')` → Verify `POST` handler role checks.

### 2. Authentication/Authorization Review
**Steps:**
1. Inspect `app/api/auth/[...nextauth]/route.ts` and `app/api/auth/register/route.ts`.
2. Validate JWT callbacks in `types/auth.ts` (Session/JWT types).
3. Check `AuthProvider.tsx` for secure client-side session propagation.
4. Audit admin routes (e.g., `app/api/admin/authors/[id]/route.ts`) for `if (!session || session.user.role !== 'ADMIN')` guards.
5. Review password hashing in register (bcrypt/argon2, not plain).
6. Test CSRF protection in forms (NextAuth handles, but verify).
7. Output: Flow diagram + gaps (e.g., missing 2FA).

### 3. Sensitive Data & Injection Scan
**Steps:**
1. `searchCode('req.body|req.query', 'app/api/**/*.ts')` → Flag unsanitized inputs.
2. Review types (`types/blog.ts: Author`, `types/auth.ts: User`) for PII fields.
3. Check components like `AuthorCard.tsx`, `AuthorModal.tsx` for XSS (use `dangerouslySetInnerHTML`?).
4. Audit DB queries if Prisma/Supabase used (prepared statements).
5. Scan env vars exposure in `next.config.js` or builds.
6. Output: Data flow map + encryption recommendations (e.g., encrypt emails).

### 4. Dependency & Config Audit
**Steps:**
1. Run `npm audit` equivalent; flag high-severity in `package.json`.
2. Review `next.config.js` for `headers()`: CSP, X-Frame-Options.
3. Check `.env` patterns (no commit secrets).
4. Output: Updated `SECURITY.md` with vulns.

### 5. Full Codebase Scan
1. `getFileStructure()` → Prioritize `app/api`, `lib`, `types`.
2. `searchCode('process.env|session|req.body|sql|eval', '**/*.ts*')`.
3. Cross-reference with OWASP cheat sheets.

## Best Practices (Codebase-Derived)

- **Auth Checks:** Always `const session = await getServerSession(authOptions);` first line in protected routes (seen in admin routes).
- **Errors:** Throw `new AuthenticationError()` or `AuthorizationError()` from `lib/errors.ts` for 401/403.
- **Validation:** Use Zod schemas matching `types/blog.ts` (Author, User); no direct Prisma `create(body)`.
- **Sessions:** Extend NextAuth Session/JWT in `types/auth.ts`; role-based access.
- **Inputs:** Sanitize comments/users with DOMPurify or server-side escaping.
- **Headers:** Add via `NextResponse.headers.set('Content-Security-Policy', "...")` in routes.
- **Logging:** Use `console.error` with context; integrate Sentry for prod.
- **Conventions:** Route files export handlers directly (e.g., `export async function POST(request: Request)`).

## Key Project Resources

- [AGENTS.md](../../AGENTS.md) – Agent collaboration guidelines
- [docs/SECURITY.md](../docs/SECURITY.md) – Existing security notes (create if missing)
- [Contributor Guide](../CONTRIBUTING.md) – PR review processes
- NextAuth.js Docs: https://authjs.dev/reference/nextjs (for codebase patterns)

## Repository Starting Points

- `app/api/` – All API routes (auth, admin, users, comments, SEO); 20+ endpoints
- `lib/` – Shared utils like `errors.ts` (custom errors)
- `types/` – `blog.ts` (Author/Post types), `auth.ts` (User/Session/JWT)
- `components/` – AuthProvider.tsx, AuthorCard.tsx, admin modals (client-side risks)
- `app/admin/` – Admin pages (authors, posts); server components with auth

## Key Files and Purposes

| File | Purpose | Security Focus |
|------|---------|----------------|
| `lib/errors.ts` | Custom errors: `AuthenticationError`, `AuthorizationError` | Consistent 401/403 handling |
| `types/blog.ts` | `Author` type (blog entities) | PII fields validation |
| `types/auth.ts` | `User`, `Session`, `JWT` types | NextAuth extensions; role enforcement |
| `app/api/auth/register/route.ts` | User registration (POST) | Password hashing, email uniqueness |
| `app/api/admin/authors/route.ts` | Admin CRUD for authors (GET/POST) | Role checks, input sanitization |
| `app/api/admin/authors/[id]/route.ts` | Author update/delete (GET/PUT/DELETE) | IDOR prevention (check ownership) |
| `components/AuthProvider.tsx` | Session provider wrapper | Secure client hydration |
| `app/api/auth/[...nextauth]/route.ts` | NextAuth handlers | Provider configs, callbacks |
| `app/api/users/route.ts` | User list/create (GET/POST) | Pagination, filtering vulns |
| `app/api/comments/route.ts` | Comment CRUD | XSS in content, spam prevention |

## Architecture Context

### Controllers (API Routes)
- **Directories:** `app/api/users`, `app/api/comments`, `app/api/admin/*`, `app/api/auth/*`, `app/api/seo/*`
- **Key Exports:** 20+ handlers (e.g., `POST` @ `app/api/comments/route.ts:13`, `DELETE` @ `app/api/users/[id]/route.ts:65`)
- **Patterns:** Server Actions pattern; `Request` → JSON → DB; session-gated admins

### Client Components
- `components/AuthProvider.tsx`, `AuthorCard.tsx`, `components/admin/AuthorModal.tsx`
- **Risks:** XSS in props, session exposure

### Types & Libs
- Strong typing enforces schemas; errors centralized

## Key Symbols for This Agent

- `AuthenticationError` (lib/errors.ts:12) – Throw for invalid sessions
- `AuthorizationError` (lib/errors.ts:18) – Insufficient privileges
- `User`/`Session`/`JWT` (types/auth.ts) – Auth types; extend for roles
- `Author` (types/blog.ts:34) – Blog entity; validate fields
- Route handlers: `POST` (app/api/auth/register/route.ts:12), `DELETE` (app/api/admin/authors/[id]/route.ts:49)

## Documentation Touchpoints

- Update `docs/SECURITY.md` with audit findings
- `README.md` – Add security section
- `AGENTS.md` – Link to this playbook
- Inline JSDoc in routes for auth requirements

## Collaboration Checklist

- [ ] OWASP Top 10 scan (A01-A10) on APIs
- [ ] Input validation/sanitization in all `req.body` uses
- [ ] AuthZ in admin routes (session.role === 'ADMIN')
- [ ] Sensitive data: No logs of secrets, encrypt at rest
- [ ] Dependencies: `npm audit --audit-level high`
- [ ] Headers: CSP strict-dynamic, HSTS max-age
- [ ] Tests: Add security tests (e.g., invalid JWT)
- [ ] Report: GitHub Issue with repro + PR fix

## Hand-off Notes

- **Outcomes:** Comprehensive report in `SECURITY-AUDIT.md`; fixed vulns in PR.
- **Risks:** IDOR in `[id]` routes if no ownership check; client XSS in modals.
- **Follow-ups:** Integrate `snyk` CI, quarterly audits, pentest external APIs.

## Related Resources

- [../docs/README.md](./../docs/README.md)
- [README.md](./README.md)
- [../../AGENTS.md](./../../AGENTS.md)
- [NextAuth Security Guide](https://authjs.dev/getting-started/security)
- [OWASP API Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet.html)
