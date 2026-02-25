# Cursor Rules for The Crypto Start Blog

Cursor rules in the `.cursor/rules/` directory customize Cursor AI (powered by Anthropic's Claude) for this Next.js blog project. These rules provide rich context about the codebase, architecture, symbols, dependencies, and conventions to enable precise code generation, refactoring, debugging, and documentation.

## Setup and Usage

### Location
```
.cursor/rules/
└── README.md          # Primary context file (this documentation)
```

- **Auto-loaded**: Cursor automatically loads rules when the repository is opened.
- **Type**: `cursorrules` – Directs Cursor to use this for codebase comprehension.
- **Source**: Auto-generated/updated via tools like `analyzeSymbols`, `searchCode`, `listFiles`.

### How Cursor Uses Rules
1. **Context Injection**: Full README.md content is included in AI prompts for chats, autocompletions, and edits.
2. **Tool Calls**: AI can invoke tools (`readFile`, `listFiles`, `analyzeSymbols`, `getFileStructure`, `searchCode`) for real-time insights.
3. **Override Defaults**: Enforces project patterns (e.g., Prisma queries, SEO schemas, RBAC with `hasRole`).

**Pro Tip**: Use `@codebase` prefix or reference exports (e.g., "Optimize `analyzeSEO` in `lib/seo-analyzer.ts`") for optimal results.

## Key Contexts Provided

### Architecture
- **Utils**: `lib/`, `lib/validations/` (utils.ts, posts.ts, seo-analyzer.ts, ai-optimization.ts, permissions.ts, rate-limit.ts)
- **Controllers/API Routes**: `app/api/` (users/[id], comments, seo/metrics, gsc/analytics, auth/[...nextauth]/register, admin/{posts,comments,categories,authors}/[id])
- **Components/Pages**: `app/` (login, guest-post-guidelines, blog/[slug]/clusters, admin/{users,seo,posts,gsc-dashboard,comments,categories,authors,ai-optimization}), `components/` (admin/, CategoryCard, CommentsList, FAQSection)
- **Data Flow**: Prisma DB → `lib/posts.ts` queries → Next.js App Router
- **Middleware**: Auth (NextAuth), rate limiting (`lib/rate-limit.ts`), spam prevention (`lib/spam-prevention.ts`)

Full structure via `getFileStructure` tool.

### Public API (Key Exports)
120+ reusable exports across modules:

```ts
// Core Utils
import { cn, calculateReadingTime, calculateReadingTimeFromRichText, formatDate, slugify, truncate } from 'lib/utils';

// Posts & Content
import { getAllPosts, getPostBySlug, getPostsByCategory, getRelatedPosts, BlogPost, BlogCategory, BlogMetadata } from 'lib/posts';

// SEO & Analysis
import { generateMetadata, generateSchema, analyzeSEO, AIOptimizationScore, calculateAIOptimizationScore } from 'lib/seo*'; // seo.ts, seo-analyzer.ts, ai-optimization.ts

// Security & Auth
import { hasPermission, hasRole, checkRateLimit, detectSpam } from 'lib/{permissions,spam-prevention,rate-limit}';
import { AppError, AuthenticationError, AuthorizationError } from 'lib/errors';

// Pages/Components
import { AboutPage, BlogPage, AdminLayout } from 'app/{about,blog,admin}';
```

Full list includes `analyzeForExpansion`, `createGSCClient`, `FAQSection`, `ExitIntentPopup`, API handlers (`GET`/`DELETE` routes), and more.

### Symbol Index

#### Classes
| Name | File | Purpose |
|------|------|---------|
| `GSCClient` | `lib/gsc-client.ts` | Google Search Console API client |
| `AppError` | `lib/errors.ts` | Base app error |
| `AuthenticationError` | `lib/errors.ts` | Auth failures |
| `AuthorizationError` | `lib/errors.ts` | Permission denials |
| `ValidationError` | `lib/errors.ts` | Input validation issues |
| `RateLimitError` | `lib/errors.ts` | Rate limiting exceeded |

#### Interfaces/Types (80+)
| Category | Examples |
|----------|----------|
| Blog | `BlogCategory`, `FeaturedImage`, `Author`, `BlogPost`, `BlogMetadata`, `PaginationOptions`, `CategoryConfig` (`types/blog.ts`) |
| Auth | `User`, `Session`, `JWT`, `UserWithRoles` (`types/auth.ts`) |
| SEO/AI | `SEOProps`, `SEOAnalysis`, `AIOptimizationScore`, `FAQItem`, `ExpansionOpportunity` (`lib/seo-*.ts`, `types/index.ts`) |
| GSC | `GSCQuery`, `GSCPage`, `GSCAnalytics` (`lib/gsc-client.ts`) |
| UI/Components | `TOCItem`, `FAQSectionProps`, `SidebarProps`, `NewsletterFormProps`, `RecommendedContentProps` (`components/*`) |
| Validations | `AuthorInput`, `CategoryInput`, `PostInput` (`lib/validations/admin.ts`) |

#### Functions (100+)
| Module | Key Functions |
|--------|---------------|
| Utils | `cn`, `calculateReadingTime*`, `formatDate`, `slugify` (`lib/utils.ts`) |
| Posts | `getAllPosts`, `getPostBySlug`, `getRelatedPosts`, `searchPosts`, `transformPrismaPost` (`lib/posts.ts`) |
| SEO/Analysis | `analyzeSEO`, `extractLinks`, `countImages`, `analyzeKeywordGap`, `analyzeForExpansion` (`lib/seo-analyzer.ts`, `keyword-research.ts`, `content-expander.ts`) |
| AI/Optimization | `calculateAIOptimizationScore`, `extractQuickAnswer`, `countCitableSentences` (`lib/ai-optimization.ts`) |
| Security | `checkRateLimit`, `detectSpam`, `getClientIP` (`lib/spam-prevention.ts`, `rate-limit.ts`) |
| Permissions | `hasPermission`, `hasRole` (`lib/permissions.ts`) |
| GSC | `createGSCClient` (`lib/gsc-client.ts`) |
| Linking | `findLinkingOpportunities` (`lib/link-builder.ts`) |

### Key Dependencies & Relationships
- **Top Imports**: `lib/spam-prevention.ts` (checkRateLimit), `lib/seo.ts` (generateMetadata), `components/SocialComments.tsx`, `scripts/seo-monitor.ts`
- **Patterns**: shadcn/ui + Tailwind, Zod (`lib/validations/`), NextAuth, Prisma (`lib/prisma.ts`)
- **Cross-References**:
  - `lib/posts.ts` → Used in `app/blog/[slug]/page.tsx`, `app/blog/page.tsx`
  - `lib/errors.ts` → Thrown in API routes (`app/api/admin/posts/[id]/route.ts`)
  - `lib/ai-optimization.ts` → Integrated in admin AI pages
  - High coupling: `app/admin/*` ↔ `lib/validations/admin.ts`

Search patterns: `searchCode('getPostBySlug')` reveals 5+ usages.

### Conventions & Patterns
- **Naming**: Kebab-case slugs (`generateSlugFromTitle`), PascalCase components/pages, camelCase functions.
- **Errors**: Extend `AppError`; throw in API routes.
- **SEO**: Invoke `generateMetadata`/`generateSchema` in every page; use `analyzeSEO`.
- **Auth/RBAC**: `hasRole('admin')` or `hasPermission()` guards in admin routes/components.
- **Prisma/Data**: Use `transformPrismaPost`; paginate via `PaginationOptions`.
- **Rate Limiting/Spam**: Wrap user inputs with `checkRateLimit`/`detectSpam`.
- **AI/SEO Tools**: Integrate `AIOptimizationScore` in post editors.
- **Testing**: `__tests__/`, Playwright E2E; utils like `countWords` for assertions.
- **Admin**: CRUD via `app/api/admin/*`; Zod schemas in `lib/validations/admin.ts`.

## Updating & Maintaining Rules

1. **Regenerate**:
   ```bash
   # Use Cursor chat: "@codebase Regenerate .cursor/rules/README.md with latest analyzeSymbols"
   # Or script: node scripts/analyze-codebase.js > .cursor/rules/README.md
   ```

2. **File-Specific Rules**:
   Create `.cursor/rules/lib-posts.md`:
   ```
   # lib/posts.ts Rules
   - Always use getPostBySlug for dynamic routes
   - Transform with transformPrismaPost
   - Cache queries with revalidatePath
   ```

3. **Cursor Features**:
   - `Cmd+K`: Apply rules to edits.
   - `@codebase`: Full context chat.
   - `@docs`: "Document app/admin/posts/new/page.tsx"

## Relation to Project Docs
- **docs/**: Guides (architecture.md, SETUP_DATABASE.md if applicable).
- **Cursor Rules**: AI-focused, dynamic (150+ symbols, tracked deps).
- **prompts/**: Docgen templates (used here).

## Troubleshooting
| Issue | Solution |
|-------|----------|
| Context ignored | Reload repo in Cursor; verify `.cursor/rules/` |
| Stale data | `@codebase Use analyzeSymbols on lib/` |
| Import errors | Check "Public API"; search `searchCode('import .* from')` |
| Refactors fail | Specify paths/symbols: "Refactor getAllPosts using PrismaSingleton" |

## Repository Snapshot
```
.cursor/rules/
├── README.md
app/ (api/, admin/, blog/)
lib/ (posts.ts, seo-analyzer.ts, ai-optimization.ts, ...)
components/ (admin/, FAQSection.tsx, ...)
types/ (blog.ts, auth.ts)
prisma/
docs/ prompts/ public/ scripts/
middleware.ts tsconfig.json package.json
```

**Last Updated**: Codebase scan (Public API: 120+ exports, Symbols: 200+, Deps: 20+ tracked). See root [README.md](../README.md) or [docs index](../index.md). PR updates to `.cursor/rules/`.
