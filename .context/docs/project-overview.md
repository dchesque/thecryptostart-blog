## Project Overview

Hey there! The Crypto Start Blog is a modern, SEO-optimized blog platform built for sharing deep dives into crypto startups, trading tips, and industry news. It tackles the pain of content management by hooking into Contentful as a headless CMS, letting writers focus on stories while devs handle a slick Next.js frontend with search, categories, and related posts. Readers win with fast loads and discoverability, admins get user management and auth goodies, and everyone enjoys a scalable, monetizable setup ready for growth.

## Codebase Reference

> **Detailed Analysis**: For complete symbol counts, architecture layers, and dependency graphs, see [`codebase-map.json`](./codebase-map.json).

## Quick Facts

- Root: `C:\Workspace\thecryptostartblog`
- Languages: TypeScript (42 files), JavaScript (8 files)
- Total Files: 50
- Total Symbols: 92
- Entry: `app/layout.tsx`
- Full analysis: [`codebase-map.json`](./codebase-map.json)

## Entry Points

- [`app/layout.tsx`](../app/layout.tsx) — Root layout with auth provider and global structure (line ~1)
- [`app/page.tsx`](../app/page.tsx) — Home/landing page (inferred entry)
- [`app/blog/page.tsx`](../app/blog/page.tsx#L17) — Blog index with pagination and search
- [`app/blog/[slug]/page.tsx`](../app/blog/[slug]/page.tsx#L25) — Dynamic post viewer with `generateStaticParams`
- [`app/admin/page.tsx`](../app/admin/page.tsx#L3) — Admin dashboard entry

## Key Exports

- `BlogPost` (interface) @ types\blog.ts:61 — Core type for blog content
- `getPostBySlug` (function) @ lib\contentful.ts:179 — Fetch individual posts from Contentful
- `generateMetadata` (function) @ lib\seo.ts:24 — SEO metadata generator
- `AuthProvider` (component) @ components\AuthProvider.tsx:5 — Authentication wrapper
- `AdminDashboard` (page) @ app\admin\page.tsx:3 — Admin panel entry

> See [`codebase-map.json`](./codebase-map.json) for the complete list.

## File Structure & Code Organization

- `app/` — Next.js App Router pages, layouts, and API routes (blog, admin, auth, users).
- `components/` — Reusable React components (e.g., `Footer`, `TableOfContents`, `BlogPost`, `AdSense`).
- `lib/` — Utilities for Contentful integration, SEO, rate limiting, permissions, CSRF, and validations.
- `types/` — TypeScript definitions for blog posts, auth sessions, roles, and SEO props.
- `prisma/` — Database schema, migrations, and seed script (`seed.ts`).
- `docs/` — Project docs including setup guides like `CONTENTFUL_SETUP.md`.
- `public/` — Static assets (images, favicons).
- `scripts/` — Misc utilities like query tests.
- Root MDs (e.g., `AUTH_ARCHITECTURE.md`, `CORE_WEB_VITALS.md`) — Guides for auth and performance.

## Technology Stack Summary

This Next.js project runs on Node.js, blending TypeScript for type safety with JavaScript for scripts. It's a fullstack web app using server-side rendering (SSR), static generation (SSG), and API routes. Build tooling includes Docker/Docker Compose for containerization, npm for dependencies, and likely ESLint/Prettier for linting/formatting (standard Next.js setup). Prisma handles the DB layer, with Contentful for content delivery.

## Core Framework Stack

- **Backend/Data**: Next.js App Router for APIs/server logic; Prisma ORM for user/role data; Contentful for blog CMS—enforces clean separation with typed queries and caching.
- **Frontend**: React Server Components (RSC) pattern for efficient rendering; SEO-first with dynamic metadata.
- **Auth/Messaging**: NextAuth.js (inferred from routes) for sessions/OAuth; custom permissions/roles system.

## UI & Interaction Libraries

Custom React components handle UI (e.g., `ShareButtons`, `RelatedPosts`, `FAQ`), paired with Tailwind CSS (inferred from structure). AdSense integration for monetization (`AdSense.tsx`). Focus on accessibility via semantic HTML in pages; no heavy UI kit, keeping it lightweight with responsive design and TOC for long posts.

## Development Tools Overview

Core CLIs: `npm run dev` for hot-reload server, `npm run build` for production, `docker-compose up` for containerized setup (DB + app). Prisma tools like `npx prisma db push` and `npx prisma studio`. Check [`tooling.md`](./tooling.md) for full setup, env vars, and scripts.

## Getting Started Checklist

1. Clone or navigate to `C:\Workspace\thecryptostartblog`.
2. Install dependencies: `npm install`.
3. Copy `.env.example` to `.env.local`; add keys for Contentful, Prisma DB, NextAuth (see `CONTENTFUL_SETUP.md`).
4. Run DB setup: `npx prisma generate && npx prisma db push && npx prisma db seed`.
5. Start dev server: `npm run dev`.
6. Verify: Open http://localhost:3000—check home/blog page loads posts, try /admin (login if seeded).
7. Explore: Read [`development-workflow.md`](./development-workflow.md) for testing/CI.

## Next Steps

Positioned as a production-ready crypto blog, prioritize Contentful setup and custom domain deployment. Key stakeholders: content team (CMS), devs (extending APIs), readers (feedback on UX). Dive into [`architecture.md`](./architecture.md) for layers, or external specs in root MDs like `AUTH_ARCHITECTURE.md`. Contribute via PRs after reviewing [`codebase-map.json`](./codebase-map.json).
