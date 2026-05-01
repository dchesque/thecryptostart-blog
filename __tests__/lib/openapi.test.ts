/**
 * @jest-environment node
 */
import { buildOpenApiSpec } from '@/lib/openapi'

describe('buildOpenApiSpec', () => {
    const spec: any = buildOpenApiSpec()

    it('produces OpenAPI 3.1', () => {
        expect(spec.openapi).toBe('3.1.0')
    })

    it('has metadata', () => {
        expect(spec.info?.title).toBe('The Crypto Start API')
        expect(spec.info?.version).toBe('1.0.0')
    })

    it('registers admin security schemes', () => {
        expect(spec.components?.securitySchemes?.AdminApiKey?.in).toBe('header')
        expect(spec.components?.securitySchemes?.AdminApiKey?.name).toBe('X-API-Key')
    })

    it('declares the new public read endpoints', () => {
        const paths = Object.keys(spec.paths || {})
        for (const expected of [
            '/api/posts',
            '/api/posts/{slug}',
            '/api/posts/{slug}/related',
            '/api/posts/featured',
            '/api/categories',
            '/api/categories/{slug}',
            '/api/authors',
            '/api/authors/{slug}',
            '/api/search',
            '/api/tags',
            '/api/stats',
            '/api/health',
        ]) {
            expect(paths).toContain(expected)
        }
    })

    it('declares newsletter endpoints', () => {
        const paths = Object.keys(spec.paths || {})
        expect(paths).toContain('/api/newsletter/subscribe')
        expect(paths).toContain('/api/newsletter/confirm')
        expect(paths).toContain('/api/newsletter/unsubscribe')
    })

    it('declares password reset endpoints', () => {
        const paths = Object.keys(spec.paths || {})
        expect(paths).toContain('/api/auth/password-reset/request')
        expect(paths).toContain('/api/auth/password-reset/confirm')
    })

    it('admin endpoints declare AdminApiKey or Session security', () => {
        const adminPath = spec.paths?.['/api/admin/posts']?.get
        expect(adminPath).toBeDefined()
        expect(JSON.stringify(adminPath?.security || [])).toMatch(/AdminApiKey|Session/)
    })
})
