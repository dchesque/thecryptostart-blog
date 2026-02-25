## Tooling & Productivity Guide

This guide outlines the essential tools, scripts, automation setups, and configurations that streamline development for this Next.js blog platform. By following these recommendations, contributors can maintain code quality, ensure consistent workflows, and leverage productivity boosters like automated linting, database seeding, and SEO monitoring scripts.

The project uses TypeScript, Prisma for database management, Tailwind CSS with shadcn/ui components, and Next.js App Router. Setups focus on fast iteration, error prevention, and deployment readiness.

## Required Tooling

- **Node.js** (v18+ required)
  - Powers the Next.js runtime, build process, and scripts.
  - Installation: Use [nvm](https://github.com/nvm-sh/nvm):
    ```bash
    nvm install 18
    nvm use
    ```
  - Check `.nvmrc` in the root for the pinned version.

- **Package Manager** (pnpm recommended, npm/yarn supported)
  - Manages dependencies like Next.js, Prisma, and Zod.
  - Installation:
    ```bash
    # pnpm (fastest, uses lockfile)
    curl -fsSL https://get.pnpm.io/install.sh | sh -

    # Install deps
    pnpm install
    ```

- **Prisma CLI** (included via devDependencies)
  - Handles database migrations, seeding, and introspection.
  - Installation: Auto-installed with `pnpm install`.
  - Key commands:
    ```bash
    npx prisma generate     # Generate Prisma Client
    npx prisma db push      # Sync schema to DB (dev)
    npx prisma migrate dev  # Create and apply migrations
    npx prisma studio       # Open DB GUI
    ```

- **Google Search Console API** (via lib/gsc-client.ts)
  - Requires OAuth credentials for SEO analytics scripts.
  - Setup: Follow [Google API Console](https://console.developers.google.com/) for service account; env vars: `GSC_CREDENTIALS_JSON`.

## Recommended Automation

**Pre-commit Hooks** (via Husky + lint-staged):
- Automatically runs ESLint, Prettier formatting, and TypeScript checks before commits.
- Commit messages enforced with commitlint (Conventional Commits format: `feat: add seo monitor`).
- Setup (auto-runs on `pnpm install`):
  ```bash
  pnpm dlx husky install
  ```

**Code Quality Commands**:
```bash
pnpm lint          # ESLint: strict rules for TS/JS/imports
pnpm lint:fix      # Auto-fix lint issues
pnpm format        # Prettier: format all files
pnpm typecheck     # tsc --noEmit: full type checking
pnpm check         # All-in-one: lint + format + typecheck
```

**Build & Test Automation**:
```bash
pnpm build         # Next.js production build + telemetry check
pnpm test          # Vitest unit/integration tests
pnpm test:watch    # Watch mode for TDD
pnpm db:test       # Run test-db.ts: validate DB schema/connections
pnpm db:seed       # prisma/seed.ts: populate dev DB with sample posts/authors/categories
pnpm seo:monitor   # seo-monitor.ts: daily GSC analytics, broken links, SEO scores
```

**Watch Modes**:
- `pnpm dev`: Next.js dev server with HMR, Tailwind JIT, Prisma acceleration.
- `pnpm test:watch`: Interactive test runner.

**Custom Scripts**:
- **SEO Monitoring** (`scripts/seo-monitor.ts`): Runs `runDailySEOMonitoring()` to fetch GSC data, check broken links (lib/broken-link-finder.ts), analyze SEO (lib/seo-analyzer.ts), and log AI optimization scores (lib/ai-optimization.ts). Schedule via cron: `0 2 * * * cd /path/to/repo && pnpm seo:monitor`.
- **DB Testing** (`scripts/test-db.ts`): Validates Prisma connections and queries.
- Integrate with [development-workflow.md](./development-workflow.md) for CI/CD pipelines.

## IDE / Editor Setup

**VS Code Extensions** (see `.vscode/extensions.json`):
- **ESLint** (@vscode-eslint): Real-time linting.
- **Prettier - Code formatter** (esbenp.prettier-vscode): Auto-format on save.
- **TypeScript Importer** / **TypeScript + JavaScript Language Features**: IntelliSense for types (e.g., BlogPost, AIOptimizationScore).
- **Tailwind CSS IntelliSense** (bradlc.vscode-tailwindcss): Autocomplete for `cn()` utility classes.
- **Prisma** (prisma.vscode-prisma): Schema visualization and query builder.
- **Error Lens** (usernamehw.errorlens): Inline error/warning highlights.
- **GitLens** (eamodio.gitlens): Advanced Git blame/history.

**Workspace Settings** (`.vscode/settings.json`):
- Formats on save, ESLint auto-fix, Tailwind suggestions.
- Debug configs in `launch.json` for API routes (e.g., /api/admin/posts) and Next.js.

**Key Snippets** (add to VS Code):
```json
// prisma-query.jsonc
{
  "Prisma Query": {
    "prefix": "prisma",
    "body": ["const ${1:data} = await prisma.${2:model}.findMany({", "\twhere: { $3 },", "});"]
  }
}
```

## Productivity Tips

**Terminal Aliases** (add to `~/.zshrc` or `~/.bashrc`):
```bash
alias nr='pnpm run'
alias nrd='pnpm run dev'
alias nrb='pnpm run build'
alias nrt='pnpm run test'
alias nrdb='pnpm run db:seed'
alias nrseo='pnpm run seo:monitor'
alias clean='pnpm run clean && rm -rf .next node_modules/.cache'
```

**Workflow Shortcuts**:
- **Full PR Check**: `pnpm check && pnpm build && pnpm test`.
- **Local DB Reset**: `pnpm db:test && pnpm db:seed`.
- **Hot Reload Debugging**: Use `pnpm dev` + VS Code debugger on port 3000.
- **Env Management**: Copy `.env.example` to `.env.local`; use `direnv` for auto-loading.
- **Containerized Dev** (optional): Docker Compose for Postgres + app (see `docker-compose.dev.yml` if present).

For full workflows, see [development-workflow.md](./development-workflow.md).
