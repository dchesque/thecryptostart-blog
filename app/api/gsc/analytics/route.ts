/**
 * API Route para GSC Analytics
 * GET /api/gsc/analytics
 */

import { createGSCClient, GSCAnalytics } from '@/lib/gsc-client'
import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { logRequest, logSuccess, logWarn, logError, createTimer } from '@/lib/logger'

const PATH = '/api/gsc/analytics'
const CACHE_TTL = 3600

export async function GET() {
    const t = createTimer()
    logRequest('GET', PATH)

    try {
        const session = await auth()

        if (!session?.user) {
            logWarn({ method: 'GET', path: PATH, status: 401, extra: { reason: 'Unauthorized — no session' } })
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const gsc = createGSCClient()
        const analytics = await gsc.getAnalytics()

        const response = {
            ...analytics,
            lastFetched: new Date().toISOString(),
            dataPoints: {
                topQueriesCount: analytics.topQueries.length,
                topPagesCount: analytics.topPages.length,
                lowCTRPagesCount: analytics.lowCTRPages.length,
            },
            recommendations: generateRecommendations(analytics),
        }

        logSuccess({
            method: 'GET', path: PATH, durationMs: t.ms(), extra: {
                topQueries: analytics.topQueries.length,
                topPages: analytics.topPages.length,
                avgPosition: analytics.avgPosition,
            }
        })

        return NextResponse.json(response, {
            headers: { 'Cache-Control': `public, max-age=${CACHE_TTL}` },
        })
    } catch (error) {
        logError({ method: 'GET', path: PATH, error })
        return NextResponse.json(
            {
                error: 'Failed to fetch GSC analytics',
                message: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        )
    }
}

function generateRecommendations(analytics: GSCAnalytics) {
    const recommendations = []

    if (analytics.avgCTR < 0.05) {
        recommendations.push({
            priority: 'high',
            title: 'Optimize Low CTR Pages',
            description: `${analytics.lowCTRPages.length} pages have CTR < 5%`,
            action: 'Improve titles and meta descriptions',
        })
    }

    if (analytics.avgPosition > 15) {
        recommendations.push({
            priority: 'high',
            title: 'Improve Average Ranking Position',
            description: `Average position is ${analytics.avgPosition.toFixed(1)}`,
            action: 'Add more internal links and improve content quality',
        })
    }

    const highImpressionLowClick = analytics.topPages.filter(
        (p: any) => p.impressions > 100 && p.clicks < 5
    )
    if (highImpressionLowClick.length > 0) {
        recommendations.push({
            priority: 'high',
            title: 'Fix High Impression/Low Click Pages',
            description: `${highImpressionLowClick.length} pages have high impressions but low CTR`,
            action: 'These pages are being shown but not clicked. Optimize titles/descriptions.',
        })
    }

    return recommendations
}
