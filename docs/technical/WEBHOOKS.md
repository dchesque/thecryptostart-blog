# Outgoing webhooks

The blog fires HTTP webhooks on selected events so external services
(n8n, Slack/Discord notifiers, Zapier, custom workers) can react.

## Events

| Event | Triggered by | Payload |
|-------|--------------|---------|
| `post.published` | `POST /api/admin/posts/{id}/publish` with `publish: true` | id, slug, title, excerpt, url, publishDate, category, author |
| `post.unpublished` | same endpoint with `publish: false` | same shape |
| `comment.received` | `POST /api/comments` (any new comment, including spam) | id, postSlug, authorName, content, status, spamScore, isReply |
| `comment.moderated` | `PATCH /api/admin/comments/{id}` (status change) | id, postSlug, status, moderatedBy |

More events can be added in the future without breaking consumers — check
the `type` field.

## Configuration

Three env vars on the blog:

```bash
# Comma-separated. Empty/unset disables webhooks for that event group.
PUBLISH_WEBHOOK_URLS="https://hooks.zapier.com/...,https://n8n.example/webhook/post-published"
UNPUBLISH_WEBHOOK_URLS=""
# Both comment.received and comment.moderated share this single URL list.
# Filter by `type` on the consumer side.
COMMENT_WEBHOOK_URLS="https://discord.com/api/webhooks/<id>/<token>"
# Optional. If set, every body is signed with HMAC-SHA256 and sent in
# the X-Webhook-Signature header as "sha256=<hex>".
WEBHOOK_SECRET="<generate with: openssl rand -hex 32>"
```

Apply via your usual env mechanism (EasyPanel, Vercel, .env.local).

## Request shape

Each registered URL receives:

```http
POST <url>
content-type: application/json
user-agent: thecryptostart-webhooks/1.0
x-webhook-event: post.published
x-webhook-signature: sha256=<hex>          # only if WEBHOOK_SECRET is set
```

Body:

```json
{
    "type": "post.published",
    "occurredAt": "2026-04-30T18:42:00.000Z",
    "data": {
        "id": "ck...",
        "slug": "the-future-of-bitcoin",
        "title": "The future of Bitcoin",
        "excerpt": "Plain-language overview…",
        "url": "https://thecryptostart.com/blog/the-future-of-bitcoin",
        "publishDate": "2026-04-30T18:42:00.000Z",
        "category": { "slug": "bitcoin", "name": "Bitcoin" },
        "author": { "name": "Jane Doe", "slug": "jane-doe" }
    }
}
```

## Verifying the signature (consumer side)

Drop into any Node consumer:

```ts
import { createHmac, timingSafeEqual } from 'crypto'

function verify(secret: string, body: string, signature: string) {
    const expected = 'sha256=' + createHmac('sha256', secret).update(body).digest('hex')
    if (expected.length !== signature.length) return false
    return timingSafeEqual(Buffer.from(expected), Buffer.from(signature))
}
```

Or in Python:

```python
import hmac, hashlib

def verify(secret: bytes, body: bytes, signature: str) -> bool:
    expected = "sha256=" + hmac.new(secret, body, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, signature)
```

The signature is computed over the **raw request body** (UTF-8 string). If
your framework parses JSON before you can hash, fetch the raw bytes first.

## Delivery semantics

- **Best-effort, fire-and-forget.** A webhook failure never blocks the API
  response — the post still publishes.
- **Per-URL timeout: 5s.** Slow consumers are aborted; the others continue.
- **No retries.** Use a queue on the consumer side (n8n has built-in retry
  on errored webhook nodes).
- **No ordering guarantees.** If you publish two posts in quick succession,
  webhooks may arrive in either order.
- **Logged.** Every dispatch is recorded in `SystemLog` with `source =
  "Webhooks"` for forensics. Use `/api/admin/logs?level=WARN` to inspect.

## Adding a new event

1. Add the event type to `WebhookEvent['type']` in `lib/webhooks.ts`.
2. Add a `XYZ_WEBHOOK_URLS` env to read in `urlsFor()`.
3. Document the trigger and payload in this file.
4. Test: run `dispatchWebhook` with a fake URL pointing at https://webhook.site.

That's it — no additional infra; the existing dispatcher signs and logs.
