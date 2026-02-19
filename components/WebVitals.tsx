'use client'

import { useEffect } from 'react'
import { onCLS, onINP, onLCP, onTTFB, Metric } from 'web-vitals'

export function WebVitals() {
    useEffect(() => {
        const logMetric = (metric: Metric) => {
            console.log(`${metric.name}:`, metric.value)

            // Send to GA4 if gtag is available
            if (typeof window !== 'undefined' && (window as any).gtag) {
                (window as any).gtag('event', metric.name, {
                    value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
                    event_category: 'Web Vitals',
                    event_label: metric.id,
                    non_interaction: true,
                })
            }
        }

        onCLS(logMetric)
        onLCP(logMetric)
        onINP(logMetric)
        onTTFB(logMetric)
    }, [])

    return null
}
