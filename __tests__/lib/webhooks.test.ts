/**
 * @jest-environment node
 */
import { signPayload, verifySignature, dispatchWebhook } from '@/lib/webhooks'

describe('signPayload', () => {
    it('produces a deterministic sha256= hex digest', () => {
        const sig = signPayload('topsecret', '{"hello":"world"}')
        expect(sig).toMatch(/^sha256=[0-9a-f]{64}$/)
        // same inputs → same output
        expect(signPayload('topsecret', '{"hello":"world"}')).toBe(sig)
    })

    it('different secrets produce different sigs', () => {
        const a = signPayload('secret-a', '{}')
        const b = signPayload('secret-b', '{}')
        expect(a).not.toBe(b)
    })
})

describe('verifySignature', () => {
    it('accepts a valid signature', () => {
        const body = JSON.stringify({ event: 'test' })
        const sig = signPayload('topsecret', body)
        expect(verifySignature('topsecret', body, sig)).toBe(true)
    })

    it('rejects a tampered body', () => {
        const body = JSON.stringify({ event: 'test' })
        const sig = signPayload('topsecret', body)
        expect(verifySignature('topsecret', body + ' ', sig)).toBe(false)
    })

    it('rejects a wrong secret', () => {
        const body = JSON.stringify({ event: 'test' })
        const sig = signPayload('topsecret', body)
        expect(verifySignature('wrong', body, sig)).toBe(false)
    })

    it('rejects a malformed signature without throwing', () => {
        const body = JSON.stringify({ event: 'test' })
        expect(verifySignature('topsecret', body, 'sha256=deadbeef')).toBe(false)
    })
})

describe('dispatchWebhook', () => {
    const origFetch = global.fetch
    const origUrls = process.env.PUBLISH_WEBHOOK_URLS
    const origSecret = process.env.WEBHOOK_SECRET

    afterEach(() => {
        global.fetch = origFetch
        if (origUrls === undefined) delete process.env.PUBLISH_WEBHOOK_URLS
        else process.env.PUBLISH_WEBHOOK_URLS = origUrls
        if (origSecret === undefined) delete process.env.WEBHOOK_SECRET
        else process.env.WEBHOOK_SECRET = origSecret
    })

    it('no-ops when URL list env is missing', async () => {
        delete process.env.PUBLISH_WEBHOOK_URLS
        const fetchSpy = jest.fn()
        global.fetch = fetchSpy as any
        const result = await dispatchWebhook({ type: 'post.published', occurredAt: '2026-01-01T00:00:00Z', data: {} })
        expect(result.attempted).toEqual([])
        expect(fetchSpy).not.toHaveBeenCalled()
    })

    it('POSTs each URL with the event payload + headers', async () => {
        process.env.PUBLISH_WEBHOOK_URLS = 'https://a.example/hook,https://b.example/hook'
        delete process.env.WEBHOOK_SECRET
        const calls: Array<{ url: string; init: RequestInit }> = []
        global.fetch = (async (url: any, init: any) => {
            calls.push({ url, init })
            return new Response('ok', { status: 200 })
        }) as any

        const result = await dispatchWebhook({ type: 'post.published', occurredAt: '2026-01-01T00:00:00Z', data: { slug: 'foo' } })
        expect(result.attempted).toEqual(['https://a.example/hook', 'https://b.example/hook'])
        expect(calls).toHaveLength(2)
        for (const call of calls) {
            expect(call.init.method).toBe('POST')
            const headers = call.init.headers as Record<string, string>
            expect(headers['content-type']).toBe('application/json')
            expect(headers['x-webhook-event']).toBe('post.published')
            expect(headers['x-webhook-signature']).toBeUndefined() // no secret set
            const body = JSON.parse(call.init.body as string)
            expect(body.type).toBe('post.published')
            expect(body.data.slug).toBe('foo')
        }
    })

    it('signs the body when WEBHOOK_SECRET is set', async () => {
        process.env.PUBLISH_WEBHOOK_URLS = 'https://a.example/hook'
        process.env.WEBHOOK_SECRET = 'topsecret'
        let captured: any
        global.fetch = (async (url: any, init: any) => {
            captured = init
            return new Response('ok', { status: 200 })
        }) as any

        await dispatchWebhook({ type: 'post.published', occurredAt: '2026-01-01T00:00:00Z', data: {} })

        const sig = (captured.headers as Record<string, string>)['x-webhook-signature']
        expect(sig).toMatch(/^sha256=[0-9a-f]{64}$/)
        expect(verifySignature('topsecret', captured.body, sig)).toBe(true)
    })

    it('does not throw if the destination errors', async () => {
        process.env.PUBLISH_WEBHOOK_URLS = 'https://broken.example/hook'
        delete process.env.WEBHOOK_SECRET
        global.fetch = (async () => { throw new Error('connection refused') }) as any

        const result = await dispatchWebhook({ type: 'post.published', occurredAt: '2026-01-01T00:00:00Z', data: {} })
        expect(result.attempted).toEqual(['https://broken.example/hook'])
    })
})
