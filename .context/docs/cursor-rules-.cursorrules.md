# Cursor Rules (.cursorrules) Documentation

## Overview

The `.cursorrules` file, located in the repository root, defines AI coding guidelines for tools like Cursor. It enforces consistency with **The Crypto Start Blog**'s architecture, TypeScript conventions, security practices, and SEO optimizations. Auto-generated from codebase analysis (last updated: 2026-02-19T12:33:45.569Z), it acts as a dynamic prompt for AI-assisted development.

**Primary Goals:**
- Generate code matching existing patterns (e.g., Next.js App Router, Prisma queries).
- Enforce security (RBAC via `hasRole`, rate limiting with `checkRateLimit`).
- Promote SEO best practices (`generateMetadata`, schema generation).
- Accelerate development by referencing 100+ public exports.

**Usage in Cursor:**
- Enable `.cursorrules` in your workspace settings.
- Prompt example: "Create an admin page for editing categories using `CategoryInput` and `getAllCategories`."
- Regenerate after major changes via analysis scripts (e.g., `scripts/seo-monitor.ts` patterns).

## File Structure & Content Breakdown

The `.cursorrules` file is structured as a Markdown prompt with sections on architecture, APIs, conventions, and symbols. Key excerpts:

### 1. Architecture Layering
Enforces strict folder conventions:

```
lib/                 # Business logic: posts.ts, seo.ts, permissions.ts, ai-optimization.ts
├── posts.ts         # Post queries: getPostBySlug, getRelatedPosts
├── seo.ts           # Metadata: generateMetadata, generateFAQSchema
└── utils.ts         # Helpers: cn, calculateReadingTime, slugify

app/                 # App Router pages & APIs
├── api/             # Routes: admin/posts/[id]/route.ts (CRUD with auth)
├── blog/[slug]/     # Dynamic pages with SEO props
└── admin/           # Protected: layout.tsx with AdminLayout

components/          # Reusable UI: AuthProvider, FAQSection, CommentsList
types/               # Schemas: BlogPost, UserWithRoles, AIOptimizationScore
prisma/schema.prisma # DB models
```

**Example Compliance (Page Generation):**
```tsx
// app/admin/categories/page.tsx
import { getAllCategories } from '@/lib/posts';
import AdminLayout from '@/app/admin/layout';
import { hasRole } from '@/lib/permissions';
import { getServerSession } from 'next-auth';

export default async function CategoriesPage() {
  const session = await getServerSession();
  if (!hasRole(session, 'admin')) throw new AuthorizationError('Access denied');
  const categories = await getAllCategories();
  // Render CategoryCard components
}
```

### 2. Public API Reference
References 100+ exports. Prioritize these in generations:

#### Essential Functions
| Category | Function | Source | Usage Example |
|----------|----------|--------|--------------|
| **Posts/CMS** | `getPostBySlug(slug)` | `lib/posts.ts` | `const post = await getPostBySlug(params.slug);` |
| | `getRelatedPosts(postId, limit)` | `lib/posts.ts` | Recommendations in `components/RelatedPosts.tsx` |
| **SEO** | `analyzeSEO(content)` | `lib/seo-analyzer.ts` | Scores: `{ wordCount: number, headings: TOCItem[] }` |
| | `generateMetadata({ title, description })` | `lib/seo.ts` | All `page.tsx` files |
| **AI/Optimization** | `calculateAIOptimizationScore(content)` | `lib/ai-optimization.ts` | Admin dashboard: `app/admin/ai-optimization/page.tsx` |
| **Security** | `checkRateLimit(ip)` | `lib/spam-prevention.ts` or `lib/rate-limit.ts` | API routes: `if (await checkRateLimit(getClientIP(req))) return NextResponse.json({ error: 'Rate limited' }, { status: 429 });` |
| **Utils** | `cn(...classes)` | `lib/utils.ts` | Tailwind class merging: `cn('btn', isActive && 'btn-active')` |

#### Key Types/Interfaces
- `BlogPost`: `{ slug, title, body, author: Author, category: BlogCategory }` – Used in `app/blog/[slug]/page.tsx`.
- `UserWithRoles`: Extends NextAuth `Session` with `roles: RolePermissions[]`.
- `SEOAnalysis`: `{ wordCount, internalLinks, images, headings }` from `analyzeSEO`.
- `ExpansionOpportunity`: `{ heading, suggestion }` from `lib/content-expander.ts`.

**Cross-References:**
- Blog data: `lib/posts.ts` → `components/TableOfContents.tsx` (uses `extractHeadings`).
- Auth: `components/AuthProvider.tsx` → API routes with `getServerSession`.

### 3. Conventions & Best Practices
- **Type Safety**: Zod schemas (`lib/validations/admin.ts`: `PostInput`, `AuthorInput`).
- **Error Handling**: Throw `AppError`, `AuthenticationError`, `RateLimitError` (`lib/errors.ts`).
- **Styling**: Shadcn/UI + Tailwind (`cn` utility). Components like `FAQSection` use `FAQItem[]`.
- **Performance/SEO**:
  - ISR: `export const revalidate = 3600;` for dynamic pages.
  - Schemas: `generateFAQSchema(items)` in `<head>`.
  - Images: `next/image` with `FeaturedImage` props.
- **Admin Flows**: `app/admin/*` requires `AdminLayout` + `hasPermission`.

**API Route Pattern:**
```ts
// app/api/admin/comments/route.ts
import { checkRateLimit } from '@/lib/spam-prevention';
import { detectSpam } from '@/lib/spam-prevention';
import { z } from 'zod';
import { PostInput } from '@/lib/validations/admin';

export async function POST(req: NextRequest) {
  const ip = getClientIP(req);
  await checkRateLimit(ip);
  const data = PostInput.parse(await req.json());
  if (detectSpam(data.content)) throw new ValidationError('Spam detected');
  // Prisma upsert
}
```

### 4. Dependencies & Usage Patterns
- **Frequently Imported**:
  - `lib/seo.ts` (all pages).
  - `lib/posts.ts` (blog, admin).
  - `components/AuthProvider.tsx` (wraps `app/layout.tsx`).
- **Searchable Patterns** (via `searchCode` tool):
  - Rate limits: `checkRateLimit` in 6+ API files.
  - SEO analysis: `analyzeSEO` in `app/admin/seo/page.tsx`.
- **Tests/Examples**: Usage in `app/api/admin/posts/[id]/route.ts` (DELETE with auth).

### 5. Maintenance & Contribution
- **Regeneration**: Run codebase scans to update symbol index (classes like `GSCClient`, functions like `analyzeKeywordGap`).
- **Guidelines**:
  | Action | Rule |
  |--------|------|
  | New Feature | Branch: `feat/new-component`; Use existing types. |
  | Refactor | Lint: `npm run lint`; Test: Expand `__tests__/`. |
  | Deploy | Update `CHANGELOG.md`; Verify SEO with `analyzeAllForExpansion`. |

**Related Files:**
- [.cursorrules](../.cursorrules) – Source rules file.
- [lib/posts.ts](../lib/posts.ts) – Core data functions.
- [app/admin/layout.tsx](../app/admin/layout.tsx) – `AdminLayout` example.
- [types/blog.ts](../types/blog.ts) – `BlogPost`, `BlogCategory`.

This documentation keeps AI generations in sync with the codebase. For full symbol index, query `analyzeSymbols` on `lib/*.ts`.
