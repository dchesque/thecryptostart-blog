/**
 * AI Search Optimization Utilities
 * Otimizar posts para ChatGPT, Claude, Perplexity (Markdown)
 */

import type { BlogPost } from '@/types/blog'

export interface AIOptimizationScore {
    overallScore: number // 0-100
    hasQuickAnswer: boolean
    answerWordCount: number
    hasFAQSchema: boolean
    hasNumberedList: boolean
    hasDefinitions: boolean
    hasProperHeadings: boolean
    authorExpertiseSignals: number
    contentFreshness: number
    citableSentences: number
    recommendations: string[]
}

/**
 * Extrair primeiro parágrafo como quick answer
 */
export function extractQuickAnswer(content: string): string | null {
    if (!content) return null

    // Pega os parágrafos separando por linhas vazias
    const paragraphs = content.split(/\n\s*\n/)

    // Procura o primeiro parágrafo que não seja heading
    const firstParagraph = paragraphs.find(p =>
        p.trim().length > 20 && !p.trim().startsWith('#') && !p.trim().startsWith('!')
    )

    if (firstParagraph) {
        // Tira o markdown para contar tamanho real
        const text = firstParagraph.replace(/[#*`_~[\]]/g, '').trim()
        if (text.length > 0) {
            return text.length > 300 ? text.substring(0, 297) + '...' : text
        }
    }

    return null
}

/**
 * Verificar se conteúdo tem Q&A well-structured
 */
export function hasWellStructuredQA(content: string): boolean {
    if (!content) return false

    // Contar headings H2 e H3
    const headingMatches = content.match(/^(#{2,3})\s+(.+)$/gm)
    const headingCount = headingMatches ? headingMatches.length : 0

    // Contar sentenças que parecem Q&A
    const textLower = content.toLowerCase()
    let qaSentenceCount = 0

    const qaKeywords = ['what ', 'how ', 'why ', 'como ', 'o que ', 'por que ']
    const sentences = content.split(/[.!?\n]+/)

    sentences.forEach(s => {
        const sentence = s.toLowerCase().trim()
        if (sentence.endsWith('?') || qaKeywords.some(kw => sentence.includes(kw))) {
            qaSentenceCount++
        }
    })

    return headingCount >= 3 && qaSentenceCount >= 2
}

/**
 * Contar sentenças citáveis (específicas, com dados)
 */
export function countCitableSentences(content: string): number {
    if (!content) return 0

    let citableCount = 0

    // Remove coisas de código ou tags de markdown difíceis
    const cleanText = content.replace(/```[\s\S]*?```/g, '').replace(/[#*`_~[\]]/g, '')
    const sentences = cleanText.split(/[.!?\n]+/)

    sentences.forEach(sentence => {
        const words = sentence.trim().split(/\s+/).filter(Boolean).length

        // Ideal: sentenças com 8-25 palavras que contenham números ou entidades com Letra Maiúscula
        if (words >= 8 && words <= 25) {
            if (/[0-9]/.test(sentence) || /\b[A-Z][a-z]+\b/.test(sentence)) {
                citableCount++
            }
        }
    })

    return citableCount
}

/**
 * Calcular AI Optimization Score
 */
export function calculateAIOptimizationScore(
    post: BlogPost
): AIOptimizationScore {
    const content = post.content || ''

    // 1. Quick Answer (20 pontos)
    const quickAnswer = extractQuickAnswer(content)
    const hasQuickAnswer = !!quickAnswer
    const answerWordCount = quickAnswer ? quickAnswer.split(/\s+/).filter(Boolean).length : 0

    // Bonus se estiver entre 40-60 palavras (o "sweet spot" para snippets de IA)
    let quickAnswerScore = 0
    if (hasQuickAnswer) {
        quickAnswerScore = 15
        if (answerWordCount >= 30 && answerWordCount <= 70) quickAnswerScore = 20
    }

    // 2. FAQ Schema (25 pontos)
    const hasFAQSchema = post.tags && post.tags.length > 0
    const faqScore = hasFAQSchema ? 25 : 0

    // 3. Structure (20 pontos)
    const hasWellStructured = hasWellStructuredQA(content)
    const structureScore = hasWellStructured ? 20 : 10

    // 4. Authority (20 pontos)
    const hasAuthorBio = !!post.author?.bio
    const hasAuthorImage = !!post.author?.image
    const isRecent = new Date(post.publishedAt).getTime() > Date.now() - 90 * 24 * 60 * 60 * 1000
    const authorScore = (hasAuthorBio ? 8 : 0) + (hasAuthorImage ? 6 : 0) + (isRecent ? 6 : 0)

    // 5. Citability (15 pontos)
    const citableSentences = countCitableSentences(content)
    const citabilityScore = Math.min(citableSentences * 2, 15)

    // Total
    const overallScore = Math.min(Math.round(quickAnswerScore + faqScore + structureScore + authorScore + citabilityScore), 100)

    // Recommendations
    const recommendations: string[] = []
    if (!hasQuickAnswer) recommendations.push('Add a clear "definition" or summary paragraph at the start (40-60 words).')
    if (!hasWellStructured) recommendations.push('Use more H2/H3 headings and structure content with clear Q&A style.')
    if (!hasAuthorBio) recommendations.push('Ensure the author has a detailed bio for E-E-A-T signals.')
    if (citableSentences < 5) recommendations.push('Add more specific statistics, dates, or named entities to make content more citable.')
    if (answerWordCount > 0 && (answerWordCount < 30 || answerWordCount > 70)) {
        recommendations.push(`The first paragraph has ${answerWordCount} words. Aim for 40-60 for better AI extraction.`)
    }

    // Helpers for minor flags
    const contentString = content.toLowerCase()

    return {
        overallScore,
        hasQuickAnswer,
        answerWordCount,
        hasFAQSchema: true, // Automático agora
        hasNumberedList: contentString.includes('1.') || contentString.match(/^\d+\.\s/gm) !== null,
        hasDefinitions: contentString.includes('**') || contentString.includes('__'),
        hasProperHeadings: hasWellStructured,
        authorExpertiseSignals: hasAuthorBio ? (hasAuthorImage ? 3 : 2) : 0,
        contentFreshness: isRecent ? 100 : 50,
        citableSentences,
        recommendations,
    }
}

/**
 * FAQ Item Interface
 */
export interface FAQItem {
    question: string
    answer: string
}

/**
 * Geração automática de FAQ com base nas tags e categoria do post.
 */
export function generateFAQFromPost(post: BlogPost): FAQItem[] {
    const faqsMap: Record<string, FAQItem> = {
        'bitcoin': {
            question: 'What is Bitcoin?',
            answer: 'Bitcoin is a decentralized digital currency (cryptocurrency) created in 2009 by an anonymous person or group known as Satoshi Nakamoto. It operates on a peer-to-peer network without the need for a central authority.'
        },
        'ethereum': {
            question: 'What is Ethereum?',
            answer: 'Ethereum is a decentralized, open-source blockchain with smart contract functionality. Ether (ETH) is the native cryptocurrency of the platform, which is used to power the network and its decentralized applications (dApps).'
        },
        'defi': {
            question: 'What is DeFi?',
            answer: 'DeFi, or Decentralized Finance, refers to a financial system built on blockchain technology that allows for peer-to-peer financial services like lending, borrowing, and trading without traditional intermediaries like banks.'
        },
        'crypto-security': {
            question: 'How do I keep my crypto safe?',
            answer: 'Basic crypto security involves using strong, unique passwords, enabling two-factor authentication (2FA), and storing significant amounts of cryptocurrency in hardware wallets (cold storage) rather than on exchanges.'
        },
        'investing-and-strategy': {
            question: 'Is crypto a good investment?',
            answer: 'Cryptocurrency can be a high-reward investment, but it is also highly volatile and carries significant risk. It is recommended to only invest money you can afford to lose and to diversify your portfolio.'
        },
        'web3-and-innovation': {
            question: 'What is Web3?',
            answer: 'Web3 is an evolution of the internet based on blockchain technology, focusing on decentralization, privacy, and user ownership of data and digital assets.'
        }
    }

    const generatedFaqs: FAQItem[] = []

    // Adicionar FAQ baseada na categoria
    const categorySlug = typeof post.category === 'string' ? post.category :
        (post.category as any)?.slug || ''

    if (categorySlug && faqsMap[categorySlug]) {
        generatedFaqs.push(faqsMap[categorySlug])
    }

    // Adicionar FAQs baseadas em tags (limitar a 3 total)
    if (post.tags) {
        post.tags.forEach(tag => {
            const normalizedTag = tag.toLowerCase()
            if (faqsMap[normalizedTag] && !generatedFaqs.find(f => f.question === faqsMap[normalizedTag].question)) {
                if (generatedFaqs.length < 3) {
                    generatedFaqs.push(faqsMap[normalizedTag])
                }
            }
        })
    }

    return generatedFaqs
}
