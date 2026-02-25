# Documentation Hub

Welcome to the comprehensive documentation for **The Crypto Start Blog**, a Next.js-powered crypto startup blog with advanced SEO, AI optimization, admin panels, and content management features. This living documentation is auto-generated and maintained to help developers onboard quickly, understand the architecture, and contribute effectively.

Start with the [Project Overview](./project-overview.md) for high-level context, then explore specific guides.

## 🚀 Quick Start for Developers

1. **Clone & Install**:
   ```bash
   git clone <repo-url>
   cd thecryptostartblog
   npm install
   ```

2. **Database Setup**:
   - Use Prisma: `npx prisma generate && npx prisma db push`
   - Seed data: `npx prisma db seed`
   - See [SETUP_DATABASE.md](../SETUP_DATABASE.md) for details.

3. **Run Locally**:
   ```bash
   npm run dev
   ```
   - App: http://localhost:3000
   - Admin: http://localhost:3000/admin

4. **Key Commands**:
   | Command | Description |
   |---------|-------------|
   | `npm run dev` | Development server |
   | `npm run build` | Production build |
   | `npm run lint` | Lint code |
   | `npm run db:studio` | Open Prisma Studio |
   | `node scripts/seo-monitor.ts` | Run daily SEO monitoring |

## 📁 Repository Structure

```
.
├── app/                  # Next.js App Router pages & layouts
├── components/           # Reusable UI components (admin, blog, shared)
├── lib/                  # Core utilities, validators, SEO/AI tools
├── types/                # TypeScript definitions (blog, auth, roles)
├── prisma/               # Database schema & migrations
├── docs/                 # This documentation hub
├── scripts/              # Maintenance scripts (SEO monitoring, DB tests)
├── public/               # Static assets
├── styles/               # Tailwind/PostCSS configs
└── ...                   # See full snapshot below
```

**Full Snapshot**:
- `AGENTS.md`, `AUTH_ARCHITECTURE.md`, `CHANGELOG.md`, `CLAUDE.md`
- `app/`, `components/`, `data/`, `lib/`, `prisma/`, `prompts/`, `public/`, `scripts/`, `styles/`, `types/`
- Configs: `next.config.mjs`, `tailwind.config.ts`, `tsconfig.json`, `docker-compose.yml`, `Dockerfile`

## 🏗️ Architecture Overview

**Monolithic Next.js App** with App Router, Prisma ORM, and Tailwind CSS.

### Key Layers
- **Pages & Routes** (`app/`): Blog, admin dashboard, API endpoints (users, posts, SEO, auth).
- **Components** (`components/`): UI building blocks (FAQ, ads, newsletters, TOC).
- **Lib** (`lib/`): Business logic (SEO analyzer, AI optimization, post utils, spam prevention).
- **Data** (Prisma): Posts, authors, categories, comments, users with roles.

**Core Flows**:
- **Content Management**: Admin CRUD for posts/authors/categories.
- **SEO/AI Tools**: GSC integration, keyword gap analysis, content expansion suggestions.
- **Auth**: NextAuth.js with roles/permissions.
- **Monetization**: AdSense slots, newsletters, gated content.
- **Spam/Rate Limiting**: IP-based checks, AI spam detection.

**Dependencies** (High Impact):
- `scripts/seo-monitor.ts` (imported by 3 files)
- `lib/seo-analyzer.ts`, `lib/ai-optimization.ts`, `lib/gsc-client.ts`
- UI: `components/SocialComments.tsx`, `components/NewsletterCTALarge.tsx`

## 🔧 Public API & Key Exports

### Top Functions
| Export | File | Purpose |
|--------|------|---------|
| `analyzeSEO` | `lib/seo-analyzer.ts` | Comprehensive SEO audit (words, links, images, headings). |
| `calculateAIOptimizationScore` | `lib/ai-optimization.ts` | AI readiness score for content. |
| `getAllPosts`, `getPostBySlug` | `lib/posts.ts` | Post querying with pagination/search. |
| `generateMetadata`, `generateSchema` | `lib/seo.ts` | Dynamic SEO metadata & JSON-LD schemas. |
| `checkRateLimit`, `detectSpam` | `lib/spam-prevention.ts` | Abuse prevention. |
| `cn`, `calculateReadingTime` | `lib/utils.ts` | Utilities (clsx merge, reading time). |

### Top Types/Interfaces
- `BlogPost`, `Author`, `BlogCategory` (`types/blog.ts`)
- `SEOAnalysis`, `AIOptimizationScore` (analysis results)
- `UserWithRoles` (`types/auth.ts`)

### Pages/Components
- `BlogPage` (`app/blog/page.tsx`)
- `AdminLayout` (`app/admin/layout.tsx`)
- `FAQSection`, `TableOfContents`, ad components.

**Full Symbol Index**: See [Symbol Index](./symbols.md) (generated separately).

## 📚 Core Guides

| Guide | Description | Key Topics |
|-------|-------------|------------|
| [Project Overview](./project-overview.md) | High-level roadmap & goals | Features, milestones, tech decisions |
| [Architecture Notes](./architecture.md) | Deep dive into structure | Layers, data flow, dependencies |
| [Development Workflow](./development-workflow.md) | Daily dev processes | Git flow, PRs, CI/CD |
| [Testing Strategy](./testing-strategy.md) | QA & reliability | Unit/integration tests, coverage |
| [Glossary & Domain Concepts](./glossary.md) | Business terms | Crypto startups, SEO metrics, roles |
| [Security & Compliance](./security.md) | Auth, secrets, audits | NextAuth, rate limits, GDPR |
| [Tooling & Productivity](./tooling.md) | Dev tools & scripts | Prisma, Tailwind, scripts, Docker |

## 🔍 Search & Navigation

- **Code Search**: Use VS Code or `grep` for patterns (e.g., `grep -r "analyzeSEO" lib/`).
- **API Endpoints**: `app/api/` (users, admin/posts, seo/metrics, gsc/analytics).
- **Admin Features**: Posts, comments, categories, authors, SEO dashboard, AI scores.

## 🤝 Contributing

- Follow [development-workflow.md](./development-workflow.md).
- Lint & type-check before PRs.
- Run SEO monitor script daily in prod.

## 📈 Monitoring & Scripts

- **SEO Monitoring**: `node scripts/seo-monitor.ts` (broken links, keyword gaps).
- **DB Tests**: `node scripts/test-db.ts`.
- **Web Vitals**: Tracked via `lib/analytics.ts` to GA4.

For issues, see `CHANGELOG.md`, `FASE3_STATUS.md`, or open a ticket.

**Generated: $(date)** | **Updated from codebase analysis**
