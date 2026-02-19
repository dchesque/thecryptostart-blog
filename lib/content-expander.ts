/**
 * Content Expansion Analyzer
 * Identificar posts que precisam ser expandidos
 */

import { countWords } from './seo-analyzer'
import type { BlogPost } from '@/types/blog'

export interface ExpansionOpportunity {
    slug: string
    title: string
    currentWordCount: number
    targetWordCount: number
    wordGap: number
    priority: 'high' | 'medium' | 'low'
    suggestions: string[]
}

/**
 * Analisar post para expansão
 */
export function analyzeForExpansion(post: BlogPost): ExpansionOpportunity | null {
    const currentWords = countWords(post.content)

    // Meta: 1500-2000 palavras
    if (currentWords >= 1500) return null

    let priority: 'high' | 'medium' | 'low' = 'low'
    let targetWordCount = 1500

    if (currentWords < 800) {
        priority = 'high'
        targetWordCount = 2000
    } else if (currentWords < 1200) {
        priority = 'medium'
        targetWordCount = 1500
    }

    const wordGap = targetWordCount - currentWords

    const suggestions: string[] = []

    // Sugerir adições baseado na categoria (mapeado para as categorias do projeto)
    const category = post.category as string

    if (category === 'bitcoin') {
        suggestions.push('Add section: "Como Minerar Bitcoin em 2024"')
        suggestions.push('Add section: "História do Halving e Impacto no Preço"')
        suggestions.push('Add FAQ: "Bitcoin é Seguro?"')
    } else if (category === 'ethereum') {
        suggestions.push('Add section: "Guia de Staking de Ethereum"')
        suggestions.push('Add section: "O que são Smart Contracts?"')
        suggestions.push('Add comparison: "Ethereum vs Solana"')
    } else if (category === 'defi') {
        suggestions.push('Add section: "Riscos DeFi e Como Mitigar"')
        suggestions.push('Add section: "Protocolos Populares (Aave, Uniswap)"')
        suggestions.push('Add real-world use cases')
    } else if (category === 'crypto-security') {
        suggestions.push('Add checklist: "10 Passos para Proteger suas Cryptos"')
        suggestions.push('Add section: "Hardware Wallets vs Software Wallets"')
        suggestions.push('Add section: "Como Identificar Scams e Phishing"')
    } else {
        suggestions.push('Add a detailed comparison with similar concepts')
        suggestions.push('Add a "Pro/Con" list for this topic')
        suggestions.push('Add an expert opinion or quote section')
    }

    return {
        slug: post.slug,
        title: post.title,
        currentWordCount: currentWords,
        targetWordCount,
        wordGap,
        priority,
        suggestions: suggestions.slice(0, 3),
    }
}

/**
 * Analisar todos os posts para expansão
 */
export function analyzeAllForExpansion(posts: BlogPost[]): ExpansionOpportunity[] {
    return posts
        .map(analyzeForExpansion)
        .filter((opp): opp is ExpansionOpportunity => opp !== null)
        .sort((a, b) => {
            // Prioridade alta primeiro
            if (a.priority === 'high' && b.priority !== 'high') return -1
            if (a.priority !== 'high' && b.priority === 'high') return 1
            // Depois pelo gap de palavras (maior gap primeiro)
            return b.wordGap - a.wordGap
        })
}
