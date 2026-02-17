type RateLimitStore = {
    [key: string]: {
        count: number;
        resetAt: number;
    };
};

const store: RateLimitStore = {};

/**
 * Simple memory-based rate limiter.
 * In a real production environment with multiple instances, use Redis.
 */
export async function checkRateLimit(
    key: string,
    limit: number,
    windowMs: number
) {
    const now = Date.now();
    const entry = store[key];

    if (!entry || now > entry.resetAt) {
        store[key] = {
            count: 1,
            resetAt: now + windowMs,
        };
        return {
            limited: false,
            remaining: limit - 1,
            resetAt: new Date(now + windowMs),
        };
    }

    if (entry.count >= limit) {
        return {
            limited: true,
            remaining: 0,
            resetAt: new Date(entry.resetAt),
        };
    }

    entry.count += 1;
    return {
        limited: false,
        remaining: limit - entry.count,
        resetAt: new Date(entry.resetAt),
    };
}

/**
 * Helper to get user IP from request.
 */
export function getIP(req: Request) {
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0] : "127.0.0.1";
    return ip;
}
