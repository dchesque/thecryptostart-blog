# Rules for Claude AI - Project Guidelines

Rules and conventions for Claude (Anthropic's AI) when generating code, documentation, or modifications for **The Crypto Start Blog**. Derived from current codebase analysis (app/, lib/, types/, components/). Ensures consistency with architecture, 100+ public exports, symbol index (classes like `GSCClient`, interfaces like `BlogPost`, functions like `analyzeSEO`), dependencies, and patterns. Follow strictly.

## Core Principles

- **TypeScript Everywhere**: Fully typed code. Leverage `types/` (e.g., `BlogPost`, `Author`, `UserWithRoles`, `RolePermissions`, `SEOProps`).
- **Next.js App Router**: Pages in `app/` (e.g., `app/blog/[slug]/page.tsx`). API routes export `GET`/`POST`/`DELETE` handlers (e.g., `app/api/admin/posts/[id]/route.ts`).
- **Naming & Exports**: Align with public API (e.g., `calculateAIOptimizationScore`, `analyzeSEO`, `getPostBySlug` from `lib/posts.ts`). Export only documented symbols.
- **Styling**: Tailwind + shadcn/ui (`cn` utility from `lib/utils.ts`). Extend `globals.css` only if needed.
- **Validation**: Zod schemas (`lib/validations.ts`, `lib/validations/admin.ts`: `RegisterInput`, `PostInput`, `AuthorInput`).
- **Security**: Integrate `lib/rate-limit.ts`/`lib/spam-prevention.ts` (`checkRateLimit`, `detectSpam`), `lib/permissions.ts` (`hasRole`), CSRF checks.
- **Performance**: SSG/ISR (`generateStaticParams`), reading time (`calculateReadingTime` from `lib/utils.ts` or `lib/posts.ts`).
- **SEO**: `lib/seo.ts` (`generateMetadata`, `generateSchema`), analyzers (`lib/seo-analyzer.ts`: `analyzeSEO`).
- **Errors**: Subclasses from `lib/errors.ts` (`AppError`, `RateLimitError`, `AuthorizationError`).

```ts
// Error example
import { RateLimitError, AuthorizationError } from '@/lib/errors';
import { checkRateLimit } from '@/lib/rate-limit';

const ip = getClientIP(req);
if (await checkRateLimit(ip)) throw new RateLimitError('Rate limited');
if (!hasRole(session?.user, 'admin')) throw new AuthorizationError('Admin only');
```

## Architecture Compliance

Layered structure from codebase scan:

| Layer | Rules | Key Files/Exports |
|-------|--------|-------------------|
| **Utils** | Helpers, validators. | `lib/utils.ts` (`cn`, `slugify`), `lib/validations/` (`PostInput`) |
| **Controllers (API)** | Edge runtime, JSON responses, security guards. | `app/api/admin/*` (`DELETE /api/admin/posts/[id]`), `app/api/auth/[...nextauth]` |
| **Components/UI** | Server Components default, props typed (e.g., `FAQSectionProps`). | `components/` (`CommentsList`, `TableOfContents`), `app/admin/*` pages |
| **Data Layer** | Prisma (`lib/prisma.ts`), blog queries (`lib/posts.ts`). | `getAllPosts`, `getPostBySlug`, `getRelatedPosts` |
| **Auth/RBAC** | NextAuth + roles. | `lib/permissions.ts` (`hasPermission`), `types/auth.ts` (`UserWithRoles`) |
| **Middleware** | Auth/rate limits. | `middleware.ts` |
| **SEO/AI Tools** | Analyzers, schemas. | `lib/seo-analyzer.ts` (`analyzeSEO`), `lib/ai-optimization.ts` (`AIOptimizationScore`) |

**Dependencies**: Reuse top imports (e.g., `lib/seo.ts` → 1 file, `components/SocialComments.tsx` → 2 files). Avoid new packages.

**Cross-References**:
- Blog: `app/blog/page.tsx` (`BlogPage`) → `lib/posts.ts` → `types/blog.ts` (`BlogPost`, `BlogCategory`).
- Admin: `app/admin/posts` → `app/api/admin/posts/[id]` → `lib/permissions.ts`.
- GSC: `lib/gsc-client.ts` (`GSCClient`, `createGSCClient`).

## Blog & Content Rules (lib/posts.ts)

- **Queries**: Exported functions with `PaginationOptions`/`SearchOptions`.
- **Transform**: `transformPrismaPost` for Prisma → `BlogPost`.
- **Patterns**:
```ts
// Page example: app/blog/[slug]/page.tsx
import { getPostBySlug, getRelatedPosts } from '@/lib/posts';
import { generateMetadata } from '@/lib/seo';
import { BlogPost } from '@/types/blog';

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const post: BlogPost | null = await getPostBySlug(params.slug);
  if (!post) return {};
  return generateMetadata({ title: post.title, description: post.excerpt });
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getPostBySlug(params.slug);
  const related = await getRelatedPosts(post.slug);
  return <article>{/* Render post, RelatedPosts(related) */}</article>;
}
```
- Categories: `getPostsByCategory`, `getAllCategories`.
- Slugs: `getAllPostSlugs`, `generateSlugFromTitle`.

## Authentication & Permissions

```ts
import { getServerSession } from 'next-auth';
import { hasRole, hasPermission } from '@/lib/permissions';
import { AuthorizationError } from '@/lib/errors';

export async function GET(req: Request) {
  const session = await getServerSession();
  if (!session || !hasRole(session.user as UserWithRoles, 'admin')) {
    throw new AuthorizationError('Access denied');
  }
  // Admin logic
}
```
- Users: `app/api/users/[id]`, types `User` (`types/auth.ts`).

## Security & Spam Prevention

Mandatory in all mutable APIs:

1. IP: `getClientIP` (`lib/spam-prevention.ts`).
2. Rate Limit: `checkRateLimit(ip)`.
3. Spam: `detectSpam(content)`, `validateEmail`.
4. Log: `logSpam`.

```ts
// app/api/comments/route.ts
import { checkRateLimit, detectSpam, getClientIP, logSpam } from '@/lib/spam-prevention';
import { AppError } from '@/lib/errors';

export async function POST(req: Request) {
  const ip = getClientIP(req);
  if (await checkRateLimit(ip)) throw new RateLimitError();
  const data = await req.json();
  if (detectSpam(data.content)) {
    await logSpam(ip, data.content);
    throw new AppError('Spam detected');
  }
  // Create comment
}
```

## Components & UI

Typed props, common patterns:

| Component | Usage | Props/Source |
|-----------|--------|--------------|
| `CommentsList` | Post comments | `components/CommentsList.tsx` (`CommentsListProps`) |
| `CategoryLinks`/`CategoryCard` | Categories | `components/Category*` |
| `FAQSection`/`FAQAccordion` | AI/SEO FAQs | `FAQItem`, `components/FAQ*.tsx` |
| `TableOfContents` | Headings TOC | `TOCItem[]` |
| `RelatedPosts`/`RecommendedContent` | Suggestions | `RelatedPostsProps` |
| `NewsletterForm`/`InlineNewsletter` | Subs | `Newsletter*Props` |
| Ads | `StickyHeaderAd`, `AdSense` (`AdSlot`) | `components/*Ad*.tsx` |

Example:
```tsx
import { CommentsList } from '@/components/CommentsList';
import { RelatedPosts } from '@/components/RelatedPosts';

<CommentsList comments={post.comments} postSlug={slug} />
<RelatedPosts posts={relatedPosts} />
```

## Utilities & Analyzers

| Function | Purpose | File |
|----------|---------|------|
| `cn`, `slugify`, `formatDate` | UI/text utils | `lib/utils.ts` |
| `calculateReadingTime`, `calculateWordCount` | Metrics | `lib/utils.ts`, `lib/posts.ts` |
| `analyzeSEO`, `extractHeadings`, `countImages` | SEO audit | `lib/seo-analyzer.ts` |
| `calculateAIOptimizationScore`, `extractQuickAnswer` | AI scoring | `lib/ai-optimization.ts` |
| `findLinkingOpportunities` | Internal links | `lib/link-builder.ts` |
| `analyzeKeywordGap`, `getKeywordSuggestions` | Keywords | `lib/keyword-research.ts` |
| `createGSCClient` | Google Search Console | `lib/gsc-client.ts` |

## Admin Dashboard

- Routes: `/admin/*` (e.g., `app/admin/posts/new`, `app/admin/ai-optimization`).
- APIs: `app/api/admin/{posts,comments,categories,authors}/[id]` (CRUD).
- Permissions: `hasRole('admin')`.
- Pages: `AdminLayout` (`app/admin/layout.tsx`).

## Testing & Scripts

- Utils: `__tests__/`.
- Scripts: `scripts/seo-monitor.ts` (`runDailySEOMonitoring`), `prisma/seed.ts`.
- Validation: Zod + Prisma transactions.

## Documentation Standards

- Markdown: Headings (# ##), tables, fenced code (```ts, ```tsx).
- Refs: [`lib/posts.ts`](../lib/posts.ts), symbols (e.g., [`BlogPost`](../types/blog.ts)).
- Examples: Runnable, context-aware snippets.

## Workflow

1. Use tools (`readFile('lib/posts.ts')`, `analyzeSymbols`, `searchCode`).
2. Match patterns (e.g., 100+ exports like `ExitIntentPopup`).
3. Output **only** final Markdown/code.

**Violations**: Prioritize these rules unless overridden.

**Updated**: Codebase snapshot (Public API: 100+ exports; Symbols: 50+ interfaces/types). See [README](../README.md).
