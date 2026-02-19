/**
 * Internal Link Building
 * Encontrar oportunidades de internal linking
 */

import type { BlogPost } from '@/types/blog'

export interface LinkingSuggestion {
    sourceSlug: string
    sourceTitle: string
    targetSlug: string
    targetTitle: string
    anchorText: string
    relevanceScore: number
    reason: string
}

/**
 * Tokenizar e stemmatizar texto (versão simplificada)
 */
function tokenize(text: string): string[] {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove acentos
        .split(/[\s\-.,!?;:()]+/)
        .filter(word => word.length > 3)
}

/**
 * Calcular similaridade Jaccard entre dois textos
 */
function calculateSimilarity(text1: string, text2: string): number {
    const tokens1 = new Set(tokenize(text1))
    const tokens2 = new Set(tokenize(text2))

    if (tokens1.size === 0 || tokens2.size === 0) return 0

    const intersection = new Set([...tokens1].filter(x => tokens2.has(x)))
    const union = new Set([...tokens1, ...tokens2])

    return intersection.size / union.size
}

/**
 * Encontrar oportunidades de linking para um post alvo
 */
export function findLinkingOpportunities(
    sourcePosts: BlogPost[],
    targetPost: BlogPost
): LinkingSuggestion[] {
    const suggestions: LinkingSuggestion[] = []

    sourcePosts.forEach(sourcePost => {
        // Skip se for o mesmo post
        if (sourcePost.slug === targetPost.slug) return

        // Calcular relevância entre títulos
        const titleSimilarity = calculateSimilarity(
            sourcePost.title,
            targetPost.title
        )

        // Calcular relevância entre tags
        const sourceTags = new Set(sourcePost.tags || [])
        const targetTags = new Set(targetPost.tags || [])
        const commonTags = [...sourceTags].filter(tag => targetTags.has(tag))
        const tagRelevance = Math.max(sourceTags.size, targetTags.size) > 0
            ? commonTags.length / Math.max(sourceTags.size, targetTags.size)
            : 0

        // Calcular relevância entre categorias
        const sameCategory = sourcePost.category === targetPost.category ? 0.3 : 0

        // Score final ponderado
        const relevanceScore = titleSimilarity * 0.5 + tagRelevance * 0.3 + sameCategory * 0.2

        // Se score > 0.15, é uma oportunidade decente
        if (relevanceScore > 0.15) {
            suggestions.push({
                sourceSlug: sourcePost.slug,
                sourceTitle: sourcePost.title,
                targetSlug: targetPost.slug,
                targetTitle: targetPost.title,
                anchorText: targetPost.title,
                relevanceScore,
                reason: commonTags.length > 0
                    ? `Shares tags: ${commonTags.join(', ')}`
                    : sameCategory > 0
                        ? `Same category: ${sourcePost.category}`
                        : 'Similar topic detected',
            })
        }
    })

    // Retornar top 5, ordenado por score
    return suggestions
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, 5)
}

/**
 * Gerar sugestões de linking para todos os posts
 */
export function generateLinkingSuggestionsForAll(
    posts: BlogPost[]
): { [slug: string]: LinkingSuggestion[] } {
    const suggestions: { [slug: string]: LinkingSuggestion[] } = {}

    posts.forEach(post => {
        const otherPosts = posts.filter(p => p.slug !== post.slug)
        suggestions[post.slug] = findLinkingOpportunities(otherPosts, post)
    })

    return suggestions
}
