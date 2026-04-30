import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logRequest, logSuccess, logError, createTimer } from '@/lib/logger'

const PATH = '/api/categories'

/**
 * Public list of categories with published-post counts.
 */
export async function GET() {
    const t = createTimer()
    logRequest('GET', PATH)

    try {
        const categories = await prisma.category.findMany({
            orderBy: [{ order: 'asc' }, { name: 'asc' }],
            select: {
                id: true,
                name: true,
                slug: true,
                description: true,
                icon: true,
                color: true,
                order: true,
                _count: {
                    select: {
                        posts: { where: { status: 'PUBLISHED' } },
                    },
                },
            },
        })

        const formatted = categories.map((c) => ({
            id: c.id,
            name: c.name,
            slug: c.slug,
            description: c.description,
            icon: c.icon,
            color: c.color,
            order: c.order,
            postCount: c._count.posts,
        }))

        logSuccess({ method: 'GET', path: PATH, durationMs: t.ms(), extra: { count: formatted.length } })
        return NextResponse.json({ categories: formatted })
    } catch (error) {
        logError({ method: 'GET', path: PATH, error })
        return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
    }
}
