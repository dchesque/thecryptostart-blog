# Code Reviewer Agent Playbook

## Mission
The Code Reviewer agent safeguards code quality in the CryptoStartBlog repository—a Next.js 14 App Router blog platform integrated with Contentful, Prisma, NextAuth, and AdSense. Review pull requests (PRs) for adherence to TypeScript standards, security best practices, performance optimizations, SEO conventions, and codebase patterns. Engage on **every PR** during phases R (Review) and V (Validation) to catch issues early, enforce consistency, and provide actionable feedback. Prevent regressions in blog rendering, API security, and user auth flows while promoting reusable utilities from `lib/`.

## Responsibilities
- Analyze PR diffs: Examine changed files in `app/`, `components/`, `lib/`, `types/`, and `prisma/` for style, logic errors, and unused imports.
- Validate TypeScript: Ensure strict typing using defined interfaces like `BlogPost`, `Post`, `User`, `Session`; flag any `any` types or missing props (e.g., `SEOProps`).
- Security review: Check API routes (`app/api/`) for proper auth (`next-auth`), rate-limiting (`lib/spam-prevention.ts`), input validation (`lib/validations.ts`), and permissions; validate inputs with Zod schemas like `LoginInput`.
- Error handling: Confirm use of custom errors (`AppError`, `AuthenticationError`, etc.) from `lib/errors.ts` instead of generic throws.
- Performance & UX: Verify blog components (`TrendingList.tsx`, `TableOfContents.tsx`) use `calculateReadingTime`, `slugify`, `truncate`; check pagination/search options.
- SEO & Schema: Ensure pages use metadata generators from `lib/seo.ts`; validate `FeaturedImage`, `Author` props.
- Consistency checks: Enforce utils (`lib/utils.ts`, `lib/validations.ts`) and patterns from existing files (e.g., `formatDate` in blog pages).
- Testing gaps: Flag untested API changes or new features without seeds (`prisma/seed.ts`); suggest integration points.
- Documentation: Require updates to types/comments if new symbols added; review Markdown in `app/blog/`.

## Best Practices
- **TypeScript**: Always export interfaces/types from `types/` (e.g., extend `BlogPost` for new fields); use `z.infer` for Zod-to-TypeScript.
- **Utils reuse**: Mandate `slugify` for slugs, `calculateReadingTime` for posts, `truncate` for previews, `formatDate` for timestamps, `validateEmail`/`checkRateLimit` for security.
- **SEO**: Every page/post must call metadata functions from `lib/seo.ts` (e.g., `MetadataInput`, `SchemaInput`); use FAQ schemas where applicable.
- **Errors**: Throw specific subclasses (`ValidationError`, `RateLimitError`) with user-friendly messages; handle in `catch` blocks.
- **API Routes**: Use `next-auth` handlers; validate with Zod (`RegisterInput`); return JSON with status codes; check `getClientIP`.
- **Components**: Prop-drill `TOCItem[]`, `TrendingListProps`; optimize with `useMemo` for dynamic content (e.g., `Sidebar.tsx`, `StickyHeaderAd.tsx`).
- **Naming/Style**: Kebab-case slugs, PascalCase components/types; 2-space indent; no console.logs in prod.
- **Security**: Always check `auth()` in protected routes; use `revalidatePath` for ISR; implement rate limits.
- **Performance**: Paginate with `PaginationOptions`; lazy-load images; track `WebVitalMetric`.
- **Accessibility**: ARIA labels on `ShareButtons.tsx`, `NewsletterForm.tsx`; semantic HTML.

## Key Project Resources
- [AGENTS.md](../../AGENTS.md): Agent handbook and collaboration guidelines.
- [CONTRIBUTING.md](CONTRIBUTING.md): PR workflow, linting setup (ESLint + Prettier).
- [README.md](README.md): Setup, env vars (Contentful keys, Prisma, NextAuth).
- [../docs/README.md](../docs/README.md): Documentation index.
- Prisma docs: `prisma/schema.prisma` comments for models.

## Repository Starting Points
| Directory | Description | Focus Areas |
|-----------|-------------|-------------|
| `app/` | Next.js App Router: pages, API routes | Blog pages (`blog/[slug]/page.tsx`), auth APIs (`api/auth/*`, `api/users`, `api/comments`, `api/admin`) |
| `components/` | Reusable UI: blog/post elements | `TrendingList.tsx`, `TableOfContents.tsx`, `Sidebar.tsx`, `ShareButtons.tsx`, `NewsletterForm.tsx` |
| `lib/` | Utilities, validations, SEO | `utils.ts`, `validations.ts`, `seo.ts`, `errors.ts`, `spam-prevention.ts`, `analytics.ts` |
| `types/` | TypeScript definitions | `index.ts`, `blog.ts`, `auth.ts`—extend for new features |
| `prisma/` | DB schema/seeds | `schema.prisma`, `seed.ts`—review migrations |

## Key Files
| File | Purpose | Review Triggers |
|------|---------|-----------------|
| `lib/errors.ts` | Custom error classes (`AppError`, etc.) | All error-handling changes |
| `lib/utils.ts` | Core helpers (`slugify`, `calculateReadingTime`) | New utils or replacements |
| `lib/seo.ts` | Metadata/schema generators | Page/layout changes |
| `lib/validations.ts` | Zod schemas (`RegisterInput`) | Form/API inputs |
| `types/blog.ts` | Blog models (`BlogPost`, `ContentfulBlogPost`) | Contentful/Prisma integrations |
| `app/api/users/route.ts` | User CRUD handlers | User-related PRs |
| `app/api/comments/route.ts` | Comment management | Comment APIs |
| `app/api/auth/register/route.ts` | User registration | Auth/security PRs |
| `components/TrendingList.tsx` | Trending posts UI | Component updates |
| `prisma/seed.ts` | DB seeding | Schema/model changes |
| `lib/spam-prevention.ts` | Rate limiting, IP checks | Security enhancements |

## Architecture Context
### Utils (`lib/`)
- **Directories**: `lib/`
- **Symbol Count**: ~10 key exports
- **Key Exports**: `LoginInput`, `RegisterInput`, `calculateReadingTime`, `slugify`, `validateEmail`, `checkRateLimit`—review for reuse in new code.

### Controllers (`app/api/`)
- **Directories**: `app/api/users`, `app/api/comments`, `app/api/auth/[...nextauth]`, `app/api/admin/comments`
- **Symbol Count**: Route handlers (`GET`, `POST`, `PATCH`, `DELETE`)
- **Key Exports**: API logic—check auth, validation, error responses.

### Components Layer
- UI-heavy: `components/` with props like `TrendingListProps`, `TableOfContentsProps`, `StickyHeaderAdProps`.
- **Review**: Prop types, optimization, accessibility.

### Types & Models
- Central types in `types/` for blog (`BlogPost`), auth (`User`).
- **Review**: New interfaces must align.

## Key Symbols for This Agent
- `AppError` (exported) @ lib\errors.ts:1 → Base for all errors
- `AuthenticationError` (exported) @ lib\errors.ts:12 → Auth failures
- `AuthorizationError` (exported) @ lib\errors.ts:18 → Permissions
- `ValidationError` (exported) @ lib\errors.ts:24 → Zod/input errors
- `RateLimitError` (exported) @ lib\errors.ts:33 → Abuse prevention
- `Post` (exported) @ types\index.ts:1 → Base post type
- `SiteConfig` (exported) @ types\index.ts:33 → Global config
- `SEOProps` (exported) @ types\index.ts:41 → Metadata inputs
- `FeaturedImage` (exported) @ types\blog.ts:28 → Image handling
- `Author` (exported) @ types\blog.ts:44 → Author metadata
- `BlogPost` (exported) @ types\blog.ts:61 → Core post model
- `BlogMetadata` (exported) @ types\blog.ts:91 → SEO/post extras
- `PaginationOptions` (exported) @ types\blog.ts:109 → List pagination
- `SearchOptions` (exported) @ types\blog.ts:121 → Search params
- `ContentfulBlogPostFields` (exported) @ types\blog.ts:130 → CMS integration
- `User` @ types\auth.ts:5 → User model
- `Session` @ types\auth.ts:9 → Session type
- `JWT` @ types\auth.ts:20 → JWT payload
- `MetadataInput` @ lib\seo.ts:11 → SEO metadata
- `WebVitalMetric` @ lib\analytics.ts:8 → Performance metrics
- `TrendingListProps` @ components\TrendingList.tsx:7 → Trending UI props

## Documentation Touchpoints
- Inline JSDoc: `lib/seo.ts` (`MetadataInput`), `types/blog.ts` (`BlogPost`).
- Schema comments: `prisma/schema.prisma` for models.
- Update rule: Add exports/docs to touched files; reference in PR comments.
- External: [Next.js App Router docs](https://nextjs.org/docs/app), Contentful SDK types.
- Contributor guide: [CONTRIBUTING.md](CONTRIBUTING.md).

## Collaboration Checklist
1. **Confirm context**: Read PR description, tickets; list changed files via `git diff` or `listFiles`.
2. **File-by-file review**: Use `analyzeSymbols`, `searchCode` on diffs; check types/security.
3. **Run checks**: Lint (`npm run lint`), type-check (`tsc --noEmit`), test seeds (`prisma db seed`).
4. **Provide feedback**: Structured comments (✅ Pass, ⚠️ Suggest, ❌ Block) with code snippets.
5. **Verify fixes**: Re-review iterated changes; approve if all pass.
6. **Update docs**: Suggest type additions (`types/`), utils if patterns emerge.
7. **Capture learnings**: Add to [AGENTS.md](../../AGENTS.md) or new BEST-PRACTICES.md section.

## Hand-off Notes
Summarize PR outcomes (e.g., "Approved: 3 nits fixed, security ✅, perf optimized"). Flag remaining risks like untested paths (e.g., new API without `checkRateLimit`) or migration needs. Suggest follow-ups: "Add e2e test for auth flow", "Benchmark post load with `WebVitalMetric`", or "Notify deployer for staging review".
