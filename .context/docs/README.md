# The Crypto Start Blog - Documentation

Welcome to the comprehensive documentation for **The Crypto Start Blog**, a modern Next.js 14+ blog platform focused on cryptocurrency education, startup guides, and Web3 insights. Built with TypeScript, App Router, Contentful CMS for content, Prisma ORM for user data, and production-ready features including SEO optimization, NextAuth.js authentication, rate limiting, spam prevention, and an admin dashboard.

This documentation serves as your knowledge base for onboarding, development, deployment, and maintenance. Navigate via the sidebar or the guide index below.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 15+ (local or Docker)
- Contentful account (free tier sufficient)
- Optional: Vercel for deployment, Docker for local DB

### Setup Steps
1. **Clone & Install**:
   ```bash
   git clone <repo-url>
   cd thecryptostartblog
   npm install
   ```

2. **Environment Variables**:
   Copy `.env.example` to `.env.local` and configure:
   ```
   DATABASE_URL="postgresql://user:pass@localhost:5432/dbname"
   CONTENTFUL_SPACE_ID=your_space_id
   CONTENTFUL_ACCESS_TOKEN=your_delivery_token
   CONTENTFUL_PREVIEW_TOKEN=your_preview_token  # Optional
   NEXTAUTH_SECRET=openssl rand -base64 32  # Generate once
   NEXTAUTH_URL=http://localhost:3000
   UPSTASH_REDIS_REST_URL=...  # For rate limiting
   # Full list in lib/env.ts
   ```

3. **Database Setup**:
   ```bash
   npx prisma generate
   npx prisma db push  # Schema sync
   npx prisma db seed   # Optional: Seed users/roles
   npx prisma studio    # Explore DB
   ```

4. **Contentful Setup**:
   - Create a space/environment.
   - Install CLI: `npm i -g contentful-cli`
   - Define content types: `BlogPost`, `Category`, `Author` (see [CONTENTFUL_SETUP.md](./CONTENTFUL_SETUP.md)).
   - Import sample content if needed.

5. **Development**:
   ```bash
   npm run dev
   ```
   Visit [http://localhost:3000](http://localhost:3000).

6. **Build & Production**:
   ```bash
   npm run build
   npm run start
   ```

**Docker**: `docker-compose up` (includes Postgres + app).

## 🏗️ Architecture Overview

Next.js App Router with hybrid rendering (SSG/ISR for blog, SSR for admin).

| Layer | Directories | Key Tech/Features |
|-------|-------------|-------------------|
| **Pages/UI** | `app/` (blog, admin, about), `components/` | Tailwind, shadcn/ui, React Server Components |
| **API Routes** | `app/api/` (users, comments, auth) | Edge Runtime, Zod validation |
| **Data Layer** | Contentful (posts/categories), Prisma (users/comments) | ISR caching, pagination/search |
| **Auth & Security** | NextAuth.js, `lib/permissions.ts` | RBAC (User/Admin), CSRF, rate limiting (Upstash) |
| **Utils & Libs** | `lib/` (contentful.ts, seo.ts, utils.ts) | Custom errors, spam detection, Web Vitals |
| **Types** | `types/` (blog.ts, auth.ts) | Full TS coverage |

- **Routing**: `/` (home), `/blog` (listing), `/blog/[slug]` (post), `/admin` (dashboard), `/admin/users`, `/login`.
- **Middleware**: `middleware.ts` - Auth guards, IP-based rate limits.
- **Providers**: `AuthProvider` in `app/layout.tsx`.

**Data Flow Example** (Blog Post):
```tsx
// app/blog/[slug]/page.tsx
import { getPostBySlug } from '@/lib/contentful';
export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getPostBySlug(params.slug);
  return <PostContent post={post} />;
}
```

Cross-references:
- [Architecture Deep Dive](./architecture.md)
- [Data Models](./glossary.md)

## ✨ Key Features & Public API

50+ exported symbols for extensibility.

### Core Functions
| Function | File | Purpose | Example |
|----------|------|---------|---------|
| `getAllPosts(options: PaginationOptions)` | `lib/contentful.ts` | Fetch paginated posts | `getAllPosts({ limit: 10, skip: 0 })` |
| `getPostBySlug(slug: string)` | `lib/contentful.ts` | Single post fetch | Used in `/blog/[slug]` |
| `generateMetadata(props: MetadataInput)` | `lib/seo.ts` | Dynamic SEO | Auto OpenGraph/JSON-LD |
| `calculateReadingTime(text: string)` | `lib/utils.ts` | Est. read time | `~5 min read` |
| `checkRateLimit(ip: string, identifier: string)` | `lib/rate-limit.ts` | Upstash-backed limits | API routes |
| `detectSpam(content: string, ip: string)` | `lib/spam-prevention.ts` | AI-free spam filter | Comments |

### Key Types/Interfaces
- `BlogPost` (`types/blog.ts:61`): Full post shape (title, slug, content, author).
- `BlogCategory` (`types/blog.ts:15`): Categories like "DeFi", "NFTs".
- `UserWithRoles` (`types/auth.ts:26`): Users + RBAC.
- `RolePermissions` (`types/roles.ts:31`): Admin/User perms.

### Components
- `CommentsList` (`components/CommentsList.tsx`): Nested comments.
- `AuthProvider` (`components/AuthProvider.tsx`): Session wrapper.
- Reusable: `CategoryLinks`, `Footer`, `ExitIntentPopup`.

**Security Utils**:
- `hasRole(session: Session, role: string)` (`lib/permissions.ts`).
- Custom errors: `AppError`, `RateLimitError` (`lib/errors.ts`).

Full [Symbol Index](./symbols.md) (classes, interfaces, functions).

## 📁 Repository Structure

```
.
├── app/                    # Pages & API routes
│   ├── api/                # users/, comments/, auth/
│   ├── admin/              # Protected dashboard
│   ├── blog/               # Posts & listing
│   └── layout.tsx          # Root + providers
├── components/             # UI: Sidebar, TOC, Ads, Newsletter
├── lib/                    # Business logic: contentful, seo, utils
├── types/                  # TS defs: blog.ts (BlogPost, etc.)
├── prisma/                 # schema.prisma, seed.ts
├── public/                 # Images, favicon
├── docs/                   # This site (MDX-powered)
├── middleware.ts           # Guards
├── next.config.mjs         # ISR, images
└── package.json            # Next.js 14, @contentful, prisma
```

**Key Dependencies**:
- `lib/contentful.ts`: Imported by blog pages.
- `lib/seo.ts`: Metadata everywhere.
- `components/SocialComments.tsx`: Used in post views.

[Full Snapshot](#repository-snapshot) | [Dependency Graph](./architecture.md#dependencies)

## 📚 Guides & References

| Category | Guides |
|----------|--------|
| **Setup** | [Contentful](./CONTENTFUL_SETUP.md), [Database](./SETUP_DATABASE.md) |
| **Development** | [Workflow](./development-workflow.md), [Testing](./testing-strategy.md) |
| **Advanced** | [Security](./security.md), [SEO](./seo-guide.md), [Admin RBAC](./permissions.md) |
| **Domain** | [Glossary](./glossary.md): BlogPost, CategoryConfig |
| **Ops** | [Deployment](./deployment.md), [Monitoring](./monitoring.md) |

## 🔧 Tooling & Commands

```bash
npm run dev      # Turbopack dev server
npm run build    # Production build
npm run lint     # ESLint + Prettier
npm run db:push  # Prisma sync
npm run db:seed  # Sample data
npx prisma studio # DB GUI
```

- **Editor**: VS Code + Tailwind IntelliSense, Prisma extension.
- **Testing**: Jest (utils), Playwright (E2E) planned.

## 🤝 Contributing

1. Branch: `feat/your-feature` or `fix/issue`.
2. Commit: Conventional (e.g., `feat(blog): add search`).
3. PR: Linked issues, changelog update.
4. Tests: `__tests__/`, >80% coverage.

See [CHANGELOG.md](CHANGELOG.md), [Development Workflow](./development-workflow.md).

## 🚨 Troubleshooting

| Issue | Fix |
|-------|-----|
| Contentful fetch fails | Verify `CONTENTFUL_SPACE_ID`/`ACCESS_TOKEN` |
| Prisma connection error | Check `DATABASE_URL`, run `db:push` |
| Rate limit exceeded | Configure Upstash Redis |
| Auth session mismatch | Match `NEXTAUTH_URL` to deploy URL |
| Build ISR errors | `revalidatePath('/blog')` in cron |

## 📈 Monitoring & Perf

- **Web Vitals**: `lib/analytics.ts` tracks LCP/FID/CLS to GA4.
- **SEO**: Sitemap (`app/sitemap.ts`), schemas (`lib/seo.ts`).
- **Ads**: AdSense slots in `StickyHeaderAd`, `RecommendedContent`.

## 📄 License

MIT. Credits: Next.js, Contentful, shadcn/ui, Prisma.

**Last Updated**: From codebase analysis (symbols, exports). Regenerate via docs generator.

### Repository Snapshot
```
app/ AUTH_ARCHITECTURE.md components/ CONTENTFUL_SETUP.md CORE_WEB_VITALS.md
docker-compose.yml Dockerfile FASE3_STATUS.md lib/ prisma/ prompts/ public/
scripts/ types/ ... (full list in context)
```
