# Feature Developer Agent Playbook

## Mission
The Feature Developer agent implements new features for the CryptoStartBlog, a Next.js 14+ application built with the App Router, TypeScript, Tailwind CSS, shadcn/ui, Contentful for content management, and NextAuth for authentication. Engage this agent for product specifications requiring new UI pages, API routes, reusable components, admin tools, blog enhancements, or third-party integrations. It prioritizes clean architecture by extending existing patterns, ensuring seamless integration, type safety, responsive design, SEO optimization, and comprehensive testing to maintain scalability, performance, and maintainability.

## Responsibilities
- Scaffold new App Router pages in `/app/` (e.g., `page.tsx`, `layout.tsx`) with server-side rendering, dynamic segments (`[slug]`), `generateStaticParams`, and `generateMetadata` for SSG and SEO.
- Develop API routes in `/app/api/` (e.g., `route.ts` with `GET`, `POST`, `PATCH`, `DELETE` handlers) including authentication checks, database operations via Prisma or similar, Contentful fetches, and standardized error responses.
- Create reusable components in `/components/` with TypeScript interfaces for props (e.g., cards, modals, sidebars, ads) following shadcn/ui and Tailwind conventions.
- Integrate authentication using `AuthProvider`, session checks, and protected routes for admin areas (`/app/admin/`).
- Fetch, parse, and display Contentful data (posts, comments, authors) with patterns like `extractHeadings` for TOC and rich text handling.
- Extend global types in `/types/` and error classes for new data shapes and consistent handling.
- Incorporate UI elements like ads (`StickyHeaderAd`), newsletters (`NewsletterForm`), share buttons, and social comments into new pages.
- Implement responsive, accessible designs with Tailwind classes, mobile-first approach, and ARIA attributes.
- Add unit/integration tests for new components and APIs using existing test patterns (Vitest/Jest).
- Update documentation, SEO metadata, and changelog for deployed features.

## Best Practices
- Prioritize Server Components; use `"use client"` only for interactive elements (e.g., forms, modals with hooks).
- Define strict TypeScript interfaces for all props/data (e.g., `PostMetaProps`, `CommentsListProps`); infer from Contentful schemas.
- Secure APIs with NextAuth session validation; throw `AuthenticationError` for unauthorized access.
- Follow Contentful patterns: use `client.getEntries` with queries; parse rich text for TOC/slugs with `extractHeadings`.
- Generate dynamic metadata (`generateMetadata`) and static params (`generateStaticParams`) for blog/admin pages.
- Handle errors uniformly: custom classes (`AppError`), `notFound()`, `redirect()`; provide user-friendly messages.
- Style with Tailwind/shadcn/ui: extend `tailwind.config.js`, use utility classes, ensure responsiveness (`sm:`, `md:` breakpoints).
- Optimize performance: SSG where possible, `revalidatePath` for ISR, lazy-load components/images.
- Test comprehensively: unit tests for components (`@testing-library/react`), API mocks, E2E with Playwright if patterned.
- Commit conventions: feature branches (`feat/new-feature`), descriptive messages; run `lint`, `type-check`, `test` pre-PR.
- Integrate cross-cutting concerns: ads, newsletters, SEO, analytics in all public pages.

## Key Project Resources
- [README.md](../README.md) - Project overview, setup, scripts, environment variables.
- [AGENTS.md](../../AGENTS.md) - Agent roles, collaboration protocols.
- [../docs/README.md](../docs/README.md) - Documentation index and guides.
- [Contributor Guide](../CONTRIBUTING.md) - PR workflow, code standards, deployment.
- Contentful SDK Docs: [Content Delivery API](https://www.contentful.com/developers/docs/references/content-delivery-api/).

## Repository Starting Points
- `/app/` - Core App Router structure: pages, layouts, loading/error states, dynamic routes (`[slug]`), and metadata.
- `/components/` - Reusable UI elements: blog/sidebar components, ads, auth UI, forms, and content displays.
- `/app/api/` - API routes for users, comments, auth; handlers follow REST patterns with auth guards.
- `/app/admin/` - Protected admin interfaces: dashboards, user/comment management pages.
- `/app/blog/` - Blog functionality: post listings, dynamic slugs, TOC, related content.
- `/types/` - Shared TypeScript definitions: data models, props interfaces, error types.

## Key Files
| File | Purpose |
|------|---------|
| [`app/api/users/route.ts`](../app/api/users/route.ts) | User CRUD operations (GET, POST); template for new entity APIs. |
| [`app/api/comments/route.ts`](../app/api/comments/route.ts) | Comment handling (POST, GET); extend for moderation features. |
| [`app/api/admin/comments/[id]/route.ts`](../app/api/admin/comments/[id]/route.ts) | Admin comment management (GET, PATCH, DELETE). |
| [`components/TableOfContents.tsx`](../components/TableOfContents.tsx) | TOC generation from rich text; use `extractHeadings` for blog pages. |
| [`components/StickyHeaderAd.tsx`](../components/StickyHeaderAd.tsx) | Persistent ad component; integrate in layouts. |
| [`components/SocialComments.tsx`](../components/SocialComments.tsx) | Comments display; pair with `CommentForm`. |
| [`components/NewsletterForm.tsx`](../components/NewsletterForm.tsx) | Subscription UI; add to sidebars/footers. |
| [`components/Footer.tsx`](../components/Footer.tsx) | Global footer with links, ads, newsletter CTA. |
| [`app/blog/[slug]/page.tsx`](../app/blog/[slug]/page.tsx) | Dynamic post page; model for content-heavy features. |
| [`components/TrendingList.tsx`](../components/TrendingList.tsx) | Trending content sidebar; reuse for recommendations. |

## Architecture Context
### Controllers (API Routes)
- **Directories**: `app/api/users`, `app/api/comments`, `app/api/users/[id]`, `app/api/auth/[...nextauth]`, `app/api/auth/register`, `app/api/admin/comments`, `app/api/admin/comments/[id]`.
- **Symbol Count**: 10+ handlers.
- **Key Exports**:
  - `GET` @ `app/api/users/route.ts:15` - List users.
  - `POST` @ `app/api/users/route.ts:48` - Create user.
  - `POST` @ `app/api/comments/route.ts:13` - Add comment.
  - `GET` @ `app/api/comments/route.ts:112` - Fetch comments.
  - `PATCH` @ `app/api/users/[id]/route.ts:15` - Update user.
  - `DELETE` @ `app/api/users/[id]/route.ts:59` - Delete user.
  - `POST` @ `app/api/auth/register/route.ts:12` - Registration.
  - `GET` @ `app/api/admin/comments/route.ts:5` - Admin comment list.
  - `PATCH` @ `app/api/admin/comments/[id]/route.ts:4` - Admin update.
  - `DELETE` @ `app/api/admin/comments/[id]/route.ts:31` - Admin delete.

### Components (UI Layer)
- **Directories**: `app`, `components`, `app/login`, `app/blog`, `app/admin`, `app/about`, `components/admin`, `app/blog/[slug]`, `app/admin/users`, `app/admin/comments`.
- **Symbol Count**: 30+ components and props interfaces.
- **Key Exports**:
  - `TableOfContents` @ `components/TableOfContents.tsx:86`.
  - `StickyHeaderAd` @ `components/StickyHeaderAd.tsx:19`.
  - `StickyFooterAd` @ `components/StickyFooterAd.tsx:19`.
  - `SocialComments` @ `components/SocialComments.tsx:16`.
  - `NewsletterForm` @ `components/NewsletterForm.tsx:13`.

## Key Symbols for This Agent
- `TrendingListProps` @ `components/TrendingList.tsx:7` - Props for trending posts list.
- `TOCItem` @ `components/TableOfContents.tsx:7` - TOC heading structure.
- `TableOfContentsProps` @ `components/TableOfContents.tsx:13` - Input for TOC generation.
- `StickyHeaderAdProps` @ `components/StickyHeaderAd.tsx:9` - Ad configuration.
- `SocialCommentsProps` @ `components/SocialComments.tsx:8` - Comments display props.
- `NewsletterFormProps` @ `components/NewsletterForm.tsx:5` - Form handling props.
- `CommentsListProps` @ `components/CommentsList.tsx:14` - List rendering.
- `CommentFormProps` @ `components/CommentForm.tsx:6` - Submission form.
- `PostMetaProps` @ `components/PostMeta.tsx:4` - Post metadata display.
- `FeaturedArticleCardProps` @ `components/FeaturedArticleCard.tsx:5` - Card component props.

## Documentation Touchpoints
- [`../docs/README.md`](../docs/README.md) - Central docs index.
- [`types/README.md`](../types/README.md) - Type definitions guidelines.
- [Contentful Guide](../docs/contentful.md) - Data fetching and parsing.
- [Auth README](../app/api/auth/README.md) - NextAuth extensions and sessions.
- [Admin Patterns](../app/admin/README.md) - Protected page checklist.

## Collaboration Checklist
1. **Confirm Spec**: Parse feature requirements; query Product Owner for ambiguities (e.g., Contentful fields, auth levels).
2. **Gather Context**: Use tools to scan similar files (e.g., `app/blog/[slug]/page.tsx` for new post types); list relevant symbols.
3. **Plan Implementation**: Outline files/types/APIs; mock wireframes if UI-heavy.
4. **Develop Iteratively**: Create types first → API routes → pages/components → tests → integrations (auth, Contentful, ads).
5. **Validate**: Run linting, type-check, tests; self-review for patterns/best practices.
6. **Document & PR**: Update READMEs/types/changelog; create PR with screenshots/demo; notify reviewers.
7. **Review & Iterate**: Address feedback; capture edge cases/learnings in `LEARNINGS.md`.
8. **Hand-off**: Summarize outcomes, risks; suggest next agents (e.g., Performance for optimizations).

## Hand-off Notes
Upon completion, confirm the feature is fully integrated, tested across devices/browsers, and deployed to preview. Remaining risks include Contentful schema drifts or high-traffic auth bottlenecks—monitor logs. Follow-ups: Engage QA Agent for E2E tests, Performance Agent for bundle analysis if >500KB, and Docs Agent to expand guides with new patterns. Link PR in spec ticket for tracking.
