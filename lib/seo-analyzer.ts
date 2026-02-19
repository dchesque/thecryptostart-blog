/**
 * SEO Analysis Utilities
 * Analisar e otimizar conteúdo para SEO
 */

import type { Document } from '@contentful/rich-text-types'

export interface SEOAnalysis {
    wordCount: number
    readingTime: number
    headingCount: number
    internalLinkCount: number
    externalLinkCount: number
    imageCount: number
    keywordDensity: { [key: string]: number }
    headingHierarchy: string[]
    recommendations: string[]
    score: number // 0-100
}

/**
 * Contar palavras em documento
 */
export function countWords(content: Document): number {
    if (!content?.content) return 0

    let wordCount = 0

    const traverse = (node: any) => {
        if (node.nodeType === 'text' && node.value) {
            wordCount += node.value.split(/\s+/).filter(Boolean).length
        }
        if (node.content && Array.isArray(node.content)) {
            node.content.forEach(traverse)
        }
    }

    content.content.forEach(traverse)
    return wordCount
}

/**
 * Extrair todos os links
 */
export function extractLinks(content: Document): {
    internal: string[]
    external: string[]
} {
    if (!content?.content) return { internal: [], external: [] }

    const internal: string[] = []
    const external: string[] = []

    const traverse = (node: any) => {
        if (node.nodeType === 'hyperlink' && node.data?.uri) {
            const url = node.data.uri
            if (url.startsWith('/') || url.includes('thecryptostart.com')) {
                internal.push(url)
            } else {
                external.push(url)
            }
        }
        if (node.content && Array.isArray(node.content)) {
            node.content.forEach(traverse)
        }
    }

    content.content.forEach(traverse)
    return { internal, external }
}

/**
 * Contar imagens
 */
export function countImages(content: Document): number {
    if (!content?.content) return 0

    let imageCount = 0

    const traverse = (node: any) => {
        if (node.nodeType === 'embedded-asset' || node.nodeType === 'embedded-entry' || node.nodeType === 'asset-hyperlink') {
            imageCount++
        }
        if (node.content && Array.isArray(node.content)) {
            node.content.forEach(traverse)
        }
    }

    content.content.forEach(traverse)
    return imageCount
}

/**
 * Extrair headings
 */
export function extractHeadings(content: Document): string[] {
    if (!content?.content) return []

    const headings: string[] = []

    const traverse = (node: any) => {
        if (node.nodeType?.includes('heading')) {
            const text = extractTextFromNode(node)
            if (text) headings.push(text)
        }
        if (node.content && Array.isArray(node.content)) {
            node.content.forEach(traverse)
        }
    }

    content.content.forEach(traverse)
    return headings
}

function extractTextFromNode(node: any): string {
    if (node.nodeType === 'text') return node.value || ''
    if (!node.content) return ''
    return node.content
        .map((child: any) => extractTextFromNode(child))
        .join('')
}

/**
 * Analisar SEO completo
 */
export function analyzeSEO(
    content: Document,
    keywords: string[] = []
): SEOAnalysis {
    const wordCount = countWords(content)
    const { internal, external } = extractLinks(content)
    const imageCount = countImages(content)
    const headings = extractHeadings(content)
    const readingTime = Math.ceil(wordCount / 200)

    // Keyword density
    const keywordDensity: { [key: string]: number } = {}
    const contentText = extractTextFromNode({ content: content.content, nodeType: 'document', data: {} } as any).toLowerCase()

    keywords.forEach(keyword => {
        const kw = keyword.toLowerCase()
        const regex = new RegExp(`\\b${kw}\\b`, 'gi')
        const matches = contentText.match(regex) || []
        keywordDensity[keyword] = wordCount > 0 ? (matches.length / (wordCount / 100)) : 0
    })

    // Recommendations
    const recommendations: string[] = []
    if (wordCount < 1500) recommendations.push(`Expand content to 1500+ words (current: ${wordCount})`)
    if (headings.length < 3) recommendations.push('Add more H2/H3 headings for structure')
    if (imageCount < 3) recommendations.push('Add at least 3 relevant images')
    if (internal.length < 3) recommendations.push('Add at least 3 internal links')
    if (external.length < 5) recommendations.push('Add at least 5 external references')

    Object.entries(keywordDensity).forEach(([keyword, density]) => {
        if (density < 1 && density > 0) recommendations.push(`Keyword "${keyword}" density is low (${density.toFixed(2)}%)`)
        if (density > 3) recommendations.push(`Keyword "${keyword}" density is high (${density.toFixed(2)}%) - consider reducing`)
    })

    // Score calculation
    let score = 50 // Base score
    if (wordCount >= 1500) score += 15
    if (wordCount >= 2000) score += 5
    if (headings.length >= 3) score += 10
    if (imageCount >= 3) score += 10
    if (internal.length >= 3) score += 10
    if (external.length >= 5) score += 10

    return {
        wordCount,
        readingTime,
        headingCount: headings.length,
        internalLinkCount: internal.length,
        externalLinkCount: external.length,
        imageCount,
        keywordDensity,
        headingHierarchy: headings,
        recommendations: recommendations.slice(0, 5), // Top 5 recommendations
        score: Math.min(score, 100),
    }
}
