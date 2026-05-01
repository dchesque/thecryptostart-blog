/**
 * @jest-environment node
 */
import { checkRateLimit, getIP } from '@/lib/rate-limit'

describe('checkRateLimit (in-memory fallback)', () => {
    beforeEach(() => {
        // Ensure Upstash isn't configured for these tests
        delete process.env.UPSTASH_REDIS_REST_URL
        delete process.env.UPSTASH_REDIS_REST_TOKEN
    })

    it('allows up to limit then blocks', async () => {
        const key = `test:${Math.random()}`
        const limit = 3
        const window = 5_000

        for (let i = 0; i < limit; i++) {
            const r = await checkRateLimit(key, limit, window)
            expect(r.limited).toBe(false)
        }

        const blocked = await checkRateLimit(key, limit, window)
        expect(blocked.limited).toBe(true)
        expect(blocked.remaining).toBe(0)
    })

    it('different keys are isolated', async () => {
        const a = await checkRateLimit(`a:${Math.random()}`, 1, 5_000)
        const b = await checkRateLimit(`b:${Math.random()}`, 1, 5_000)
        expect(a.limited).toBe(false)
        expect(b.limited).toBe(false)
    })

    it('returns a future resetAt', async () => {
        const r = await checkRateLimit(`reset:${Math.random()}`, 5, 5_000)
        expect(r.resetAt.getTime()).toBeGreaterThan(Date.now())
    })
})

describe('getIP', () => {
    function makeReq(headers: Record<string, string>) {
        return {
            headers: { get: (k: string) => headers[k.toLowerCase()] ?? null },
        } as unknown as Request
    }

    it('reads x-forwarded-for first', () => {
        expect(getIP(makeReq({ 'x-forwarded-for': '8.8.8.8, 1.1.1.1' }))).toBe('8.8.8.8')
    })

    it('returns 127.0.0.1 by default', () => {
        expect(getIP(makeReq({}))).toBe('127.0.0.1')
    })
})
