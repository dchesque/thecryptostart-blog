import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { transformPrismaPost } from '@/lib/posts'
import { logRequest, logSuccess, logWarn, logError, createTimer } from '@/lib/logger'

const PATH = '/api/authors/[slug]'

/**
 * Public read of a single author with their PUBLISHED posts.
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
        const author = await prisma.author.findUnique({
            where: { slug },
            select: {
                id: true,
                name: true,
                slug: true,
                bio: true,
                avatar: true,
                socialLinks: true,
            },
        })

        if (!author) {
            logWarn({ method: 'GET', path: PATH, status: 404, extra: { slug } })
            return NextResponse.json({ error: 'Author not found' }, { status: 404 })
        }

        const [posts, total] = await Promise.all([
            prisma.post.findMany({
                where: {
                    status: 'PUBLISHED',
                    author: { slug },
                    OR: [{ publishDate: null }, { publishDate: { lte: new Date() } }],
                },
                include: { author: true, category: true },
                orderBy: [{ publishDate: 'desc' }, { createdAt: 'desc' }],
                take: limit,
                skip,
            }),
            prisma.post.count({
                where: {
                    status: 'PUBLISHED',
                    author: { slug },
                    OR: [{ publishDate: null }, { publishDate: { lte: new Date() } }],
                },
            }),
        ])

        logSuccess({ method: 'GET', path: PATH, durationMs: t.ms(), extra: { slug, count: posts.length } })
        return NextResponse.json({
            author,
            posts: posts.map(transformPrismaPost),
            pagination: {
                total,
                pages: Math.max(Math.ceil(total / limit), 1),
                limit,
            },
        })
    } catch (error) {
        logError({ method: 'GET', path: PATH, error, extra: { slug } })
        return NextResponse.json({ error: 'Failed to fetch author' }, { status: 500 })
    }
}
