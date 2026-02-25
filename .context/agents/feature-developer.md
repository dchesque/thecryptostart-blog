## Mission

This agent implements new features for the Crypto Start Blog, a Next.js application focused on blog content, admin management, SEO analytics, user interactions, and AI optimizations. Features integrate with existing API routes, UI components, and admin dashboards while maintaining clean architecture, performance, and SEO best practices.

**When to engage:**
- New feature implementation (e.g., blog post enhancements, admin tools, SEO metrics, user auth/comments)
- Feature enhancement requests (e.g., new components like ads, newsletters, or analytics dashboards)
- User story development (e.g., gated content, FAQ sections, social sharing)
- API endpoint additions (e.g., new routes under `app/api/admin/` or `app/api/seo/`)

**Implementation approach:**
- Analyze requirements against existing patterns in controllers (`app/api/`), pages (`app/`), and components (`components/`)
- Design API/UI before coding, reusing symbols like `PostMetaProps`, `CommentsListProps`
- Integrate with Prisma/DB via existing services, Drizzle ORM patterns, and NextAuth for auth
- Write tests in `__tests__/` or alongside files using Jest/RTL patterns
- Ensure mobile-responsive, SEO-optimized (e.g., OpenGraph, schema), and ad-friendly UI

## Responsibilities

- Implement new API endpoints in `app/api/` following route.ts patterns (e.g., GET/POST handlers with auth checks)
- Build/enhance UI in `app/` pages (e.g., `app/blog/[slug]/page.tsx`) and reusable `components/` (e.g., new cards, forms)
- Add admin features in `app/admin/` subpaths (e.g., posts, users, SEO dashboards)
- Handle data fetching with Server Components, revalidate paths, and integrate GSC/SEO APIs
- Create TypeScript types mirroring existing props (e.g., `FAQSectionProps`, `RecommendedContentProps`)
- Write comprehensive tests for APIs (unit/integration) and components (RTL)
- Update docs in `docs/` or inline JSDoc; ensure accessibility (ARIA) and performance (Web Vitals)
- Maintain backward compatibility for public APIs; use Zod for validation

## Best Practices

**Derived from codebase:**
- **API Routes (`app/api/`)**: Use async handlers with `NextRequest/NextResponse`; auth via `getServerSession`; Prisma queries; error handling with JSON responses (status 400/401/500); rate limiting where applicable.
- **UI Components**: Functional components with TypeScript props (e.g., `interface TrendingListProps { posts: Post[] }`); Tailwind CSS for styling; shadcn/ui patterns; Server/Client boundaries with `'use client'`.
- **Pages**: App Router structure (`app/blog/[slug]/page.tsx`); metadata exports for SEO; loading/error/suspense boundaries; integrate components like `TableOfContents`, `NewsletterForm`.
- **Data Flow**: Server Components for fetching (e.g., from `/api/users`, GSC analytics); revalidateTag/Path for dynamic data; optimistic updates in forms.
- **Testing**: Colocated `__tests__/`; mock APIs with MSW; test props, renders, interactions.
- **Conventions**: Kebab-case dynamic routes (`[id]`); consistent naming (e.g., `route.ts` exports methods); ESLint/Prettier; Git commit: `feat: add user comments API`.
- **Performance/SEO**: Lazy-load ads (`StickyHeaderAd`); schema.org JSON-LD; Core Web Vitals tracking; image optimization.
- **Commits**: Scoped (`feat(admin): new posts editor`), small, descriptive.

## Key Project Resources

- [AGENTS.md](../../AGENTS.md) - Agent collaboration guidelines
- [docs/README.md](../docs/README.md) - Architecture and setup
- [README.md](./README.md) - Project overview and contrib guide
- [next.config.js](next.config.js) - Build/Webpack config
- [tailwind.config.js](tailwind.config.js) - Styling conventions
- [tsconfig.json](tsconfig.json) - TypeScript strict mode

## Repository Starting Points

- `app/` - App Router pages: blog (`app/blog/`), admin (`app/admin/`), auth/SEO routes
- `app/api/` - API handlers: users/comments (`app/api/users/`), admin CRUD (`app/api/admin/`), SEO/GSC (`app/api/seo/`, `app/api/gsc/`)
- `components/` - Reusable UI: blog enhancers (`TrendingList.tsx`, `RelatedPosts.tsx`), forms (`NewsletterForm.tsx`, `CommentForm.tsx`), ads (`StickyHeaderAd.tsx`)
- `lib/` - Utilities, DB (Prisma/Drizzle), auth (NextAuth), SEO helpers
- `types/` - Shared TypeScript definitions (e.g., Post, User, Comment)
- `__tests__/` - Unit/integration tests for APIs/components

## Key Files

| File | Purpose |
|------|---------|
| `app/api/users/route.ts` | User listing (`GET`), creation (`POST`); auth-guarded |
| `app/api/comments/route.ts` | Comment creation (`POST`), listing (`GET`) |
| `app/api/admin/posts/[id]/route.ts` | Admin post CRUD (GET/PATCH/DELETE); publish endpoint |
| `components/TableOfContents.tsx` | Dynamic TOC from headings; `TOCItem` type |
| `components/NewsletterForm.tsx` | Email signup; integrates with backend service |
| `components/SocialComments.tsx` | Embeddable comments; props for moderation |
| `components/RelatedPosts.tsx` | AI-recommended posts; `RelatedPostsProps` |
| `components/PostMeta.tsx` | SEO metadata renderer; OpenGraph/schema |
| `app/blog/[slug]/page.tsx` | Single post page; integrates TOC, comments, ads |
| `app/admin/posts/new/page.tsx` | New post editor form; integrates rich text/upload |

## Architecture Context

### Controllers (API Layer)
- **Directories**: `app/api/users/`, `app/api/comments/`, `app/api/admin/posts/[id]/`, `app/api/seo/metrics/`, `app/api/gsc/analytics/`, `app/api/auth/register/`
- **Patterns**: `route.ts` files export HTTP methods (e.g., `export async function GET(request: NextRequest)`); auth via `getServerSession`; Prisma `db.user.findMany()`; Zod validation; caching with `revalidatePath`.
- **Key Exports**: 10+ handlers (GET users@18, POST comments@13, GET SEO metrics@7).

### Components/UI Layer
- **Directories**: `app/blog/[slug]/`, `app/admin/`, `components/` (50+ files)
- **Patterns**: Props-driven FCs (e.g., `interface TableOfContentsProps { items: TOCItem[] }`); Tailwind; hooks for state (useState, useEffect); `'use client'` for interactive.
- **Key Exports**: `TableOfContents`, `StickyHeaderAd`, `NewsletterForm`, `CommentsList` (30+ components).

### Data/Services
- Prisma schema inferred; GSC/SEO integrations; NextAuth (`app/api/auth/[...nextauth]/route.ts`).

## Key Symbols for This Agent

- **Props/Types**: `TrendingListProps`, `TableOfContentsProps`, `SocialCommentsProps`, `RelatedPostsProps`, `RecommendedContentProps`, `FAQSectionProps`, `CommentsListProps`
- **Data Models**: `Comment`, `FAQItem`, `RecommendedPost`, `PostMetaProps`, `PopularPostsProps`
- **API Handlers**: Exported `GET`, `POST`, `PATCH`, `DELETE` from `route.ts` files
- **UI Utils**: `WebVitals`, `ReadingProgressBar`, `ShareButtonsProps`

## Documentation Touchpoints

- Inline JSDoc on components/exports (e.g., `@param {TrendingListProps} props`)
- `components/*.tsx` prop docs
- API comments in `app/api/route.ts` (e.g., request/response shapes)
- Update `README.md` for new features; `docs/` for admin guides

## Workflows for Common Tasks

### 1. New API Endpoint (e.g., `/api/admin/categories`)
```
1. Create `app/api/admin/categories/route.ts` and `[id]/route.ts`
2. Export methods: GET (list), POST (create), etc.; use auth middleware
3. Validate with Zod; query Prisma (e.g., `db.category.findMany({ include: { posts: true } })`)
4. Handle errors: `return NextResponse.json({ error }, { status: 400 })`
5. Test: `__tests__/api/admin/categories.test.ts` with MSW
6. Revalidate: `revalidateTag('categories')`
```

### 2. New UI Component (e.g., `AuthorCard.tsx`)
```
1. Add to `components/AuthorCard.tsx`; define `interface AuthorCardProps { author: Author }`
2. Use Tailwind/shadcn; export default FC
3. Integrate in pages (e.g., `app/admin/authors/page.tsx`)
4. Add `__tests__/AuthorCard.test.tsx`: render, snapshot, prop variants
5. Usage: `<AuthorCard author={data.author} />`
```

### 3. New Page/Feature (e.g., `app/blog/clusters/page.tsx`)
```
1. Create page.tsx; fetch data server-side (async function)
2. Integrate components: `<TableOfContents />`, `<RelatedPosts />`
3. Add metadata: `export const metadata = { title: 'Clusters' }`
4. Suspense for loading; error.tsx for boundaries
5. Test interactions; update nav if needed
```

### 4. Feature Enhancement (e.g., Add AI Scores to Posts)
```
1. Extend `/api/ai-optimization/scores` or new endpoint
2. Update `Post` type; add to `PostMeta.tsx`
3. UI: New `<AIScoreBadge />` component
4. Admin integration: `app/admin/posts/[id]/edit/page.tsx`
```

## Collaboration Checklist

- [ ] Clarify requirements: acceptance criteria, wireframes, edge cases
- [ ] Sketch design: API schema, component tree, data flow
- [ ] Implement per workflows; TDD for critical paths
- [ ] Self-test: unit (90% coverage), e2e if UI-heavy
- [ ] Lint/build: `npm run lint`, `npm run build`
- [ ] Docs: JSDoc, README updates
- [ ] PR: Descriptive title/body, screenshots, tests passed
- [ ] Review: Address feedback; perf/security checks

## Hand-off Notes

- Verify feature in staging; monitor Web Vitals/SEO impact
- Risks: DB migrations (run prisma migrate), auth regressions (test NextAuth)
- Follow-up: Analytics agent for usage metrics; deploy after approvals

## Related Resources

- [../docs/README.md](./../docs/README.md)
- [README.md](./README.md)
- [../../AGENTS.md](./../../AGENTS.md)
- [Testing Agent Playbook](../testing-agent/playbook.md)
- [Review Agent Playbook](../review-agent/playbook.md)
