import { getAllPosts } from '@/lib/contentful'
import { analyzeSEO } from '@/lib/seo-analyzer'
import { analyzeAllForExpansion } from '@/lib/content-expander'
import { generateLinkingSuggestionsForAll } from '@/lib/link-builder'
import { NextResponse } from 'next/server'

export async function GET() {
    try {
        const posts = await getAllPosts({ limit: 1000 })

        if (!posts || posts.length === 0) {
            return NextResponse.json({
                totalPosts: 0,
                avgWordCount: 0,
                postsUnder1500Words: 0,
                avgInternalLinks: 0,
                avgExternalLinks: 0,
                contentExpansionOpportunities: [],
                linkingSuggestions: [],
            })
        }

        // Análise de palavra count
        const wordCounts = posts.map(p => analyzeSEO(p.content, p.tags).wordCount)
        const avgWordCount = Math.round(wordCounts.reduce((a, b) => a + b, 0) / posts.length)
        const postsUnder1500Words = wordCounts.filter(w => w < 1500).length

        // Análise de links
        const allAnalysis = posts.map(p => analyzeSEO(p.content, p.tags))
        const avgInternalLinks = Number((allAnalysis.reduce((sum, a) => sum + a.internalLinkCount, 0) / posts.length).toFixed(1))
        const avgExternalLinks = Number((allAnalysis.reduce((sum, a) => sum + a.externalLinkCount, 0) / posts.length).toFixed(1))

        // Oportunidades de expansão
        const expansionOpportunities = analyzeAllForExpansion(posts)

        // Sugestões de linking
        const linkingSuggestionsMap = generateLinkingSuggestionsForAll(posts)
        const flattenedSuggestions = Object.values(linkingSuggestionsMap)
            .flat()
            .sort((a, b) => b.relevanceScore - a.relevanceScore)

        return NextResponse.json({
            totalPosts: posts.length,
            avgWordCount,
            postsUnder1500Words,
            avgInternalLinks,
            avgExternalLinks,
            contentExpansionOpportunities: expansionOpportunities,
            linkingSuggestions: flattenedSuggestions,
        })
    } catch (error) {
        console.error('[SEO API Error]', error)
        return NextResponse.json({ error: 'Failed to fetch SEO metrics' }, { status: 500 })
    }
}
