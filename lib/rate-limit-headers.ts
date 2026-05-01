/**
 * Standard rate-limit headers for HTTP responses.
 *
 * Follows the IETF draft (draft-ietf-httpapi-ratelimit-headers):
 *   - X-RateLimit-Limit:     ceiling of the bucket
 *   - X-RateLimit-Remaining: requests left in the current window
 *   - X-RateLimit-Reset:     unix-seconds when the bucket refills
 *   - Retry-After:           seconds until refill (only on 429)
 */

export type RateInfo = {
    limit: number
    remaining: number
    resetAt: Date
}

export function rateLimitHeaders(info: RateInfo, opts: { include429?: boolean } = {}): Record<string, string> {
    const headers: Record<string, string> = {
        'X-RateLimit-Limit': String(info.limit),
        'X-RateLimit-Remaining': String(Math.max(0, info.remaining)),
        'X-RateLimit-Reset': String(Math.floor(info.resetAt.getTime() / 1000)),
    }
    if (opts.include429) {
        const seconds = Math.max(1, Math.ceil((info.resetAt.getTime() - Date.now()) / 1000))
        headers['Retry-After'] = String(seconds)
    }
    return headers
}
