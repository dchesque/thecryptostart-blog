# Project Rules and Guidelines

> Auto-generated from .context/docs on 2026-02-19T12:33:45.569Z

## README

# The Crypto Start Blog - Documentation

Welcome to the comprehensive documentation for **The Crypto Start Blog**, a modern Next.js blog platform focused on cryptocurrency education, startup guides, and Web3 insights. Built with TypeScript, App Router, a self-hosted PostgreSQL/Prisma CMS, and production-ready features like SEO optimization, authentication, rate limiting, and an admin dashboard.

This docs site serves as your knowledge base. Use the sidebar or the guide index below to navigate.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL (via Docker or local)
- Vercel or similar for deployment (optional)

### Setup Steps
1. **Clone & Install**:
   ```bash
   git clone <repo-url>
   cd thecryptostartblog
   npm install
   ```

2. **Environment Variables** (copy `.env.example` to `.env.local`):
   ```
   DATABASE_URL="postgresql://..."
   NEXTAUTH_SECRET=...
   NEXTAUTH_URL=http://localhost:3000
   # See lib/env.ts for full list
   ```

3. **Database**:
   ```bash
   npx prisma generate
   npx prisma db push  # Or migrate
   npx prisma db seed   # Optional: seed.ts
   ```

4. **Run Dev Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000)

5. **Build & Deploy**:
   ```bash
   npm run build
   npm run start
   ```

For Docker: `docker-compose up`

## 🏗️ Architecture Overview

| Layer | Key Components | Tech |
|-------|----------------|------|
| **Frontend** | App Router pages (`app/`), Components (`components/`) | Next.js 14+, Tailwind CSS, shadcn/ui |
| **Backend** | API Routes (`app/api/`), Lib utils | Prisma, NextAuth.js, Upstash Rate Limit |
| **Data** | Blog Posts/Categories (CMS), Users/Roles (DB) | PostgreSQL, Prisma |
| **Auth** | Session-based (NextAuth), RBAC | Credentials + Database provider |
| **SEO/Perf** | Metadata API, Schema.org, Sitemap | next-seo patterns, Core Web Vitals optimized |

- **Pages**: Home (`/`), Blog (`/blog`), Post (`/blog/[slug]`), Admin (`/admin`), About (`/about`), Login (`/login`)
- **Key Libs**: `lib/posts.ts` (Data layer), `lib/seo.ts` (structured data), `lib/permissions.ts` (RBAC)
- **Middleware**: Auth guards, rate limiting (`middleware.ts`)

See [Architecture Notes](./architecture.md) for diagrams and ADRs.

## ✨ Key Features

- **Dynamic Blog**: Fetch posts/categories from PostgreSQL with pagination, search, related posts.
  ```ts
  // Example: lib/posts.ts
  export const getAllPosts = async (options: PaginationOptions) => { ... };
  ```
- **Authentication**: Register/Login, Admin-only routes, Role-based access (User/Admin).
- **Admin Dashboard**: User management (`/admin/users`), Posts, Categories, Authors management protected with `hasRole`.
- **SEO Optimized**: Auto-generated metadata, JSON-LD schemas (Breadcrumb, Organization, Website).
- **Performance**: SSG/ISR for posts, reading time calc, Markdown TOC extraction, AdSense integration.
- **Security**: CSRF protection, rate limiting, Zod validations.
- **Utils**: `calculateReadingTime`, `formatDate`, custom errors (AppError, RateLimitError).

Public API exports: 50+ functions/types (e.g., `BlogPost`, `getPostBySlug`, `generateMetadata`).

## 📁 Repository Structure

```
.
├── app/                 # Next.js App Router (pages, API routes)
│   ├── api/             # Auth, users, admin, register
│   ├── admin/           # Dashboard, users, posts, categories, authors
│   ├── blog/            # Listing, [slug]
│   ├── layout.tsx       # Root layout + AuthProvider
│   └── globals.css
├── components/          # Reusable UI (TOC, Sidebar, Footer, AdSense)
├── lib/                 # Core logic (posts, seo, utils, prisma)
├── types/               # TS interfaces (blog.ts, auth.ts, roles.ts)
├── prisma/              # Schema, seed.ts
├── public/              # Static assets
├── docs/                # This docs site
├── scripts/             # Utils (test-query.js)
├── styles/              # Tailwind/PostCSS
├── middleware.ts        # Edge runtime guards
├── next.config.mjs      # Images, env
├── tailwind.config.ts
├── package.json         # Turbopack, shadcn, react-markdown
└── ... (Dockerfile, etc.)
```

Full snapshot: See [Repository Snapshot](#repository-snapshot).

## 📚 Core Guides

| Guide | Description | Key Topics |
|-------|-------------|------------|
| [Project Overview](./project-overview.md) | High-level roadmap, goals, stakeholders | Milestones, FASE3_STATUS.md |
| [Architecture Notes](./architecture.md) | Deep dive into layers, data flow | Dependency graph, symbols index |
| [Development Workflow](./development-workflow.md) | Git flow, PRs, CI/CD | Branching, CHANGELOG.md |
| [Testing Strategy](./testing-strategy.md) | Unit/E2E, coverage | Jest, Playwright plans |
| [Glossary & Domain Concepts](./glossary.md) | Terms: BlogPost, RolePermissions | Crypto/blog domain |
| [Security & Compliance](./security.md) | Auth model, secrets, rate limits | AUTH_ARCHITECTURE.md |
| [Tooling & Productivity](./tooling.md) | Scripts, IDE setup, linting | shadcn, Prisma Studio |
| [Database Setup](./SETUP_DATABASE.md) | Prisma migrations | Docker Postgres |

## 🔧 Tooling & Scripts

- `npm run dev` / `build` / `start` / `lint` / `type-check`
- `npx prisma studio` - DB explorer
- `npm run db:seed` - Run seed.ts

## 🤝 Contributing

1. Fork & branch: `feat/your-feature`
2. Commit conventionally: `feat: add TOC extraction`
3. PR with changelog entry
4. Tests: Add to `__tests__/` (expand coverage)

See [Development Workflow](./development-workflow.md).

## 📈 Metrics & Monitoring

- **Core Web Vitals**: Optimized (see CORE_WEB_VITALS.md)
- **Analytics**: Google Analytics/Tag Manager ready
- **Deployment**: Vercel preview deploys auto

## 🚨 Troubleshooting

| Issue | Solution |
|-------|----------|
| Prisma connect fail | Verify DATABASE_URL |
| Auth mismatch | Sync NEXTAUTH_URL |
| Rate limit hit | Upstash Redis config |

Report issues with reproduction steps.

## 📄 License & Credits

MIT License. Powered by Next.js, Prisma, PostgreSQL.

---

**Last Updated**: Auto-generated from codebase analysis. Edit prompts/ for regenerations.

### Repository Snapshot
```
app/ AUTH_ARCHITECTURE.md/ auth.ts/ CHANGELOG.md/ components/
CORE_WEB_VITALS.md/ data/ docker-compose.yml/
Dockerfile/ FASE3_STATUS.md/ lib/ middleware.ts/ next-env.d.ts/
next.config.mjs/ package-lock.json/ package.json/ postcss.config.js/
prisma/ prompts/ public/ README.md/ scripts/ SETUP_DATABASE.md/
styles/ tailwind.config.ts/ tsconfig.json/ types/
```
