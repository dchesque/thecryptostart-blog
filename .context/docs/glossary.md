# Glossary

This glossary defines key terminology, domain entities, concepts, and acronyms for the CryptoStart Blog project—a Next.js 14 App Router application with Contentful CMS integration, Prisma ORM, NextAuth authentication, and features like SEO optimization, rate limiting, and admin dashboards.

## Domain Entities

Core data models shaping the application's business logic:

- **BlogPost**: Full representation of a blog article after transformation from Contentful. Includes `title`, `slug`, `content`, `excerpt`, `author` (`Author`), `featuredImage` (`FeaturedImage`), `categories` (`BlogCategory[]`), `tags`, `readingTime`, and `relatedPosts`.
  
  **Usage Example**:
  ```typescript
  // lib/contentful.ts
  export async function getPostBySlug(slug: string): Promise<BlogPost> {
    const entry = await getClient().getEntries<ContentfulBlogPost>({ /* ... */ });
    return transformPost(entry.items[0]);
  }
  ```
  Used in `app/blog/[slug]/page.tsx` for rendering posts with TOC, comments, and related content. See [types/blog.ts#L61](../types/blog.ts#L61).

- **Author**: Post author metadata with `name`, `avatar` (URL), `bio`, and `socialLinks`.
  
  **Usage**: Attached to `BlogPost`; rendered in `components/PostMeta.tsx`.
  See [types/blog.ts#L44](../types/blog.ts#L44).

- **BlogCategory**: Union type of predefined categories (e.g., `"Blockchain" | "DeFi" | "NFTs"`). Used for filtering and UI cards.
  
  **Usage**:
  ```typescript
  // components/CategoryCard.tsx
  <CategoryCard category={post.categories[0] as BlogCategory} />
  ```
  Fetched via `getPostsByCategory`. See [types/blog.ts#L15](../types/blog.ts#L15), [lib/constants.ts](../lib/constants.ts).

- **User**: Authenticated user with `id`, `email`, `name`, `roles` (`string[]`), managed via Prisma and NextAuth.
  
  Extended as `UserWithRoles`. See [types/auth.ts](../types/auth.ts), `app/api/users/route.ts`.

- **Comment**: Individual comment with `id`, `content`, `author` (`User`), `postSlug`, `createdAt`, `approved`.
  
  Managed via API routes (`app/api/comments/route.ts`). Rendered in `components/CommentsList.tsx`.

## Key Concepts

- **Contentful Integration**: Headless CMS for blog content. Raw responses (`ContentfulBlogPost`) transformed to `BlogPost` via `transformPost`. Key functions: `getPostBySlug`, `getAllPosts`, `getPostsByCategory`.
  
  **Example**:
  ```typescript
  // app/blog/page.tsx
  const posts = await getAllPosts({ limit: 10 });
  ```
  Configured in [lib/contentful.ts](../lib/contentful.ts).

- **Rate Limiting**: IP-based throttling using Upstash Redis. `checkRateLimit` throws `RateLimitError` on excess.
  
  **Example**:
  ```typescript
  // app/api/auth/register/route.ts
  if (!(await checkRateLimit(request.ipAddress))) {
    throw new RateLimitError('Too many requests');
  }
  ```
  See [lib/rate-limit.ts](../lib/rate-limit.ts), [lib/spam-prevention.ts](../lib/spam-prevention.ts).

- **Role-Based Access Control (RBAC)**: Permission checks via `hasRole`/`hasPermission` against `RolePermissions`.
  
  **Example**:
  ```typescript
  // lib/permissions.ts
  if (!hasRole(session.user.roles, 'admin')) {
    throw new AuthorizationError('Access denied');
  }
  ```
  Protects admin routes like `app/admin/comments/page.tsx`. See [types/roles.ts](../types/roles.ts).

- **SEO Optimization**: Generates metadata and Schema.org JSON-LD (`generateMetadata`, `generateSchema`, `generateBreadcrumbSchema`).
  
  **Example**:
  ```typescript
  // app/blog/[slug]/page.tsx
  export async function generateMetadata({ params }: { params: { slug: string } }) {
    const post = await getPostBySlug(params.slug);
    return generateMetadata({ title: post.title, description: post.excerpt });
  }
  ```
  See [lib/seo.ts](../lib/seo.ts).

- **Static Generation**: Pre-renders blog pages using `generateStaticParams` for slugs from `getAllPostSlugs`.
  
  See `app/blog/[slug]/page.tsx`.

- **CSRF Protection**: Tokens via `generateCSRFToken`/`validateCSRFToken` for forms.
  See [lib/csrf.ts](../lib/csrf.ts).

- **Spam Prevention**: `detectSpam` + `validateEmail` + logging.
  See [lib/spam-prevention.ts](../lib/spam-prevention.ts).

## Custom Errors

- **AppError**: Base error for app-wide issues.
- **AuthenticationError**: Missing/invalid session.
- **AuthorizationError**: Insufficient permissions.
- **ValidationError**: Zod schema failures.
- **RateLimitError**: Exceeded API limits.

Defined in [lib/errors.ts](../lib/errors.ts). Caught in API handlers (e.g., `handleError` in `app/api/users/[id]/route.ts`).

## Utilities

- **calculateReadingTime(text: string)**: Estimates minutes from word count (~250/min).
  
  ```typescript
  const readingTime = calculateReadingTime(post.content);
  ```
  See [lib/utils.ts](../lib/utils.ts).

- **formatDate(date: string | Date)**: Formats to "MMM DD, YYYY".
  See [lib/utils.ts](../lib/utils.ts).

## Type Definitions

| Type/Interface | Description | Source |
|---------------|-------------|--------|
| [`Post`](../types/index.ts) | Base post for lists/pages. | [types/index.ts](../types/index.ts#L1) |
| [`SiteConfig`](../types/index.ts#L33) | Site-wide config (title, URLs). | [types/index.ts](../types/index.ts#L33) |
| [`SEOProps`](../types/index.ts#L41) | Metadata inputs. | [types/index.ts](../types/index.ts#L41) |
| [`BlogPost`](../types/blog.ts#L61) | Transformed post. | [types/blog.ts](../types/blog.ts#L61) |
| [`ContentfulBlogPost`](../types/blog.ts#L171) | Raw CMS entry. | [types/blog.ts](../types/blog.ts#L171) |
| [`RolePermissions`](../types/roles.ts) | Role → permissions map. | [types/roles.ts](../types/roles.ts#L31) |
| [`LoginInput`](../lib/validations.ts) | Zod login schema. | [lib/validations.ts](../lib/validations.ts#L20) |

Full list in Symbol Index.

## Acronyms & Abbreviations

| Acronym | Expansion | Context |
|---------|-----------|---------|
| CMS | Content Management System | Contentful |
| RBAC | Role-Based Access Control | Permissions via roles |
| SEO | Search Engine Optimization | [lib/seo.ts](../lib/seo.ts) |
| JWT | JSON Web Token | NextAuth sessions |
| API | Application Programming Interface | `app/api/` routes |
| ORM | Object-Relational Mapping | Prisma |
| TOC | Table of Contents | `components/TableOfContents.tsx` |

## User Personas

- **Blog Reader**: Browses categories (`CategoryCard`), reads posts (with reading time, related posts), shares (`ShareButtons`).
- **Registered User**: Logs in/registers (`app/login/page.tsx`), comments (`CommentForm`).
- **Site Admin**: Manages users/comments via dashboard (`app/admin/page.tsx`), requires "admin" role.

## Domain Rules & Invariants

- Admin access: Valid session + "admin" role.
- API writes: Rate limited, CSRF validated, spam checked.
- Posts: Unique slugs, paginated fetches (≤20 default).
- Errors: JSON responses with `message` for clients.

## Related Files

- [project-overview.md](./project-overview.md): Architecture overview.
- [types/blog.ts](../types/blog.ts): Blog types.
- [lib/contentful.ts](../lib/contentful.ts): Data fetching.
- [lib/permissions.ts](../lib/permissions.ts): RBAC utils.
