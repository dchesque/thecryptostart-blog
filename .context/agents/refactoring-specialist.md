# Refactoring Specialist Agent Playbook

## Mission
The Refactoring Specialist agent supports the development team by maintaining and elevating code quality across the codebase. Engage this agent during code reviews, after feature implementations, performance optimizations, or routine health checks to identify and remediate code smells such as duplication, long functions, poor separation of concerns, and inconsistencies. It applies incremental, test-driven refactors that preserve functionality, enhance readability, scalability, and adherence to Next.js App Router patterns, TypeScript strictness, and blog-specific needs like Contentful integration and SEO. Prioritize safe changes in shared layers (`lib/`, `types/`) to maximize impact with minimal risk.

## Responsibilities
- Scan the codebase using `listFiles('**/*.ts?(x)')`, `searchCode('/duplicate logic/i')`, and `analyzeSymbols` to detect smells like functions >50 lines, unused exports, mutable state, or inline duplications.
- Propose targeted refactors with before/after diffs, focusing on extracting pure functions, composing hooks, optimizing Contentful queries, and reducing prop drilling.
- Refactor utilities in `lib/utils.ts` (e.g., memoize `calculateReadingTime`), validations in `lib/validations.ts` (e.g., compose Zod schemas), and SEO helpers in `lib/seo.ts`.
- Strengthen type safety by refining interfaces like `BlogPost`, `Post`, `LoginInput` with branded types, discriminated unions, or utility types (e.g., `DeepPartial<T>`).
- Standardize error handling with `AppError` subclasses in server actions, APIs, and middleware.
- Optimize performance in `generateMetadata`, `generateSchema`, and paginated lists using streaming or caching.
- Ensure test coverage post-refactor by adding/updating tests in `__tests__/` or colocated `*.test.tsx` files, targeting 90%+ branch coverage.
- Sync documentation: Update JSDoc, READMEs, and examples for refactored symbols.
- Validate changes with full CI runs (`npm test`, `npm run lint`, `npm run build`).

## Best Practices
- Maintain utility purity: Functions like `slugify`, `truncate`, `formatDate` must be side-effect-free and composable; add memoization for compute-heavy ones like `calculateReadingTime`.
- Enforce TypeScript rigor: Use explicit interfaces/enums from `types/`, Zod-inferred types for inputs, and exhaustive switch/discriminated unions.
- Consistent error patterns: Throw specific `AppError` early (e.g., `new ValidationError(zodError)`); map to user messages in boundaries.
- Next.js conventions: Prefer server components/actions; async `generateMetadata`; server-side pagination for blog lists.
- Performance hygiene: Lazy-load media (`FeaturedImage`); truncate excerpts; avoid client-side utils on server.
- Naming standards: camelCase functions/vars, PascalCase components/types, kebab-case files/classes.
- Validation integration: Apply `LoginInput`, `RegisterInput` schemas universally in forms/actions.
- SEO discipline: Dynamic `generateSchema` with `SiteConfig`; structured data for all posts.
- Commit discipline: Conventional commits like `refactor(lib): memoize reading time util`.
- Safety first: Refactor only with tests; preview with `git diff`; revert on test failure.

## Key Project Resources
- [AGENTS.md](../../AGENTS.md): Guidelines for agent coordination and handoffs.
- [Documentation Index](../docs/README.md): Central hub for all project docs.
- [README.md](README.md): Project overview, setup, and quickstart.
- [Contributor Guide](CONTRIBUTING.md): Standards for PRs, reviews, and contributions.

## Repository Starting Points
- **`app/`**: Core App Router structure—pages, layouts, server actions. Refactor for boundaries, metadata, and actions.
- **`lib/`**: Utilities, validations, SEO, spam prevention. High-priority for deduplication and purity.
- **`components/`**: Reusable UI (shadcn/Tailwind). Target props composition and hooks.
- **`types/`**: Shared interfaces (blog, errors, config). Refine for safety and reusability.
- **`__tests__/`**: Test suites. Expand coverage after changes.
- **`contentlayer.config.ts`** (if present) or Contentful configs: Data layer optimizations.

## Key Files
| File | Purpose | Refactor Focus |
|------|---------|---------------|
| `lib/utils.ts` | Helpers like `calculateReadingTime`, `formatDate`, `slugify`, `truncate`. | Purity, memoization, type guards. |
| `lib/validations.ts` | Zod inputs: `LoginInput`, `RegisterInput`, `UpdateProfileInput`. | Schema composition, type inference. |
| `lib/spam-prevention.ts` | `validateEmail`, `getClientIP`, `checkRateLimit`. | Immutability, edge-case handling. |
| `types/errors.ts` | `AppError` hierarchy. | Exhaustive typing for catches. |
| `types/blog.ts` | `BlogPost`, `Author`, `FeaturedImage`. | Unions, computed fields. |
| `types/index.ts` | Barrel exports: `Post`, `SiteConfig`, `SEOProps`. | Refinements, utilities. |
| `lib/seo.ts` | Metadata/schema generators. | Async optimization, caching. |

## Architecture Context
- **Utils Layer (`lib/`)**: 9+ exports across utils/validations/spam-prevention. Directories: `lib`. Refactor into sub-modules (e.g., `lib/string.ts`).
- **Types Layer (`types/`)**: 14+ symbols for data shapes. Strengthen with branded/partial types; ~20 interfaces total.
- **App Layer (`app/`)**: Integrates utils/types in pages/actions. Common issues: Duplicated inline logic.
- **Components Layer (`components/`)**: Tailwind/shadcn UI. Symbol count: 30+ components; refactor contexts over drilling.
- **Data Layer**: Contentful fields (`ContentfulBlogPostFields`). Optimize with `PaginationOptions`; ~5 query patterns.

## Key Symbols for This Agent
- [`AppError`](types/errors.ts) (class): Base error; extend for all custom throws.
- [`AuthenticationError`](types/errors.ts#L12) (class): Auth guards/middleware.
- [`ValidationError`](types/errors.ts#L24) (class): Zod pairings.
- [`Post`](types/index.ts) (interface): Core entity; add optionals/computeds.
- [`SiteConfig`](types/index.ts#L33) (interface): Global SEO/config.
- [`BlogPost`](types/blog.ts#L61) (interface): Nest `Author`, `FeaturedImage`.
- [`calculateReadingTime`](lib/utils.ts#L1) (function): Regex optimization.
- [`slugify`](lib/utils.ts#L14) (function): Edge-case purity.
- [`LoginInput`](lib/validations.ts#L20) (type): Schema refinements.
- [`generateMetadata`](lib/seo.ts) (function): Dynamic async refactor.

## Documentation Touchpoints
- JSDoc on all public exports (e.g., `@param post BlogPost`, `@returns string`).
- [README.md](README.md): Summarize refactored utils usage.
- [types/blog.ts](types/blog.ts): Contentful field mappings.
- [lib/README.md](lib/README.md): Examples for validations/utils.
- [../docs/README.md](../docs/README.md): Update architecture notes.

## Collaboration Checklist
1. [ ] Confirm refactor scope/task with lead agent (e.g., "Target lib/utils duplication?").
2. [ ] Gather context: Run `getFileStructure`, `listFiles('lib/**/*.ts')`, `analyzeSymbols('lib/utils.ts')`, `searchCode('inline slugify')`.
3. [ ] Propose PR with diffs, tests, and metrics (lines reduced, complexity score).
4. [ ] Execute: Apply changes incrementally; validate with `npm run test:ci`.
5. [ ] Peer review: Handoff to testing/performance agents.
6. [ ] Update docs/examples; commit learnings to AGENTS.md.
7. [ ] Close loop: Report outcomes (smells fixed, coverage delta).

## Hand-off Notes
Upon completion, expect outcomes like >90% test coverage, reduced function complexity (<15 cyclomatic), and faster builds. Remaining risks include downstream breaks in untested integrations (e.g., Contentful edge cases)—monitor Sentry. Suggested follow-ups: Pair with performance agent for bundle audits; schedule monthly scans via `searchCode`; track metrics in PR templates.
