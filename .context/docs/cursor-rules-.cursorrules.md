# Cursor Rules (.cursorrules)

## Overview

The `.cursorrules` file in the repository root provides AI-specific guidelines for tools like Cursor, ensuring generated code aligns with **The Crypto Start Blog**'s architecture, conventions, and best practices. It is auto-generated from codebase analysis (last updated: 2026-02-19T12:33:45.569Z) and serves as a contextual prompt for AI assistance.

**Key Benefits for Developers:**
- Consistent code generation (e.g., TypeScript types, Next.js App Router patterns).
- Adherence to security (rate limiting, CSRF, RBAC) and SEO standards.
- Awareness of core exports, symbols, and dependencies.
- Faster onboarding for new features or refactors.

When using Cursor (or similar tools):
1. Ensure `.cursorrules` is active in your workspace.
2. Reference it for prompts like "Add a new blog post component following rules."
3. Regenerate via codebase scans if architecture changes.

## Core Rules Extracted from .cursorrules

### 1. Architecture Compliance
Follow the layered structure:
```
lib/          # Utils: contentful.ts, seo.ts, utils.ts, permissions.ts
app/api/      # Controllers: users, comments, auth/register
app/          # Pages: blog/[slug], admin/users, layout.tsx
components/   # UI: Sidebar, TOC, AuthProvider, AdSense
types/        # Interfaces: BlogPost, UserWithRoles
prisma/       # DB: schema.prisma
```

- **Pages**: Use App Router (`generateMetadata`, `generateStaticParams`).
- **Data Fetching**: Contentful for blog (`getPostBySlug`), Prisma for users/comments.
- **Middleware**: Apply auth guards, rate limits (`middleware.ts`).
- **No Redux/Zustand**: Server Components + `useSession` for state.

**Example**:
```tsx
// Correct: app/blog/[slug]/page.tsx
import { getPostBySlug } from '@/lib/contentful';
export async function generateMetadata({ params }: { params: { slug: string } }) {
  const post = await getPostBySlug(params.slug);
  return generateMetadata({ title: post.title, description: post.excerpt });
}
```

### 2. Public API Usage
Prioritize exported symbols (50+ available). Always import from canonical paths.

#### Key Functions
| Function | File | Purpose | Example |
|----------|------|---------|---------|
| `getPostBySlug(slug)` | `lib/contentful.ts` | Fetch single post | `const post = await getPostBySlug('my-post');` |
| `generateMetadata(props)` | `lib/seo.ts` | SEO metadata | Used in all pages |
| `calculateReadingTime(text)` | `lib/utils.ts` | Est. read time | `{`${calculateReadingTime(post.body)} min read`}` |
| `checkRateLimit(ip)` | `lib/spam-prevention.ts` | Spam prevention | In API routes: `if (await checkRateLimit(ip)) throw new RateLimitError();` |
| `hasRole(session, role)` | `lib/permissions.ts` | RBAC check | `if (!hasRole(session, 'admin')) redirect('/login');` |

#### Key Types
- `BlogPost`: Full post shape from Contentful.
- `UserWithRoles`: Auth user + permissions.
- `SEOProps`: Metadata inputs.

**Cross-references**:
- See `lib/contentful.ts` for all CMS queries.
- `components/AuthProvider.tsx` wraps app for session access.

### 3. Coding Conventions
- **TypeScript**: Strict mode, Zod for validation (`lib/validations.ts`).
- **Styling**: Tailwind + shadcn/ui. No inline styles.
- **Errors**: Extend `AppError`, `RateLimitError` (`lib/errors.ts`).
- **Security**:
  - CSRF: `generateCSRFToken`, `validateCSRFToken` (`lib/csrf.ts`).
  - Rate Limits: Upstash + IP detection.
  - Auth: NextAuth Credentials + DB adapter.
- **SEO**: Always call `generateMetadata`, add schemas (`generateBreadcrumbSchema`).
- **Performance**: ISR for posts, `next/image` optimized.

**Patterns to Follow**:
```ts
// Utils example
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', { ... }).format(date);
}

// API Route example
import { NextRequest } from 'next/server';
export async function POST(req: NextRequest) {
  const ip = getClientIP(req);
  if (await checkRateLimit(ip)) throw new RateLimitError();
  // ...
}
```

### 4. Dependencies & Relationships
- **High Usage**: `lib/seo.ts` (pages), `lib/contentful.ts` (blog), `components/CommentsList.tsx`.
- **Admin Only**: `/admin/*` → `hasRole('admin')`.
- **Tests/Examples**: Check `app/api/comments/route.ts` for spam checks; `__tests__/` for units (expand as needed).

**Search Patterns**:
- Blog queries: `getPostsByCategory`, `searchPosts`.
- Analytics: `sendWebVital`, `trackAdClick` (`lib/analytics.ts`).

### 5. Contribution Guidelines (AI-Enforced)
- **Branches**: `feat/`, `fix/`, `chore/`.
- **Commits**: Conventional (e.g., `feat: add related posts`).
- **PRs**: Update CHANGELOG.md, lint/type-check.
- **Avoid**: Global state, client-only fetches in RSC.

## Symbol Index Summary
- **Classes**: `AppError`, `AuthenticationError` (custom errors).
- **Interfaces**: 40+ (e.g., `BlogPost`, `CommentsListProps`).
- **Functions**: 70+ exports (CMS, utils, API handlers).

Full index available in codebase scans.

## Updating .cursorrules
- Regenerate via analysis tools (e.g., Cursor's context builder).
- Edit source in `prompts/` or `.context/docs`.
- Track changes in CHANGELOG.md.

## Related Files
- [README.md](../README.md): Quick start.
- [architecture.md](../docs/architecture.md): Diagrams.
- [CONTENTFUL_SETUP.md](../CONTENTFUL_SETUP.md): CMS config.
- [lib/contentful.ts](../lib/contentful.ts): Core data layer.

This documentation ensures AI and human developers stay aligned. For questions, reference repo snapshot or run `npm run type-check`.
