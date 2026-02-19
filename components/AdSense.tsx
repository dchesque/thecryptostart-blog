'use client'

import { useEffect, useState } from 'react'
import { SITE_CONFIG, ADSENSE_SLOTS } from '@/lib/constants'

type AdSlot = keyof typeof ADSENSE_SLOTS

interface AdSenseProps {
  slot: AdSlot
  format?: 'auto' | 'rectangle' | 'horizontal' | 'vertical'
  responsive?: boolean
  className?: string
}

/**
 * Google AdSense ad component
 * Renders responsive ads based on slot configuration
 */
export default function AdSense({
  slot,
  format = 'auto',
  responsive = true,
  className = '',
}: AdSenseProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!SITE_CONFIG.adSense.enabled || !isMounted) return

    try {
      // Push ad to AdSense
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({})
    } catch (error) {
      console.error('AdSense error:', error)
    }
  }, [isMounted])

  const slotId = ADSENSE_SLOTS[slot]

  // Placeholder in development
  if (process.env.NODE_ENV === 'development') {
    return (
      <div
        className={`bg-crypto-darker border border-dashed border-crypto-primary/30 rounded-lg p-4 text-center text-gray-500 ${className}`}
      >
        <span className="text-xs">Ad: {slot}</span>
      </div>
    )
  }

  // Don't render until mounted to prevent hydration mismatch
  if (!isMounted) {
    return (
      <div
        className={`ad-container overflow-hidden bg-gray-50 border border-gray-100 rounded-lg animate-pulse ${className}`}
        style={{ minHeight: '100px', aspectRatio: format === 'vertical' ? '300/600' : format === 'horizontal' ? '728/90' : '16/9' }}
      />
    )
  }

  // Don't render if AdSense is not configured
  if (!SITE_CONFIG.adSense.enabled) {
    return null
  }

  return (
    <div className={`ad-container overflow-hidden bg-gray-50 border border-gray-100 rounded-lg flex items-center justify-center ${className}`} style={{ minHeight: '100px', aspectRatio: format === 'vertical' ? '300/600' : format === 'horizontal' ? '728/90' : '16/9' }}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block', width: '100%', height: '100%' }}
        data-ad-client={SITE_CONFIG.adSense.clientId}
        data-ad-slot={slotId}
        data-ad-format={format}
        data-full-width-responsive={responsive ? 'true' : 'false'}
      />
    </div>
  )
}

import Script from 'next/script'

/**
 * AdSense script component
 * Add this to the layout head
 */
export function AdSenseScript() {
  if (!SITE_CONFIG.adSense.enabled) {
    return null
  }

  return (
    <Script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${SITE_CONFIG.adSense.clientId}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  )
}
