import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getPostsByCategory } from '@/lib/posts'
import { logRequest, logSuccess, logWarn, logError, createTimer } from '@/lib/logger'

const PATH = '/api/categories/[slug]'

/**
 * Public read of a single category, including its published posts.
 *
 * Query params:
 *   limit: posts per page (default 10, max 100)
 *   skip:  offset
 */
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    const t = createTimer()
    const { slug } = await params
    const { searchParams } = new URL(req.url)
    const limit = Math.min(parseInt(searchParams.get('limit') || '10', 10), 100)
    const skip = parseInt(searchParams.get('skip') || '0', 10)

    logRequest('GET', PATH, { slug, limit, skip })

    try {
        const category = await prisma.category.findUnique({
            where: { slug },
            select: {
                id: true,
                name: true,
                slug: true,
                description: true,
                icon: true,
                color: true,
                order: true,
            },
        })

        if (!category) {
            logWarn({ method: 'GET', path: PATH, status: 404, extra: { slug } })
            return NextResponse.json({ error: 'Category not found' }, { status: 404 })
        }

        const posts = await getPostsByCategory(slug, { limit, skip })
        const total = await prisma.post.count({
            where: {
                status: 'PUBLISHED',
                category: { slug },
                OR: [{ publishDate: null }, { publishDate: { lte: new Date() } }],
            },
        })

        logSuccess({ method: 'GET', path: PATH, durationMs: t.ms(), extra: { slug, count: posts.length } })
        return NextResponse.json({
            category,
            posts,
            pagination: {
                total,
                pages: Math.max(Math.ceil(total / limit), 1),
                limit,
            },
        })
    } catch (error) {
        logError({ method: 'GET', path: PATH, error, extra: { slug } })
        return NextResponse.json({ error: 'Failed to fetch category' }, { status: 500 })
    }
}
