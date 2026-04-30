/**
 * @jest-environment node
 */
import { calculateWordCount, calculateReadingTime, generateSlugFromTitle } from '@/lib/posts'

describe('calculateWordCount', () => {
    it('returns 0 for empty input', () => {
        expect(calculateWordCount('')).toBe(0)
    })

    it('counts plain words', () => {
        expect(calculateWordCount('hello world from jest')).toBe(4)
    })

    it('strips common markdown syntax', () => {
        const md = '# Title\n\nThis is **bold** and *italic*. [link](https://x).'
        // "Title", "This", "is", "bold", "and", "italic", "link", "https", "x"
        expect(calculateWordCount(md)).toBeGreaterThanOrEqual(7)
    })

    it('does not crash on null-ish input', () => {
        expect(calculateWordCount(null as unknown as string)).toBe(0)
        expect(calculateWordCount(undefined as unknown as string)).toBe(0)
    })
})

describe('calculateReadingTime', () => {
    it('always returns at least 1', () => {
        expect(calculateReadingTime(0)).toBe(1)
        expect(calculateReadingTime(50)).toBe(1)
    })

    it('rounds up at 200 wpm', () => {
        expect(calculateReadingTime(201)).toBe(2)
        expect(calculateReadingTime(400)).toBe(2)
        expect(calculateReadingTime(401)).toBe(3)
    })
})

describe('generateSlugFromTitle', () => {
    it('lowercases and dashes', () => {
        expect(generateSlugFromTitle('Hello World')).toBe('hello-world')
    })

    it('strips diacritics', () => {
        expect(generateSlugFromTitle('Crônica de João')).toBe('cronica-de-joao')
    })

    it('removes punctuation', () => {
        expect(generateSlugFromTitle("Bitcoin: a Beginner's Guide!")).toBe('bitcoin-a-beginners-guide')
    })

    it('collapses repeated separators', () => {
        expect(generateSlugFromTitle('a   b -- c')).toBe('a-b-c')
    })
})
