/**
 * API Route para GSC Analytics
 * GET /api/gsc/analytics
 */

import { createGSCClient, GSCAnalytics } from '@/lib/gsc-client'
import { NextResponse } from 'next/server'
import { auth } from '@/auth'

// Rate limit (opcional)
const CACHE_TTL = 3600 // 1 hora em cache

export async function GET() {
    try {
        // Verificar auth
        const session = await auth()

        // Deixar aberto para desenvolvimento se não houver sessão, mas em produção deve ser restrito
        // No projeto atual, o admin é controlado pelo auth.ts
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const gsc = createGSCClient()

        // Buscar analytics
        const analytics = await gsc.getAnalytics()

        // Adicionar metadata
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

        // Cache com revalidation
        return NextResponse.json(response, {
            headers: {
                'Cache-Control': `public, max-age=${CACHE_TTL}`,
            },
        })
    } catch (error) {
        console.error('[GSC API Error]', error)
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

    // Recommendation 1: CTR optimization
    if (analytics.avgCTR < 0.05) {
        recommendations.push({
            priority: 'high',
            title: 'Optimize Low CTR Pages',
            description: `${analytics.lowCTRPages.length} pages have CTR < 5%`,
            action: 'Improve titles and meta descriptions',
        })
    }

    // Recommendation 2: Position optimization
    if (analytics.avgPosition > 15) {
        recommendations.push({
            priority: 'high',
            title: 'Improve Average Ranking Position',
            description: `Average position is ${analytics.avgPosition.toFixed(1)}`,
            action: 'Add more internal links and improve content quality',
        })
    }

    // Recommendation 3: High impression pages not ranking
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
