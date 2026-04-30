import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logRequest, logSuccess, logError, createTimer } from '@/lib/logger'

const PATH = '/api/tags'

/**
 * Aggregated list of tags across PUBLISHED posts, with counts.
 */
export async function GET() {
    const t = createTimer()
    logRequest('GET', PATH)

    try {
        const posts = await prisma.post.findMany({
            where: { status: 'PUBLISHED' },
            select: { tags: true },
        })

        const counts = new Map<string, number>()
        for (const p of posts) {
            for (const tag of p.tags) {
                counts.set(tag, (counts.get(tag) || 0) + 1)
            }
        }

        const tags = Array.from(counts.entries())
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))

        logSuccess({ method: 'GET', path: PATH, durationMs: t.ms(), extra: { count: tags.length } })
        return NextResponse.json({ tags })
    } catch (error) {
        logError({ method: 'GET', path: PATH, error })
        return NextResponse.json({ error: 'Failed to fetch tags' }, { status: 500 })
    }
}
