/**
 * Rate limiter unificado.
 *
 * Em produção (com UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN),
 * usa Upstash Redis com sliding window. Em dev ou se as envs não estiverem
 * setadas, cai para um store in-memory por instância (perde estado em
 * deploys e não é multi-instância — OK para dev).
 */

type RateLimitResult = {
    limited: boolean
    remaining: number
    resetAt: Date
}

type MemoryEntry = { count: number; resetAt: number }
const memoryStore = new Map<string, MemoryEntry>()

let upstashClient: { limit: (key: string) => Promise<{ success: boolean; remaining: number; reset: number }> } | null = null
let upstashInitTried = false

async function getUpstash(limit: number, windowMs: number) {
    if (!upstashInitTried) {
        upstashInitTried = true
        const url = process.env.UPSTASH_REDIS_REST_URL
        const token = process.env.UPSTASH_REDIS_REST_TOKEN
        if (!url || !token) return null
        try {
            const { Ratelimit } = await import('@upstash/ratelimit')
            const { Redis } = await import('@upstash/redis')
            const redis = new Redis({ url, token })
            upstashClient = new Ratelimit({
                redis,
                limiter: Ratelimit.slidingWindow(limit, `${windowMs} ms`),
                analytics: false,
                prefix: 'rl',
            })
        } catch (err) {
            console.warn('[rate-limit] Upstash init failed, falling back to memory:', err)
            upstashClient = null
        }
    }
    return upstashClient
}

export async function checkRateLimit(
    key: string,
    limit: number,
    windowMs: number,
): Promise<RateLimitResult> {
    const upstash = await getUpstash(limit, windowMs)

    if (upstash) {
        try {
            const r = await upstash.limit(key)
            return {
                limited: !r.success,
                remaining: r.remaining,
                resetAt: new Date(r.reset),
            }
        } catch (err) {
            console.warn('[rate-limit] Upstash request failed, falling back to memory:', err)
        }
    }

    const now = Date.now()
    const entry = memoryStore.get(key)

    if (!entry || now > entry.resetAt) {
        memoryStore.set(key, { count: 1, resetAt: now + windowMs })
        return { limited: false, remaining: limit - 1, resetAt: new Date(now + windowMs) }
    }

    if (entry.count >= limit) {
        return { limited: true, remaining: 0, resetAt: new Date(entry.resetAt) }
    }

    entry.count += 1
    return { limited: false, remaining: limit - entry.count, resetAt: new Date(entry.resetAt) }
}

export function getIP(req: Request) {
    const forwarded = req.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0] : '127.0.0.1'
    return ip.trim()
}
