import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logRequest, logSuccess, logError, createTimer } from '@/lib/logger'

const PATH = '/api/stats'

/**
 * Public aggregate stats for the blog.
 * Safe for unauthenticated consumers (counts only, no sensitive data).
 */
export async function GET() {
    const t = createTimer()
    logRequest('GET', PATH)

    try {
        const [posts, drafts, categories, authors, approvedComments] = await Promise.all([
            prisma.post.count({ where: { status: 'PUBLISHED' } }),
            prisma.post.count({ where: { status: 'DRAFT' } }),
            prisma.category.count(),
            prisma.author.count({ where: { posts: { some: { status: 'PUBLISHED' } } } }),
            prisma.comment.count({ where: { status: 'APPROVED' } }),
        ])

        logSuccess({ method: 'GET', path: PATH, durationMs: t.ms() })
        return NextResponse.json({
            publishedPosts: posts,
            draftPosts: drafts,
            categories,
            authors,
            approvedComments,
            generatedAt: new Date().toISOString(),
        })
    } catch (error) {
        logError({ method: 'GET', path: PATH, error })
        return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
    }
}
