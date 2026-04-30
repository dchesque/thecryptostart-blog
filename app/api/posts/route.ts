import { NextRequest, NextResponse } from 'next/server'
import { getAllPosts, getTotalPostsCount } from '@/lib/posts'
import { logRequest, logSuccess, logError, createTimer } from '@/lib/logger'

const PATH = '/api/posts'

/**
 * Public, read-only listing of PUBLISHED posts.
 *
 * Query params:
 *   limit:    page size (default 10, max 100)
 *   skip:     offset for pagination
 *   page:     1-based page index (alternative to skip)
 *   category: category slug filter
 *   tag:      single tag filter (repeatable: tag=foo&tag=bar)
 */
export async function GET(req: NextRequest) {
    const t = createTimer()
    const { searchParams } = new URL(req.url)

    const limit = Math.min(parseInt(searchParams.get('limit') || '10', 10), 100)
    const page = Math.max(parseInt(searchParams.get('page') || '1', 10), 1)
    const skip = searchParams.get('skip')
        ? parseInt(searchParams.get('skip') as string, 10)
        : (page - 1) * limit
    const category = searchParams.get('category') || undefined
    const tags = searchParams.getAll('tag')

    logRequest('GET', PATH, { limit, skip, category, tags })

    try {
        const [posts, total] = await Promise.all([
            getAllPosts({ limit, skip, category: category as any, tags }),
            getTotalPostsCount(category),
        ])

        logSuccess({ method: 'GET', path: PATH, durationMs: t.ms(), extra: { count: posts.length, total } })
        return NextResponse.json({
            posts,
            pagination: {
                total,
                pages: Math.max(Math.ceil(total / limit), 1),
                currentPage: page,
                limit,
            },
        })
    } catch (error) {
        logError({ method: 'GET', path: PATH, error })
        return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 })
    }
}
