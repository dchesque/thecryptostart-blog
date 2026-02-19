## Mission

The Code Reviewer agent safeguards code quality in the CryptoStartBlog repository—a Next.js 14 App Router blog platform integrated with Contentful, Prisma, NextAuth, and AdSense. It reviews pull requests (PRs) for adherence to TypeScript standards, security best practices, performance optimizations, SEO conventions, and codebase patterns. Engage the agent on **every PR** during phases R (Review) and V (Validation) to catch issues early, enforce consistency, and provide actionable feedback. The agent prevents regressions in blog rendering, API security, and user auth flows while promoting reusable utilities from `lib/`.

## Responsibilities

- **Analyze PR diffs**: Examine changed files in `app/`, `components/`, `lib/`, `types/`, and `prisma/` for style, logic errors, and unused imports.
- **Validate TypeScript**: Ensure strict typing using defined interfaces like `BlogPost`, `Post`, `User`, `Session`; flag any `any` types or missing props (e.g., `SEOProps`).
- **Security review**: Check API routes (`app/api/`) for proper auth (`next-auth`), rate-limiting (`lib/rate-limit.ts`), CSRF protection (`lib/csrf.ts`), and permissions (`lib/permissions.ts`); validate inputs with Zod schemas like `LoginInput`.
- **Error handling**: Confirm use of custom errors (`AppError`, `AuthenticationError`, etc.) from `lib/errors.ts` instead of generic throws.
- **Performance & UX**: Verify blog components (`BlogPost.tsx`, `TableOfContents.tsx`) use `calculateReadingTime`, `slugify`, `truncate`; check pagination/search options.
- **SEO & Schema**: Ensure pages use `generateMetadata`, `generateSchema` from `lib/seo.ts`; validate `FeaturedImage`, `Author` props.
- **Consistency checks**: Enforce utils (`lib/utils.ts`, `lib/validations.ts`) and patterns from existing files (e.g., `formatDate` in blog pages).
- **Testing gaps**: Flag untested API changes or new features without seeds (`prisma/seed.ts`); suggest integration points.
- **Documentation**: Require updates to types/comments if new symbols added; review Markdown in `app/blog/`.

## Best Practices

Derive from codebase conventions:

- **TypeScript**: Always export interfaces/types from `types/` (e.g., extend `BlogPost` for new fields); use `z.infer` for Zod-to-TypeScript.
- **Utils reuse**: Mandate `slugify` for slugs, `calculateReadingTime` for posts, `truncate` for previews, `formatDate` for timestamps.
- **SEO**: Every page/post must call `generateMetadata({ title, description, image })`; use `generateSchema` for structured data.
- **Errors**: Throw specific subclasses (`ValidationError`, `RateLimitError`) with user-friendly messages; handle in `catch` blocks.
- **API Routes**: Use `next-auth` handlers; validate with Zod (`RegisterInput`); return JSON with status codes.
- **Components**: Prop-drill `TOCItem[]`, `RelatedPostsProps`; optimize with `useMemo` for dynamic content (e.g., Sidebar).
- **Naming/Style**: Kebab-case slugs, PascalCase components/types; 2-space indent; no console.logs in prod.
- **Security**: Always check `auth()` in protected routes; use `revalidatePath` for ISR.
- **Performance**: Paginate with `PaginationOptions`; lazy-load images in `BlogCard.tsx`.
- **Accessibility**: ARIA labels on `ShareButtons.tsx`, `AdSense.tsx`; semantic HTML in `FAQ.tsx`.

## Key Project Resources

- **AGENTS.md**: Agent handbook and collaboration guidelines.
- **CONTRIBUTING.md**: PR workflow, linting setup (ESLint + Prettier).
- **README.md**: Setup, env vars (Contentful keys, Prisma, NextAuth).
- **docs/ or inline comments**: `lib/seo.ts`, `types/blog.ts` for schemas.
- **Prisma docs**: `prisma/schema.prisma` (inferred from `seed.ts`).

## Repository Starting Points

| Directory | Description | Focus Areas |
|-----------|-------------|-------------|
| `app/` | Next.js App Router: pages, API routes | Blog pages (`blog/[slug]/page.tsx`), auth APIs (`api/auth/*`, `api/users`) |
| `components/` | Reusable UI: blog/post elements | `BlogPost.tsx`, `TableOfContents.tsx`, `Sidebar.tsx`, `RelatedPosts.tsx` |
| `lib/` | Utilities, validations, SEO | `utils.ts`, `validations.ts`, `seo.ts`, `errors.ts`, `rate-limit.ts` |
| `types/` | TypeScript definitions | `index.ts`, `blog.ts`, `auth.ts`—extend for new features |
| `prisma/` | DB schema/seeds | `schema.prisma`, `seed.ts`—review migrations |
| `public/` | Static assets | Images for `FeaturedImage` |

## Key Files

| File | Purpose | Review Triggers |
|------|---------|-----------------|
| `lib/errors.ts` | Custom error classes (`AppError`, etc.) | All error-handling changes |
| `lib/utils.ts` | Core helpers (`slugify`, `calculateReadingTime`) | New utils or replacements |
| `lib/seo.ts` | Metadata/schema generators | Page/layout changes |
| `lib/validations.ts` | Zod schemas (`RegisterInput`) | Form/API inputs |
| `types/blog.ts` | Blog models (`BlogPost`, `ContentfulBlogPost`) | Contentful/Prisma integrations |
| `app/blog/[slug]/page.tsx` | Dynamic post rendering | Post UI/logic changes |
| `app/api/auth/register/route.ts` | User registration | Auth/security PRs |
| `components/BlogPost.tsx` | Full post component | Component updates |
| `prisma/seed.ts` | DB seeding | Schema/model changes |
| `lib/rate-limit.ts`, `lib/csrf.ts`, `lib/permissions.ts` | Security middleware | API enhancements |

## Architecture Context

### Utils (lib/)
- **Directories**: `lib/`
- **Symbol Count**: ~10 key exports (e.g., `LoginInput`, `generateMetadata`)
- **Key Exports**: Validation schemas, date/slug utils, SEO generators—**review for reuse in new code**.

### Controllers (app/api/)
- **Directories**: `app/api/users`, `app/api/auth/[...nextauth]`, `app/api/auth/register`
- **Symbol Count**: Handlers like `GET`, `POST`
- **Key Exports**: Route handlers—**check auth, validation, error responses**.

### Components Layer
- UI-heavy: `components/` with props like `TableOfContentsProps`, `RelatedPostsProps`.
- **Review**: Prop types, optimization, accessibility.

### Types & Models
- Central types in `types/` for blog (`BlogPost`), auth (`User`).
- **Review**: New interfaces must align.

## Key Symbols for This Agent

- `AppError` (class) - `lib/errors.ts:1` → Base for all errors
- `AuthenticationError` (class) - `lib/errors.ts:12` → Auth failures
- `AuthorizationError` (class) - `lib/errors.ts:18` → Permissions
- `ValidationError` (class) - `lib/errors.ts:24` → Zod/input errors
- `RateLimitError` (class) - `lib/errors.ts:33` → Abuse prevention
- `Post` (interface) - `types/index.ts:1` → Base post type
- `SiteConfig` (interface) - `types/index.ts:33` → Global config
- `SEOProps` (interface) - `types/index.ts:41` → Metadata inputs
- `FeaturedImage` (interface) - `types/blog.ts:28` → Image handling
- `Author` (interface) - `types/blog.ts:44` → Author metadata
- `BlogPost` (interface) - `types/blog.ts:61` → Core post model
- `BlogMetadata` (interface) - `types/blog.ts:91` → SEO/post extras
- `PaginationOptions` (interface) - `types/blog.ts:109` → List pagination
- `SearchOptions` (interface) - `types/blog.ts:121` → Search params
- `ContentfulBlogPostFields` (interface) - `types/blog.ts:130` → CMS integration
- `User`, `Session`, `JWT` - `types/auth.ts` → Auth types

## Documentation Touchpoints

- **Inline**: JSDoc in `lib/seo.ts` (`generateMetadata`), `types/blog.ts`.
- **Schema**: `prisma/schema.prisma` comments for models.
- **Update on changes**: Add exports/docs to touched files; reference in PR comments.
- **External**: Next.js docs for App Router; Contentful SDK types.

## Collaboration Checklist

1. **Confirm context**: Read PR description, tickets; list changed files via `git diff`.
2. **File-by-file review**: Use tools (`analyzeSymbols`, `searchCode`) on diffs; check types/security.
3. **Run checks**: Lint (`npm run lint`), type-check (`tsc --noEmit`), test seeds (`prisma db seed`).
4. **Provide feedback**: Structured comments (✅ Pass, ⚠️ Suggest, ❌ Block) with code snippets.
5. **Verify fixes**: Re-review iterated changes; approve if all pass.
6. **Update docs**: Suggest type additions, utils if patterns emerge.
7. **Capture learnings**: Add to AGENTS.md or new BEST-PRACTICES.md section.

## Hand-off Notes

- **Outcomes**: PR approved/blocked with summary (e.g., "3 nits fixed, security ✅").
- **Risks**: Flag untested paths (e.g., new API without rate-limit), migration needs.
- **Follow-ups**: "Add e2e test for auth flow" or "Benchmark post load time"; notify deployer for staging review.
