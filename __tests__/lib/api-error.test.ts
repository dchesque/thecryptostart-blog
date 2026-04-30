/**
 * @jest-environment node
 */
import { handleApiError } from '@/lib/api-error'
import { Prisma } from '@prisma/client'

describe('handleApiError', () => {
    it('maps Prisma P2002 (unique constraint) to 409', async () => {
        const err = new Prisma.PrismaClientKnownRequestError(
            'Unique constraint failed',
            { code: 'P2002', clientVersion: 'test', meta: { target: ['slug'] } } as any,
        )
        const res = handleApiError(err, 'Post')
        expect(res.status).toBe(409)
        const body = await res.json()
        expect(body.code).toBe('CONFLICT')
        expect(body.error).toMatch(/already exists/i)
    })

    it('maps Prisma P2025 (record not found) to 404', async () => {
        const err = new Prisma.PrismaClientKnownRequestError('Not found', {
            code: 'P2025', clientVersion: 'test',
        } as any)
        const res = handleApiError(err, 'Author')
        expect(res.status).toBe(404)
        const body = await res.json()
        expect(body.code).toBe('NOT_FOUND')
    })

    it('maps Prisma P2003 (FK violation) to 400 with field hint', async () => {
        const err = new Prisma.PrismaClientKnownRequestError('FK', {
            code: 'P2003', clientVersion: 'test', meta: { field_name: 'authorId' },
        } as any)
        const res = handleApiError(err, 'Post')
        expect(res.status).toBe(400)
        const body = await res.json()
        expect(body.code).toBe('INVALID_REFERENCE')
    })

    it('falls through to 500 for unexpected errors', async () => {
        const res = handleApiError(new Error('boom'), 'Post')
        expect(res.status).toBe(500)
        const body = await res.json()
        expect(body.error).toBe('Internal Server Error')
    })
})
