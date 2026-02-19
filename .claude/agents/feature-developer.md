## Mission

The Feature Developer agent is responsible for implementing new features in the CryptoStartBlog, a Next.js 14+ application using the App Router, TypeScript, Tailwind CSS, Contentful for blog content, and NextAuth for authentication. Engage this agent when product specifications require new UI pages, API routes, components, or integrations (e.g., new admin tools, blog features, user management). It ensures features align with the existing architecture, maintain type safety, and follow codebase conventions for scalability and maintainability.

## Responsibilities

- Implement new App Router pages (e.g., `/app/new-feature/page.tsx`) with server-side rendering, static generation (`generateStaticParams`, `generateMetadata`), and dynamic segments (`[slug]`).
- Create API routes in `/app/api/` (e.g., `route.ts` with `GET`, `POST` handlers) handling auth checks, database operations, and error responses.
- Develop reusable components in `/components/` (e.g., new cards, modals, TOC variants) with TypeScript props interfaces.
- Integrate authentication using `AuthProvider`, `SignOutButton`, and NextAuth sessions in protected routes like `/app/admin/`.
- Fetch and display Contentful data (posts, authors, featured images) following patterns in blog pages.
- Update global types in `/types/` (e.g., new interfaces for feature data).
- Add SEO metadata, AdSense, share buttons, and sidebar elements to new blog/admin pages.
- Handle errors with custom classes (`AppError`, `AuthenticationError`) and user-facing messages.
- Ensure responsive design with Tailwind and shadcn/ui patterns.

## Best Practices

- **App Router Priority**: Use Server Components by default; Client Components (`"use client"`) only for interactivity (hooks, events).
- **TypeScript Strictness**: Define props interfaces (e.g., `BlogPostProps`), use `interface` for data shapes (`Post`, `Author`), and infer types from Contentful.
- **Auth Integration**: Wrap protected pages/components with `AuthProvider`; check `session` in API routes and loaders.
- **Contentful Patterns**: Use `extractHeadings`, `slugify` for TOC; fetch rich text and parse for headings/slugs.
- **SEO & Metadata**: Export `generateMetadata` async function for dynamic titles/descriptions/images.
- **Error Handling**: Throw custom errors (`new AuthenticationError(...)`) in APIs; use `notFound()` or `redirect()` for 404/auth failures.
- **Styling**: Extend Tailwind config; use shadcn/ui components; ensure mobile-first responsive classes.
- **Performance**: Leverage `generateStaticParams` for SSG on blog posts; cache fetches with `revalidatePath`.
- **Testing**: Add unit tests for components (if Vitest/Jest pattern exists); integration tests for API routes.
- **Conventions**: Name routes `route.ts`, pages `page.tsx`; export handlers as const (e.g., `export const GET = async ...`); use `async/await` everywhere.

## Key Project Resources

- [README.md](../README.md) - Project setup, scripts, and env vars.
- [AGENTS.md](../AGENTS.md) - Agent collaboration guidelines.
- [Contributor Guide](../CONTRIBUTING.md) - PR process, linting, deployment.
- [Agent Handbook](https://github.com/your-org/agent-handbook) - Cross-agent workflows.
- Contentful Docs: [Blog Post Fetching Patterns](https://www.contentful.com/developers/docs/references/content-delivery-api/).

## Repository Starting Points

- `/app/` - Next.js App Router: pages (`page.tsx`), layouts (`layout.tsx`), API routes (`api/*/route.ts`), dynamic routes (`[slug]`).
- `/components/` - Reusable UI: blog (`BlogPost.tsx`, `BlogCard.tsx`), auth (`AuthProvider.tsx`), shared (`TableOfContents.tsx`, `Footer.tsx`).
- `/types/` - TypeScript definitions: blog (`Post`, `Author`), errors (`AppError`), SEO (`SEOProps`).
- `/app/api/` - API layer: auth (`auth/register/route.ts`, `[...nextauth]/route.ts`), users (`users/route.ts`).
- `/app/admin/` - Protected admin: dashboard (`page.tsx`), users (`users/page.tsx`).
- `/app/blog/` - Core blog: posts (`[slug]/page.tsx`), listings.

## Key Files

| File | Purpose |
|------|---------|
| [`components/TableOfContents.tsx`](../components/TableOfContents.tsx) | Generates TOC from Contentful rich text; use `extractHeadings` for new blog features. |
| [`components/AuthProvider.tsx`](../components/AuthProvider.tsx) | Session provider; wrap new admin/blog pages. |
| [`components/SignOutButton.tsx`](../components/SignOutButton.tsx) | Reusable sign-out UI; integrate in headers/navs. |
| [`components/Footer.tsx`](../components/Footer.tsx) | Global footer with links/ads; extend for new features. |
| [`app/api/users/route.ts`](../app/api/users/route.ts) | User listing API; model for new CRUD endpoints. |
| [`app/api/auth/register/route.ts`](../app/api/auth/register/route.ts) | User registration; extend for profile updates. |
| [`app/blog/[slug]/page.tsx`](../app/blog/[slug]/page.tsx) | Dynamic blog post: SSG params, metadata, TOC/sidebar. |
| [`app/admin/users/page.tsx`](../app/admin/users/page.tsx) | Admin users table; `fetchUsers` pattern for data grids. |
| [`types/index.ts`](../types/index.ts) | Core types: `Post`, `SiteConfig`, `SEOProps`; extend here. |
| [`types/blog.ts`](../types/blog.ts) | Blog-specific: `FeaturedImage`, `Author`. |

## Architecture Context

### Controllers (API Routes)
- **Directories**: `app/api/users/`, `app/api/auth/[...nextauth]/`, `app/api/auth/register/`.
- **Symbol Count**: ~10 key handlers.
- **Key Exports**:
  - `GET` @ `app/api/users/route.ts:7` - Fetch users (protected).
  - `POST` @ `app/api/auth/register/route.ts:12` - User signup.

### Components (UI Layer)
- **Directories**: `components/`, `app/`, `app/login/`, `app/blog/`, `app/admin/`, `app/about/`, `app/blog/[slug]/`, `app/admin/users/`.
- **Symbol Count**: 20+ components/interfaces.
- **Key Exports**:
  - `TableOfContents` @ `components/TableOfContents.tsx:86`.
  - `SignOutButton` @ `components/SignOutButton.tsx:5`.
  - `Footer` @ `components/Footer.tsx:4`.
  - `AuthProvider` @ `components/AuthProvider.tsx:5`.
  - `AdminDashboard` @ `app/admin/page.tsx:3`.
  - `UsersPage` @ `app/admin/users/page.tsx:13` (uses `fetchUsers`).

### Types & Errors
- Central types in `/types/`; custom errors for consistent handling.

## Key Symbols for This Agent

- `TOCItem` @ `components/TableOfContents.tsx:7` - Heading node.
- `TableOfContentsProps` @ `components/TableOfContents.tsx:13` - Content input.
- `BlogPostProps` @ `components/BlogPost.tsx:8` - Post rendering.
- `extractHeadings` @ `components/TableOfContents.tsx:46` - Parse Contentful rich text.
- `AppError` (class) @ `errors.ts:1` - Base error.
- `AuthenticationError` (class) @ `errors.ts:12`.
- `Post` (interface) @ `types/index.ts:1` - Blog post shape.
- `Author` (interface) @ `types/blog.ts:44`.
- `generateStaticParams` @ `app/blog/[slug]/page.tsx:25` - SSG paths.
- `generateMetadata` @ `app/blog/[slug]/page.tsx:31` - Dynamic SEO.

## Documentation Touchpoints

- [`types/README.md`](../types/README.md) - Type extension guidelines.
- [Contentful Integration Guide](../docs/contentful.md) - Fetching posts/authors.
- [Auth Setup](../app/api/auth/README.md) - NextAuth extensions.
- [Admin Patterns](../app/admin/README.md) - Protected routes checklist.

## Collaboration Checklist

1. **Confirm Spec**: Review feature spec; clarify assumptions with Product Owner (e.g., auth requirements, Contentful fields).
2. **Gather Context**: Analyze similar features (e.g., blog post for new article type); use `fetchUsers` pattern for lists.
3. **Implement Iteratively**: Scaffold page/component → Add types → API if needed → UI → Auth/SEO.
4. **Self-Review**: Lint (`npm run lint`), type-check (`npm run type-check`), test new code.
5. **PR Ready**: Update docs/types; add changelog entry; tag @reviewer.
6. **Post-PR**: Respond to feedback; capture learnings in `LEARNINGS.md`.

## Hand-off Notes

- **Outcomes**: New feature fully implemented, typed, tested; PR linked with demo screenshots.
- **Risks**: Edge cases (e.g., empty data, auth failures); monitor Contentful schema changes.
- **Follow-ups**: Deploy to Vercel preview; A/B test UX; engage Performance Agent if bundle > threshold; update AGENTS.md if new patterns emerge.
