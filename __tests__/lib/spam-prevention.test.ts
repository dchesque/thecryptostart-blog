/**
 * @jest-environment node
 */
import { validateEmail, detectSpam, getClientIP } from '@/lib/spam-prevention'

describe('validateEmail', () => {
    it('accepts valid emails', () => {
        expect(validateEmail('a@b.co')).toBe(true)
        expect(validateEmail('user.name+tag@example.com')).toBe(true)
    })

    it('rejects malformed', () => {
        expect(validateEmail('foo')).toBe(false)
        expect(validateEmail('foo@')).toBe(false)
        expect(validateEmail('@foo.com')).toBe(false)
        expect(validateEmail('foo bar@x.com')).toBe(false)
    })

    it('rejects very long emails (>= 255 chars)', () => {
        const local = 'a'.repeat(250)
        expect(validateEmail(`${local}@x.co`)).toBe(false)
    })
})

describe('detectSpam', () => {
    it('clean comment scores low', () => {
        const score = detectSpam('Great article about Bitcoin security. Thanks!', 'reader@example.com')
        expect(score).toBeLessThan(0.3)
    })

    it('flags spam keywords', () => {
        const score = detectSpam('Click here for free money!! Buy viagra now!', 'spam@test.com')
        expect(score).toBeGreaterThan(0.5)
    })

    it('penalizes too many links', () => {
        const score = detectSpam(
            'http://a.com http://b.com http://c.com http://d.com http://e.com http://f.com',
            'reader@example.com',
        )
        expect(score).toBeGreaterThan(0.5)
    })

    it('penalizes excessive caps', () => {
        const score = detectSpam('I REALLY LOVE THIS POST IT IS THE BEST', 'reader@example.com')
        expect(score).toBeGreaterThan(0.1)
    })

    it('caps at 1.0', () => {
        // Heavy spam content
        const heavy = 'CLICK HERE BUY NOW VIAGRA CASINO POKER FREE MONEY!!! '.repeat(20)
        const score = detectSpam(heavy, 'spam@fake.com')
        expect(score).toBeLessThanOrEqual(1)
    })
})

describe('getClientIP', () => {
    function makeReq(headers: Record<string, string>) {
        return {
            headers: {
                get: (k: string) => headers[k.toLowerCase()] ?? null,
            },
        } as unknown as Request
    }

    it('uses x-forwarded-for first ip', () => {
        const req = makeReq({ 'x-forwarded-for': '1.2.3.4, 5.6.7.8' })
        expect(getClientIP(req)).toBe('1.2.3.4')
    })

    it('falls back to x-real-ip', () => {
        const req = makeReq({ 'x-real-ip': '9.8.7.6' })
        expect(getClientIP(req)).toBe('9.8.7.6')
    })

    it('falls back to cf-connecting-ip', () => {
        const req = makeReq({ 'cf-connecting-ip': '10.0.0.1' })
        expect(getClientIP(req)).toBe('10.0.0.1')
    })

    it('default loopback when nothing set', () => {
        const req = makeReq({})
        expect(getClientIP(req)).toBe('127.0.0.1')
    })
})
