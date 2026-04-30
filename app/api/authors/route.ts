import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logRequest, logSuccess, logError, createTimer } from '@/lib/logger'

const PATH = '/api/authors'

/**
 * Public list of authors that have at least one PUBLISHED post.
 */
export async function GET() {
    const t = createTimer()
    logRequest('GET', PATH)

    try {
        const authors = await prisma.author.findMany({
            where: {
                posts: { some: { status: 'PUBLISHED' } },
            },
            orderBy: { name: 'asc' },
            select: {
                id: true,
                name: true,
                slug: true,
                bio: true,
                avatar: true,
                socialLinks: true,
                _count: {
                    select: {
                        posts: { where: { status: 'PUBLISHED' } },
                    },
                },
            },
        })

        const formatted = authors.map((a) => ({
            id: a.id,
            name: a.name,
            slug: a.slug,
            bio: a.bio,
            avatar: a.avatar,
            socialLinks: a.socialLinks,
            postCount: a._count.posts,
        }))

        logSuccess({ method: 'GET', path: PATH, durationMs: t.ms(), extra: { count: formatted.length } })
        return NextResponse.json({ authors: formatted })
    } catch (error) {
        logError({ method: 'GET', path: PATH, error })
        return NextResponse.json({ error: 'Failed to fetch authors' }, { status: 500 })
    }
}
