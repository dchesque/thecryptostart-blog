# API Audit & MCP Expansion Plan

> Generated: 2026-04-30
> Branch: `claude/audit-blog-api-1wkNb`
> Scope: full audit of `/app/api/**`, `proxy.ts` (middleware), Prisma data layer,
> RBAC, rate-limiting, and how each route is consumed by pages/components.

---

## 1. Summary

The codebase already had **35 endpoints** focused almost entirely on the admin
panel. There was **no public read-only API** (the public site reads Prisma
directly via `lib/posts.ts`), so external consumers — mobile apps, the planned
MCP server, n8n/Python automations — had no contract to talk to.

This audit:

1. Mapped every route, every consumer, every guard.
2. Found and fixed **2 real bugs** and **6 hardening gaps**.
3. Added **15 new endpoints** so the public surface, newsletter, and
   on-demand revalidation are 100 % covered.
4. Drafts an MCP server (Section 7) that re-uses the new public + admin API
   without re-implementing Prisma logic.

---

## 2. Bugs found & fixed

| # | Location | Bug | Fix |
|---|----------|-----|-----|
| B1 | `app/api/gsc/health/route.ts` | Read API key from `NextResponse.next().url` and `.headers` — that constructs a **new** outbound response, not the incoming request. The `?key=` / `x-api-key` path was effectively dead. | Receive `request: Request`, parse `request.url` and `request.headers`. |
| B2 | `app/api/gsc/analytics/route.ts` | Only honored session auth, contradicting the documented `ADMIN_API_KEY` contract enforced everywhere else. | Switched to `checkApiAuth(request)`. |

## 3. Hardening gaps fixed

| # | Where | Issue | Fix |
|---|-------|-------|-----|
| H1 | `/api/admin/posts/[id]` (GET/PUT/DELETE) | Relied solely on middleware, no defense-in-depth | Added `checkApiAuth` |
| H2 | `/api/admin/posts/[id]/publish` | Same as above | Added `checkApiAuth` |
| H3 | `/api/admin/categories/[id]` | Same as above | Added `checkApiAuth` |
| H4 | `/api/admin/authors/[id]` | Same as above | Added `checkApiAuth` |
| H5 | `/api/admin/comments/[id]` | Same as above | Added `checkApiAuth` |
| H6 | PUT/DELETE on posts/categories/authors/comments | No `revalidatePath` — public pages stayed stale until next ISR window | Added targeted `revalidatePath` calls (`/`, `/blog`, `/blog/<slug>`, `/sitemap.xml`) |

The middleware (`proxy.ts`) already blocks unauthenticated `/api/admin/*`, so
none of the above were CVE-class — but defense in depth means a misconfigured
matcher cannot silently expose an admin handler.

## 4. Coverage gaps closed (new endpoints)

### 4.1 Public read API (the big one)

The public site (`app/page.tsx`, `app/blog/**`) hits `lib/posts.ts` directly.
External consumers (mobile, MCP, n8n, third-party renderers) had no entry point.

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/posts` | List PUBLISHED posts; pagination, `category`, `tag` filter |
| GET | `/api/posts/[slug]` | Single post by slug |
| GET | `/api/posts/[slug]/related` | Related posts (manual list → category fallback) |
| GET | `/api/posts/featured` | Featured posts |
| GET | `/api/categories` | Category list with published-post counts |
| GET | `/api/categories/[slug]` | Category detail + paginated posts |
| GET | `/api/authors` | Authors that have at least one published post |
| GET | `/api/authors/[slug]` | Author detail + paginated published posts |
| GET | `/api/search?q=` | Search title/excerpt over PUBLISHED posts |
| GET | `/api/tags` | Distinct tags + occurrence counts |
| GET | `/api/stats` | Aggregate counts (posts, categories, authors, comments) |

All read-only, no auth, cached by the existing `Cache-Control: public,
s-maxage=60, stale-while-revalidate=86400` header in `next.config.mjs`.

### 4.2 Newsletter (the `// TODO: Wire to /api/newsletter` was real)

Schema gained `NewsletterSubscriber` model + `SubscriberStatus` enum. Migration:
`prisma/migrations/20260430_newsletter_subscriber/migration.sql`.

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/newsletter/subscribe` | Double opt-in start; honeypot + soft IP rate-limit |
| GET | `/api/newsletter/confirm?token=` | Activate subscription |
| POST | `/api/newsletter/unsubscribe` | Mark as `UNSUBSCRIBED` (idempotent) |
| GET | `/api/admin/newsletter/subscribers` | Paginated admin listing |
| DELETE | `/api/admin/newsletter/subscribers?email=` | Hard delete |

`components/NewsletterForm.tsx` was wired up — the placeholder TODO is gone.

### 4.3 On-demand revalidation

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/admin/revalidate` | Trigger ISR refresh by `paths`, `tags`, or shorthand `slug` |

Required for the MCP plan (so an external agent can republish a post and force
the public pages to refresh immediately).

## 5. Final endpoint inventory

```
PUBLIC
├── GET  /api/health
├── GET  /api/posts                       *new
├── GET  /api/posts/featured              *new
├── GET  /api/posts/[slug]                *new
├── GET  /api/posts/[slug]/related        *new
├── GET  /api/categories                  *new
├── GET  /api/categories/[slug]           *new
├── GET  /api/authors                     *new
├── GET  /api/authors/[slug]              *new
├── GET  /api/search?q=                   *new
├── GET  /api/tags                        *new
├── GET  /api/stats                       *new
├── GET  /api/comments?postSlug=
├── POST /api/comments                          (spam-guarded)
├── POST /api/newsletter/subscribe        *new  (honeypot + IP rate-limit)
├── GET  /api/newsletter/confirm?token=   *new
├── POST /api/newsletter/unsubscribe      *new
└── GET  /api/seo/metrics                       (heavy — TODO: protect)

AUTH
├── GET/POST /api/auth/[...nextauth]
└── POST     /api/auth/register

ADMIN  (Session OR X-API-Key: ADMIN_API_KEY — enforced by proxy.ts AND function-level)
├── GET/POST              /api/users
├── PATCH/DELETE          /api/users/[id]
├── GET/POST              /api/admin/posts
├── GET/PUT/DELETE        /api/admin/posts/[id]
├── POST                  /api/admin/posts/[id]/publish
├── GET/POST              /api/admin/categories
├── GET/PUT/DELETE        /api/admin/categories/[id]
├── GET/POST              /api/admin/authors
├── GET/PUT/DELETE        /api/admin/authors/[id]
├── GET                   /api/admin/comments
├── PATCH/DELETE          /api/admin/comments/[id]
├── GET/DELETE            /api/admin/newsletter/subscribers   *new
├── POST                  /api/admin/revalidate               *new
├── GET                   /api/admin/diagnostics
├── GET                   /api/admin/logs
├── GET                   /api/ai-optimization/scores
├── GET                   /api/gsc/analytics                  (auth fixed)
└── GET                   /api/gsc/health                     (bug fixed)
```

50 endpoints total (35 existing + 15 new).

## 6. App-vs-API coverage matrix

| App feature | Page consumer | API contract | Status |
|-------------|---------------|--------------|--------|
| Homepage | `app/page.tsx` | `lib/posts` direct + now `/api/posts` available | ✅ |
| Blog index | `app/blog/page.tsx` | `lib/posts` direct + now `/api/posts`, `/api/search` | ✅ |
| Blog post page | `app/blog/[slug]/page.tsx` | `lib/posts` direct + now `/api/posts/[slug]` | ✅ |
| Comments (read) | `components/CommentsList.tsx` | `GET /api/comments` | ✅ |
| Comments (write) | `components/CommentForm.tsx` | `POST /api/comments` | ✅ |
| Newsletter | `components/NewsletterForm.tsx` | `POST /api/newsletter/subscribe` | ✅ wired |
| Admin login | `app/login/page.tsx` | `/api/auth/[...nextauth]` | ✅ |
| Admin posts CRUD | `app/admin/posts/**` | `/api/admin/posts/**` | ✅ |
| Admin authors / categories | `app/admin/{authors,categories}/**` | `/api/admin/{authors,categories}/**` | ✅ |
| Admin users | `app/admin/users/page.tsx` | `/api/users/**` | ✅ |
| Admin comments | `app/admin/comments/page.tsx` | `/api/admin/comments/**` | ✅ |
| Admin AI optimization | `app/admin/ai-optimization/page.tsx` | `/api/ai-optimization/scores` | ✅ |
| Admin SEO metrics | `app/admin/seo/page.tsx` | `/api/seo/metrics` | ✅ |
| Admin GSC dashboard | `app/admin/gsc-dashboard/page.tsx` | `/api/gsc/analytics`, `/api/gsc/health` | ✅ |
| Admin diagnostics | `app/admin/diagnostics/page.tsx` | `/api/admin/diagnostics`, `/api/admin/logs` | ✅ |
| Admin newsletter | (UI to-be-built) | `/api/admin/newsletter/subscribers` | API ready |
| Sitemap | `app/sitemap.ts` | `lib/posts` direct | ✅ |

## 7. MCP server expansion plan

> Goal: expose the blog as a Model Context Protocol server so any MCP-capable
> client (Claude Desktop, Claude Code, Cursor, etc.) can read posts, draft new
> ones, moderate comments, and trigger republishing — without bypassing the
> existing API.

### 7.1 Architecture

```
┌──────────────────────┐   stdio / HTTP-SSE     ┌────────────────────────────┐
│   MCP Client         │ ─────────────────────► │   thecryptostart-mcp        │
│ (Claude Code,        │                         │   (Node 20+ TypeScript)     │
│  Claude Desktop, …)  │ ◄───────────────────── │   @modelcontextprotocol/sdk │
└──────────────────────┘                         └────────────┬────────────────┘
                                                              │ HTTPS
                                                              │ X-API-Key: $ADMIN_API_KEY
                                                              ▼
                                                ┌─────────────────────────────┐
                                                │   thecryptostart-blog API   │
                                                │   (Next.js)                 │
                                                └─────────────────────────────┘
```

The MCP server is a **thin adapter** over the HTTP API. It keeps zero blog
state; the blog stays the source of truth.

### 7.2 Project layout (proposed)

```
mcp-server/                            # new sibling repo or top-level dir
├── package.json
├── tsconfig.json
├── src/
│   ├── server.ts                      # MCP entrypoint
│   ├── config.ts                      # env validation (BLOG_URL, ADMIN_API_KEY)
│   ├── api-client.ts                  # fetch helper that injects X-API-Key
│   ├── tools/
│   │   ├── posts.ts                   # list/get/search/create/update/publish
│   │   ├── categories.ts
│   │   ├── authors.ts
│   │   ├── comments.ts                # list, moderate
│   │   ├── newsletter.ts              # list subscribers, export CSV
│   │   ├── seo.ts                     # /api/seo/metrics, /api/gsc/analytics
│   │   └── revalidate.ts              # /api/admin/revalidate
│   ├── resources/
│   │   ├── post.ts                    # blog://post/<slug>
│   │   ├── category.ts                # blog://category/<slug>
│   │   └── stats.ts                   # blog://stats
│   └── prompts/
│       ├── new-post-skeleton.ts       # ContentType-aware draft prompt
│       └── seo-fix-pr.ts              # input: /api/seo/metrics → action plan
└── README.md
```

### 7.3 Tools to expose (mapping → existing endpoints)

| MCP tool | Underlying API call | Notes |
|----------|---------------------|-------|
| `posts.list` | GET `/api/posts` | Public; supports pagination/filter |
| `posts.get` | GET `/api/posts/[slug]` | Public |
| `posts.search` | GET `/api/search?q=` | Public |
| `posts.related` | GET `/api/posts/[slug]/related` | Public |
| `posts.create` | POST `/api/admin/posts` | Admin |
| `posts.update` | PUT `/api/admin/posts/[id]` | Admin |
| `posts.publish` | POST `/api/admin/posts/[id]/publish` | Admin |
| `posts.delete` | DELETE `/api/admin/posts/[id]` | Admin (require `confirm: true`) |
| `categories.list` / `.get` | GET `/api/categories[/slug]` | Public |
| `categories.create/update/delete` | `/api/admin/categories[/id]` | Admin |
| `authors.list` / `.get` | GET `/api/authors[/slug]` | Public |
| `authors.create/update/delete` | `/api/admin/authors[/id]` | Admin |
| `comments.list` | GET `/api/admin/comments` | Admin |
| `comments.moderate` | PATCH `/api/admin/comments/[id]` | Admin |
| `comments.delete` | DELETE `/api/admin/comments/[id]` | Admin |
| `newsletter.subscribers` | GET `/api/admin/newsletter/subscribers` | Admin |
| `newsletter.subscribe` | POST `/api/newsletter/subscribe` | Public |
| `seo.metrics` | GET `/api/seo/metrics` | Admin (protect in §10) |
| `seo.gsc` | GET `/api/gsc/analytics` | Admin |
| `ai.scores` | GET `/api/ai-optimization/scores` | Admin |
| `revalidate` | POST `/api/admin/revalidate` | Admin |
| `health` | GET `/api/health` | Public |
| `diagnostics` | GET `/api/admin/diagnostics` | Admin |

### 7.4 Resources (read-mostly URIs)

| URI | Maps to |
|-----|---------|
| `blog://post/{slug}` | `/api/posts/{slug}` |
| `blog://category/{slug}` | `/api/categories/{slug}` |
| `blog://author/{slug}` | `/api/authors/{slug}` |
| `blog://stats` | `/api/stats` |
| `blog://sitemap` | `/api/posts` (paginated walk) |

### 7.5 Prompts (server-suggested templates)

- `new-post-skeleton` — given a `targetKeyword` and `contentType`, returns a
  prefilled JSON body matching the `postSchema` Zod contract in
  `lib/validations/admin.ts`.
- `seo-fix-pr` — pulls `/api/seo/metrics` and outputs a prioritized list of
  posts needing word-count expansion or internal-link additions.
- `triage-comments` — pulls pending comments from `/api/admin/comments?status=PENDING`
  and proposes `APPROVE | REJECT | SPAM` for each.

### 7.6 Configuration

```bash
# .env for the MCP server
BLOG_URL=https://thecryptostart.example.com
ADMIN_API_KEY=...      # same secret as the Next.js app
MCP_TIMEOUT_MS=15000
```

`api-client.ts` injects `X-API-Key` on every admin call; public calls go
without it.

### 7.7 Transport

- **stdio** for desktop MCP clients (Claude Desktop, Claude Code).
- Optional **HTTP+SSE** mode behind the same `ADMIN_API_KEY` for hosted use.

### 7.8 Implementation skeleton

```ts
// src/server.ts
import { Server } from "@modelcontextprotocol/sdk/server/index.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"
import { registerPostTools } from "./tools/posts.js"
import { registerCategoryTools } from "./tools/categories.js"
// …

const server = new Server({ name: "thecryptostart-mcp", version: "0.1.0" }, {
  capabilities: { tools: {}, resources: {}, prompts: {} },
})

registerPostTools(server)
registerCategoryTools(server)
// …

const transport = new StdioServerTransport()
await server.connect(transport)
```

```ts
// src/api-client.ts
const BASE = process.env.BLOG_URL!
const KEY  = process.env.ADMIN_API_KEY!

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const isAdmin = path.startsWith("/api/admin") || path.startsWith("/api/users")
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      "content-type": "application/json",
      ...(isAdmin ? { "X-API-Key": KEY } : {}),
      ...(init.headers || {}),
    },
  })
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`)
  return res.status === 204 ? (undefined as T) : res.json()
}
```

```ts
// src/tools/posts.ts
import { z } from "zod"
import { api } from "../api-client.js"

export function registerPostTools(server) {
  server.tool("posts.list", {
    inputSchema: z.object({
      limit: z.number().int().min(1).max(100).default(10),
      page: z.number().int().min(1).default(1),
      category: z.string().optional(),
    }),
    description: "List published blog posts.",
    handler: (args) => api(`/api/posts?limit=${args.limit}&page=${args.page}` +
      (args.category ? `&category=${args.category}` : "")),
  })

  server.tool("posts.publish", {
    inputSchema: z.object({ id: z.string(), publish: z.boolean().default(true) }),
    description: "Publish or unpublish a post.",
    handler: ({ id, publish }) =>
      api(`/api/admin/posts/${id}/publish`, {
        method: "POST",
        body: JSON.stringify({ publish }),
      }),
  })

  // …posts.create / .update / .delete / .search / .related / .featured
}
```

### 7.9 Roadmap

1. **MVP (1–2 days)** — `posts.*`, `categories.*`, `authors.*` (read), plus
   `revalidate`. Single stdio transport. Deployable as a local CLI.
2. **Authoring (1 day)** — admin write tools + `posts.publish` + the
   `new-post-skeleton` prompt.
3. **Moderation (½ day)** — `comments.list` + `comments.moderate`.
4. **Insights (1 day)** — `seo.metrics`, `seo.gsc`, `ai.scores`,
   `seo-fix-pr` prompt.
5. **Hosted mode (1 day)** — HTTP-SSE transport + Cloudflare/Fly.io deploy.
6. **Hardening** — per-tool dry-run flags, audit log of MCP-initiated writes
   piped to the existing `SystemLog` table via a new `source: "MCP"`.

## 8. Follow-ups recommended (not done in this PR)

- `/api/seo/metrics` runs `analyzeAllForExpansion` on every request with
  `limit: 1000`. Add `checkApiAuth` (it leaks heavy data) and a 5-minute
  in-memory cache.
- `/api/admin/posts` POST/PUT does **not** auto-recompute `wordCount` /
  `readingTime`. Today the `PostForm` sends them from the client — an MCP
  client may not. Compute server-side from `content` if the field is 0.
- `proxy.ts` matcher excludes `sitemap.xml` and `robots.txt` but the project
  has no `app/robots.ts`. Either add one or remove the exclusion.
- `lib/rate-limit.ts` is in-memory; in a multi-instance deploy it does
  nothing. Migrate to Upstash Redis (the README already mentions it).
- Add password-reset endpoints (`PasswordReset` model exists, no API).
- Add `app/api/admin/users/[id]/roles` for granular role mutation if the
  admin UI ever wants per-role toggles.
