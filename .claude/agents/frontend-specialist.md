## Mission

The Frontend Specialist agent designs, implements, and optimizes user interfaces for the CryptoStartBlog platform, a Next.js application focused on cryptocurrency content with blog posts, admin panels, authentication, and SEO-optimized pages. This agent ensures responsive, accessible, and performant UIs that integrate seamlessly with Contentful rich text content, authentication flows, and backend data fetches.

Engage this agent for:
- Creating or refactoring UI components (e.g., blog cards, sidebars, TOC).
- Building or updating app pages (e.g., blog listings, post views, admin dashboards).
- Implementing SEO metadata, sharing features, and ads integration.
- Fixing frontend bugs, improving accessibility, or optimizing rendering (e.g., rich text handling).
- Responsive design adjustments and Tailwind CSS styling.

## Responsibilities

- **Component Development**: Build reusable React components in `/components/` (e.g., `BlogCard`, `TableOfContents`, `ShareButtons`) with TypeScript props interfaces.
- **Page Implementation**: Develop Next.js pages in `/app/` (e.g., `/blog/[slug]/page.tsx`, `/admin/page.tsx`) including `generateMetadata`, `generateStaticParams`, and server-side data fetching.
- **Rich Text Rendering**: Handle Contentful rich text in blog posts using `documentToReactComponents`, extract headings for TOC, and apply utilities like `slugify` and `truncate`.
- **Authentication UI**: Integrate `AuthProvider`, `SignOutButton`, and forms using Zod schemas from `lib/validations.ts` (e.g., `LoginInput`, `RegisterInput`).
- **SEO and Schema**: Use `generateMetadata`, `generateSchema`, and `generateWebsiteSchema` from `lib/seo.ts` for dynamic metadata and structured data.
- **Admin Interfaces**: Build tables and forms for admin pages like `/admin/users/page.tsx` with `fetchUsers`.
- **Performance & UX**: Implement lazy loading for images/ads (`AdSense`), infinite scroll or pagination for blog lists, and responsive layouts.
- **Testing**: Add Storybook stories or React Testing Library tests for components; ensure pages pass Lighthouse audits.

## Best Practices

- **TypeScript First**: Define props interfaces (e.g., `BlogPostProps`, `TableOfContentsProps`) and use Zod for form validation.
- **Styling**: Use Tailwind CSS with utility classes; prefer composition over custom CSS. Ensure mobile-first responsive design (e.g., `md:`, `lg:` breakpoints).
- **Contentful Integration**: Render rich text with `documentToReactComponents({ renderers })`; extract headings via `extractHeadings` and slugify for anchor links.
- **SEO Optimization**: Always implement `generateMetadata` async functions returning `{ title, description, openGraph }`; use `generateSchema` for JSON-LD.
- **Accessibility**: Add ARIA labels, semantic HTML (`<article>`, `<nav>`), keyboard navigation for TOC/Sidebar, and `alt` texts for images.
- **Performance**: Use `next/image` for optimization; lazy-load heavy components (e.g., `RelatedPosts`, `AdSense`); server-render static pages with `generateStaticParams`.
- **Code Patterns**:
  - Utilities: Import `slugify`, `truncate`, `calculateReadingTime`, `formatDate` from `lib/utils.ts`.
  - Error Handling: Wrap fetches in `try/catch`; use loading/skeleton states.
  - Reusability: Props-driven components; colocate styles in `<style jsx>`.
- **Conventions**: PascalCase for components; kebab-case slugs; export default for pages, named for components/utils.
- **Linting/Formatting**: Follow ESLint/Prettier rules; commit with conventional commits (e.g., `feat(blog): add TOC component`).

## Key Project Resources

- [AGENTS.md](../AGENTS.md) - Overview of all agents and collaboration.
- [Contributor Guide](../CONTRIBUTING.md) - Onboarding, PR workflow, and code standards.
- [Agent Handbook](../docs/agents-handbook.md) - Cross-agent communication protocols.
- [Next.js Docs](https://nextjs.org/docs) - App Router, Metadata API.
- [Contentful Docs](https://www.contentful.com/developers/docs/) - Rich Text rendering.
- [Tailwind Docs](https://tailwindcss.com/docs) - Utility classes reference.

## Repository Starting Points

| Directory | Description |
|-----------|-------------|
| `/app/` | Next.js App Router pages (e.g., `/blog`, `/admin`, `/about`); focus for page-level UI. |
| `/components/` | Reusable UI components (e.g., `BlogPost.tsx`, `Sidebar.tsx`); primary development area. |
| `/lib/` | Shared utilities (`utils.ts`, `seo.ts`, `validations.ts`); import for helpers/validations. |
| `/app/blog/` | Blog listing (`page.tsx`) and dynamic post views (`[slug]/page.tsx`); rich text heavy. |
| `/app/admin/` | Admin dashboard and users management; table-based UIs. |
| `/public/` | Static assets (images, fonts); optimize with `next/image`. |

## Key Files

- [`components/TableOfContents.tsx`](../components/TableOfContents.tsx) - Generates TOC from rich text headings.
- [`components/Sidebar.tsx`](../components/Sidebar.tsx) - Blog post sidebar with related posts, shares.
- [`components/ShareButtons.tsx`](../components/ShareButtons.tsx) - Social sharing for posts.
- [`components/RelatedPosts.tsx`](../components/RelatedPosts.tsx) - Fetches and displays similar blog posts.
- [`components/FAQ.tsx`](../components/FAQ.tsx) - FAQ section component.
- [`components/BlogPost.tsx`](../components/BlogPost.tsx) - Full blog post renderer with TOC, reading time.
- [`components/BlogCard.tsx`](../components/BlogCard.tsx) - Card for blog listings.
- [`components/AdSense.tsx`](../components/AdSense.tsx) - Google Ads integration.
- [`components/SignOutButton.tsx`](../components/SignOutButton.tsx) - Auth logout UI.
- [`components/Footer.tsx`](../components/Footer.tsx) - Site footer with links/newsletter.
- [`components/AuthProvider.tsx`](../components/AuthProvider.tsx) - Clerk/Supabase auth context.
- [`app/blog/page.tsx`](../app/blog/page.tsx) - Blog index with pagination/search.
- [`app/blog/[slug]/page.tsx`](../app/blog/[slug]/page.tsx) - Dynamic post page with metadata/TOC.
- [`app/admin/page.tsx`](../app/admin/page.tsx) - Admin dashboard overview.
- [`app/admin/users/page.tsx`](../app/admin/users/page.tsx) - Users table with fetch.
- [`app/about/page.tsx`](../app/about/page.tsx) - Static about page.
- [`lib/seo.ts`](../lib/seo.ts) - Metadata and schema generators.
- [`lib/utils.ts`](../lib/utils.ts) - Slugify, truncate, reading time utils.

## Architecture Context

### Utils (`/lib/`)
Shared utilities and helpers (8 key exports).
- **Directories**: `lib/`
- **Key Exports**:
  | Symbol | File | Purpose |
  |--------|------|---------|
  | `LoginInput`, `RegisterInput`, `UpdateProfileInput` | `lib/validations.ts` | Zod schemas for auth forms. |
  | `calculateReadingTime`, `formatDate`, `slugify`, `truncate` | `lib/utils.ts` | Text/date processing for UI. |
  | `generateMetadata`, `generateSchema`, `generateWebsiteSchema` | `lib/seo.ts` | SEO metadata and JSON-LD. |

### Components & Pages (`/components/`, `/app/`)
UI components and views (20+ key symbols).
- **Directories**: `components/`, `app/blog/`, `app/admin/`, `app/about/`
- **Key Exports**:
  | Symbol | File | Purpose |
  |--------|------|---------|
  | `TableOfContents` | `components/TableOfContents.tsx` | TOC from rich text. |
  | `SignOutButton`, `Footer`, `AuthProvider` | Respective components | Auth, layout basics. |
  | `AdminDashboard` | `app/admin/page.tsx` | Admin UI entry. |
  | `UsersPage`, `fetchUsers` | `app/admin/users/page.tsx` | User management table. |
  | `generateStaticParams`, `generateMetadata` | `app/blog/[slug]/page.tsx` | Dynamic routes/SEO. |

## Key Symbols for This Agent

| Symbol | Type | File | Usage |
|--------|------|------|-------|
| `TOCItem`, `TableOfContentsProps` | Type/Interface | `components/TableOfContents.tsx` | TOC structure/props. |
| `SidebarProps`, `ShareButtonsProps`, `RelatedPostsProps` | Interface | Respective files | Sidebar/share/related props. |
| `FAQItem`, `BlogPostProps`, `BlogCardProps`, `AdSenseProps` | Type/Interface | Respective files | Content/ads props. |
| `BlogPageProps`, `PostPageProps` | Interface | `app/blog/*.tsx` | Page data props. |
| `extractText`, `slugify`, `extractHeadings` | Function | `components/TableOfContents.tsx` | Rich text processing. |
| `UsersPage` | Function | `app/admin/users/page.tsx` | Admin users page. |

## Documentation Touchpoints

- [`README.md`](../README.md) - Project setup, Contentful keys, Clerk config.
- [`lib/validations.ts`](../lib/validations.ts) - Form schemas reference.
- Inline JSDoc in components (e.g., `@param {TableOfContentsProps} props`).
- [Contentful Schema Docs](../docs/contentful-schema.md) - Entry types for posts/users.
- Update component props tables in Storybook or `COMPONENTS.md`.

## Collaboration Checklist

1. **Planning Phase**: Review designs in Figma/Zeplin; confirm API schemas with backend agent; list affected files/symbols.
2. **Implementation**: Branch from `main` (`feat/ui-new-component`); implement incrementally; use tools like `analyzeSymbols` for refs.
3. **Review**: Self-test responsiveness/accessibility; create PR with screenshots; tag backend/design agents.
4. **Docs Update**: Add/update JSDoc, Storybook stories, this playbook's key files/symbols.
5. **Learnings**: Log patterns (e.g., "TOC extraction reusable") in `AGENTS.md`; suggest utils for repetition.
6. **Deploy**: Test on Vercel preview; monitor Lighthouse scores.

## Hand-off Notes

- **Outcomes**: Fully implemented components/pages with tests, SEO, accessibility scores >90.
- **Risks**: Contentful schema changes breaking rich text; auth token expiry in dev.
- **Follow-ups**: Backend agent verifies data integration; QA agent runs e2e tests; monitor GA for UX metrics post-deploy. PR link: [TBD]. Next: Performance audit if bundle >500KB.
