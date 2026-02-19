# Cursor Rules for The Crypto Start Blog

Cursor rules in the `.cursor/rules/` directory customize the behavior of Cursor AI (powered by Anthropic's Claude) for this Next.js blog project. These rules provide rich context about the codebase, architecture, symbols, dependencies, and conventions, enabling accurate code generation, refactoring, debugging, and documentation.

## Setup and Usage

### Location
```
.cursor/rules/
└── README.md          # Primary context file (this documentation)
```

- **Auto-loaded**: Cursor automatically applies rules when the repo is open.
- **Type**: `cursorrules` – Instructs Cursor to use this for codebase understanding.
- **Source**: Generated/updated via analysis tools (e.g., `analyzeSymbols`, `searchCode`).

### How Cursor Uses Rules
1. **Context Injection**: The full README.md content is fed into AI prompts for chats, completions, and edits.
2. **Tool Integration**: AI can "call" virtual tools like `readFile`, `listFiles`, `analyzeSymbols` to fetch real-time codebase info.
3. **Precedence**: Rules override default behaviors for project-specific patterns (e.g., Contentful queries, SEO schemas, RBAC).

**Pro Tip**: Prefix queries with `@codebase` or reference symbols (e.g., "Refactor `getPostBySlug` using `transformPost`") for best results.

## Key Contexts Provided

### Architecture
- **Utils**: `lib/` (contentful.ts, seo.ts, utils.ts, permissions.ts)
- **Controllers/API**: `app/api/` (users, comments, auth, admin)
- **Components/Pages**: `components/`, `app/` (blog/[slug], admin/users, etc.)
- **Data Flow**: Contentful (CMS) → Prisma (DB) → Next.js App Router
- **Middleware**: Auth, rate limiting, CSRF (`middleware.ts`)

See full structure in [Repository Snapshot](#repository-snapshot).

### Public API (Key Exports)
Over 90 exports for reuse:
```ts
// Examples
import { getPostBySlug, BlogPost, generateMetadata } from 'lib/contentful';
import { calculateReadingTime, formatDate } from 'lib/utils';
import { hasRole, hasPermission } from 'lib/permissions';
import AppError, AuthenticationError from 'lib/errors';
```

Full list: `AboutPage`, `AdminDashboard`, `BlogPage`, `getAllPosts`, `generateSchema`, `checkRateLimit`, etc.

### Symbol Index

#### Classes (5+)
- `AppError`, `AuthenticationError`, `AuthorizationError`, `ValidationError`, `RateLimitError` (@ lib/errors.ts)

#### Interfaces/Types (50+)
| Category | Examples |
|----------|----------|
| Blog | `BlogPost`, `BlogCategory`, `BlogMetadata`, `ContentfulBlogPost` (@ types/blog.ts) |
| Auth | `User`, `Session`, `UserWithRoles` (@ types/auth.ts) |
| SEO | `SEOProps`, `MetadataInput` (@ types/index.ts, lib/seo.ts) |
| UI | `CommentsListProps`, `TableOfContentsProps`, `NewsletterFormProps` (@ components/*) |

#### Functions (80+)
| Module | Key Functions |
|--------|---------------|
| Contentful | `getAllPosts`, `getPostBySlug`, `getPostsByCategory`, `getAllCategories` |
| Utils/SEO | `calculateReadingTime`, `formatDate`, `slugify`, `generateMetadata`, `generateFAQSchema` |
| Security | `checkRateLimit`, `detectSpam`, `generateCSRFToken`, `hasRole` |
| Analytics | `sendWebVital`, `trackAdClick` |
| API Routes | `GET`/`POST` handlers for users/comments |

### Key Dependencies & Relationships
- **High Usage**: `components/SocialComments.tsx` (2 imports), `lib/seo.ts`, `lib/spam-prevention.ts`
- **Patterns**: shadcn/ui components, Tailwind, Zod validation, NextAuth sessions.
- **Cross-Refs**:
  - `lib/contentful.ts` ← Used by `app/blog/[slug]/page.tsx`
  - `lib/errors.ts` ← Thrown in API routes (e.g., `app/api/users/[id]/route.ts`)

### Conventions & Patterns
- **Naming**: Kebab-case slugs, PascalCase components, camelCase functions.
- **Errors**: Extend `AppError` for consistency.
- **SEO**: Always call `generateMetadata` in pages.
- **Auth**: Use `hasRole('admin')` for guards.
- **Contentful**: Transform via `transformPost`; paginate with `PaginationOptions`.
- **Testing**: Expand `__tests__/`, use Playwright for E2E.

## Updating & Maintaining Rules

1. **Regenerate Context**:
   ```bash
   # Run analysis (hypothetical script)
   node scripts/analyze-codebase.js > .cursor/rules/README.md
   ```

2. **Add Rules**:
   - Create `.cursor/rules/[filename].md` for file-specific rules (e.g., `blog-page.md`).
   - Example:
     ```
     # app/blog/[slug]/page.tsx Rules
     - Always fetch related posts with getRelatedPosts
     - Include TOC and ShareButtons
     ```

3. **Cursor Commands**:
   - `Cmd+K`: Edit with rules context.
   - `@docs`: Generate/update docs (e.g., "Generate documentation for lib/contentful.ts").

## Relation to Project Docs
- **docs/**: Human-readable guides (CONTENTFUL_SETUP.md, architecture.md).
- **Rules**: AI-optimized subset + dynamic analysis.
- **prompts/**: Custom prompts for doc generation (used by this task).

## Troubleshooting
| Issue | Fix |
|-------|-----|
| AI ignores context | Refresh Cursor, check `.cursor/rules/` load |
| Outdated symbols | Re-analyze: Use `analyzeSymbols` tool in chat |
| Missing imports | Reference "Public API" section |
| Complex refactors | Provide file paths/symbols explicitly |

## Repository Snapshot
```
.cursor/rules/
├── README.md  # This file
app/ lib/ components/ types/ prisma/ docs/ prompts/ public/
middleware.ts next.config.mjs tailwind.config.ts package.json
```

**Last Updated**: From codebase analysis (Public API: 92 exports, Symbols: 150+, Dependencies: tracked).

For full project docs, see [docs index](../README.md) or root [README.md](../README.md). Contribute rules via PRs to `.cursor/rules/`.
