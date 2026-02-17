## Security & Compliance Notes

This project implements a set of security guardrails to protect the blog platform, admin interfaces, and API endpoints. Key practices include:

- **Input Validation**: All user inputs (e.g., login, registration, search) are validated using Zod schemas defined in `lib/validations.ts` (e.g., `LoginInput`, `RegisterInput`). Invalid inputs trigger `ValidationError`.
- **Rate Limiting**: Applied to sensitive API routes via `lib/rate-limit.ts`. The `checkRateLimit` function enforces limits based on IP (extracted via `getIP`), throwing `RateLimitError` on exceedance.
- **CSRF Protection**: Custom CSRF tokens generated with `generateCSRFToken` and validated via `validateCSRFToken` in `lib/csrf.ts`. Integrated into forms like login and registration.
- **Error Handling**: Custom errors (`AppError`, `AuthenticationError`, `AuthorizationError`) in `lib/errors.ts` prevent information leakage. Production errors are logged without stack traces exposed to clients.
- **Secure Headers**: Next.js middleware (refer to [architecture.md](./architecture.md)) enforces HTTPS redirects, CSP, and other headers.
- **Dependency Scanning**: Run `npm audit` and tools like Snyk regularly during CI/CD.
- **Content Security**: Contentful integration in `lib/contentful.ts` fetches read-only data; no write access from client-side.

Developers must scan for vulnerabilities before merging changes and avoid committing secrets.

## Authentication & Authorization

Authentication is handled via NextAuth.js, configured in `app/api/auth/[...nextauth]/route.ts` (not shown but inferred from structure). Key features:

- **Identity Providers**: Supports credentials-based login/register via `app/api/auth/register/route.ts` (POST handler creates users in Prisma DB). Expandable to OAuth providers (e.g., Google) in NextAuth config.
- **Session Strategy**: JWT tokens (type `JWT` in `types/auth.ts`) for stateless sessions, with database sessions optional via Prisma (`lib/prisma.ts`). Sessions include `User` details and `UserWithRoles`.
- **Token Format**: Signed JWTs with NextAuth secret from env vars. Includes roles for authorization.
- **Role/Permission Model**:
  - Roles defined in `types/roles.ts` (`RolePermissions`).
  - Check roles with `hasRole(session, 'admin')` from `lib/permissions.ts`.
  - Permissions checked via `hasPermission(session, 'users:read')`.

Example usage in admin pages:

```tsx
// app/admin/users/page.tsx
import { hasRole } from '@/lib/permissions';
import { getServerSession } from 'next-auth';

export default async function UsersPage() {
  const session = await getServerSession();
  if (!hasRole(session, 'admin')) {
    throw new AuthorizationError('Admin access required');
  }
  // Fetch users with fetchUsers
}
```

`AuthProvider` in `components/AuthProvider.tsx` wraps app for client-side session access. Protect routes with middleware checking `AuthorizationError`.

See [architecture.md](./architecture.md) for session flow.

## Secrets & Sensitive Data

Secrets are managed via environment variables (`.env.local`, `.env`) and never committed to Git. Key secrets:

| Secret | Purpose | Storage | Rotation Cadence |
|--------|---------|---------|------------------|
| `DATABASE_URL` | Prisma DB connection (`lib/prisma.ts`) | `.env` | Quarterly or on breach |
| `CONTENTFUL_SPACE_ID`, `CONTENTFUL_ACCESS_TOKEN` | Contentful client (`lib/contentful.ts:getClient`) | `.env` | Monthly |
| `NEXTAUTH_SECRET` | JWT signing for sessions | `.env` | On demand |
| `NEXTAUTH_URL` | Callback base URL | `.env` | N/A |

- **Encryption Practices**:
  - In-transit: HTTPS enforced.
  - At-rest: Delegated to providers (e.g., PostgreSQL encryption).
  - No client-side storage of secrets.
- **Data Classifications**:
  - Public: Blog posts (`BlogPost` type).
  - Private: User data (`User` type with roles), sessions.
  - Highly Sensitive: API keys/tokens (least privilege: read-only for Contentful).
- **Access**: Use `process.env.VAR ?? ''` with runtime checks. For production, migrate to AWS SSM/Secrets Manager.

Avoid logging secrets; use Prisma query logging sparingly.

## Compliance & Policies

- **GDPR/CCPA**: User data (e.g., from registration) minimal; implement deletion on request via admin tools. Consent banners in `app/layout.tsx`.
- **SOC 2 Principles**: Access controls via roles; audit logs via Prisma.
- **Internal Policies**: No third-party analytics tracking PII without consent. Regular security reviews.

Evidence: Session audits in DB, rate limit logs.

## Related Resources

- [architecture.md](./architecture.md)
