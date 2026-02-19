'use client'

interface ContentfulLoaderProps {
    src: string
    width: number
    quality?: number
}

/**
 * Custom Contentful Image Loader
 * 
 * Prevents double-optimization of Contentful images.
 * If the URL already has transformation parameters (from our API helpers), return as is.
 * If it's a raw URL, apply standard Next.js optimization parameters.
 */
export default function contentfulLoader({ src, width, quality }: ContentfulLoaderProps): string {
    // Ensure URL starts with https://
    let url = src
    if (url.startsWith('//')) {
        url = `https:${url}`
    }

    // If not a Contentful image, return as is (or handle other domains if needed)
    if (!url.includes('ctfassets.net')) {
        return url
    }

    // Check if URL already has transformation parameters
    // Our API helpers add 'w=', 'h=', 'fm=', 'fit=' etc.
    const hasParams = url.includes('?') && (
        url.includes('w=') ||
        url.includes('h=') ||
        url.includes('fm=') ||
        url.includes('fit=')
    )

    if (hasParams) {
        // Already optimized/transformed, return original URL
        return url
    }

    // Prepare new URL params
    // Use URL object to safely append params
    try {
        const urlObj = new URL(url)
        urlObj.searchParams.set('w', width.toString())
        urlObj.searchParams.set('q', (quality || 75).toString())
        urlObj.searchParams.set('fm', 'webp') // Default to webp if not specified (Contentful supports auto via fm, but next/image expects a specific format if we don't use 'auto')
        // Actually, 'fm=auto' is better for Contentful as it serves AVIF/WebP based on Accept header
        urlObj.searchParams.set('fm', 'auto')

        return urlObj.toString()
    } catch (e) {
        // If URL parsing fails, fallback to simple string concatenation
        // But 'src' should be a valid URL from Contentful
        return `${url}?w=${width}&q=${quality || 75}&fm=auto`
    }
}
