import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { createApiClient, ApiError } from './api-client.js'

const cfg = {
    blogUrl: 'https://blog.example',
    adminApiKey: 'admin-secret',
    timeoutMs: 5_000,
    writesEnabled: false,
}

describe('createApiClient', () => {
    let calls: Array<{ url: string; init: RequestInit }>
    let respondWith: () => Response

    beforeEach(() => {
        calls = []
        respondWith = () => new Response('{}', { status: 200, headers: { 'content-type': 'application/json' } })
        vi.stubGlobal('fetch', vi.fn(async (url: any, init: any) => {
            calls.push({ url, init })
            return respondWith()
        }))
    })

    afterEach(() => vi.unstubAllGlobals())

    it('GETs the absolute URL composed from blogUrl + path', async () => {
        const api = createApiClient(cfg)
        await api.get('/api/posts')
        expect(calls[0].url).toBe('https://blog.example/api/posts')
        expect(calls[0].init.method).toBe('GET')
    })

    it('does NOT inject X-API-Key on public paths', async () => {
        const api = createApiClient(cfg)
        await api.get('/api/posts')
        const headers = calls[0].init.headers as Record<string, string>
        expect(headers['x-api-key']).toBeUndefined()
    })

    it('injects X-API-Key on /api/admin/* paths', async () => {
        const api = createApiClient(cfg)
        await api.get('/api/admin/posts')
        const headers = calls[0].init.headers as Record<string, string>
        expect(headers['x-api-key']).toBe('admin-secret')
    })

    it('injects X-API-Key on /api/users/* paths', async () => {
        const api = createApiClient(cfg)
        await api.delete('/api/users/123')
        const headers = calls[0].init.headers as Record<string, string>
        expect(headers['x-api-key']).toBe('admin-secret')
    })

    it('sends content-type and stringified body on POST', async () => {
        const api = createApiClient(cfg)
        await api.post('/api/admin/posts', { title: 'Hello' })
        const headers = calls[0].init.headers as Record<string, string>
        expect(headers['content-type']).toBe('application/json')
        expect(calls[0].init.body).toBe('{"title":"Hello"}')
    })

    it('does NOT send content-type when body is undefined', async () => {
        const api = createApiClient(cfg)
        await api.get('/api/posts')
        const headers = calls[0].init.headers as Record<string, string>
        expect(headers['content-type']).toBeUndefined()
    })

    it('returns parsed JSON for application/json responses', async () => {
        respondWith = () => new Response('{"ok":true,"n":7}', {
            status: 200,
            headers: { 'content-type': 'application/json' },
        })
        const api = createApiClient(cfg)
        const result = await api.get<{ ok: boolean; n: number }>('/api/posts')
        expect(result).toEqual({ ok: true, n: 7 })
    })

    it('returns text for non-JSON responses', async () => {
        respondWith = () => new Response('plain', { status: 200, headers: { 'content-type': 'text/plain' } })
        const api = createApiClient(cfg)
        const result = await api.get<string>('/api/posts')
        expect(result).toBe('plain')
    })

    it('returns undefined for 204 No Content', async () => {
        respondWith = () => new Response(null, { status: 204 })
        const api = createApiClient(cfg)
        const result = await api.delete('/api/admin/posts/abc')
        expect(result).toBeUndefined()
    })

    it('throws ApiError with status + body when response is non-OK', async () => {
        respondWith = () => new Response('boom', { status: 500 })
        const api = createApiClient(cfg)
        await expect(api.get('/api/posts')).rejects.toBeInstanceOf(ApiError)
        try {
            await api.get('/api/posts')
        } catch (err: any) {
            expect(err.status).toBe(500)
            expect(err.body).toBe('boom')
            expect(err.method).toBe('GET')
            expect(err.path).toBe('/api/posts')
        }
    })
})
