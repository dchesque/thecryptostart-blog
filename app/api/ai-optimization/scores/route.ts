import { getAllPosts } from '@/lib/posts'
import { calculateAIOptimizationScore } from '@/lib/ai-optimization'

/**
 * API Route to calculate AI Optimization Scores for all blog posts.
 * Used by the Admin Dashboard.
 */
export async function GET() {
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

        return Response.json(scores)
    } catch (error) {
        console.error('Failed to calculate AI scores:', error)
        return Response.json(
            { error: 'Failed to calculate scores', details: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        )
    }
}
