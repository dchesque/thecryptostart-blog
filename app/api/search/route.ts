import { NextRequest, NextResponse } from 'next/server'
import { searchPosts } from '@/lib/posts'
import { logRequest, logSuccess, logWarn, logError, createTimer } from '@/lib/logger'

const PATH = '/api/search'

/**
 * Public full-text-ish search over PUBLISHED posts.
 *
 * Query params:
 *   q:     query string (required, min 2 chars)
 *   limit: result cap (default 10, max 50)
 */
export async function GET(req: NextRequest) {
    const t = createTimer()
    const { searchParams } = new URL(req.url)
    const q = (searchParams.get('q') || '').trim()
    const limit = Math.min(parseInt(searchParams.get('limit') || '10', 10), 50)
    logRequest('GET', PATH, { q, limit })

    if (q.length < 2) {
        logWarn({ method: 'GET', path: PATH, status: 400, extra: { reason: 'Query too short', q } })
        return NextResponse.json({ error: 'Query parameter "q" must be at least 2 characters' }, { status: 400 })
    }

    try {
        const results = await searchPosts(q, { limit })
        logSuccess({ method: 'GET', path: PATH, durationMs: t.ms(), extra: { q, returned: results.length } })
        return NextResponse.json({ query: q, results, count: results.length })
    } catch (error) {
        logError({ method: 'GET', path: PATH, error, extra: { q } })
        return NextResponse.json({ error: 'Search failed' }, { status: 500 })
    }
}
