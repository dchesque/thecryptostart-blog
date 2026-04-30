# thecryptostart-mcp

MCP server thin-wrapper over the blog HTTP API. Exposes the editorial surface
(posts, categories, authors, comments, newsletter, SEO) to MCP-capable clients
like **Claude Desktop** and **Claude Code**.

The server holds **zero state** — every tool call hits the blog's API and the
blog DB stays the source of truth.

## Quick start (local)

```bash
cd mcp-server
npm install
npm run build

# Configure
export BLOG_URL=https://thecryptostart.com
export ADMIN_API_KEY=...                # same secret the blog uses
export MCP_WRITES_ENABLED=false         # default: read-only

node dist/server.js
```

## Integration with Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json`
(macOS) or the equivalent on your OS:

```json
{
  "mcpServers": {
    "thecryptostart": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-server/dist/server.js"],
      "env": {
        "BLOG_URL": "https://thecryptostart.com",
        "ADMIN_API_KEY": "<your-key>",
        "MCP_WRITES_ENABLED": "false"
      }
    }
  }
}
```

Restart Claude Desktop. The "thecryptostart" toolbox will appear.

## Tools

### Public (always available)

| Tool | Description |
|------|-------------|
| `posts.list` | Paginated list of published posts |
| `posts.get` | Single post by slug |
| `posts.related` | Related posts |
| `posts.featured` | Featured posts |
| `posts.search` | Title/excerpt search |
| `categories.list` / `.get` | Categories with post counts |
| `authors.list` / `.get` | Authors with published posts |
| `comments.list_public` | Approved comments by post slug |
| `tags` | Tag cloud + counts |
| `stats` | Aggregate counts |
| `health` | Blog health check |

### Admin reads (always available; require `ADMIN_API_KEY`)

| Tool | Description |
|------|-------------|
| `posts.list_admin` / `posts.get_admin` | Includes drafts |
| `comments.list` | All comments by status |
| `newsletter.subscribers` | Paginated subscriber list |
| `seo.metrics` / `seo.gsc` / `seo.ai_scores` | SEO insight feeds |
| `diagnostics` | DB + env diagnostics |
| `logs.recent` | Recent SystemLog entries |

### Admin writes (gated by `MCP_WRITES_ENABLED=true`)

| Tool | Description |
|------|-------------|
| `posts.create` / `posts.update` / `posts.publish` / `posts.delete` | Post CRUD. Delete requires confirm token. |
| `categories.create` / `.update` / `.delete` | Category CRUD |
| `authors.create` / `.update` / `.delete` | Author CRUD |
| `comments.moderate` / `.delete` | Moderation |
| `newsletter.delete_subscriber` | Hard delete by email |
| `revalidate` | Trigger ISR refresh |

## Prompts

| Prompt | Use |
|--------|-----|
| `new-post-skeleton` | Generate a `posts.create` body filled from a `targetKeyword` + `contentType` |
| `triage-comments` | Walk through PENDING comments and propose APPROVE/REJECT/SPAM (no auto-apply) |
| `seo-fix-report` | Build a prioritized SEO action plan from `seo.metrics` + `seo.gsc` + `seo.ai_scores` |

## Safety model

- **Default**: read-only. Set `MCP_WRITES_ENABLED=true` to expose write tools.
- **Confirm tokens**: `posts.delete`, `categories.delete`, `authors.delete` require
  passing `confirm: "DELETE <slug>"` exactly. LLMs can't accidentally trigger them.
- **Audit trail**: every API call is logged to the blog's `SystemLog` table by the
  Next.js routes themselves (the MCP doesn't bypass the API).
- **Auth**: requests to admin endpoints carry the `X-API-Key` header automatically;
  public endpoints go without authentication.

## Env

| Var | Required | Default | Notes |
|-----|----------|---------|-------|
| `BLOG_URL` | yes | — | e.g. `https://thecryptostart.com` (no trailing slash) |
| `ADMIN_API_KEY` | yes | — | Must match the blog's `ADMIN_API_KEY` |
| `MCP_TIMEOUT_MS` | no | `15000` | Per-request timeout |
| `MCP_WRITES_ENABLED` | no | `false` | Set `"true"` to expose write tools |

## Development

```bash
npm run dev    # tsx watch mode against src/
npm run build  # tsc → dist/
```

The blog itself does not import this directory — it lives next to `app/` for
co-location but is a separate Node program.
