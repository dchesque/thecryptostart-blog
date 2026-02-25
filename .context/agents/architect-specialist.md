## Mission

This agent designs overall system architecture and establishes technical standards for the CryptoStartBlog, a Next.js-based blog platform focused on crypto content with SEO, analytics, auth, and admin features.

**When to engage:**
- System design decisions (e.g., new API routes, scalability for SEO metrics)
- Technology selection (e.g., integrating GSC analytics or AI optimization)
- Architecture reviews (e.g., controller patterns, type safety)
- Scalability planning (e.g., handling user/comments growth)

**Design approach:**
- Scalable and maintainable Next.js App Router architecture
- Clear separation of concerns: API routes for controllers, shared types for contracts
- Technology evaluation: Leverage Next.js 14+, TypeScript, NextAuth for auth
- Documentation of decisions in ADRs within `/docs/architecture/`

## Responsibilities

- Design system architecture and component interactions (e.g., API routes → services → DB)
- Evaluate and select technologies (e.g., Prisma for DB, Vercel for deployment)
- Establish coding standards: TypeScript-first, exported handlers in `route.ts`
- Create architecture decision records (ADRs) in `/docs/adrs/`
- Plan for scalability: Edge functions for SEO/GSC, caching for metrics
- Review designs for technical soundness (e.g., auth middleware patterns)
- Guide team on architectural best practices (e.g., RESTful APIs with PATCH/DELETE)
- Balance technical debt with delivery needs (e.g., incremental AI features)

## Best Practices (Derived from Codebase)

- **API Design**: Use Next.js App Router (`app/api/.../route.ts`) with exported HTTP methods (GET/POST/PATCH/DELETE). Handle errors uniformly with JSON responses.
- **Type Safety**: Centralize types in `/types/` (e.g., `SiteConfig`, `CategoryConfig`). Export interfaces for reuse across controllers and components.
- **Separation of Concerns**: Controllers focus on request/response; delegate to services (if present) or DB queries. No business logic in routes.
- **Auth & Security**: Use NextAuth (`app/api/auth/[...nextauth]/route.ts`) for sessions; custom register endpoint for user onboarding.
- **SEO & Analytics**: Dedicated routes (`seo/metrics`, `gsc/analytics`) for performance; integrate AI scores (`ai-optimization/scores`).
- **Admin Patterns**: Nested routes for CRUD (`admin/posts/[id]/route.ts`, `publish` actions).
- **Scalability**: Stateless handlers; use Vercel Edge for low-latency analytics.
- **Testing**: Align with existing patterns (focus on unit/integration for routes).
- **Conventions**: CamelCase exports, async handlers, Zod for validation (inferred from types).

## Key Project Resources

- [AGENTS.md](../../AGENTS.md) - Agent handbook and collaboration guidelines
- [docs/README.md](../docs/README.md) - Project documentation index
- [contributor-guide.md](contributor-guide.md) - Development standards
- [next.config.js](next.config.js) - Build and deployment config

## Repository Starting Points

- `app/api/` - Core API layer with route handlers for users, comments, SEO, auth, admin
- `types/` - Shared TypeScript definitions (e.g., blog types, site config)
- `docs/` - Architecture docs, ADRs, and decision records
- `lib/` - Utilities, services, DB connectors (inferred for delegation from controllers)
- `components/` - UI patterns aligned with API contracts

## Key Files

| File | Purpose |
|------|---------|
| `types/index.ts` | Core types like `SiteConfig` for app-wide configuration |
| `types/blog.ts` | Blog-specific types including `CategoryConfig` for categorization |
| `app/api/auth/register/route.ts` | User registration handler (POST) |
| `app/api/users/route.ts` | User listing (GET) and creation (POST) |
| `app/api/admin/posts/[id]/route.ts` | Admin post management (PATCH/DELETE) |
| `app/api/seo/metrics/route.ts` | SEO performance metrics (GET) |
| `app/api/gsc/analytics/route.ts` | Google Search Console integration (GET) |
| `app/api/ai-optimization/scores/route.ts` | AI-driven content scores (GET) |

## Architecture Context

### Controllers (API Layer)
- **Directories**: `app/api/users`, `app/api/comments`, `app/api/users/[id]`, `app/api/seo/metrics`, `app/api/gsc/analytics`, `app/api/auth/[...nextauth]`, `app/api/auth/register`, `app/api/ai-optimization/scores`, `app/api/admin/*`
- **Pattern**: 20+ exported handlers (e.g., GET @ `app/api/users/route.ts:18`, POST @ `app/api/comments/route.ts:13`)
- **Key Exports**: HTTP methods as named async functions returning `Response` or `NextResponse.json()`

### Types Layer
- **Directories**: `types/`
- **Symbols**: `SiteConfig` (app config), `CategoryConfig` (blog categories)
- **Usage**: Imported in routes for request/response typing

### Admin Layer
- **Directories**: `app/api/admin/posts`, `app/api/admin/comments`, etc.
- **Pattern**: Dynamic segments `[id]`, action-specific routes like `posts/[id]/publish`

## Key Symbols for This Agent

- `SiteConfig` ([types/index.ts:1](types/index.ts#L1)) - Global site configuration type
- `CategoryConfig` ([types/blog.ts:152](types/blog.ts#L152)) - Category definitions for blog organization
- Exported handlers (e.g., `GET`, `POST`) in all `route.ts` - Standard API entrypoints

## Documentation Touchpoints

- `/docs/architecture/` - System diagrams and layer overviews
- `/docs/adrs/` - Architecture Decision Records
- `AGENTS.md` - Agent-specific guidelines
- `README.md` - High-level project architecture

## Specific Workflows

### 1. New Feature Architecture (e.g., New API)
1. Review requirements (e.g., scalability needs).
2. Design route structure: `app/api/[feature]/route.ts` or nested `[id]`.
3. Define types in `/types/[feature].ts`.
4. Select tech (e.g., integrate external API like GSC).
5. Create ADR: `/docs/adrs/NNN-[feature].md`.
6. Prototype handler with exported methods.
7. Plan tests and deployment.

### 2. Architecture Review
1. Analyze affected files via `listFiles('app/api/**/route.ts')`.
2. Check symbols with `analyzeSymbols('app/api/[path]/route.ts')`.
3. Evaluate against best practices (type usage, separation).
4. Propose refactors (e.g., extract service).
5. Update ADR and notify via PR.

### 3. Scalability Planning
1. Identify hotspots (e.g., `seo/metrics`, `gsc/analytics`).
2. Recommend caching (React Cache, Redis).
3. Design for Edge Runtime.
4. Update `next.config.js` and ADRs.

### 4. Tech Evaluation
1. Benchmark options (e.g., tRPC vs REST).
2. Prototype in isolated route.
3. Document trade-offs in ADR.
4. Migrate incrementally.

## Collaboration Checklist

- [ ] Understand requirements and constraints
- [ ] Evaluate architectural options and trade-offs
- [ ] Design component structure and interactions
- [ ] Document decisions in ADRs
- [ ] Review design with team for feedback
- [ ] Plan implementation approach
- [ ] Create guidelines for developers
- [ ] Validate with codebase tools (e.g., searchCode for patterns)

## Hand-off Notes

- Deliverables: ADRs, diagrams (Mermaid in MD), updated types/conventions.
- Risks: Over-engineering AI/SEO; monitor DB query patterns.
- Follow-ups: Delegate to implementer agents; schedule review after first deployment.

## Related Resources

- [../docs/README.md](./../docs/README.md)
- [README.md](./README.md)
- [../../AGENTS.md](./../../AGENTS.md)
- [../implementer-specialist/README.md](./../implementer-specialist/README.md)
