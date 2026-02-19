/**
 * Contentful Image Transformation API
 * Otimiza automaticamente TODAS as imagens do Contentful
 * Sem precisar modificar componentes
 */

interface ImageTransformOptions {
    width?: number
    height?: number
    quality?: number
    format?: 'webp' | 'jpg' | 'png' | 'auto'
    fit?: 'pad' | 'fill' | 'scale' | 'crop' | 'thumb'
}

/**
 * Transform Contentful image URL com otimizações automáticas
 * Usa Contentful Image API
 */
export function transformContentfulImageUrl(
    url: string,
    options: ImageTransformOptions = {}
): string {
    if (!url) return url

    // Se não é Contentful, return as-is
    if (!url.includes('ctfassets.net')) {
        return url
    }

    // Normalizar URL
    const cleanUrl = url.startsWith('//') ? `https:${url}` : url

    // Parse base URL e parameters
    const urlObj = new URL(cleanUrl)

    // Adicionar default options
    const params = new URLSearchParams(urlObj.search)

    // Aplicar transformações
    if (options.width) params.set('w', options.width.toString())
    if (options.height) params.set('h', options.height.toString())
    if (options.quality) params.set('q', options.quality.toString())
    if (options.format) params.set('fm', options.format) // Fix: Contentful uses 'fm' for format, 'f' is for focus
    if (options.fit) params.set('fit', options.fit)

    // Auto-format: Contentful serve melhor formato
    if (!params.has('fm')) {
        params.set('fm', 'auto')  // Auto seleciona WebP/AVIF/etc
    }

    // Rebuild URL
    urlObj.search = params.toString()
    return urlObj.toString()
}

/**
 * Get hero image URL (otimizado para LCP)
 * Tamanho grande para desktop, priorizado
 */
export function getHeroImageUrl(url: string): string {
    return transformContentfulImageUrl(url, {
        width: 1200,
        height: 630,
        quality: 85,
        format: 'auto',
        fit: 'fill',
    })
}

/**
 * Get featured article image (otimizado para cards)
 */
export function getFeaturedImageUrl(url: string): string {
    return transformContentfulImageUrl(url, {
        width: 600,
        height: 400,
        quality: 80,
        format: 'auto',
        fit: 'fill',
    })
}

/**
 * Get card image (otimizado para thumbnails)
 */
export function getCardImageUrl(url: string): string {
    return transformContentfulImageUrl(url, {
        width: 400,
        height: 250,
        quality: 75,
        format: 'auto',
        fit: 'fill',
    })
}

/**
 * Get responsive image URL
 * Use em <Image> com srcSet
 */
export function getResponsiveImageUrl(url: string, width: number): string {
    return transformContentfulImageUrl(url, {
        width,
        quality: 80,
        format: 'auto',
    })
}

/**
 * Gerar srcSet automaticamente para Next.js Image
 */
export function generateImageSrcSet(url: string): string {
    const widths = [320, 640, 750, 1080, 1280, 1536]
    return widths
        .map(w => `${getResponsiveImageUrl(url, w)} ${w}w`)
        .join(', ')
}
