## Glossary & Domain Concepts

This document serves as the central reference for project-specific terminology, domain entities, acronyms, and key concepts in *The Crypto Start Blog*, a Next.js-powered blog platform focused on cryptocurrency and startup content. It emphasizes SEO optimization, AI-driven content analysis, admin workflows, and user engagement features.

Key domain entities include:
- **BlogPost**: Core content unit representing articles with slugs, rich text content, metadata, authors, and categories.
- **BlogCategory**: Hierarchical classification for posts, enabling clustering and SEO silos.
- **Author**: Contributor profile with bio, avatar, and associated posts.
- **SEOAnalysis**: Structured report on content quality, including word count, headings, links, and images.
- **AIOptimizationScore**: AI-evaluated metric for content expandability, quick answers, and FAQ potential.
- **GSCAnalytics**: Data from Google Search Console for query performance, impressions, and clicks.
- **ExpansionOpportunity**: Suggested content expansions based on keyword gaps and semantic analysis.

User personas:
- **Reader**: Seeks educational crypto/startup content; interacts via reading, sharing, comments.
- **Content Admin/Author**: Manages posts, categories, SEO; uses AI tools for optimization.
- **SEO Specialist**: Monitors GSC, broken links, keyword gaps via admin dashboard.

Refer to [project-overview.md](./project-overview.md) for high-level architecture.

## Type Definitions

Exported interfaces and types defining the domain model:

- **SiteConfig** — Global site configuration including title, description, and URLs. ([types/index.ts](types/index.ts))
- **SEOProps** — Props for SEO metadata generation, including title, description, and schema. ([types/index.ts](types/index.ts))
- **FeaturedImage** — Image metadata for post headers (src, alt, dimensions). ([types/blog.ts](types/blog.ts))
- **Author** — Blog author details (id, name, bio, avatar, social links). ([types/blog.ts](types/blog.ts))
- **BlogPost** — Full post entity (slug, title, content, excerpt, reading time, author, category). ([types/blog.ts](types/blog.ts))
- **BlogMetadata** — Post metadata (tags, published date, featured image). ([types/blog.ts](types/blog.ts))
- **PaginationOptions** — Query params for paginated post lists (page, limit). ([types/blog.ts](types/blog.ts))
- **SearchOptions** — Search filters (query, category, tags). ([types/blog.ts](types/blog.ts))
- **CategoryConfig** — Category settings (name, slug, description, pillar content). ([types/blog.ts](types/blog.ts))
- **RolePermissions** — User role capabilities (e.g., admin, editor). ([types/roles.ts](types/roles.ts))
- **SEOAnalysis** — Comprehensive SEO audit results (word count, headings, links, images). ([lib/seo-analyzer.ts](lib/seo-analyzer.ts))
- **AIOptimizationScore** — AI score breakdown (citable sentences, quick answers, FAQs). ([lib/ai-optimization.ts](lib/ai-optimization.ts))
- **GSCAnalytics** — Google Search Console metrics (queries, impressions, CTR). ([lib/gsc-client.ts](lib/gsc-client.ts))
- **ExpansionOpportunity** — Content expansion suggestions (topic, relevance score). ([lib/content-expander.ts](lib/content-expander.ts))

These types are used across `lib/posts.ts`, admin APIs, and page components.

## Enumerations

No enums are explicitly defined or exported in the current codebase. Domain logic uses string unions or interfaces (e.g., `RolePermissions` for permissions).

## Core Terms

- **Slug**: URL-friendly post identifier generated from title via `generateSlugFromTitle` in `lib/posts.ts`. Surfaces in routes like `app/blog/[slug]/page.tsx`.
- **Reading Time**: Estimated minutes to read post content, calculated by `calculateReadingTime` (`lib/utils.ts`, `lib/posts.ts`). Displayed in post metadata.
- **Pillar Content**: High-level category hub posts linking to cluster content; queried via `getPostsByPillar` (`lib/posts.ts`).
- **Keyword Gap**: Discrepancy between target keywords and GSC performance; analyzed by `analyzeKeywordGap` (`lib/keyword-research.ts`).
- **Broken Link**: Invalid internal/external URL detected by `lib/broken-link-finder.ts`; used in SEO monitoring.
- **Rate Limit**: IP-based throttling to prevent spam; enforced by `checkRateLimit` (`lib/rate-limit.ts`, `lib/spam-prevention.ts`).
- **AI Optimization**: Holistic content scoring for SGE (Search Generative Experience) readiness, via `calculateAIOptimizationScore` (`lib/ai-optimization.ts`).

These terms appear in admin dashboards (`app/admin/seo`, `app/admin/ai-optimization`), APIs, and utils.

## Acronyms & Abbreviations

| Acronym | Expansion | Context |
|---------|-----------|---------|
| GSC | Google Search Console | Analytics integration via `GSCClient` (`lib/gsc-client.ts`) |
| SEO | Search Engine Optimization | Core focus; analyzers in `lib/seo-analyzer.ts`, metadata in `lib/seo.ts` |
| AI | Artificial Intelligence | Content tools (`lib/ai-optimization.ts`, `lib/content-expander.ts`) |
| SGE | Search Generative Experience | Google's AI search; optimization target |
| CTR | Click-Through Rate | GSC metric in `GSCAnalytics` |
| GA4 | Google Analytics 4 | Web vitals tracking (`lib/analytics.ts`) |
| Prisma | Prisma ORM | Database access (`lib/prisma.ts`) |

## Personas / Actors

- **Blog Reader**: Goal: Quickly find and consume crypto/startup insights. Workflows: Browse categories (`app/blog/clusters`), read posts (`app/blog/[slug]`), share via buttons. Pain points addressed: Fast loading, mobile UX, related content suggestions.
- **Content Admin**: Goal: Publish/optimize high-SEO posts. Workflows: CRUD posts/authors/categories (`app/admin/posts`, etc.), AI scores, GSC dashboard. Pain points: Manual SEO checks, spam comments (handled by `detectSpam`).
- **SEO Manager**: Goal: Monitor performance. Workflows: Keyword gaps, broken links, expansion opportunities via admin tools. Pain points: Data silos (integrated via GSCClient).

## Domain Rules & Invariants

- **Content Validation**: Posts require title (min 10 chars), content (>300 words), slug uniqueness; enforced in `lib/validations/admin.ts`.
- **Permissions**: Role-based access (`hasPermission`, `hasRole` in `lib/permissions.ts`); admins only for delete/publish.
- **Spam Prevention**: Comments/emails validated (`validateEmail`, `detectSpam`); rate-limited by IP (`checkRateLimit`).
- **SEO Invariants**: All posts generate schema (`generateSchema` in `lib/seo.ts`); headings H1-H3 required for analysis.
- **Publishing**: Posts must have category/author; featured status limited to 5 (`getFeaturedPosts`).
- **Localization**: US-centric (no i18n); dates in ISO format (`formatDate`).

Violations throw typed errors (e.g., `ValidationError`, `AuthorizationError` from `lib/errors.ts`).

## Related Resources

- [project-overview.md](./project-overview.md)
