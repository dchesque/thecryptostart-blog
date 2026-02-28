import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authorSchema } from '@/lib/validations/admin'
import { z } from 'zod'
import { logRequest, logSuccess, logWarn, logError, createTimer } from '@/lib/logger'

const PATH = '/api/admin/authors/[id]'

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const t = createTimer()
    const { id } = await params
    logRequest('GET', PATH, { id })

    try {
        const author = await prisma.author.findUnique({ where: { id } })

        if (!author) {
            logWarn({ method: 'GET', path: PATH, status: 404, extra: { id, reason: 'Author not found' } })
            return NextResponse.json({ error: 'Author not found' }, { status: 404 })
        }

        logSuccess({ method: 'GET', path: PATH, durationMs: t.ms(), extra: { id } })
        return NextResponse.json(author)
    } catch (error) {
        logError({ method: 'GET', path: PATH, error, extra: { id } })
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const t = createTimer()
    const { id } = await params
    logRequest('PUT', PATH, { id })

    try {
        const body = await req.json()
        const data = authorSchema.parse(body)

        const author = await prisma.author.update({ where: { id }, data })

        logSuccess({ method: 'PUT', path: PATH, durationMs: t.ms(), extra: { id } })
        return NextResponse.json(author)
    } catch (error) {
        if (error instanceof z.ZodError) {
            logWarn({ method: 'PUT', path: PATH, status: 400, extra: { id, reason: 'Validation error', errors: (error as any).errors } })
            return NextResponse.json({ error: (error as any).errors }, { status: 400 })
        }
        logError({ method: 'PUT', path: PATH, error, extra: { id } })
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const t = createTimer()
    const { id } = await params
    logRequest('DELETE', PATH, { id })

    try {
        await prisma.author.delete({ where: { id } })

        logSuccess({ method: 'DELETE', path: PATH, status: 204, durationMs: t.ms(), extra: { id } })
        return new NextResponse(null, { status: 204 })
    } catch (error) {
        logError({ method: 'DELETE', path: PATH, error, extra: { id } })
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
