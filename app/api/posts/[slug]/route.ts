import { NextRequest, NextResponse } from 'next/server'
import { getPostBySlug } from '@/lib/posts'
import { logRequest, logSuccess, logWarn, logError, createTimer } from '@/lib/logger'

const PATH = '/api/posts/[slug]'

/**
 * Public read of a single PUBLISHED post by slug.
 * Returns 404 if missing or not published.
 */
export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    const t = createTimer()
    const { slug } = await params
    logRequest('GET', PATH, { slug })

    try {
        const post = await getPostBySlug(slug)
        if (!post) {
            logWarn({ method: 'GET', path: PATH, status: 404, extra: { slug } })
            return NextResponse.json({ error: 'Post not found' }, { status: 404 })
        }

        logSuccess({ method: 'GET', path: PATH, durationMs: t.ms(), extra: { slug } })
        return NextResponse.json(post)
    } catch (error) {
        logError({ method: 'GET', path: PATH, error, extra: { slug } })
        return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 })
    }
}
