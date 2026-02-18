/**
 * Web Vitals Analytics
 * Tracks Core Web Vitals and sends to GA4
 */

type MetricName = 'CLS' | 'FCP' | 'FID' | 'INP' | 'LCP' | 'TTFB'

interface WebVitalMetric {
    name: MetricName
    value: number
    rating: 'good' | 'needs-improvement' | 'poor'
    id: string
}

/**
 * Send Web Vital metric to Google Analytics 4
 */
export function sendWebVital(metric: WebVitalMetric) {
    if (typeof window === 'undefined') return
    if (process.env.NODE_ENV !== 'production') return

    const ga4Id = process.env.NEXT_PUBLIC_GA4_ID
    if (!ga4Id) return

    const gtag = (window as any).gtag
    if (typeof gtag !== 'function') return

    gtag('event', metric.name, {
        event_category: 'Web Vitals',
        event_label: metric.id,
        value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
        non_interaction: true,
        // Custom dimensions for rating
        web_vitals_rating: metric.rating,
    })
}

/**
 * Track ad impression event
 */
export function trackAdImpression(slot: string) {
    if (typeof window === 'undefined') return
    if (process.env.NODE_ENV !== 'production') return

    const gtag = (window as any).gtag
    if (typeof gtag !== 'function') return

    gtag('event', 'ad_impression', {
        event_category: 'Ads',
        event_label: slot,
        value: 1,
    })
}

/**
 * Track ad click event
 */
export function trackAdClick(slot: string) {
    if (typeof window === 'undefined') return
    if (process.env.NODE_ENV !== 'production') return

    const gtag = (window as any).gtag
    if (typeof gtag !== 'function') return

    gtag('event', 'ad_click', {
        event_category: 'Ads',
        event_label: slot,
        value: 1,
    })
}
