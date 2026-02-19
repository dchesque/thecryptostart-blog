# Security

This document outlines the security practices, authentication mechanisms, secrets management, and compliance policies implemented in the TheCryptoStartBlog platform. It serves as a guide for developers to maintain and extend security guardrails.

## Security & Compliance Notes

The project implements robust security measures across the blog platform, admin interfaces, and API endpoints:

- **Input Validation**: All user inputs (e.g., login, registration, comments, search) are validated using Zod schemas in `lib/validations.ts` (`LoginInput`, `RegisterInput`, `UpdateProfileInput`). Invalid inputs throw `ValidationError` from `lib/errors.ts`.

  ```ts
  // Example from app/api/auth/register/route.ts
  import { RegisterInput } from '@/lib/validations';
  const validated = RegisterInput.parse(req.body);
  ```

- **Rate Limiting**: Protects sensitive endpoints (e.g., auth, comments) using `lib/rate-limit.ts` and `lib/spam-prevention.ts`. `checkRateLimit(ip)` enforces per-IP limits, throwing `RateLimitError`. IP extraction via `getIP` or `getClientIP`.

  ```ts
  // Usage in API routes
  import { checkRateLimit } from '@/lib/rate-limit';
  const ip = getIP(request);
  checkRateLimit(ip, { windowMs: 15 * 60 * 1000, max: 5 });
  ```

- **CSRF Protection**: Tokens generated with `generateCSRFToken` and validated via `validateCSRFToken` in `lib/csrf.ts`. Required for state-changing forms (login, register, comments).

  ```tsx
  // In forms
  const csrfToken = generateCSRFToken();
  <input type="hidden" name="csrf" value={csrfToken} />
  ```

- **Error Handling**: Custom errors (`AppError`, `AuthenticationError`, `AuthorizationError`, `ValidationError`, `RateLimitError`) in `lib/errors.ts` ensure no sensitive info leaks. Use `handleError` wrappers in routes.

  ```ts
  // lib/errors.ts
  export class RateLimitError extends AppError {
    constructor(message = 'Too many requests') {
      super(429, message);
    }
  }
  ```

- **Secure Headers**: Next.js middleware enforces HTTPS, CSP, HSTS, and permissions policies (see [architecture.md](./architecture.md)).
- **Dependency Management**: Run `npm audit`, Snyk, or Dependabot in CI/CD. No known vulnerabilities in current deps.
- **Content Security**: `lib/contentful.ts` uses read-only access tokens. Client-side fetches are proxied via API routes.

**Developer Checklist**:
- Scan for vulns before PRs: `npm audit --audit-level high`.
- Never commit secrets (use `.gitignore` for `.env*`).
- Test rate limits and CSRF in dev.

## Authentication & Authorization

Powered by NextAuth.js (`app/api/auth/[...nextauth]/route.ts`):

- **Providers**: Credentials (login/register via `app/api/auth/register/route.ts` with Prisma). Extendable to OAuth.
- **Sessions**: JWT-based (`types/auth.ts`: `User`, `Session`, `JWT`, `UserWithRoles`). Database sessions via `lib/prisma.ts`.
- **Roles & Permissions**: `types/roles.ts` (`RolePermissions`). Check with `lib/permissions.ts`:

  ```ts
  import { hasRole, hasPermission } from '@/lib/permissions';
  import { getServerSession } from 'next-auth';

  const session = await getServerSession();
  if (!hasRole(session, 'admin')) {
    throw new AuthorizationError('Admin required');
  }
  if (!hasPermission(session, 'comments:delete')) {
    throw new AuthorizationError('Permission denied');
  }
  ```

- **Client-Side**: `AuthProvider` (`components/AuthProvider.tsx`) provides `useSession`.
- **Protected Routes**: Middleware + server-side checks in admin pages (`app/admin/*`).

**API Protection Examples**:
- Users: `app/api/users/route.ts` (GET/POST), `app/api/users/[id]/route.ts` (PATCH/DELETE).
- Comments: `app/api/comments/route.ts` (POST/GET), `app/api/admin/comments/[id]/route.ts` (PATCH/DELETE, admin-only).

## Secrets & Sensitive Data

Managed exclusively via `.env.local` / `.env`. Never hardcode or commit.

| Variable | Purpose | Sensitivity | Rotation |
|----------|---------|-------------|----------|
| `DATABASE_URL` | Prisma (`lib/prisma.ts`) | High | Quarterly |
| `CONTENTFUL_SPACE_ID`, `CONTENTFUL_ACCESS_TOKEN` | Contentful (`lib/contentful.ts`) | Medium | Monthly |
| `NEXTAUTH_SECRET` | JWT signing | High | On breach |
| `NEXTAUTH_URL` | Callbacks | Low | N/A |

- **Best Practices**:
  ```ts
  const spaceId = process.env.CONTENTFUL_SPACE_ID ?? '';
  if (!spaceId) throw new Error('Missing CONTENTFUL_SPACE_ID');
  ```
- **Encryption**: HTTPS/TLS enforced. DB at-rest by provider.
- **PII Handling**: Minimal (email/username). No client storage of tokens.

For prod, use cloud secrets (Vercel/AWS Secrets Manager).

## Compliance & Policies

- **GDPR/CCPA**: Consent via cookies banner (`app/layout.tsx`). Data deletion via admin (Prisma).
- **Accessibility**: WCAG 2.1 AA (semantic HTML, ARIA).
- **Auditing**: Rate limit/spam logs in `lib/spam-prevention.ts` (`logSpam`). Prisma query logs optional.
- **Policies**:
  - No PII in analytics (`lib/analytics.ts`).
  - Weekly `npm audit`.
  - Annual pentests.

## Monitoring & Incident Response

- **Logging**: Errors to console/ Sentry. Spam detection via `detectSpam`, `validateEmail`.
- **Alerts**: Rate limit exceeds logged.
- **Response**: Rotate secrets on breach. Rollback deploys via Vercel.

## Related Files

- `lib/errors.ts` – Custom errors
- `lib/rate-limit.ts`, `lib/spam-prevention.ts` – Protections
- `lib/permissions.ts` – Role checks
- `lib/csrf.ts` – Token utils
- `lib/validations.ts` – Zod schemas
- `types/auth.ts`, `types/roles.ts` – Types
- [architecture.md](./architecture.md) – Middleware, sessions

Report issues to security@thecryptostartblog.com.
