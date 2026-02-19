/**
 * Broken Link Finder
 * Identificar links externos e internos que podem estar quebrados
 */

import { extractLinks } from './seo-analyzer'
import type { BlogPost } from '@/types/blog'

export interface BrokenLink {
    url: string
    sourcePost: string
    status: number | 'error' | 'pending'
    type: 'internal' | 'external'
    suggestedAction: string
}

/**
 * Validar uma URL (Simulação de requisição HEAD)
 * Em um ambiente servidor real, usaríamos fetch(url, { method: 'HEAD' })
 */
async function checkUrl(url: string): Promise<number | 'error'> {
    try {
        // Simulação: links do academy.com ou thecryptostart.com são assumidos como 200
        if (url.includes('thecryptostart.com') || url.startsWith('/')) {
            return 200
        }

        // Simulação de delay de rede
        // const res = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(5000) });
        // return res.status;

        return 200 // Mock: assumindo tudo OK no ambiente de demonstração
    } catch (err) {
        return 'error'
    }
}

/**
 * Analisar posts em busca de links quebrados
 */
export async function findBrokenLinks(posts: BlogPost[]): Promise<BrokenLink[]> {
    const brokenLinks: BrokenLink[] = []

    for (const post of posts) {
        const { internal, external } = extractLinks(post.content)
        const allLinks = [...internal.map(l => ({ url: l, type: 'internal' as const })),
        ...external.map(l => ({ url: l, type: 'external' as const }))]

        for (const link of allLinks) {
            // No mundo real, faríamos o check paralelo. Aqui fazemos simples.
            // const status = await checkUrl(link.url);
            const status = Math.random() > 0.95 ? 404 : 200 // Mock: 5% de chance de link quebrado

            if (status !== 200) {
                brokenLinks.push({
                    url: link.url,
                    sourcePost: post.title,
                    status,
                    type: link.type,
                    suggestedAction: link.type === 'internal'
                        ? 'Verify if the slug changed or the post was deleted.'
                        : 'Find a new authoritative source or remove the link.'
                })
            }
        }
    }

    return brokenLinks
}
