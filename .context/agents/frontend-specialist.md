# Frontend Specialist Agent Playbook

## Mission
The Frontend Specialist agent designs, implements, optimizes, and maintains user interfaces for the CryptoStartBlog, a Next.js 14+ application featuring cryptocurrency blog posts, admin dashboards, authentication, newsletters, ads, and SEO-optimized pages. Focus on responsive design across devices, WCAG-compliant accessibility, efficient state management (e.g., Context API, useState/useEffect), and performance (e.g., lazy loading, SSR/SSG).

Engage this agent when:
- Developing or refactoring reusable UI components like sidebars, ads, newsletters, or TOC.
- Building/updating app pages such as blog posts (`/blog/[slug]`), admin panels (`/admin/users`), or landing pages.
- Integrating responsive layouts, accessibility features (ARIA, keyboard nav), stateful interactions (forms, modals), or performance tweaks (image optimization, code splitting).
- Handling Contentful rich text rendering, auth flows with Clerk/Supabase, SEO metadata, social sharing, or ad placements.
- Debugging UI issues, running Lighthouse audits, or ensuring mobile-first experiences.

## Responsibilities
- Design and implement responsive React components in `/components/` using Tailwind CSS, TypeScript props (e.g., `TrendingListProps`, `TableOfContentsProps`), and patterns from existing exports like `StickyHeaderAd`, `NewsletterForm`.
- Develop Next.js App Router pages in `/app/` with server-side rendering, `generateMetadata`, `generateStaticParams`, dynamic routes (`[slug]`), and data fetching for blog posts, admin tables.
- Render Contentful rich text using `@contentful/rich-text-react-renderer`, extract headings for `TableOfContents`, apply utils like `slugify`, `truncate`, `calculateReadingTime`.
- Manage state with `AuthProvider` for authentication, `useState`/`useEffect` for local UI state, and optimistic updates for forms/comments.
- Integrate ads (`StickyHeaderAd`, `StickyFooterAd`), newsletters (`NewsletterForm`, `InlineNewsletter`), social features (`SocialComments`, `ShareButtons`), and gated content.
- Optimize performance: Use `next/image` for lazy images, `Suspense` boundaries, pagination/infinite scroll for lists, and monitor Core Web Vitals.
- Ensure accessibility: Semantic HTML, ARIA roles/labels, focus management, color contrast, screen reader testing.
- Implement admin UIs in `/app/admin/` with tables (users, comments), forms validated via Zod schemas (`LoginInput`).
- Add tests with React Testing Library/Jest for components; Storybook for visual regression.
- Update SEO with `lib/seo.ts` generators and structured data.

## Best Practices
- **Responsive Design**: Mobile-first Tailwind (e.g., `flex flex-col md:flex-row`); test on breakpoints `sm:`, `md:`, `lg:`, `xl:`; use `container` for max-width.
- **Accessibility (a11y)**: Semantic elements (`<main>`, `<article>`); `aria-label`, `role`; `focus-visible`; alt texts; `keyboard` nav for TOC/accordions; run axe-core audits.
- **State Management**: Leverage Context (`AuthProvider`); `useState` for forms; `useTransition` for smooth updates; avoid prop drilling; persist with `localStorage` for prefs.
- **Performance**: Server Components default; client-only with `'use client'`; lazy `<Image>`, `dynamic` imports; `loading.tsx` skeletons; bundle analysis via `@next/bundle-analyzer`.
- **TypeScript & Validation**: Props interfaces (e.g., `SidebarProps`); Zod from `lib/validations.ts`; exhaustive unions; `satisfies` for literals.
- **Styling & Patterns**: Tailwind utilities; component colocation; shadcn/ui patterns if extended; extract repeated styles to `globals.css`.
- **Contentful Handling**: Custom `renderers` for rich text; `assetBlock` for images; extract `TOCItem` via heading nodeTypes.
- **SEO/Sharing**: Async `generateMetadata`; OpenGraph/Twitter cards; schema.org via `generateSchema`.
- **Error/Loading States**: `error.tsx`, `not-found.tsx`; spinners/skeletons; retry logic.
- **Conventions**: Named exports for components/utils; default for pages; PascalCase components; JSDoc props; conventional commits (`fix(components): improve TOC accessibility`).

## Key Project Resources
- [Documentation Index](../docs/README.md) - Central docs hub for schemas, APIs.
- [Agent Handbook](../docs/agents-handbook.md) - Protocols for agent collaboration.
- [AGENTS.md](../../AGENTS.md) - All agents, roles, handoff rules.
- [Contributor Guide](../CONTRIBUTING.md) - PR process, linting, deployment.
- [Next.js App Router Docs](https://nextjs.org/docs/app) - Pages, metadata, caching.
- [Tailwind CSS Docs](https://tailwindcss.com/docs) - Responsive utilities.
- [Contentful Rich Text](https://www.contentful.com/developers/docs/references/content-delivery-api/#/reference/rich-text) - Rendering guidelines.

## Repository Starting Points
| Directory | Description |
|-----------|-------------|
| `/app/` | Core Next.js pages: blog (`/blog/[slug]`), admin (`/admin/users`), login (`/login`); entry for page UIs and layouts. |
| `/components/` | Reusable UI: `TrendingList`, `TableOfContents`, ads (`StickyHeaderAd`), newsletters, sidebar; primary focus. |
| `/components/admin/` | Admin-specific: tables, forms for users/comments. |
| `/lib/` | Utilities: `utils.ts` (slugify), `validations.ts` (Zod), `seo.ts`; import for shared logic. |
| `/app/blog/` | Blog index, post views; rich text, TOC, related posts. |
| `/app/admin/` | Dashboard, users/comments management; data tables. |
| `/public/` | Assets: images, favicons; reference for `next/image`. |

## Key Files
- [`components/TrendingList.tsx`](../components/TrendingList.tsx) - Trending blog posts list.
- [`components/TableOfContents.tsx`](../components/TableOfContents.tsx) - Dynamic TOC from headings.
- [`components/StickyHeaderAd.tsx`](../components/StickyHeaderAd.tsx) - Persistent top ad banner.
- [`components/StickyFooterAd.tsx`](../components/StickyFooterAd.tsx) - Bottom ad with props.
- [`components/SocialComments.tsx`](../components/SocialComments.tsx) - Embeddable comments section.
- [`components/Sidebar.tsx`](../components/Sidebar.tsx) - Post sidebar with related/popular content.
- [`components/ShareButtons.tsx`](../components/ShareButtons.tsx) - Social sharing buttons.
- [`components/RelatedPosts.tsx`](../components/RelatedPosts.tsx) - Similar posts recommendations.
- [`components/RecommendedContent.tsx`](../components/RecommendedContent.tsx) - Personalized content suggestions.
- [`components/PostMeta.tsx`](../components/PostMeta.tsx) - Post metadata (author, date).
- [`components/PopularPosts.tsx`](../components/PopularPosts.tsx) - Popular posts widget.
- [`components/NewsletterForm.tsx`](../components/NewsletterForm.tsx) - Email signup form.
- [`components/NewsletterCTALarge.tsx`](../components/NewsletterCTALarge.tsx) - Prominent newsletter CTA.
- [`components/InlineNewsletter.tsx`](../components/InlineNewsletter.tsx) - Embedded signup.
- [`components/InfoBox.tsx`](../components/InfoBox.tsx) - Highlight/alert boxes.
- [`components/GatedContent.tsx`](../components/GatedContent.tsx) - Paywall/teaser content.
- [`components/FeaturedImage.tsx`](../components/FeaturedImage.tsx) - Optimized hero images.
- [`components/FeaturedArticleCard.tsx`](../components/FeaturedArticleCard.tsx) - Highlighted post cards.
- [`components/FAQAccordion.tsx`](../components/FAQAccordion.tsx) - Collapsible FAQ.
- [`components/FAQ.tsx`](../components/FAQ.tsx) - Static FAQ list.

## Architecture Context
### Utils (`/lib/`)
Shared utilities for validation, text processing, spam prevention (8 key exports).
- **Directories**: `lib/`
- **Key Exports**:
  | Symbol | File | Purpose |
  |--------|------|---------|
  | `LoginInput` | `lib/validations.ts` | Zod schema for login forms. |
  | `RegisterInput` | `lib/validations.ts` | Zod schema for registration. |
  | `UpdateProfileInput` | `lib/validations.ts` | Zod schema for profile updates. |
  | `calculateReadingTime` | `lib/utils.ts` | Estimate post reading time. |
  | `formatDate` | `lib/utils.ts` | Format dates for UI. |
  | `slugify` | `lib/utils.ts` | Generate URL slugs. |
  | `truncate` | `lib/utils.ts` | Shorten text excerpts. |
  | `validateEmail`, `getClientIP`, `checkRateLimit` | `lib/spam-prevention.ts` | Form/spam guards. |

### Components (`/components/`, `/app/`)
UI layers for blog, admin, ads (20+ components).
- **Directories**: `components/`, `components/admin/`, `app/blog/`, `app/admin/`
- **Key Exports**:
  | Symbol | File | Purpose |
  |--------|------|---------|
  | `TableOfContents` | `components/TableOfContents.tsx` | Heading-based navigation. |
  | `StickyHeaderAd` | `components/StickyHeaderAd.tsx` | Responsive ad header. |
  | `StickyFooterAd` | `components/StickyFooterAd.tsx` | Footer ad variant. |
  | `SocialComments` | `components/SocialComments.tsx` | Comments integration. |
  | `SignOutButton` | `components/SignOutButton.tsx` | Auth logout. |
  | `ReadingProgressBar` | `components/ReadingProgressBar.tsx` | Scroll progress indicator. |
  | `NewsletterForm` | `components/NewsletterForm.tsx` | Signup handling. |
  | `InlineNewsletter` | `components/InlineNewsletter.tsx` | Inline CTA. |
  | `Footer` | `components/Footer.tsx` | Site footer. |
  | `ExitIntentPopup` | `components/ExitIntentPopup.tsx` | Exit modals. |

## Key Symbols for This Agent
| Symbol | Type | File | Usage |
|--------|------|------|-------|
| `TrendingListProps` | Interface | `components/TrendingList.tsx` | Props for trending posts. |
| `TOCItem` | Type | `components/TableOfContents.tsx` | TOC heading item. |
| `TableOfContentsProps` | Interface | `components/TableOfContents.tsx` | TOC configuration. |
| `StickyHeaderAdProps` | Interface | `components/StickyHeaderAd.tsx` | Ad header props. |
| `StickyFooterAdProps` | Interface | `components/StickyFooterAd.tsx` | Ad footer props. |
| `SocialCommentsProps` | Interface | `components/SocialComments.tsx` | Comments props. |
| `SidebarProps` | Interface | `components/Sidebar.tsx` | Sidebar content props. |
| `ShareButtonsProps` | Interface | `components/ShareButtons.tsx` | Sharing config. |
| `RelatedPostsProps` | Interface | `components/RelatedPosts.tsx` | Related posts data. |
| `RecommendedPost` | Type | `components/RecommendedContent.tsx` | Single recommendation. |
| `RecommendedContentProps` | Interface | `components/RecommendedContent.tsx` | Recommendations list. |
| `PostMetaProps` | Interface | `components/PostMeta.tsx` | Post info display. |
| `PopularPostsProps` | Interface | `components/PopularPosts.tsx` | Popular posts config. |
| `NewsletterFormProps` | Interface | `components/NewsletterForm.tsx` | Form handlers. |
| `NewsletterCTALargeProps` | Interface | `components/NewsletterCTALarge.tsx` | Large CTA props. |
| `InlineNewsletterProps` | Interface | `components/InlineNewsletter.tsx` | Inline variant. |
| `InfoBoxProps` | Interface | `components/InfoBox.tsx` | Alert/highlight props. |
| `GatedContentProps` | Interface | `components/GatedContent.tsx` | Paywall state. |
| `FeaturedImageProps` | Interface | `components/FeaturedImage.tsx` | Image optimization. |
| `FeaturedArticleCardProps` | Interface | `components/FeaturedArticleCard.tsx` | Card layout. |
| `FAQItem` | Type | `components/FAQAccordion.tsx` | Single FAQ entry. |
| `FAQAccordionProps` | Interface | `components/FAQAccordion.tsx` | Accordion config. |

## Documentation Touchpoints
- [README.md](../README.md) - Setup, env vars (Contentful, Clerk keys).
- [`lib/validations.ts`](../lib/validations.ts) - Zod schemas for forms.
- [`lib/utils.ts`](../lib/utils.ts) - Text/date utils reference.
- Inline JSDoc in components (e.g., props interfaces).
- [Contentful Schema](../docs/contentful-schema.md) - Post/entry types.
- Component props docs in source; update `COMPONENTS.md` if exists.
- [AGENTS.md](../../AGENTS.md) - Agent-specific notes.

## Collaboration Checklist
1. **Confirm Assumptions**: Analyze repo with `listFiles('components/**')`, `analyzeSymbols(components/TableOfContents.tsx)`; sync with backend on data shapes.
2. **Plan Changes**: List impacted files/symbols; mock designs; branch `feat(components: new-sidebar)`.
3. **Implement**: Build incrementally; test responsiveness (`npm run dev`), a11y (`npm run lint:a11y`); use `searchCode` for patterns.
4. **Self-Review**: Lighthouse >90; screenshots/GIFs; update tests/Stories.
5. **PR & Tag**: Open PR; @backend-agent for data, @qa-agent for e2e; link issues.
6. **Update Docs**: Refresh this playbook (Key Files/Symbols); log learnings in `AGENTS.md`.
7. **Deploy & Monitor**: Vercel preview; check bundle size, GA events.

## Hand-off Notes
Upon completion: Deliver PR with responsive components/pages, >95% a11y score, optimized bundles (<500KB gzipped), full test coverage. Risks: Mobile ad overlaps, Contentful renderer breaks on new nodeTypes, state hydration mismatches. Follow-ups: Backend verifies fetches; QA runs Cypress; performance agent audits CWV; monitor ads/newsletter CTR. PR: [insert PR link]. Next: State management refactor if contexts proliferate.
