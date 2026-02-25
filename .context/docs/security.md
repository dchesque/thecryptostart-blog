## Security & Compliance Notes

This document details the security policies, practices, and guardrails for The Crypto Start Blog project, a Next.js application with Prisma database integration, NextAuth for authentication, and admin interfaces for content management. Security follows defense-in-depth principles, least privilege access, and secure-by-default configurations.

Key security tenets:
- **Input validation and sanitization**: All user inputs (e.g., comments, registrations, post edits) are validated using Zod schemas in `lib/validations.ts` and `lib/validations/admin.ts`.
- **Rate limiting**: Implemented via `lib/rate-limit.ts` and `lib/spam-prevention.ts` (e.g., `checkRateLimit`, `detectSpam`) to prevent abuse on API routes like `/api/comments` and `/api/auth/register`.
- **Error handling**: Custom errors (`AppError`, `AuthenticationError`, `AuthorizationError`, `ValidationError`, `RateLimitError`) in `lib/errors.ts` ensure sensitive information is not leaked.
- **Dependency management**: Regular scans recommended; use `npm audit` and tools like Snyk for vulnerabilities.
- **API protection**: All admin routes (e.g., `/api/admin/posts/[id]`, `/api/admin/users`) enforce authorization checks.
- **Client-side protections**: CSP headers via Next.js config; no inline scripts.

Developers must review [architecture.md](./architecture.md) for deployment and infrastructure security (e.g., Vercel/Cloudflare edge protections).

## Authentication & Authorization

### Authentication
- **Provider**: NextAuth.js (`app/api/auth/[...nextauth]/route.ts`) with JWT sessions by default (configurable to database sessions via `NEXTAUTH_JWT_SECRET` and Prisma adapter).
- **Supported flows**:
  - Email/password registration/login (`app/api/auth/register/route.ts`, `lib/validations.ts` for `RegisterInput`, `LoginInput`).
  - OAuth providers (e.g., Google, GitHub) configurable in `auth.ts`.
- **Session strategy**: JWT tokens (`types/auth.ts`: `JWT`, `Session`). Tokens expire after 30 days (customizable via `session.maxAge`); short-lived access/refresh via sliding sessions.
- **Components**: `AuthProvider` (`components/AuthProvider.tsx`) wraps app for session context; used in admin layouts (`app/admin/layout.tsx`).
- **Middleware**: NextAuth handles session validation on protected routes.

### Authorization
- **Model**: Role-Based Access Control (RBAC) via `lib/permissions.ts` (`hasRole`, `hasPermission`).
- **Roles** (defined in `types/roles.ts`: `RolePermissions`, `types/auth.ts`: `UserWithRoles`):
  | Role   | Permissions                          |
  |--------|--------------------------------------|
  | `admin` | Full CRUD on posts, comments, categories, authors, users; SEO tools access. |
  | `author` | Create/edit own posts; view analytics. |
  | `user`  | Comment, view gated content.        |
  | `guest` | Read-only public access.            |
- **Enforcement**: Checked in API handlers (e.g., `app/api/admin/posts/route.ts` uses `getServerSession` + `hasRole('admin')`). Client-side: `AuthProvider` redirects unauthorized users from admin pages (e.g., `app/admin/posts/page.tsx`).
- **Example**:
  ```ts
  import { getServerSession } from 'next-auth';
  import { hasRole } from '@/lib/permissions';

  export async function GET() {
    const session = await getServerSession();
    if (!session || !hasRole(session.user, 'admin')) {
      throw new AuthorizationError('Admin access required');
    }
    // Proceed with admin logic
  }
  ```

See [architecture.md](./architecture.md) for session flow diagrams.

## Secrets & Sensitive Data

### Secrets Management
- **Storage**: Environment variables only (`.env.local`, `.env.production`). Never commit secrets; use `.env.example` as template.
  - Critical vars: `DATABASE_URL` (Prisma), `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `GOOGLE_CLIENT_ID/SECRET` (OAuth), `GSC_CREDENTIALS` (Google Search Console via `lib/gsc-client.ts`).
- **Rotation**: Rotate every 90 days or on incident; use Vercel/ Railway env var dashboards or AWS Secrets Manager for production.
- **Access**: Least privilege—deploy keys scoped to repo branches.

### Sensitive Data Handling
- **Classification**:
  | Level       | Examples                     | Handling                     |
  |-------------|------------------------------|------------------------------|
  | Public     | Blog posts, metadata        | No encryption needed.       |
  | Internal   | User sessions, analytics    | TLS in transit; hash PII.   |
  | Confidential | API keys, GSC tokens       | Env vars; never log.        |
  | Restricted | DB credentials              | Vault/SSM; audit access.    |
- **Encryption**:
  - **At rest**: Prisma/Postgres handles (enable `sslmode=require` in `DATABASE_URL`); Vercel Postgres auto-encrypts.
  - **In transit**: HTTPS/TLS 1.3 enforced via Next.js (strict HSTS headers).
- **Practices**:
  - No secrets in client bundles (NextAuth client-side safe).
  - Logging: Use structured logs; redact PII with `lib/errors.ts`.
  - Example env check:
    ```bash
    # .env.example
    DATABASE_URL="postgresql://..."
    NEXTAUTH_SECRET="generate-with-openssl-rand-hex-32"
    ```

## Compliance & Policies

**Applicable Standards**:
- **GDPR/CCPA**: User consent for cookies (NextAuth); data export/deletion on request via admin user management.
- **SOC2 principles**: Availability via rate limiting; confidentiality via encryption.
- **Internal**:
  - Mandatory code review/PR approval for auth/security changes.
  - Weekly `npm audit` + Dependabot alerts.
  - Quarterly pen-tests (tools: OWASP ZAP).

**Evidence**:
- Audit logs: Vercel/Prisma query logs.
- Scans: GitHub Security tab.

## Incident Response

**Detection & Reporting**:
- Monitor Vercel logs, Sentry (integrate via `lib/errors.ts`), and Google Analytics anomalies.
- Report issues to `security@thecryptostartblog.com` or GitHub SECURITY.md template. Triage within 24h; coordinated disclosure.

**Escalation Steps**:
1. **Alert**: PagerDuty/Slack (#security) for high-severity (e.g., auth bypass).
2. **Contain**: Rollback deploy, revoke secrets, IP block via Cloudflare.
3. **Triage**: Assess via `lib/prisma.ts` queries; scope impact (users affected?).
4. **Remediate**: Hotfix/PR; notify affected users if PII breached.
5. **Post-mortem**: Root cause in GitHub issue; update policies.

**On-Call**: Primary: @lead-dev; Backup: @security-lead.

See [architecture.md](./architecture.md) for monitoring stack details.
