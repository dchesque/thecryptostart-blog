import { getAllPosts } from '@/lib/posts'
import { analyzeSEO } from '@/lib/seo-analyzer'
import { analyzeAllForExpansion } from '@/lib/content-expander'
import { generateLinkingSuggestionsForAll } from '@/lib/link-builder'
import { NextRequest, NextResponse } from 'next/server'
import { checkApiAuth } from '@/lib/auth-check'
import { logRequest, logSuccess, logWarn, logError, createTimer } from '@/lib/logger'

const PATH = '/api/seo/metrics'
const CACHE_TTL_MS = 5 * 60 * 1000

let cached: { at: number; payload: unknown } | null = null

export async function GET(req: NextRequest) {
    const t = createTimer()
    logRequest('GET', PATH)

    const authError = await checkApiAuth(req)
    if (authError) return authError

    if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
        logSuccess({ method: 'GET', path: PATH, durationMs: t.ms(), extra: { fromCache: true } })
        return NextResponse.json(cached.payload, {
            headers: { 'X-Cache': 'HIT', 'Cache-Control': 'private, max-age=300' },
        })
    }

    try {
        const posts = await getAllPosts({ limit: 1000 })

        if (!posts || posts.length === 0) {
            logWarn({ method: 'GET', path: PATH, extra: { reason: 'No posts found' } })
            const empty = {
                totalPosts: 0,
                avgWordCount: 0,
                postsUnder1500Words: 0,
                avgInternalLinks: 0,
                avgExternalLinks: 0,
                contentExpansionOpportunities: [],
                linkingSuggestions: [],
            }
            cached = { at: Date.now(), payload: empty }
            return NextResponse.json(empty, { headers: { 'X-Cache': 'MISS' } })
        }

        const wordCounts = posts.map(p => analyzeSEO(p.content, p.tags).wordCount)
        const avgWordCount = Math.round(wordCounts.reduce((a, b) => a + b, 0) / posts.length)
        const postsUnder1500Words = wordCounts.filter(w => w < 1500).length

        const allAnalysis = posts.map(p => analyzeSEO(p.content, p.tags))
        const avgInternalLinks = Number((allAnalysis.reduce((sum, a) => sum + a.internalLinkCount, 0) / posts.length).toFixed(1))
        const avgExternalLinks = Number((allAnalysis.reduce((sum, a) => sum + a.externalLinkCount, 0) / posts.length).toFixed(1))

        const expansionOpportunities = analyzeAllForExpansion(posts)

        const linkingSuggestionsMap = generateLinkingSuggestionsForAll(posts)
        const flattenedSuggestions = Object.values(linkingSuggestionsMap)
            .flat()
            .sort((a, b) => b.relevanceScore - a.relevanceScore)

        const payload = {
            totalPosts: posts.length,
            avgWordCount,
            postsUnder1500Words,
            avgInternalLinks,
            avgExternalLinks,
            contentExpansionOpportunities: expansionOpportunities,
            linkingSuggestions: flattenedSuggestions,
        }

        cached = { at: Date.now(), payload }

        logSuccess({
            method: 'GET', path: PATH, durationMs: t.ms(), extra: {
                totalPosts: posts.length,
                avgWordCount,
                postsUnder1500Words,
                suggestions: flattenedSuggestions.length,
                fromCache: false,
            },
        })

        return NextResponse.json(payload, {
            headers: { 'X-Cache': 'MISS', 'Cache-Control': 'private, max-age=300' },
        })
    } catch (error) {
        logError({ method: 'GET', path: PATH, error })
        return NextResponse.json({ error: 'Failed to fetch SEO metrics' }, { status: 500 })
    }
}
