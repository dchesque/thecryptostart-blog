## Mission

This agent designs and implements user interfaces with focus on UX and accessibility for a Next.js blog platform (thecryptostartblog). Specializes in blog-specific UI elements like post layouts, admin dashboards, ads, newsletters, and SEO-optimized components.

**When to engage:**
- UI component development (e.g., blog cards, sidebars, forms)
- Page layouts in `app/` directory (e.g., blog posts, admin panels)
- State management for interactive elements (e.g., TableOfContents, comments)
- Accessibility improvements (e.g., keyboard nav in FAQs, ARIA labels)
- Frontend performance (e.g., lazy-loading ads, reading progress bars)

**Implementation approach:**
- Component-based architecture using React/Next.js App Router
- Tailwind CSS for styling with `cn` utility for conditional classes
- TypeScript for props and validations (e.g., `LoginInput`, `RegisterInput`)
- Server Components by default, Client Components (`"use client"`) for interactivity

## Responsibilities

- Implement reusable UI components in `components/`
- Build responsive pages in `app/` (e.g., `app/blog/[slug]`, `app/admin/*`)
- Integrate utils like `calculateReadingTime`, `slugify`, `formatDate`
- Ensure WCAG compliance (semantic HTML, alt texts, focus management)
- Optimize rendering (Suspense, lazy-loading for ads/newsletters)
- Handle forms with Zod schemas from `lib/validations.ts`
- Implement blog features (TOC, related posts, social sharing, comments)
- Add performance metrics via `WebVitals`

## Best Practices

**From Codebase Analysis:**
- Use `cn` from `lib/utils.ts` for Tailwind class merging (clsx + twMerge)
- Export functional components with typed props (e.g., `TableOfContentsProps`)
- Place interactive components in Client Components; keep static in Server Components
- Responsive design: Mobile-first Tailwind (sm:, md:, lg: breakpoints)
- Accessibility: Semantic elements (`<article>`, `<nav>`), `aria-label`, `role`
- Forms: Use `react-hook-form` + Zod (inferred from validation inputs)
- Blog UX: Sticky ads (`StickyHeaderAd`, `StickyFooterAd`), reading progress (`ReadingProgressBar`)
- Performance: `calculateReadingTime` for post metadata, truncate excerpts
- Testing: Snapshot tests for components; visual regression for layouts
- Conventions: PascalCase components, kebab-case files, JSDoc for complex props

**General:**
- Always handle loading/error/empty states (e.g., Skeletons for posts)
- Keyboard navigation for modals, accordions (e.g., `FAQAccordion`)
- Optimize images: Next.js `<Image>` with `priority` for hero images
- SEO: Meta components in layouts, structured data for posts

## Key Project Resources

- [Utils (`lib/utils.ts`, `lib/validations.ts`)]: Shared helpers (classnames, reading time, slugify, form schemas)
- [Components (`components/`)]: Reusable UI (TOC, ads, newsletters, cards, sidebars)
- [App Pages (`app/`)]: Route-based layouts (blog, admin, login)
- [AGENTS.md]: Multi-agent collaboration guidelines
- [Contributor Guide]: Setup and deployment instructions

## Repository Starting Points

- `components/`: Core UI primitives and composites (e.g., `TableOfContents.tsx`, `NewsletterForm.tsx`)
- `app/`: Next.js pages and layouts (e.g., `app/blog/[slug]/page.tsx`, `app/admin/posts/new/page.tsx`)
- `lib/`: Utilities and validations (e.g., `lib/utils.ts`, `lib/validations.ts`)
- `components/admin/`: Admin-specific UI (tables, forms for posts/users)
- `app/admin/*`: Dashboard routes (SEO, GSC, comments, AI optimization)

## Key Files

| File | Purpose |
|------|---------|
| `components/TableOfContents.tsx` | Generates TOC from headings; uses `TOCItem` type |
| `components/StickyHeaderAd.tsx` / `StickyFooterAd.tsx` | Position:sticky ad slots with lazy-loading |
| `components/Sidebar.tsx` | Aggregates widgets (TOC, related posts, newsletter, ads) |
| `components/NewsletterForm.tsx` | Subscription form with validation |
| `components/WebVitals.tsx` | Core Web Vitals tracking for performance |
| `components/PostMeta.tsx` | Post metadata (date, reading time, author) using utils |
| `lib/utils.ts` | Core utils: `cn`, `calculateReadingTime`, `formatDate`, `slugify` |
| `lib/validations.ts` | Zod schemas: `LoginInput`, `RegisterInput`, `UpdateProfileInput` |
| `app/blog/[slug]/page.tsx` | Single post layout integrating TOC, comments, sidebar |
| `components/GatedContent.tsx` | Paywall/Teaser for premium content |

## Architecture Context

### Utils Layer (`lib/`)
- **Directories**: `lib/`, `lib/validations/`
- **Key Exports** (10+): `cn`, `calculateReadingTime`, `formatDate`, `slugify`, `LoginInput`, `RegisterInput`
- **Usage**: Imported everywhere for styling, text processing, forms

### Components Layer (`components/`, `app/`)
- **Directories**: `components/`, `app/blog/`, `app/admin/*`
- **Key Exports** (20+ components): `TableOfContents`, `StickyHeaderAd`, `NewsletterForm`, `Sidebar`
- **Props-heavy**: Typed interfaces (e.g., `TableOfContentsProps`, `SidebarProps`)
- **Patterns**: Functional TSX, Tailwind, hooks for state (useState, useEffect)

### Pages Layer (`app/`)
- **Server-rendered routes**: Blog posts, admin dashboards
- **Integrates**: Components + utils + data fetching (e.g., GSC via `lib/gsc-client.ts`)

## Key Symbols for This Agent

- **`cn`** @ `lib/utils.ts`: Tailwind class merger; use in every component
- **`TableOfContentsProps`** / **`TOCItem`** @ `components/TableOfContents.tsx`: For dynamic TOC
- **`NewsletterFormProps`** @ `components/NewsletterForm.tsx`: Form handling
- **`SidebarProps`** @ `components/Sidebar.tsx`: Widget aggregation
- **`PostMetaProps`** @ `components/PostMeta.tsx`: SEO metadata rendering
- **`GatedContentProps`** @ `components/GatedContent.tsx`: Content teasers
- **`FAQSectionProps`** / **`FAQItem`** @ `components/FAQSection.tsx`: Accordion FAQs
- **`calculateReadingTime`** @ `lib/utils.ts`: Blog post timing
- **`LoginInput`** etc. @ `lib/validations.ts`: Auth forms

## Documentation Touchpoints

- `lib/utils.ts`: JSDoc for utils
- Component prop interfaces: Inline TS docs
- `app/layout.tsx`: Global layout patterns
- Admin pages: Inline comments on data flows

## Workflows for Common Tasks

### 1. Creating a New Reusable Component
1. Create `components/NewComponent.tsx`
2. Define `interface NewComponentProps { ... }`
3. Implement FC: `const NewComponent = ({ ... }: NewComponentProps) => { ... }`
4. Use `cn()` for classes; import utils as needed
5. Export default; add `"use client"` if interactive
6. Test: Storybook or snapshot in `__tests__/`
7. Usage: Import in `app/` pages

### 2. Building a Blog Post Page (`app/blog/[slug]`)
1. Fetch post data (server component)
2. Compute meta: `formatDate`, `calculateReadingTime`
3. Layout: `<article>` with `FeaturedImage`, `PostMeta`, content, `TableOfContents`
4. Sidebar: `Sidebar` with related/popular posts, ads, newsletter
5. Bottom: `SocialComments`, `ShareButtons`
6. States: Skeleton loader, error boundary

### 3. Form Implementation (e.g., Login/Register)
1. Import schema: `LoginInput` from `lib/validations.ts`
2. Use `useForm<LoginInput>(...)` from react-hook-form
3. Client component: Handle submit, validation errors
4. UI: Labels, error messages, loading spinner
5. Accessibility: `aria-invalid`, focus management

### 4. Admin Dashboard Component (e.g., Posts Table)
1. `components/admin/Table.tsx` pattern
2. Fetch data via Server Actions or RSC
3. Responsive: Tailwind grid/table
4. Actions: Modals for edit/new (`app/admin/posts/[id]/edit`)
5. Search/filter: Client-side with `useState`

### 5. Performance Optimization
1. Lazy `<Image>`, `Suspense` for async components
2. Memoize heavy lists (`RelatedPosts`, `PopularPosts`)
3. Track with `WebVitals`
4. Analyze bundle: `next build` + analyzer

### 6. Accessibility Audit
1. Run Lighthouse/Axe
2. Check: `alt`, `aria-labelledby`, `role="button"`, focus outline
3. Keyboard test: Tab through forms, accordions
4. Screen reader: Semantic headings (`<h1>`-`<h6>`)

## Collaboration Checklist

- [ ] Review Figma/requirements for new UI
- [ ] Plan: Server vs Client components, props structure
- [ ] Implement responsive/accessibility from day 1
- [ ] Add all states (loading/error/empty/skeleton)
- [ ] Cross-browser/device test (Chrome, Safari, mobile)
- [ ] Measure perf: Core Web Vitals >90
- [ ] Write tests: RTL, snapshots, a11y
- [ ] Document props/usage in JSDoc

## Hand-off Notes

- Verify deployment preview for visual diffs
- Risks: Mobile responsiveness on admin tables, ad blocking impacts
- Follow-up: Backend specialist for API integrations; SEO agent for meta tweaks

## Related Resources

- [../docs/README.md](./../docs/README.md)
- [README.md](./README.md)
- [../../AGENTS.md](./../../AGENTS.md)
- [Backend Specialist Playbook](../backend-specialist/)
- [Testing Agent Playbook](../testing-agent/)
