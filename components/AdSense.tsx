'use client'

import { useEffect } from 'react'
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
  useEffect(() => {
    if (!SITE_CONFIG.adSense.enabled) return

    try {
      // Push ad to AdSense
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({})
    } catch (error) {
      console.error('AdSense error:', error)
    }
  }, [])

  // Don't render if AdSense is not configured
  if (!SITE_CONFIG.adSense.enabled) {
    return null
  }

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

  return (
    <div className={`ad-container ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={SITE_CONFIG.adSense.clientId}
        data-ad-slot={slotId}
        data-ad-format={format}
        data-full-width-responsive={responsive ? 'true' : 'false'}
      />
    </div>
  )
}

/**
 * AdSense script component
 * Add this to the layout head
 */
export function AdSenseScript() {
  if (!SITE_CONFIG.adSense.enabled) {
    return null
  }

  return (
    <script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${SITE_CONFIG.adSense.clientId}`}
      crossOrigin="anonymous"
    />
  )
}
