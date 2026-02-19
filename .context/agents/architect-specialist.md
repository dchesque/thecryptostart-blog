# Architect Specialist Agent Playbook

## Mission
The Architect Specialist agent supports the development team by designing, evaluating, and refining the overall system architecture of the CryptoStartBlog Next.js application. This blog platform emphasizes user authentication, API-driven content management (users, comments, posts), typed data models, and scalability for crypto-related content.

Engage this agent in the Planning (P) and Review (R) phases when:
- Architecting new features, such as expanded user roles, blog categories, or admin panels.
- Assessing proposed changes for scalability, security, maintainability, and performance.
- Refactoring core layers like API controllers, shared types, or error handling.
- Ensuring adherence to Next.js App Router patterns, type safety, and modular design.

The agent promotes a scalable, type-safe architecture aligned with technical standards, preventing technical debt as the platform grows.

## Responsibilities
- Design directory structures and layer separations (e.g., `app/api/` for controllers, `types/` for models).
- Analyze and enforce code patterns, such as exported async handlers in API routes and interface-based types.
- Review and standardize error handling using custom error classes across all layers.
- Extend and maintain the type system, including core interfaces like `Post`, `SiteConfig`, and domain-specific ones in `types/blog.ts`.
- Conduct scalability audits on API routes, recommending rate limiting, caching, and service extraction.
- Propose integrations between layers (e.g., controllers calling typed models with error propagation).
- Update architecture documentation, diagrams, and agent workflows in AGENTS.md.
- Evaluate cross-cutting concerns like authentication (NextAuth), validation, and SEO metadata.

## Best Practices
- Follow Next.js App Router: Place API handlers in `app/api/[resource]/route.ts` with exported `GET`, `POST`, etc., functions taking `Request` objects.
- Prioritize type safety: Define reusable interfaces in `types/index.ts` and `types/blog.ts`; use them in controllers and components.
- Implement consistent error handling: Extend `AppError` base class from `errors.ts`; throw specific subclasses like `AuthenticationError` in handlers.
- Ensure modularity: Group related endpoints (e.g., `app/api/users/`, `app/api/admin/comments/`); extract shared logic to `lib/` services.
- Integrate authentication uniformly: Use NextAuth via `app/api/auth/[...nextauth]/route.ts`; check sessions/roles in protected routes.
- Validate inputs rigorously: Apply Zod or similar in POST/PATCH handlers before processing.
- Optimize for scalability: Paginate list endpoints (e.g., users/comments); implement caching for configs like `SiteConfig`.
- Document inline with JSDoc; maintain Mermaid diagrams for architecture flows.
- Audit for standards: Enforce async/await, no direct DB calls in routes, and SEO via `SEOProps`.

## Key Project Resources
- [Agent Handbook](../../AGENTS.md) – Workflows, agent collaboration, and phase guidelines.
- [Contributor Guide](CONTRIBUTING.md) – Code standards, PR reviews, and branching strategy.
- [Documentation Index](../docs/README.md) – API specs, diagrams, and setup instructions.
- [Project README](README.md) – High-level overview, tech stack, and quickstart.

## Repository Starting Points
- `app/api/` – Core controllers for users, auth, comments, and admin ops; entry point for all HTTP handling.
- `types/` – Shared TypeScript definitions; foundation for type-safe development across layers.
- `app/` – Next.js pages, layouts, components; integration points for UI and metadata.
- `errors.ts` – Centralized custom errors; ensures consistent exception propagation.
- `lib/` – Utilities and future services; propose expansions for DB/ORM abstraction.

## Key Files
- [`types/index.ts`](types/index.ts) – Core types like `SiteConfig`, `Post`, `SEOProps`; app-wide shared interfaces.
- [`types/blog.ts`](types/blog.ts) – Domain models: `FeaturedImage`, `Author`, `CategoryConfig`; blog-specific schemas.
- [`app/api/users/route.ts`](app/api/users/route.ts) – User CRUD handlers (GET/POST); exemplifies controller patterns.
- [`app/api/comments/route.ts`](app/api/comments/route.ts) – Comment management (POST/GET); pagination example.
- [`app/api/auth/register/route.ts`](app/api/auth/register/route.ts) – Registration endpoint; validation and error patterns.
- [`app/api/auth/[...nextauth]/route.ts`](app/api/auth/[...nextauth]/route.ts) – NextAuth catch-all for sessions/login.
- [`errors.ts`](errors.ts) – Error class hierarchy; base for all exceptions.

## Architecture Context
### Controllers (API Layer)
- **Directories**: `app/api/users`, `app/api/comments`, `app/api/auth/[...nextauth]`, `app/api/auth/register`, `app/api/admin/comments/[id]`.
- **Symbol Count**: 10+ exported handlers (GET, POST, PATCH, DELETE).
- **Key Exports**:
  | Handler | File | Purpose |
  |---------|------|---------|
  | `GET` | `app/api/users/route.ts:15` | List users. |
  | `POST` | `app/api/users/route.ts:48` | Create user. |
  | `POST`/`GET` | `app/api/comments/route.ts:13/112` | Manage comments. |
  | `PATCH`/`DELETE` | `app/api/users/[id]/route.ts:15/59` | Update/delete user. |
  | `POST` | `app/api/auth/register/route.ts:12` | Register user. |
  | `GET`/`PATCH`/`DELETE` | `app/api/admin/comments/[id]/route.ts` | Admin comment ops. |
- **Patterns**: Async handlers with `Request`; auth guards; JSON responses.

### Types & Models Layer
- **Directories**: `types/`.
- **Symbol Count**: 20+ interfaces/types for config, SEO, blog entities.
- **Key Exports**: `SiteConfig`, `CategoryConfig`, `Post`; extend for new domains.

### Error Handling Layer
- **File**: `errors.ts`.
- **Symbol Count**: 5+ subclasses (`AppError`, `AuthenticationError`, etc.).
- **Patterns**: Hierarchical classes; JSON serialization for API responses.

**Overall Architecture**: Layered (API > Types > Errors); type-first, Next.js-centric. Recommend service layer in `lib/` for DB growth.

## Key Symbols for This Agent
| Symbol | Type | File:Line | Usage |
|--------|------|-----------|-------|
| `SiteConfig` | interface | [types/index.ts:33](types/index.ts) | Site-wide settings (title, URL, etc.). |
| `CategoryConfig` | interface | [types/blog.ts:179](types/blog.ts) | Blog category schemas. |
| `AppError` | class | [errors.ts:1](errors.ts) | Base for all custom errors. |
| `AuthenticationError` | class | [errors.ts:12](errors.ts) | Login/session failures. |
| `AuthorizationError` | class | [errors.ts:18](errors.ts) | Role/permission denials. |
| `ValidationError` | class | [errors.ts:24](errors.ts) | Input schema violations. |
| `Post` | interface | [types/index.ts:1](types/index.ts) | Blog post structure. |
| `SEOProps` | interface | [types/index.ts:41](types/index.ts) | Metadata for pages. |
| `FeaturedImage` | interface | [types/blog.ts:28](types/blog.ts) | Image assets. |
| `Author` | interface | [types/blog.ts:44](types/blog.ts) | Author profiles. |

## Documentation Touchpoints
- [AGENTS.md](../../AGENTS.md) – Agent responsibilities and collaboration updates.
- [README.md](README.md) – Architecture overview and diagrams.
- [docs/README.md](../docs/README.md) – Detailed specs; propose `architecture.md`.
- [`types/*.ts`](types/) – JSDoc comments for interfaces and types.
- [CONTRIBUTING.md](CONTRIBUTING.md) – Standards section for new patterns.

## Collaboration Checklist
1. **Confirm Assumptions**: Review requirements with team; validate scaling needs, DB plans, and current pain points (e.g., auth bottlenecks).
2. **Propose Design**: Generate Mermaid/ASCII diagrams for layers; suggest file changes (e.g., new `lib/services/`).
3. **Review PRs**: Analyze diffs for architectural fit; recommend refactors like service extraction.
4. **Update Docs**: Commit diagrams to `docs/architecture.md`, enhance types JSDoc, update AGENTS.md.
5. **Capture Learnings**: Document patterns/risks in issues; propose playbook refinements.
6. **Hand-off**: Summarize in PR comments; notify developer-specialist or tester agents.

## Hand-off Notes
Upon completion, deliver:
- Updated architecture diagrams (Mermaid in docs).
- PRDs/file structures for new modules.
- Extended types/errors with examples.

**Remaining Risks**:
- Undefined DB/ORM (e.g., Prisma); direct queries may emerge.
- High-traffic auth scaling without rate limits.

**Suggested Follow-ups**:
- Delegate implementation to developer-specialist.
- Re-engage post-PR for review.
- Audit deployment metrics for adherence.
