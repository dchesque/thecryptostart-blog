import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { loadConfig } from './config.js'

const ENV_KEYS = ['BLOG_URL', 'ADMIN_API_KEY', 'MCP_TIMEOUT_MS', 'MCP_WRITES_ENABLED'] as const
type Snapshot = Partial<Record<(typeof ENV_KEYS)[number], string | undefined>>

function snapshot(): Snapshot {
    return Object.fromEntries(ENV_KEYS.map((k) => [k, process.env[k]])) as Snapshot
}

function restore(s: Snapshot) {
    for (const k of ENV_KEYS) {
        if (s[k] === undefined) delete process.env[k]
        else process.env[k] = s[k]
    }
}

describe('loadConfig', () => {
    let saved: Snapshot

    beforeEach(() => {
        saved = snapshot()
        for (const k of ENV_KEYS) delete process.env[k]
    })
    afterEach(() => restore(saved))

    it('throws when BLOG_URL is missing', () => {
        process.env.ADMIN_API_KEY = 'x'
        expect(() => loadConfig()).toThrow(/BLOG_URL/)
    })

    it('throws when ADMIN_API_KEY is missing', () => {
        process.env.BLOG_URL = 'https://blog.example'
        expect(() => loadConfig()).toThrow(/ADMIN_API_KEY/)
    })

    it('throws when MCP_TIMEOUT_MS is below 1000', () => {
        process.env.BLOG_URL = 'https://blog.example'
        process.env.ADMIN_API_KEY = 'x'
        process.env.MCP_TIMEOUT_MS = '100'
        expect(() => loadConfig()).toThrow(/MCP_TIMEOUT_MS/)
    })

    it('strips trailing slash from BLOG_URL', () => {
        process.env.BLOG_URL = 'https://blog.example/'
        process.env.ADMIN_API_KEY = 'x'
        const cfg = loadConfig()
        expect(cfg.blogUrl).toBe('https://blog.example')
    })

    it('writesEnabled is false by default', () => {
        process.env.BLOG_URL = 'https://blog.example'
        process.env.ADMIN_API_KEY = 'x'
        expect(loadConfig().writesEnabled).toBe(false)
    })

    it('writesEnabled is true only when MCP_WRITES_ENABLED is exactly "true"', () => {
        process.env.BLOG_URL = 'https://blog.example'
        process.env.ADMIN_API_KEY = 'x'

        process.env.MCP_WRITES_ENABLED = 'true'
        expect(loadConfig().writesEnabled).toBe(true)

        process.env.MCP_WRITES_ENABLED = 'TRUE'
        expect(loadConfig().writesEnabled).toBe(false)

        process.env.MCP_WRITES_ENABLED = '1'
        expect(loadConfig().writesEnabled).toBe(false)

        process.env.MCP_WRITES_ENABLED = 'yes'
        expect(loadConfig().writesEnabled).toBe(false)
    })

    it('default timeoutMs is 15000', () => {
        process.env.BLOG_URL = 'https://blog.example'
        process.env.ADMIN_API_KEY = 'x'
        expect(loadConfig().timeoutMs).toBe(15000)
    })
})
