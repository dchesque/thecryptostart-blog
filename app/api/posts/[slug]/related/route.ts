import { NextRequest, NextResponse } from 'next/server'
import { getPostBySlug, getRelatedPosts } from '@/lib/posts'
import { logRequest, logSuccess, logWarn, logError, createTimer } from '@/lib/logger'

const PATH = '/api/posts/[slug]/related'

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    const t = createTimer()
    const { slug } = await params
    const { searchParams } = new URL(req.url)
    const limit = Math.min(parseInt(searchParams.get('limit') || '3', 10), 12)
    logRequest('GET', PATH, { slug, limit })

    try {
        const post = await getPostBySlug(slug)
        if (!post) {
            logWarn({ method: 'GET', path: PATH, status: 404, extra: { slug } })
            return NextResponse.json({ error: 'Post not found' }, { status: 404 })
        }

        const related = await getRelatedPosts(slug, post.category, limit)
        logSuccess({ method: 'GET', path: PATH, durationMs: t.ms(), extra: { slug, returned: related.length } })
        return NextResponse.json({ posts: related })
    } catch (error) {
        logError({ method: 'GET', path: PATH, error, extra: { slug } })
        return NextResponse.json({ error: 'Failed to fetch related posts' }, { status: 500 })
    }
}
