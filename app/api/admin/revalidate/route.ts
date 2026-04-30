import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath, revalidateTag } from 'next/cache'
import { checkApiAuth } from '@/lib/auth-check'
import { logRequest, logSuccess, logWarn, logError, createTimer } from '@/lib/logger'

const PATH = '/api/admin/revalidate'

/**
 * Trigger Next.js ISR/cache invalidation on demand.
 *
 * Body:
 *   { paths?: string[], tags?: string[], slug?: string }
 *
 *   - paths: explicit paths to revalidate ("/", "/blog", "/blog/foo")
 *   - tags:  cache tags to revalidate
 *   - slug:  shortcut — revalidates "/", "/blog", "/blog/<slug>", "/sitemap.xml"
 *
 * Returns the list of revalidated paths/tags.
 */
export async function POST(req: NextRequest) {
    const authError = await checkApiAuth(req)
    if (authError) return authError

    const t = createTimer()
    logRequest('POST', PATH)

    try {
        const body = await req.json().catch(() => ({}))
        const { paths, tags, slug } = body as {
            paths?: string[]
            tags?: string[]
            slug?: string
        }

        const revalidated: { paths: string[]; tags: string[] } = { paths: [], tags: [] }

        const pathSet = new Set<string>()
        if (Array.isArray(paths)) paths.filter(Boolean).forEach((p) => pathSet.add(p))
        if (slug) {
            pathSet.add('/')
            pathSet.add('/blog')
            pathSet.add('/sitemap.xml')
            pathSet.add(`/blog/${slug}`)
        }

        for (const p of pathSet) {
            revalidatePath(p)
            revalidated.paths.push(p)
        }
        if (Array.isArray(tags)) {
            for (const tag of tags.filter(Boolean)) {
                revalidateTag(tag)
                revalidated.tags.push(tag)
            }
        }

        if (revalidated.paths.length === 0 && revalidated.tags.length === 0) {
            logWarn({ method: 'POST', path: PATH, status: 400, extra: { reason: 'No paths/tags/slug provided' } })
            return NextResponse.json(
                { error: 'Provide at least one of: paths, tags, slug' },
                { status: 400 },
            )
        }

        logSuccess({ method: 'POST', path: PATH, durationMs: t.ms(), extra: revalidated })
        return NextResponse.json({ success: true, revalidated, at: new Date().toISOString() })
    } catch (error) {
        logError({ method: 'POST', path: PATH, error })
        return NextResponse.json({ error: 'Failed to revalidate' }, { status: 500 })
    }
}
