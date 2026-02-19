# Rules for Claude AI - Project Guidelines

Rules and conventions for Claude (Anthropic's AI) when generating code, documentation, or modifications for **The Crypto Start Blog**. These are derived from codebase analysis, ensuring consistency with architecture, symbols, exports, dependencies, and patterns. Follow strictly to maintain quality, security, and compatibility.

## Core Principles

- **TypeScript Everywhere**: All code must be fully typed. Use existing types from `types/` (e.g., `BlogPost`, `User`, `RolePermissions`).
- **Next.js App Router**: Pages in `app/`, API handlers as exported `GET`/`POST`/etc. functions.
- **Naming & Exports**: Match existing public API (50+ exports). Re-export only what's listed (e.g., `getPostBySlug` from `lib/contentful.ts`).
- **Styling**: Tailwind CSS + shadcn/ui. No custom CSS unless extending globals.
- **Validation**: Zod schemas (`lib/validations.ts`: `RegisterInput`, `LoginInput`).
- **Security First**: Always integrate rate limiting (`lib/rate-limit.ts` or `lib/spam-prevention.ts`), CSRF (`lib/csrf.ts`), permissions (`lib/permissions.ts`).
- **Performance**: SSG/ISR for blog (`generateStaticParams`), reading time (`calculateReadingTime`).
- **SEO**: Mandatory metadata/schemas via `lib/seo.ts`.
- **Error Handling**: Throw subclasses of `AppError` (`lib/errors.ts`).

```ts
// Example error usage
import { RateLimitError } from '@/lib/errors';

if (await checkRateLimit(ip)) {
  throw new RateLimitError('Too many requests');
}
```

## Architecture Compliance

Follow the layered structure:

| Layer | Rules | Key Files |
|-------|--------|-----------|
| **Frontend** | Functional components, Server Components default. Use `AuthProvider` wrapper. | `app/layout.tsx`, `components/` (e.g., `CommentsList`, `TOCItem`) |
| **Backend/API** | Edge runtime compatible. Handle CORS/JSON. | `app/api/*` (e.g., `POST` for `/api/comments`) |
| **Data** | Contentful for blog (`lib/contentful.ts`), Prisma for users (`lib/prisma.ts`). | `getAllPosts`, Prisma singleton |
| **Auth** | NextAuth.js + RBAC. Check `hasRole('admin')`. | `app/api/auth/*`, `types/auth.ts` (`UserWithRoles`) |
| **Middleware** | Guards for auth/rate limits. | `middleware.ts` |

**Dependencies**: Prefer existing imports (e.g., `lib/seo.ts` used in `app/blog/[slug]/page.tsx`). Avoid new deps.

**Cross-References**:
- Blog flow: `app/blog/page.tsx` → `lib/contentful.ts` → `types/blog.ts` (`BlogPost`, `BlogCategory`).
- Admin: `app/admin/comments` → `lib/permissions.ts`.

## Contentful & Blog Rules

- **Queries**: Use exported functions only. Paginate with `PaginationOptions`.
- **Types**: Map to `ContentfulBlogPostFields` → `BlogPost`.
- **Patterns**:
  ```ts
  // lib/contentful.ts pattern
  import { getPostBySlug, getRelatedPosts } from '@/lib/contentful';
  import { generateMetadata } from '@/lib/seo';

  export async function generateMetadata({ params }: { params: { slug: string } }) {
    const post = await getPostBySlug(params.slug);
    return generateMetadata({ title: post.title, description: post.excerpt });
  }
  ```

- Categories: `getCategoryBySlug` (`lib/constants.ts`).
- Related: `getRelatedPosts`.

## Authentication & Permissions

- **Checks**:
  ```ts
  import { hasRole, hasPermission } from '@/lib/permissions';
  import { getServerSession } from 'next-auth';

  const session = await getServerSession();
  if (!hasRole(session?.user, 'admin')) {
    throw new AuthorizationError('Admin required');
  }
  ```
- Users: CRUD via `app/api/users/*`. Types: `User` (`types/auth.ts`).

## Security & Spam Prevention

- **Always Include**:
  1. IP: `getClientIP` or `getIP`.
  2. Rate Limit: `checkRateLimit(ip)`.
  3. Spam: `detectSpam(content)`, `validateEmail(email)`.
  4. CSRF: `generateCSRFToken` / `validateCSRFToken`.

```ts
// app/api/comments/route.ts pattern
import { checkRateLimit, detectSpam, getClientIP } from '@/lib/spam-prevention';

export async function POST(req: Request) {
  const ip = getClientIP(req);
  await checkRateLimit(ip);
  const { content } = await req.json();
  if (detectSpam(content)) {
    await logSpam(ip, content);
    throw new AppError('Spam detected');
  }
  // Proceed
}
```

## Components & UI Rules

- **Props**: Match interfaces (e.g., `CommentsListProps`, `FAQAccordionProps`).
- **Common**:
  | Component | Usage | Props File |
  |-----------|--------|------------|
  | `CommentsList` | Post comments | `components/CommentsList.tsx` |
  | `CategoryLinks` | Sidebar cats | `components/CategoryLinks.tsx` |
  | `NewsletterForm` | Subscriptions | `components/NewsletterForm.tsx` |
  | `TableOfContents` | Post TOC | `components/TableOfContents.tsx` |
- Ads: `AdSlot` prop (`components/AdSense.tsx`).

Example:
```tsx
<CommentsList comments={comments} postSlug={slug} />
```

## Utilities & Helpers

| Function | Usage | File |
|----------|--------|------|
| `calculateReadingTime(text)` | Post reading time | `lib/utils.ts` |
| `formatDate(date)` | Human dates | `lib/utils.ts` |
| `slugify(text)` | URLs | `lib/utils.ts` |
| `generateFAQSchema(items)` | SEO FAQ | `lib/seo.ts` |

## Admin Dashboard Rules

- Protected: `/admin/*` requires `admin` role.
- Endpoints: `GET /api/admin/comments`, `DELETE /api/admin/comments/[id]`.
- UI: `AdminDashboard` (`app/admin/page.tsx`).

## Testing & Validation

- Unit: Jest for utils (`__tests__/`).
- E2E: Playwright planned.
- Validate: `zod` + Prisma.

## Documentation Rules

- **Format**: Markdown, no YAML frontmatter.
- **Style**: Headings, tables, code blocks. Cross-ref files (e.g., [`lib/seo.ts`](../lib/seo.ts)).
- **Examples**: Always include runnable snippets.
- **Analysis**: Use symbols (classes/interfaces/functions) for refs.

## Generation Workflow

When prompted:
1. Analyze with tools (`readFile`, `analyzeSymbols`).
2. Match existing patterns (e.g., 42+ exports).
3. Output **only** final Markdown/code.

## Violations

Deviate only if explicitly instructed, but prioritize these rules.

**Last Updated**: From codebase snapshot (app/, lib/, types/, components/). See [Architecture Overview](../README.md#architecture-overview).
