# Architecture

This is a monolithic Next.js (v14+) application for a crypto-focused blog platform. It uses the App Router, Contentful as a headless CMS for blog content, Prisma ORM with PostgreSQL for user data and authentication, and NextAuth.js for session management. The architecture emphasizes static site generation (SSG) for blog posts to boost SEO and performance, with server-side rendering (SSR) and API routes for dynamic features like admin panels and user interactions.

Deployment targets Vercel for edge caching, global CDN, and serverless scaling. All layers are co-located for simplicity, with TypeScript contracts ensuring type safety across boundaries.

## High-Level Data Flow

```
Client Request → app/ Pages (SSG/SSR) → lib/ Fetchers & Utils → External Services (Contentful/Prisma)
                    ↓
               app/api/ Routes (Mutations) → Prisma/DB
                    ↓
               Components (UI Rendering) + Auth/Session Checks
```

## Architectural Layers

| Layer                  | Directory/Path                  | Responsibilities                          | Key Files/Exports                          |
|------------------------|---------------------------------|-------------------------------------------|--------------------------------------------|
| **Presentation**      | `app/`, `components/`           | UI rendering, pages, reusable components | `app/blog/[slug]/page.tsx`, `components/TableOfContents.tsx` |
| **API**               | `app/api/`                      | Route handlers for auth, users, comments | `app/api/auth/register/route.ts`, `app/api/admin/comments/route.ts` |
| **Business Logic**    | `lib/`, `types/`                | Data fetching, utils, validation, SEO    | `lib/contentful.ts` (`getPostBySlug`), `lib/seo.ts` (`generateMetadata`) |
| **Persistence**       | `prisma/`                       | DB schema, migrations, queries           | `prisma/schema.prisma`, `lib/prisma.ts` (singleton) |
| **Infrastructure**    | `lib/` (integrations), `public/`| Config, constants, static assets         | `lib/constants.ts` (`getCategoryBySlug`), `public/` |

## Design Patterns

| Pattern     | Locations                          | Purpose                                      |
|-------------|------------------------------------|----------------------------------------------|
| **Singleton** | `lib/prisma.ts` (PrismaClientSingleton) | Single DB client instance per request        |
| **Factory**  | `lib/contentful.ts` (getClient)    | Lazy Contentful client creation              |
| **Adapter**  | `lib/contentful.ts` (transformPost)| Contentful data → internal `BlogPost` type   |
| **Decorator**| `lib/seo.ts` (generateMetadata)   | Enhance page metadata with JSON-LD schemas   |
| **Strategy** | `lib/permissions.ts` (hasRole/hasPermission) | Pluggable RBAC checks                |

## Entry Points

- **`app/layout.tsx`** — Root layout with `AuthProvider`, providers, and global metadata.
- **`app/page.tsx`** — Landing/homepage.
- **`app/blog/page.tsx`** — Blog index with `getAllPosts`, pagination, search.
- **`app/blog/[slug]/page.tsx`** — Post viewer (SSG via `generateStaticParams`/`getPostBySlug`).
- **`app/admin/page.tsx`** — Admin dashboard (`AdminDashboard`).
- **`app/api/auth/register/route.ts`** — POST user registration.
- **`app/api/users/route.ts`** — GET/POST users list.
- **`prisma/seed.ts`** — DB seeding.

Example SSG setup in `app/blog/[slug]/page.tsx`:

```tsx
export async function generateStaticParams() {
  const slugs = await getAllPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getPostBySlug(params.slug);
  // Render with SEO, comments, etc.
}
```

## Key Domains & Boundaries

- **Blog Domain** (`lib/contentful.ts`, `types/blog.ts`): Read-only Contentful access. Types: `BlogPost`, `BlogCategory`, `ContentfulBlogPost`.
- **Auth Domain** (`app/api/auth/`, `types/auth.ts`): Prisma-backed users/sessions. Exports: `UserWithRoles`, `hasPermission`.
- **Admin Domain** (`app/admin/`): Gated by roles; fetches via API routes.

No shared mutable state; data flows via props/fetch.

## Public API Surface

| Symbol                  | Type      | File                          | Usage Example |
|-------------------------|-----------|-------------------------------|---------------|
| `BlogPost`             | Interface | `types/blog.ts`              | Data model for posts |
| `getPostBySlug(slug)`  | Function  | `lib/contentful.ts`          | `const post = await getPostBySlug('my-post');` |
| `generateMetadata()`   | Function  | `lib/seo.ts`                 | Page `<head>` enhancement |
| `calculateReadingTime(text)` | Function | `lib/utils.ts`            | `const time = calculateReadingTime(post.body);` |
| `checkRateLimit(ip)`   | Function  | `lib/rate-limit.ts`          | API guard: `if (await checkRateLimit(ip)) return NextResponse.json(...);` |
| `AuthProvider`         | Component | `components/AuthProvider.tsx`| `<AuthProvider>{children}</AuthProvider>` |
| `hasPermission(user, perm)` | Function | `lib/permissions.ts`     | Admin gates |

Full list in [codebase-map.json](../codebase-map.json).

## External Dependencies

| Service       | Integration File       | Config                  | Fallback/Notes |
|---------------|-----------------------|-------------------------|----------------|
| **Contentful**| `lib/contentful.ts`  | `CONTENTFUL_SPACE_ID`, `CONTENTFUL_TOKEN` | SSG cache; query limits tracked |
| **Prisma/PG**| `lib/prisma.ts`      | `DATABASE_URL`         | Singleton; auto-migrations |
| **NextAuth** | `app/api/auth/[...nextauth]/route.ts` | `NEXTAUTH_SECRET`, providers | Credentials + sessions |
| **AdSense**  | `components/AdSense.tsx` | Client-side script   | CSP headers required |

## Deployment & Scaling

- **Build**: `pnpm build` → SSG outputs in `.next/static`.
- **Runtime**: Vercel Edge for APIs; ISR revalidation for dynamic pages.
- **Scaling**: Monolith to 10k DAU; add Upstash Redis for rate limits if needed.
- **Local Dev**: `pnpm dev`; Docker for Postgres/Contentful mocks.

## Trade-offs

| Decision                  | Pro                          | Con                          | Alternative |
|---------------------------|------------------------------|------------------------------|-------------|
| Contentful CMS            | Non-dev content edits       | Vendor cost/latency (~300ms)| Markdown files |
| SSG + API SSR             | SEO + perf                  | Build times for 100+ posts  | Full ISR    |
| Prisma + NextAuth         | Type-safe auth              | Schema lock-in              | Custom JWT  |
| Monolith                  | Fast iteration              | No independent scaling      | Turborepo   |

## Architecture Diagram

```mermaid
graph TD
    Client[Browser/Client] -->|GET /blog/[slug]| Pages[app/ Pages<br/>SSG/SSR]
    Pages -->|fetch| Lib[lib/<br/>contentful.ts, seo.ts]
    Lib -->|Query| Contentful[Contentful CMS]
    Lib -->|Query| Prisma[Prisma<br/>Postgres DB]
    Pages -->|Mutations| API[app/api/ Routes]
    API --> Prisma
    Pages -->|Sessions| Auth[NextAuth.js]
    Pages --> Components[components/<br/>UI + Ads]
    Auth -.->|RBAC| Lib
```

## Risks & Mitigations

- **Vendor Lock (Contentful)**: Export scripts; cap at 1k posts.
- **Cold Starts**: Edge runtime; <500ms p95 target.
- **Spam/Rate Limits**: `lib/rate-limit.ts`, `lib/spam-prevention.ts` (IP-based).
- **SEO**: `lib/seo.ts` schemas; monitor Core Web Vitals.

## Directory Structure

```
.
├── app/              # Pages, layouts, API routes (~25 files)
├── components/       # UI (~15 files: Sidebar, CommentsList)
├── lib/              # Utils, fetchers (~20 files: contentful.ts, utils.ts)
├── types/            # TS defs (~5 files: blog.ts, auth.ts)
├── prisma/           # DB (~5 files: schema.prisma)
├── docs/             # This docs/
└── public/           # Assets
```

## Related Docs

- [project-overview.md](./project-overview.md) — High-level project goals.
- [data-flow.md](./data-flow.md) — Detailed request/response traces.
- [codebase-map.json](./codebase-map.json) — Symbols, deps, graphs.
