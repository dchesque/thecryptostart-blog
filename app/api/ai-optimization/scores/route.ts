import { getAllPosts } from '@/lib/posts'
import { calculateAIOptimizationScore } from '@/lib/ai-optimization'
import { logRequest, logSuccess, logError, createTimer } from '@/lib/logger'

const PATH = '/api/ai-optimization/scores'

/**
 * API Route to calculate AI Optimization Scores for all blog posts.
 * Used by the Admin Dashboard.
 */
export async function GET() {
    const t = createTimer()
    logRequest('GET', PATH)

    try {
        const posts = await getAllPosts()

        const scores = posts.map(post => {
            const aiScore = calculateAIOptimizationScore(post)
            return {
                slug: post.slug,
                title: post.title,
                score: aiScore.overallScore,
                hasQuickAnswer: aiScore.hasQuickAnswer,
                hasFAQ: aiScore.hasFAQSchema,
                citableSentences: aiScore.citableSentences,
                authorBio: !!post.author.bio,
                recommendations: aiScore.recommendations,
            }
        })

        logSuccess({ method: 'GET', path: PATH, durationMs: t.ms(), extra: { postsAnalyzed: scores.length } })
        return Response.json(scores)
    } catch (error) {
        logError({ method: 'GET', path: PATH, error })
        return Response.json(
            { error: 'Failed to calculate scores', details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        )
    }
}
