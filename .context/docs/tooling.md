## Tooling & Productivity Guide

This guide covers the essential tools, scripts, and workflows to streamline development on the CryptoStartBlog project. The stack leverages Next.js with TypeScript, Prisma for database operations, Contentful for content management, and Docker for consistent local environments. Use these to set up quickly, enforce code quality, and boost efficiency. Follow the [development workflow](../development-workflow.md) for integrating these into your daily routine.

## Required Tooling

- **Node.js (v18.17.0 or higher)**  
  Powers the Next.js runtime, build tools, and scripts.  
  *Installation:* Download from [nodejs.org](https://nodejs.org/) or use `nvm install 20` (LTS recommended). Verify with `node -v`.  
  *Usage:* Runs `pnpm dev`, `pnpm build`, and all npm/pnpm scripts.

- **pnpm (v8.0.0 or higher)** *(preferred over npm/yarn for faster installs and disk efficiency)*  
  Package manager for dependencies.  
  *Installation:* `npm install -g pnpm` or via Homebrew: `brew install pnpm`. Verify: `pnpm -v`.  
  *Usage:* `pnpm install` to install deps; check `package.json` scripts.

- **Docker & Docker Compose (v2.20.0+)**  
  Local development environment for PostgreSQL (Prisma) and consistent services.  
  *Installation:* [Docker Desktop](https://www.docker.com/products/docker-desktop/). Verify: `docker --version` and `docker compose version`.  
  *Usage:* `docker compose up -d` starts DB; tear down with `docker compose down -v`.

- **Prisma CLI (v5.0.0+)**  
  Database ORM, migrations, and seeding.  
  *Installation:* `pnpm add -D prisma @prisma/client` then `pnpm prisma generate`.  
  *Usage:* `pnpm prisma db push` for dev schema sync; `pnpm prisma studio` for DB GUI.

- **Contentful CLI (optional but recommended for content editors)**  
  Manages Contentful spaces and environments.  
  *Installation:* `npm install -g contentful-cli`. Login: `contentful login`.  
  *Usage:* Sync env vars like `CONTENTFUL_SPACE_ID` for local fetches in `lib/contentful.ts`.

## Recommended Automation

Enforce code quality and speed up iteration with these built-in scripts from `package.json`. Run them manually or via hooks.

- **Linting & Formatting:**  
  `pnpm lint` (ESLint for TypeScript/Next.js issues).  
  `pnpm lint:fix` auto-fixes.  
  `pnpm format` (Prettier for consistent style).  
  *Pro Tip:* Add to VS Code tasks or use watch mode: `pnpm lint --watch`.

- **Pre-commit Hooks (Husky + lint-staged):**  
  Automatically runs `lint-staged` on staged files: ESLint, Prettier, and TypeScript checks.  
  Install: `pnpm dlx husky-init && pnpm exec lint-staged --install`.  
  *Config:* See `.husky/pre-commit` and `package.json#lint-staged`.

- **Build & Type Check:**  
  `pnpm build` (full Next.js build + type check).  
  `pnpm type-check` (isolated `tsc --noEmit`).

- **Dev Server:**  
  `pnpm dev` (starts Next.js with HMR; auto-reloads on changes).  
  Add `--turbo` for faster builds if using Turbopack.

- **Database Automation:**  
  `pnpm db:push` (Prisma schema sync).  
  `pnpm db:seed` (run `prisma/seed.ts` for sample data).  
  `pnpm db:studio` (open Prisma Studio at http://localhost:5555).

- **Contentful Scripts:**  
  Use `lib/contentful.ts` functions like `getAllPosts()` in ad-hoc scripts (e.g., `scripts/test-query.js` for testing queries).

Shortcuts: Bind to IDE (e.g., Ctrl+Shift+P > "Run Task: Lint") or shell aliases like `alias dev="pnpm dev"`.

## IDE / Editor Setup

**VS Code (recommended):** Install these extensions for early error catching and productivity:

- **ES7+ React/Redux/React-Native snippets** (dsznajder.es7-react-js-snippets): Next.js component templates.
- **Tailwind CSS IntelliSense** (bradlc.vscode-tailwindcss): Autocomplete classes (assumed Tailwind usage).
- **Prisma** (prisma.prisma): Schema highlighting, autocomplete, and migration helpers.
- **TypeScript Importer** (pmneo.tsimporter): Quick imports.
- **Error Lens** (usernamehw.errorlens): Inline error display.
- **Prettier - Code formatter** (esbenp.prettier-vscode): Auto-format on save.
- **GitLens** (eamodio.gitlens): Blame, history inline.

**.vscode/settings.json** snippet for auto-fix on save:
```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "prisma.trace.server": "verbose"
}
```

**Workspace Settings:** Open in VS Code, run `pnpm prisma generate` once.

## Productivity Tips

- **Terminal Aliases** (add to `~/.zshrc` or `~/.bashrc`):  
  ```
  alias dc="docker compose"
  alias dcu="dc up -d"
  alias dcd="dc down -v"
  alias dev="pnpm dev"
  alias lintf="pnpm lint:fix && pnpm format"
  ```

- **Container Workflow:** Always start with `docker compose up -d postgres` for Prisma. Use `pnpm db:push` post-pull. For full stack: `docker compose up` + `pnpm dev`.

- **Local Emulation:** Mock Contentful with env vars; test SEO with `pnpm build && pnpm start`. Use Prisma Studio for quick DB edits.

- **Shared Scripts:** Check `scripts/` for utils like `test-query.js`. Dotfiles: Fork [our repo's .devcontainer](https://code.visualstudio.com/docs/devcontainers/containers) for one-click setup.

For full setup, see [development-workflow.md](./development-workflow.md).
