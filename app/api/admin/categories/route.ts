import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { categorySchema } from '@/lib/validations/admin'
import { z } from 'zod'
import { logRequest, logSuccess, logWarn, logError, createTimer } from '@/lib/logger'

const PATH = '/api/admin/categories'

export async function GET(req: NextRequest) {
    const t = createTimer()
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit
    logRequest('GET', PATH, { page, limit })

    try {
        const [categories, total] = await Promise.all([
            prisma.category.findMany({
                orderBy: { order: 'asc' },
                skip,
                take: limit,
                include: {
                    _count: {
                        select: { posts: true }
                    }
                }
            }),
            prisma.category.count()
        ])

        logSuccess({ method: 'GET', path: PATH, durationMs: t.ms(), extra: { total, returned: categories.length } })
        return NextResponse.json({
            categories,
            pagination: {
                total,
                pages: Math.ceil(total / limit),
                currentPage: page
            }
        })
    } catch (error) {
        logError({ method: 'GET', path: PATH, error })
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    const t = createTimer()
    logRequest('POST', PATH)

    try {
        const body = await req.json()
        const data = categorySchema.parse(body)

        const category = await prisma.category.create({ data })

        logSuccess({ method: 'POST', path: PATH, status: 201, durationMs: t.ms(), extra: { categoryId: category.id, slug: category.slug } })
        return NextResponse.json(category, { status: 201 })
    } catch (error) {
        if (error instanceof z.ZodError) {
            logWarn({ method: 'POST', path: PATH, status: 400, extra: { reason: 'Validation error', errors: (error as any).errors } })
            return NextResponse.json({ error: (error as any).errors }, { status: 400 })
        }
        logError({ method: 'POST', path: PATH, error })
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
