/**
 * Outgoing webhook dispatcher for blog events.
 *
 * Configuration via env (comma-separated lists):
 *   PUBLISH_WEBHOOK_URLS    — URLs to POST when a post is published
 *   UNPUBLISH_WEBHOOK_URLS  — URLs to POST when a post is unpublished
 *   COMMENT_WEBHOOK_URLS    — URLs to POST when a comment is created or
 *                              moderated (any status change). Use this
 *                              to wire moderation queues to Discord/Slack.
 *   WEBHOOK_SECRET          — optional shared secret for HMAC-SHA256 signing
 *                              (sent in X-Webhook-Signature: sha256=<hex>)
 *
 * Each call:
 *   - is best-effort (timeout 5s, errors logged but never thrown)
 *   - is fire-and-forget (don't await before returning the API response)
 *   - signs the body if WEBHOOK_SECRET is set
 *   - logs success/failure to SystemLog (source: "Webhooks")
 */

import { createHmac, timingSafeEqual } from 'crypto'
import { logger } from './logger'

export type WebhookEventType =
    | 'post.published'
    | 'post.unpublished'
    | 'comment.received'
    | 'comment.moderated'

type WebhookEvent = {
    type: WebhookEventType
    occurredAt: string
    data: Record<string, unknown>
}

const TIMEOUT_MS = 5_000

function urlsFor(event: WebhookEventType): string[] {
    let raw: string | undefined
    switch (event) {
        case 'post.published': raw = process.env.PUBLISH_WEBHOOK_URLS; break
        case 'post.unpublished': raw = process.env.UNPUBLISH_WEBHOOK_URLS; break
        case 'comment.received':
        case 'comment.moderated':
            raw = process.env.COMMENT_WEBHOOK_URLS; break
    }
    if (!raw) return []
    return raw.split(',').map((s) => s.trim()).filter(Boolean)
}

export function signPayload(secret: string, body: string): string {
    return 'sha256=' + createHmac('sha256', secret).update(body).digest('hex')
}

export function verifySignature(secret: string, body: string, signature: string): boolean {
    const expected = signPayload(secret, body)
    if (expected.length !== signature.length) return false
    return timingSafeEqual(Buffer.from(expected), Buffer.from(signature))
}

/**
 * Dispatch a webhook to all configured URLs. Best-effort.
 * Returns the array of attempted URLs so callers can attribute log lines.
 */
export async function dispatchWebhook(event: WebhookEvent): Promise<{ attempted: string[] }> {
    const urls = urlsFor(event.type)
    if (urls.length === 0) return { attempted: [] }

    const body = JSON.stringify(event)
    const secret = process.env.WEBHOOK_SECRET
    const headers: Record<string, string> = {
        'content-type': 'application/json',
        'user-agent': 'thecryptostart-webhooks/1.0',
        'x-webhook-event': event.type,
    }
    if (secret) headers['x-webhook-signature'] = signPayload(secret, body)

    await Promise.all(urls.map(async (url) => {
        const controller = new AbortController()
        const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
        try {
            const res = await fetch(url, { method: 'POST', headers, body, signal: controller.signal })
            if (!res.ok) {
                logger.warn('Webhooks', `${event.type} ${res.status}`, { url, status: res.status })
            } else {
                logger.info('Webhooks', `${event.type} ✓`, { url, status: res.status })
            }
        } catch (err: any) {
            logger.error('Webhooks', `${event.type} failed`, { url, error: err?.message || String(err) })
        } finally {
            clearTimeout(timer)
        }
    }))

    return { attempted: urls }
}
