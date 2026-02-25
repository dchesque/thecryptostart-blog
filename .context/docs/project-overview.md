## Project Overview

Hey there! The Crypto Start Blog is a Next.js-powered platform designed to supercharge content creation for crypto and startup enthusiasts. It tackles common blogging headaches like poor SEO rankings, manual content optimization, and spam management by providing AI-driven tools for expansion opportunities, keyword gaps, and optimization scores—plus a full admin dashboard for posts, comments, users, and Google Search Console analytics. Authors, admins, and site owners benefit from higher traffic, easier workflows, and data-backed decisions to grow their audience.

## Codebase Reference

> **Detailed Analysis**: For complete symbol counts, architecture layers, and dependency graphs, see [`codebase-map.json`](./codebase-map.json).

## Quick Facts

- **Root**: `./`
- **Languages**: TypeScript (200+ files), JavaScript (minimal), Prisma schema (1 file)
- **Entry**: `app/layout.tsx` (root layout), `app/page.tsx` (home/blog entry)
- **Full analysis**: [`codebase-map.json`](./codebase-map.json)

## Entry Points

- **`app/layout.tsx`** — Root layout with auth provider, metadata, and global styles ([view](https://github.com/user/repo/blob/main/app/layout.tsx)).
- **`app/page.tsx`** — Main blog listing and entry page ([view](https://github.com/user/repo/blob/main/app/page.tsx)).
- **`app/blog/page.tsx`** — Blog index with pagination and categories ([view](https://github.com/user/repo/blob/main/app/blog/page.tsx:L39)).
- **`scripts/seo-monitor.ts`** — Daily SEO monitoring script entry ([view](https://github.com/user/repo/blob/main/scripts/seo-monitor.ts:L10)).
- **API Routes**: `app/api/admin/posts/route.ts` (CRUD for posts), `app/api/auth/[...nextauth]/route.ts` (authentication).

## Key Exports

See [`codebase-map.json`](./codebase-map.json) for the complete list of 100+ exported symbols across utils, types, and components.

Key public APIs:
- `getAllPosts()` from `lib/posts.ts` — Fetch paginated blog posts.
- `analyzeSEO()` from `lib/seo-analyzer.ts:L98` — Comprehensive SEO audit.
- `calculateAIOptimizationScore()` from `lib/ai-optimization.ts` — AI content scoring.
- `createGSCClient()` from `lib/gsc-client.ts` — Google Search Console integration.
- `BlogPost` type from `types/blog.ts` — Core post data structure.

## File Structure & Code Organization

- `app/` — Next.js App Router: pages (e.g., `blog/[slug]`), layouts (e.g., `admin/layout.tsx`), API routes (e.g., `api/admin/posts/[id]/route.ts`).
- `components/` — Reusable UI elements like `CommentsList.tsx`, `FAQSection.tsx`, `CategoryCard.tsx`, and admin modals.
- `lib/` — Server-side utils: SEO analyzers (`seo-analyzer.ts`), posts (`posts.ts`), validations (`validations/admin.ts`), AI tools (`ai-optimization.ts`), GSC client.
- `types/` — TypeScript interfaces like `BlogPost`, `Author`, `SEOAnalysis`.
- `prisma/` — Database schema (`schema.prisma`), seed script.
- `docs/` — Markdown guides like this one, architecture.md.
- `scripts/` — Maintenance tasks like `seo-monitor.ts`, `test-db.ts`.

## Technology Stack Summary

This project runs on **Node.js** (v20+), leveraging **Next.js 14** (App Router) for full-stack React development with server-side rendering and API routes. **TypeScript** ensures type safety, **Prisma** handles PostgreSQL ORM with migrations, and **Tailwind CSS + shadcn/ui** powers the UI (check `cn()` utility in `lib/utils.ts`). Build tooling is baked into Next.js (`next build/dev`), with **ESLint**, **Prettier**, and strict TypeScript for code quality. Auth uses **NextAuth.js**, rate limiting/spam prevention via custom middleware, and external integrations like Google Search Console.

## Core Framework Stack

- **Backend/Data**: Next.js API routes + Prisma (clean CRUD with relations for posts/authors/comments).
- **Frontend**: React 18 with App Router patterns (parallel routes, loading/error boundaries).
- **SEO/AI**: Custom libs enforce structured analysis (e.g., `analyzeSEO()` outputs `SEOAnalysis` interface).
- **Patterns**: Server Components by default, RSC for data fetching, middleware for auth/rate limits.

## UI & Interaction Libraries

Built with **shadcn/ui** components (via `cn()` class merger) and **Tailwind CSS** for responsive, customizable designs. Key elements include sticky ads (`StickyHeaderAd.tsx`), modals, accordions (`FAQAccordion.tsx`), and admin tables. Theming uses CSS variables; accessibility via ARIA roles and semantic HTML; no i18n yet, but FAQ/TOC components support dynamic content.

## Development Tools Overview

Essential CLIs: `npm run dev` (hot reload), `npm run build`, `prisma db push/migrate`, `npm run lint`. Scripts handle seeding (`prisma/seed.ts`) and monitoring (`scripts/seo-monitor.ts`). See [Tooling](./tooling.md) for VS Code setup, Docker, and CI/CD.

## Getting Started Checklist

1. Clone the repo: `git clone <repo-url> && cd thecryptostartblog`.
2. Install deps: `npm install`.
3. Copy env: `cp .env.example .env` and fill DB_URL, NEXTAUTH_SECRET, etc.
4. Setup DB: `npx prisma generate && npx prisma db push` (or migrate).
5. Seed data: `npx prisma db seed`.
6. Run dev server: `npm run dev` — visit http://localhost:3000.
7. Verify: Check admin login (`/admin`), create a post, run SEO analysis.
8. Explore: Review [Development Workflow](./development-workflow.md) for tasks like PRs and testing.

## Next Steps

Positioned as a production-ready blog for crypto/startup niches, this powers organic growth via AI+SEO. Key stakeholders: content team (authors/admins), ops (monitoring scripts). Dive into [Architecture](./architecture.md) for layers, [codebase-map.json](./codebase-map.json) for symbols, or product specs in Notion/Google Docs (TBD). Contribute via issues/PRs!

## Related Resources

- [architecture.md](./architecture.md)
- [development-workflow.md](./development-workflow.md)
- [tooling.md](./tooling.md)
- [codebase-map.json](./codebase-map.json)
