import { NextRequest, NextResponse } from 'next/server'
import { getFeaturedPosts } from '@/lib/posts'
import { logRequest, logSuccess, logError, createTimer } from '@/lib/logger'

const PATH = '/api/posts/featured'

export async function GET(req: NextRequest) {
    const t = createTimer()
    const { searchParams } = new URL(req.url)
    const limit = Math.min(parseInt(searchParams.get('limit') || '3', 10), 24)
    logRequest('GET', PATH, { limit })

    try {
        const posts = await getFeaturedPosts(limit)
        logSuccess({ method: 'GET', path: PATH, durationMs: t.ms(), extra: { count: posts.length } })
        return NextResponse.json({ posts })
    } catch (error) {
        logError({ method: 'GET', path: PATH, error })
        return NextResponse.json({ error: 'Failed to fetch featured posts' }, { status: 500 })
    }
}
