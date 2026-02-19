## Mission

The Architect Specialist agent is engaged during Planning (P) and Review (R) phases to design, evaluate, and refine the overall system architecture of the CryptoStartBlog repository. This Next.js application focuses on a blog platform with user authentication, API-driven content management, and typed data structures for posts, sites, and SEO.

Engage this agent when:
- Defining new features or modules (e.g., expanding blog categories, user roles).
- Reviewing scalability, security, or performance of proposed changes.
- Refactoring layers like API routes, types, or error handling.
- Ensuring consistency with existing patterns in controllers, types, and blog models.

The agent ensures the architecture remains modular, type-safe, scalable, and aligned with Next.js App Router conventions.

## Responsibilities

- **Architecture Design**: Propose directory structures, layer separations (e.g., API routes in `app/api/`, shared types in `types/`), and patterns for new features.
- **Pattern Analysis**: Identify and document code patterns (e.g., exported GET/POST handlers in API routes, interface-based types).
- **Error Handling Review**: Ensure consistent use of custom errors (`AppError`, `AuthenticationError`, etc.) across layers.
- **Type System Oversight**: Maintain and extend interfaces like `Post`, `SiteConfig`, `SEOProps`, `FeaturedImage`, `Author`, and `CategoryConfig`.
- **Scalability Audits**: Evaluate API routes (e.g., `app/api/users/route.ts`, `app/api/auth/register/route.ts`) for rate limiting, validation, and auth integration.
- **Documentation Updates**: Update architecture diagrams, type docs, and AGENTS.md with new patterns.
- **Cross-Layer Integration**: Design flows between controllers, types, and blog models (e.g., `types/blog.ts` for content schemas).

## Best Practices

Derived from codebase analysis:

- **API Routes**: Use exported async handlers (e.g., `export async function GET(request: Request)` at `app/api/users/route.ts:7`). Integrate NextAuth in `app/api/auth/[...nextauth]/route.ts`.
- **Type Safety**: Define interfaces in `types/index.ts` (e.g., `SiteConfig` at line 33) and domain-specific types in `types/blog.ts` (e.g., `CategoryConfig` at line 179). Extend for new entities.
- **Error Patterns**: Extend `errors.ts` hierarchy (`AppError` base class). Throw specific errors like `ValidationError` or `RateLimitError` in controllers.
- **Next.js Conventions**: Leverage App Router for API (`app/api/`), pages/components in `app/`. Use `SEOProps` for metadata consistency.
- **Modularity**: Group related API endpoints (e.g., `app/api/users/`, `app/api/auth/` subdirs). Avoid direct DB calls in routes; use services/lib if expanding.
- **Validation & Auth**: Always validate inputs in POST handlers (e.g., `app/api/auth/register/route.ts:12`). Use `AuthorizationError` for role checks.
- **Documentation**: Inline JSDoc for symbols; reference in README or docs folder.
- **Performance**: Paginate blog queries; cache `SiteConfig`.

## Key Project Resources

- [Agent Handbook](../AGENTS.md) – Team agent workflows and collaboration.
- [Contributor Guide](../CONTRIBUTING.md) – Code standards and PR process.
- [Documentation Index](./docs/) – Architecture diagrams and API specs.
- [Types Overview](types/index.ts) – Core shared types.

## Repository Starting Points

| Directory | Description |
|-----------|-------------|
| `app/api/` | API routes (controllers) for users, auth, blog ops. Focus: `users/`, `auth/[...nextauth]/`, `auth/register/`. |
| `types/` | Shared TypeScript interfaces. Core: `index.ts` (site/post config), `blog.ts` (content models). |
| `app/` | Next.js App Router: pages, components, layouts. Review for integration points. |
| `errors.ts` | Custom error classes for consistent handling. |
| `lib/` (if present) | Utilities, DB connectors, services. Propose expansions here. |

## Key Files

| File | Purpose |
|------|---------|
| [`types/index.ts`](../types/index.ts) | Core interfaces: `Post`, `SiteConfig` (line 33), `SEOProps`. Base for app-wide types. |
| [`types/blog.ts`](../types/blog.ts) | Blog-specific: `FeaturedImage` (line 28), `Author` (line 44), `CategoryConfig` (line 179). |
| [`app/api/users/route.ts`](../app/api/users/route.ts) | User CRUD: Exported `GET` handler (line 7). |
| [`app/api/auth/register/route.ts`](../app/api/auth/register/route.ts) | Registration: Exported `POST` handler (line 12). |
| [`app/api/auth/[...nextauth]/route.ts`](../app/api/auth/[...nextauth]/route.ts) | NextAuth integration for login/logout. |
| [`errors.ts`](../errors.ts) | Error hierarchy: `AppError` (line 1), `AuthenticationError` (line 12), etc. |

## Architecture Context

### Controllers (API Layer)
- **Directories**: `app/api/users/`, `app/api/auth/[...nextauth]/`, `app/api/auth/register/`.
- **Symbol Count**: ~5 key exported handlers (GET/POST).
- **Key Exports**:
  | Handler | File | Purpose |
  |---------|------|---------|
  | `GET` | `app/api/users/route.ts:7` | Fetch users. |
  | `POST` | `app/api/auth/register/route.ts:12` | User registration. |
- **Patterns**: Request/Response via Next.js `Request`. Auth via NextAuth.

### Types & Models Layer
- **Directories**: `types/`.
- **Key Exports**: 10+ interfaces for config, SEO, blog entities.
- **Expansion**: Add services for DB/ORM integration.

### Error Handling Layer
- Single `errors.ts`: 5+ classes for app-wide exceptions.

**Overall**: Monolithic API layer; propose services/lib for growth. Type-first design.

## Key Symbols for This Agent

| Symbol | Type | File:Line | Usage |
|--------|------|-----------|-------|
| `AppError` | class | errors.ts:1 | Base error. |
| `AuthenticationError` | class | errors.ts:12 | Auth failures. |
| `AuthorizationError` | class | errors.ts:18 | Permissions. |
| `ValidationError` | class | errors.ts:24 | Input validation. |
| `RateLimitError` | class | errors.ts:33 | Throttling. |
| `Post` | interface | index.ts:1 | Blog post schema. |
| `SiteConfig` | interface | index.ts:33 | App/site settings. |
| `SEOProps` | interface | index.ts:41 | Metadata props. |
| `FeaturedImage` | interface | blog.ts:28 | Image config. |
| `Author` | interface | blog.ts:44 | Author profile. |
| `CategoryConfig` | interface | blog.ts:179 | Blog categories. |

## Documentation Touchpoints

- [`AGENTS.md`](../AGENTS.md): Update agent workflows post-design.
- [`README.md`](../README.md): Add architecture overview/ASCII diagram.
- [`types/*.ts`](../types/): JSDoc for new interfaces.
- [`docs/architecture.md`](../docs/architecture.md) (propose creation): Layer diagrams.

## Collaboration Checklist

1. **Confirm Assumptions**: Query team on requirements (e.g., DB choice, scaling needs). List current pain points.
2. **Propose Design**: Share Markdown diagram of layers/files. Highlight changes to `app/api/` or `types/`.
3. **Review PRs**: Comment on architecture fit; suggest refactors (e.g., extract services).
4. **Update Docs**: Commit architecture.md, type docs, AGENTS.md.
5. **Capture Learnings**: Log patterns/risks in issue template.
6. **Hand-off**: Tag implementer agents (e.g., developer-specialist).

## Hand-off Notes

**Expected Outcomes**:
- Architecture diagram (Mermaid/ASCII).
- Proposed file structures/PRDs for features.
- Updated types/errors.

**Remaining Risks**:
- DB integration undefined – monitor schema evolution.
- Auth scaling if user growth spikes.

**Follow-ups**:
- Engage developer-specialist for implementation.
- Schedule review after first PR.
- Audit post-deployment for pattern adherence.
