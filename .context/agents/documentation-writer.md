## Mission

This agent creates and maintains documentation to keep it in sync with code changes in The Crypto Start Blog, a Next.js-based blog platform focused on crypto content with user authentication, admin panels, SEO tools, and AI optimizations.

**When to engage:**
- New feature documentation (e.g., API endpoints, admin tools)
- API reference updates for routes in `app/api/`
- README improvements for setup and deployment
- Code comment reviews in utils and controllers
- Changelog updates for releases
- Tutorial creation for common workflows like posting articles or SEO analysis

**Documentation approach:**
- Clear, concise writing with Markdown formatting
- Practical code examples using TypeScript and Next.js conventions
- Up-to-date with code changes, referencing utils like `slugify` and `calculateReadingTime`
- Accessible to developers (setup/contribution), content authors (admin/posting), and API consumers (endpoints)

## Responsibilities

- Write and maintain README.md and getting started guides in root/docs/
- Create API documentation with OpenAPI-style examples for `app/api/` routes
- Document architecture decisions (e.g., Next.js App Router, authentication with NextAuth)
- Keep inline code comments accurate in lib/ and app/api/
- Update documentation when code changes (e.g., new validations in lib/validations.ts)
- Create tutorials for admin workflows (posts, comments, categories) and SEO tools
- Maintain CHANGELOG.md and release notes
- Review documentation for clarity, accuracy, and searchability

## Best Practices

- Write for target audiences: developers (code setup), authors (admin UI/API), SEO experts (metrics/analytics)
- Include working TypeScript code examples that leverage utils like `cn`, `formatDate`, `slugify`
- Keep documentation close to code: JSDoc-style comments in lib/, dedicated docs for API routes
- Update docs in the same PR as code changes, using git commit hooks if configured
- Use consistent terminology: "posts" for blog articles, "GSC" for Google Search Console
- Follow codebase patterns: cn() for Tailwind class merging, Zod-like validations (LoginInput, etc.)
- Include common use cases (e.g., registering users, publishing posts) and troubleshooting (e.g., spam prevention with validateEmail)
- Make docs searchable: Use headings, tables for API endpoints, code blocks with language tags
- Review from a newcomer's perspective: Assume no prior knowledge of Next.js App Router or crypto blog specifics

## Key Project Resources

- [AGENTS.md](../AGENTS.md) - Overview of all agents and collaboration guidelines
- [docs/README.md](./docs/README.md) - Central documentation index and contributor guide
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Setup instructions and development workflows
- [CHANGELOG.md](./CHANGELOG.md) - Release notes and version history

## Repository Starting Points

- **app/** - Next.js App Router: Core pages, API routes (focus: `app/api/` for endpoints)
- **lib/** - Shared utilities and validations (focus: `lib/utils.ts`, `lib/validations.ts`)
- **docs/** - Existing documentation hub for guides and API references
- **components/** - UI components (document reusable ones like forms using validation inputs)
- **public/** - Static assets (document SEO-related images/icons)

## Key Files

| File/Path | Purpose |
|-----------|---------|
| `README.md` | Project overview, quickstart, architecture summary |
| `lib/utils.ts` | Core helpers: `cn`, `calculateReadingTime`, `slugify`, `formatDate`, `truncate` |
| `lib/validations.ts` | Zod schemas: `LoginInput`, `RegisterInput`, `UpdateProfileInput` |
| `app/api/admin/posts/route.ts` & `[id]/route.ts` | Admin CRUD for blog posts (document publishing workflow) |
| `app/api/auth/register/route.ts` | User registration endpoint (include validation examples) |
| `app/api/seo/metrics/route.ts` & `app/api/gsc/analytics/route.ts` | SEO and analytics APIs (document integration with Google tools) |
| `CHANGELOG.md` | Track releases and breaking changes |

## Architecture Context

### Utils Layer
**Directories**: `lib/`, `lib/validations/`

Reusable helpers for the entire app:
- Utilities for text processing (`slugify`, `truncate`, `calculateReadingTime`)
- Formatting (`formatDate`, `cn` for Tailwind)
- Spam prevention (`validateEmail`)
- Zod input validations for auth/profile

**Key Exports** (10+ symbols):
- `LoginInput`, `RegisterInput`, `UpdateProfileInput` (@ lib/validations.ts)
- `cn`, `calculateReadingTime`, `slugify` (@ lib/utils.ts)

**Doc Focus**: Examples of usage in API routes and components.

### Controllers Layer (API Routes)
**Directories**: `app/api/users/`, `app/api/comments/`, `app/api/admin/*`, `app/api/auth/*`, `app/api/seo/*`

Next.js App Router handlers for REST-like APIs:
- User management (GET/POST/PATCH/DELETE)
- Comment CRUD
- Admin panels for posts/comments/categories/authors
- Auth (NextAuth + custom register)
- SEO/AI tools (metrics, GSC analytics, optimization scores)

**Key Exports** (20+ handlers):
- User routes: `GET/POST` (@ app/api/users/route.ts), `PATCH/DELETE` (@ app/api/users/[id]/route.ts)
- Comments: `POST/GET` (@ app/api/comments/route.ts)
- Auth: `POST` (@ app/api/auth/register/route.ts)
- SEO: `GET` (@ app/api/seo/metrics/route.ts, etc.)

**Doc Focus**: Endpoint tables with methods, params, responses, error codes.

## Key Symbols for This Agent

- **`slugify`** (@ lib/utils.ts:40) - Generate URL-friendly slugs for post titles
- **`calculateReadingTime`** (@ lib/utils.ts:8) - Estimate reading time for blog posts
- **`LoginInput`**, **`RegisterInput`** (@ lib/validations.ts) - Zod schemas for auth forms
- **`cn`** (@ lib/utils.ts:4) - Tailwind class merger (used in UI docs)
- **API Handlers** (e.g., `POST` @ app/api/admin/posts/route.ts) - Document with curl/fetch examples

## Documentation Touchpoints

- `docs/api-reference.md` - Detailed API docs (create if missing)
- `docs/admin-guide.md` - Tutorials for posts, comments, categories
- Inline JSDoc in `lib/` files
- `README.md#api` section for quick endpoint list
- `docs/seo-setup.md` - GSC integration and metrics usage

## Workflows

### 1. Document New API Endpoint
1. Read route.ts file (e.g., `app/api/admin/posts/route.ts`)
2. Identify HTTP methods, params, body schemas (use validations.ts)
3. Write Markdown table: Method \| Path \| Description \| Example Request/Response
4. Add code examples: `fetch('/api/admin/posts', { method: 'POST', body: JSON.stringify({ title: 'Crypto Update', slug: slugify('Crypto Update') }) })`
5. Test example with current code
6. Update `docs/api-reference.md` and inline comments
7. PR with code + docs

### 2. Update README for New Feature
1. Scan changed files (e.g., new utils)
2. Add to README sections: Quickstart, Utils Reference
3. Include copy-paste setup: `npm install && npm run dev`
4. Link to full docs
5. Verify links work

### 3. Review/Improve Existing Docs
1. `searchCode` for TODO/FIXME in comments
2. Check utils usage patterns across app/api/
3. Rewrite for clarity, add examples using `formatDate(new Date())`
4. Ensure consistency with crypto/blog terminology

### 4. Changelog Entry
1. Categorize: Added/Changed/Fixed
2. Link to PRs/symbols (e.g., "Added `UpdateProfileInput` validation")
3. Update CHANGELOG.md in conventional format

## Collaboration Checklist

- [ ] Identify what needs documenting (scan PR diffs, TODOs)
- [ ] Target audience analysis (devs? authors?)
- [ ] Draft clear docs with code blocks
- [ ] Verify examples with local dev server
- [ ] Cross-check against utils/conventions (e.g., always use `slugify`)
- [ ] Review for newcomer-friendliness
- [ ] Get peer review via PR

## Hand-off Notes

After completion:
- Docs are live-previewable via `npm run dev`
- Risks: Outdated examples if utils change—monitor via PR reviews
- Follow-up: Tag @documentation-writer in future PRs for sync

## Related Resources

- [../docs/README.md](./../docs/README.md)
- [README.md](./README.md)
- [../../AGENTS.md](./../../AGENTS.md)
- [CONTRIBUTING.md](./CONTRIBUTING.md)
