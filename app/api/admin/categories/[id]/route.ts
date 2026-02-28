import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { categorySchema } from '@/lib/validations/admin'
import { z } from 'zod'
import { logRequest, logSuccess, logWarn, logError, createTimer } from '@/lib/logger'

const PATH = '/api/admin/categories/[id]'

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const t = createTimer()
    const { id } = await params
    logRequest('GET', PATH, { id })

    try {
        const category = await prisma.category.findUnique({ where: { id } })

        if (!category) {
            logWarn({ method: 'GET', path: PATH, status: 404, extra: { id, reason: 'Category not found' } })
            return NextResponse.json({ error: 'Category not found' }, { status: 404 })
        }

        logSuccess({ method: 'GET', path: PATH, durationMs: t.ms(), extra: { id } })
        return NextResponse.json(category)
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
        const data = categorySchema.parse(body)

        const category = await prisma.category.update({ where: { id }, data })

        logSuccess({ method: 'PUT', path: PATH, durationMs: t.ms(), extra: { id } })
        return NextResponse.json(category)
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
        await prisma.category.delete({ where: { id } })

        logSuccess({ method: 'DELETE', path: PATH, status: 204, durationMs: t.ms(), extra: { id } })
        return new NextResponse(null, { status: 204 })
    } catch (error) {
        logError({ method: 'DELETE', path: PATH, error, extra: { id } })
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
