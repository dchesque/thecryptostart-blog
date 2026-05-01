/**
 * @jest-environment node
 */
import { rateLimitHeaders } from '@/lib/rate-limit-headers'

describe('rateLimitHeaders', () => {
    it('returns the standard 3 headers as strings', () => {
        const resetAt = new Date('2026-05-01T00:00:00Z')
        const h = rateLimitHeaders({ limit: 60, remaining: 42, resetAt })
        expect(h['X-RateLimit-Limit']).toBe('60')
        expect(h['X-RateLimit-Remaining']).toBe('42')
        expect(h['X-RateLimit-Reset']).toBe(String(Math.floor(resetAt.getTime() / 1000)))
    })

    it('clamps Remaining to 0 when negative', () => {
        const h = rateLimitHeaders({ limit: 5, remaining: -3, resetAt: new Date() })
        expect(h['X-RateLimit-Remaining']).toBe('0')
    })

    it('does NOT include Retry-After by default', () => {
        const h = rateLimitHeaders({ limit: 5, remaining: 0, resetAt: new Date(Date.now() + 30_000) })
        expect(h['Retry-After']).toBeUndefined()
    })

    it('includes Retry-After when include429 is true', () => {
        const resetAt = new Date(Date.now() + 30_000)
        const h = rateLimitHeaders({ limit: 5, remaining: 0, resetAt }, { include429: true })
        expect(h['Retry-After']).toBeDefined()
        const seconds = Number(h['Retry-After'])
        expect(seconds).toBeGreaterThanOrEqual(29)
        expect(seconds).toBeLessThanOrEqual(31)
    })

    it('Retry-After is at least 1 second even if reset is in the past', () => {
        const resetAt = new Date(Date.now() - 5_000)
        const h = rateLimitHeaders({ limit: 5, remaining: 0, resetAt }, { include429: true })
        expect(Number(h['Retry-After'])).toBeGreaterThanOrEqual(1)
    })
})
