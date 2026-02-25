/**
 * SEO Analysis Utilities
 * Analisar e otimizar conteúdo para SEO (Markdown)
 */

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
 * Contar palavras em documento markdown
 */
export function countWords(content: string): number {
    if (!content) return 0
    // Remove markdown formatting to count real words
    const stripped = content
        .replace(/[#*`_~[\]]/g, '')
        .replace(/\s+/g, ' ')
        .trim()

    return stripped ? stripped.split(/\s+/).length : 0
}

/**
 * Extrair todos os links
 */
export function extractLinks(content: string): {
    internal: string[]
    external: string[]
} {
    const internal: string[] = []
    const external: string[] = []

    if (!content) return { internal, external }

    // Match markdown links: [text](url)
    const linkRegex = /\[[^\]]*\]\(([^)]+)\)/g
    let match

    while ((match = linkRegex.exec(content)) !== null) {
        const url = match[1]
        if (url.startsWith('/') || url.includes('thecryptostart.com')) {
            internal.push(url)
        } else if (url.startsWith('http')) {
            external.push(url)
        }
    }

    return { internal, external }
}

/**
 * Contar imagens (markdown e tags HTML)
 */
export function countImages(content: string): number {
    if (!content) return 0

    // Markdown images: ![alt](url)
    const mdImagesMatches = content.match(/!\[[^\]]*\]\([^)]+\)/g)
    const mdCount = mdImagesMatches ? mdImagesMatches.length : 0

    // HTML img tags
    const htmlImagesMatches = content.match(/<img[^>]+>/gi)
    const htmlCount = htmlImagesMatches ? htmlImagesMatches.length : 0

    return mdCount + htmlCount
}

/**
 * Extrair headings (Markdown headers #)
 */
export function extractHeadings(content: string): string[] {
    if (!content) return []

    const headings: string[] = []
    const regex = /^(#{1,6})\s+(.+)$/gm
    let match

    while ((match = regex.exec(content)) !== null) {
        headings.push(match[2].trim())
    }

    return headings
}

/**
 * Analisar SEO completo
 */
export function analyzeSEO(
    content: string,
    keywords: string[] = []
): SEOAnalysis {
    const wordCount = countWords(content)
    const { internal, external } = extractLinks(content)
    const imageCount = countImages(content)
    const headings = extractHeadings(content)
    const readingTime = Math.ceil(wordCount / 200)

    // Keyword density
    const keywordDensity: { [key: string]: number } = {}
    const contentText = content ? content.toLowerCase().replace(/[#*`_~[\]]/g, '') : ''

    keywords.forEach(keyword => {
        const kw = keyword.toLowerCase()
        if (!kw) return

        // Escape keyword for regex
        const escapedKw = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        const regex = new RegExp(`\\b${escapedKw}\\b`, 'gi')
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
