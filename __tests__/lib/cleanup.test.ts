/**
 * @jest-environment node
 */
import { clampInt, pastDate } from '@/lib/cleanup'

describe('clampInt', () => {
    it('returns fallback for undefined', () => {
        expect(clampInt(undefined, 1, 100, 30)).toBe(30)
    })

    it('returns fallback for non-finite', () => {
        expect(clampInt(NaN, 1, 100, 30)).toBe(30)
        expect(clampInt(Infinity, 1, 100, 30)).toBe(30)
    })

    it('returns fallback for non-number type', () => {
        expect(clampInt('foo' as unknown as number, 1, 100, 30)).toBe(30)
        expect(clampInt(null as unknown as number, 1, 100, 30)).toBe(30)
    })

    it('clamps to min', () => {
        expect(clampInt(-5, 1, 100, 30)).toBe(1)
    })

    it('clamps to max', () => {
        expect(clampInt(9_999, 1, 100, 30)).toBe(100)
    })

    it('passes through valid values', () => {
        expect(clampInt(50, 1, 100, 30)).toBe(50)
    })

    it('truncates floats', () => {
        expect(clampInt(7.9, 1, 100, 30)).toBe(7)
    })
})

describe('pastDate', () => {
    it('returns a date in the past for positive days', () => {
        const d = pastDate(30)
        expect(d.getTime()).toBeLessThan(Date.now())
        // ~30 days ago, allow ±1 second drift
        const expected = Date.now() - 30 * 24 * 60 * 60 * 1000
        expect(Math.abs(d.getTime() - expected)).toBeLessThan(1000)
    })

    it('returns ~now for 0 days', () => {
        const d = pastDate(0)
        expect(Math.abs(d.getTime() - Date.now())).toBeLessThan(1000)
    })
})
