# Tooling & Productivity Guide

This guide covers essential tools, scripts, and workflows for developing the CryptoStartBlog project—a Next.js 14 App Router application with TypeScript, Prisma (PostgreSQL ORM), Contentful (headless CMS), and authentication via NextAuth. It emphasizes code quality, fast iteration, and consistent environments using Docker. Integrate with the [development workflow](../development-workflow.md) for daily use.

## Required Tooling

### Node.js (v18.17+; LTS v20 recommended)
- **Purpose**: Runs Next.js dev server, builds, and pnpm scripts.
- **Installation**: [nodejs.org](https://nodejs.org/) or `nvm install 20 && nvm use 20`.
- **Verify**: `node -v`.
- **Usage**: `pnpm dev` (HMR-enabled dev server at `http://localhost:3000`).

### pnpm (v8+; preferred for monorepo-like efficiency)
- **Purpose**: Dependency management; faster and more disk-efficient than npm/yarn.
- **Installation**: `npm i -g pnpm` or `brew install pnpm`.
- **Verify**: `pnpm -v`.
- **Usage**:
  ```bash
  pnpm install  # Installs from package.json/lockfile
  pnpm add lodash  # Add dependency
  ```

### Docker & Docker Compose (v2.20+)
- **Purpose**: Local PostgreSQL for Prisma; reproducible envs.
- **Installation**: [Docker Desktop](https://www.docker.com/products/docker-desktop/).
- **Verify**: `docker --version && docker compose version`.
- **Usage**:
  ```bash
  docker compose up -d postgres  # Start DB (exposes port 5432)
  docker compose down -v        # Stop + clear volumes
  docker compose logs postgres  # View logs
  ```
- **Config**: See `docker-compose.yml` (Prisma DB with `DATABASE_URL` env).

### Prisma CLI (v5+)
- **Purpose**: Schema management, migrations, introspection, Studio GUI.
- **Installation**: Included via `pnpm i -D prisma @prisma/client`; run `pnpm prisma generate`.
- **Key Commands** (aliased in `package.json`):
  | Script | Command | Purpose |
  |--------|---------|---------|
  | `pnpm db:push` | `prisma db push` | Sync schema to DB (dev/prod). |
  | `pnpm db:generate` | `prisma generate` | Regen Prisma Client. |
  | `pnpm db:migrate` | `prisma migrate dev` | Create migration. |
  | `pnpm db:seed` | `prisma db seed` | Seed sample data (`prisma/seed.ts`). |
  | `pnpm db:studio` | `prisma studio` | DB explorer at `http://localhost:5555`. |
- **Cross-ref**: Prisma usage in API routes (e.g., `app/api/users/route.ts` uses `PrismaClientSingleton`).

### Contentful CLI (optional; for CMS admins)
- **Purpose**: Manage spaces/envs; sync previews.
- **Installation**: `npm i -g @contentful/cli`.
- **Usage**:
  ```bash
  contentful login
  contentful space env list --space-id $CONTENTFUL_SPACE_ID
  ```
- **Local Integration**: Set `CONTENTFUL_SPACE_ID`, `CONTENTFUL_ACCESS_TOKEN` in `.env.local`. Test queries via `lib/contentful.ts` functions like `getAllPosts()` or `getPostBySlug()`.

## Core Scripts (from `package.json`)

Run via `pnpm <script>`. Full list:
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "format": "prettier --write .",
    "type-check": "tsc --noEmit",
    "db:push": "prisma db push",
    "db:generate": "prisma generate",
    "db:seed": "tsx prisma/seed.ts",
    "db:studio": "prisma studio"
  }
}
```

| Script | Purpose | Example |
|--------|---------|---------|
| `pnpm dev` | Dev server w/ Turbopack (add `--turbo`). | Auto-reloads; watches `app/`, `lib/`, `components/`. |
| `pnpm build` | Production build + type-check. | Validates SEO (`lib/seo.ts`), Contentful fetches. |
| `pnpm lint` / `pnpm lint:fix` | ESLint (TSX, Next.js rules). | Checks API routes (e.g., `app/api/comments/route.ts`). |
| `pnpm format` | Prettier formatting. | Enforces style in `types/blog.ts`, utils. |
| `pnpm type-check` | Isolated TSC. | Validates types like `BlogPost`, `UserWithRoles`. |

## Git Hooks & Automation
- **Husky + lint-staged**: Pre-commit runs ESLint/Prettier/TS on staged files.
  - **Setup**: `pnpm dlx husky-init && pnpm lint-staged`.
  - **Config**: `.husky/pre-commit` → `npx lint-staged`.
- **VS Code Integration**: Tasks for `lint`, `build` (Ctrl+Shift+P > "Tasks: Run Task").

## IDE Setup (VS Code Recommended)

Install extensions:
- **Tailwind CSS IntelliSense** (bradlc.tailwindcss-intellisense): Class autocomplete (used in components like `CategoryCard.tsx`).
- **Prisma** (prisma.vscode): Schema autocomplete (`prisma/schema.prisma`).
- **ESLint** (dbaeumer.vscode-eslint): Real-time linting.
- **Prettier** (esbenp.prettier-vscode): Format on save.
- **TypeScript Importer** (pmneo.tsimporter): Auto-imports (e.g., `lib/contentful.ts`).
- **Error Lens** (usernamehw.errorlens): Inline errors.
- **GitLens** (eamodio.gitlens): Commit history.

**`.vscode/settings.json`**:
```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "typescript.suggest.autoImports": true,
  "prisma.trace.server": "verbose"
}
```

**Dev Container**: Use `.devcontainer/devcontainer.json` for one-click Docker + VS Code setup.

## Environment & Secrets
- **`.env.local` Template** (from `.env.example`):
  ```
  DATABASE_URL="postgresql://user:pass@localhost:5432/db"
  NEXTAUTH_SECRET="..."
  CONTENTFUL_SPACE_ID="..."
  CONTENTFUL_ACCESS_TOKEN="..."
  ```
- **Rate Limiting/Spam**: Uses Upstash Redis (`REDIS_URL`); see `lib/rate-limit.ts`, `lib/spam-prevention.ts`.

## Productivity Tips
- **Aliases** (`~/.zshrc` / `~/.bashrc`):
  ```bash
  alias dev="pnpm dev"
  alias lintf="pnpm lint:fix && pnpm format"
  alias dbp="pnpm db:push && pnpm db:generate"
  alias dc="docker compose"
  ```
- **Workflow**:
  1. `docker compose up -d postgres`
  2. `pnpm db:push`
  3. `pnpm dev`
- **Testing Contentful**: Create `scripts/test-contentful.ts`:
  ```ts
  import { getAllPosts } from '@/lib/contentful';
  async function test() {
    const posts = await getAllPosts();
    console.log(posts.length);
  }
  test();
  ```
  Run: `pnpm tsx scripts/test-contentful.ts`.
- **Debugging**:
  - API: Visit `/api/users`, `/api/comments`.
  - Errors: Custom classes like `AppError`, `RateLimitError` in `lib/errors.ts`.
  - Analytics: `lib/analytics.ts` for Web Vitals/Ads.
- **Deployment**: Vercel (Next.js optimized); preview deploys auto-run `pnpm build`.

For troubleshooting, check `lib/prisma.ts` (singleton client), `lib/permissions.ts` (roles), or open an issue. See [development-workflow.md](../development-workflow.md) for branching/CI.
