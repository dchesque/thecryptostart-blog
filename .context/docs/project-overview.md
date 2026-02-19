# The Crypto Start Blog - Project Overview

A modern, SEO-optimized Next.js blog platform focused on crypto startups, trading tips, and industry insights. Built with Contentful for headless CMS, Prisma for user management, and NextAuth for secure authentication. Emphasizes performance (Core Web Vitals), monetization (AdSense), and developer-friendly extensibility.

[![Architecture Overview](codebase-map.json#architecture)](codebase-map.json)  
*Detailed symbol counts, layers, and graphs in [`codebase-map.json`](./codebase-map.json).*

## Quick Facts

| Metric | Details |
|--------|---------|
| **Root** | `C:\Workspace\thecryptostartblog` |
| **Languages** | TypeScript (42 files), JavaScript (8 files) |
| **Total Files** | 50 |
| **Total Symbols** | 92 exports + interfaces/types |
| **Entry Point** | [`app/layout.tsx`](../app/layout.tsx) – Root layout with `AuthProvider` |
| **Build Tooling** | npm scripts, Docker Compose, Prisma CLI |
| **Key Pages** | `/` (home), `/blog`, `/blog/[slug]`, `/admin` |

## Architecture Layers

```
app/          # Next.js App Router: Pages, layouts, API routes
├── api/      # API handlers: users, comments, auth, admin
├── blog/     # Blog index + dynamic posts (SSG + ISR)
├── admin/    # Dashboard, users, comments management
components/   # UI: PostMeta, RelatedPosts, AdSense, TableOfContents
lib/          # Utils: contentful.ts (CMS), seo.ts, rate-limit.ts, permissions.ts
types/        # TS defs: BlogPost, UserWithRoles, SEOProps
prisma/       # DB: schema.prisma, seed.ts
public/       # Assets: images, favicons
docs/         # Guides: CONTENTFUL_SETUP.md, tooling.md
```

- **Data Flow**: Contentful → `lib/contentful.ts` → Pages (e.g., `getPostBySlug`)
- **Auth Flow**: NextAuth → `lib/permissions.ts` → Admin APIs
- **Spam/Rate Limiting**: `lib/spam-prevention.ts` + `lib/rate-limit.ts`
- **SEO**: Dynamic `generateMetadata` + JSON-LD schemas in `lib/seo.ts`

**Cross-References**:
- [Auth Architecture → `AUTH_ARCHITECTURE.md`](../AUTH_ARCHITECTURE.md)
- [Core Web Vitals → `CORE_WEB_VITALS.md`](../CORE_WEB_VITALS.md)

## Core Technology Stack

| Layer | Tech | Purpose |
|-------|------|---------|
| **Framework** | Next.js 14+ (App Router) | SSR/SSG, API routes, RSC |
| **CMS** | Contentful | Headless content for posts/categories |
| **Database** | Prisma + PostgreSQL | Users, comments, roles |
| **Auth** | NextAuth.js | Sessions, OAuth, custom providers |
| **Styling** | Tailwind CSS | Responsive, utility-first |
| **Analytics** | Google Analytics 4 | Web Vitals (`lib/analytics.ts`), ad tracking |
| **Monetization** | Google AdSense | Sticky ads, recommended content |
| **DevOps** | Docker, npm | Local/prod deployment |

**Example Usage** (Contentful Fetch):
```tsx
// app/blog/[slug]/page.tsx
import { getPostBySlug } from '@/lib/contentful';

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getPostBySlug(params.slug); // Transforms Contentful entry to BlogPost
  return <article>{/* Render post */}</article>;
}
```

## Key Exports & Symbols

### Top Functions (lib/)
- **`getPostBySlug(slug: string)`** [`lib/contentful.ts:189`](../lib/contentful.ts#L189) – Fetches/transforms single post.
- **`generateMetadata(props: MetadataInput)`** [`lib/seo.ts:24`](../lib/seo.ts#L24) – Dynamic page titles/descriptions.
- **`checkRateLimit(ip: string)`** [`lib/rate-limit.ts:14`](../lib/rate-limit.ts#L14) – Prevents API abuse.
- **`detectSpam(content: string)`** [`lib/spam-prevention.ts:57`](../lib/spam-prevention.ts#L57) – AI-free spam filter.

### Core Types/Interfaces (types/)
- **`BlogPost`** [`types/blog.ts:61`](../types/blog.ts#L61) – `{ slug, title, content, author: Author, category: BlogCategory }`
- **`UserWithRoles`** [`types/auth.ts:26`](../types/auth.ts#L26) – Extends NextAuth `User`.
- **`SEOProps`** [`types/index.ts:41`](../types/index.ts#L41) – For metadata generation.

### Pages/Components
- **`BlogPage`** [`app/blog/page.tsx:39`](../app/blog/page.tsx) – Paginated list + search.
- **`AdminDashboard`** [`app/admin/page.tsx:5`](../app/admin/page.tsx) – User/comment CRUD.
- **`AuthProvider`** [`components/AuthProvider.tsx:5`](../components/AuthProvider.tsx) – Wraps app for sessions.

*Full list (92+ symbols): [`codebase-map.json`](#symbol-index).*

## Entry Points & Navigation

- **`app/layout.tsx`** – Global providers (Auth, SEO), Navbar/Footer.
- **`app/page.tsx`** – Landing with featured posts, newsletter CTA.
- **`app/blog/page.tsx`** – `getAllPosts()`, categories, pagination.
- **`app/blog/[slug]/page.tsx`** – `generateStaticParams()` for SSG, `getPostBySlug()`.
- **APIs**: `app/api/comments/route.ts` (POST/GET), `app/api/admin/comments/[id]/route.ts` (CRUD).

**Example Static Params**:
```tsx
// app/blog/[slug]/page.tsx
export async function generateStaticParams() {
  const slugs = await getAllPostSlugs();
  return slugs.map((slug) => ({ slug }));
}
```

## Getting Started

1. **Setup Env**:
   ```
   cp .env.example .env.local
   # Add: CONTENTFUL_SPACE_ID, NEXTAUTH_SECRET, DATABASE_URL (see CONTENTFUL_SETUP.md)
   ```

2. **Install & DB**:
   ```
   npm install
   npx prisma generate
   npx prisma db push
   npx prisma db seed  # Creates admin user
   ```

3. **Run**:
   ```
   npm run dev  # http://localhost:3000
   docker-compose up  # Prod-like (optional)
   ```

4. **Verify**:
   - Blog loads posts from Contentful.
   - `/admin` → Login → Manage users/comments.
   - Check console for rate limits/spam logs.

**Troubleshooting**: See [`tooling.md`](./tooling.md), [`development-workflow.md`](./development-workflow.md).

## Development Workflow

- **Content**: Update in Contentful → Revalidate paths (`revalidatePath('/blog')`).
- **Testing**: API routes have `handleError`; unit tests inferred via Prisma seed.
- **Performance**: `sendWebVital()` auto-tracks LCP/FCP; AdSense slots in components.
- **Extend**: Add categories in `lib/constants.ts`; new APIs mirror `app/api/comments/route.ts`.
- **Deploy**: Vercel/Netlify (Next.js optimized); Docker for self-host.

## Next Steps for Contributors

- **Priorities**: Contentful integration, custom domain/SSL.
- **Stakeholders**: Writers (CMS), Devs (APIs), Readers (UX feedback).
- **Dive Deeper**:
  - [File Structure → `#file-structure--code-organization`](#file-structure--code-organization)
  - [Permissions → `lib/permissions.ts`](../lib/permissions.ts)
  - Full codebase: [`codebase-map.json`](./codebase-map.json)

Welcome aboard! 🚀 Questions? Check docs or open an issue.
