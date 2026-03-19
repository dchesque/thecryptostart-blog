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
  const [adFailed, setAdFailed] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true)
    }, 0)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!SITE_CONFIG.adSense.enabled || !isMounted) return

    const timer = setTimeout(() => {
      // Basic detection: if after 5s we don't see any change in the element, maybe it's blocked/empty
      const adElement = document.getElementById(`ad-${slot}`)
      if (adElement && adElement.innerHTML === '') {
        // setAdFailed(true) // Disable for now as adsbygoogle might take time
      }
    }, 5000)

    try {
      // Push ad to AdSense
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({})
    } catch (error) {
      console.error('AdSense error:', error)
      setTimeout(() => setAdFailed(true), 0)
    }

    return () => clearTimeout(timer)
  }, [isMounted, slot])

  const slotId = ADSENSE_SLOTS[slot]

  // Placeholder in development
  if (process.env.NODE_ENV === 'development' && !adFailed) {
    // Show a simplified version of the fallback as a placeholder
    return (
      <div 
        id={`ad-${slot}`}
        className={`bg-crypto-darker border border-dashed border-crypto-primary/30 rounded-2xl p-6 text-center text-gray-400 flex flex-col items-center justify-center group transition-all hover:bg-crypto-darker/80 ${className}`}
        style={{ minHeight: '120px', ...(format === 'vertical' ? { aspectRatio: '300/600' } : format === 'horizontal' ? { aspectRatio: '728/90' } : {}) }}
      >
        <div className="w-10 h-10 rounded-full bg-crypto-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
          <div className="w-2 h-2 rounded-full bg-crypto-primary animate-pulse" />
        </div>
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-crypto-primary mb-2">Ad Slot: {slot}</span>
        <p className="text-sm font-medium text-gray-500 max-w-[200px]">This placeholder simulates the ad unit space.</p>
      </div>
    )
  }

  // Don't render until mounted to prevent hydration mismatch
  if (!isMounted) {
    return (
      <div
        className={`ad-container overflow-hidden bg-gray-50 border border-gray-100 rounded-lg animate-pulse ${className}`}
        style={{ minHeight: '100px', ...(format === 'vertical' ? { aspectRatio: '300/600' } : format === 'horizontal' ? { aspectRatio: '728/90' } : {}) }}
      />
    )
  }

  // Don't render if AdSense is not configured
  if (!SITE_CONFIG.adSense.enabled) {
    return null
  }

  const fallback = (
    <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gray-50 border border-gray-100 rounded-2xl group transition-all hover:bg-white hover:border-crypto-primary/20">
      <div className="w-8 h-8 rounded-full bg-crypto-primary/5 flex items-center justify-center mb-3">
        <div className="w-2 h-2 rounded-full bg-crypto-primary animate-pulse" />
      </div>
      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Recommended for you</p>
      <p className="text-sm font-medium text-gray-600">Explore our beginner guides</p>
    </div>
  )

  if (adFailed) {
    return (
      <div className={`ad-container relative ${className}`} style={{ minHeight: '120px' }}>
        {fallback}
      </div>
    )
  }

  return (
    <div 
      id={`ad-${slot}`}
      className={`ad-container relative overflow-hidden bg-gray-50/50 border border-gray-100/50 rounded-2xl flex items-center justify-center transition-all ${className}`} 
      style={{ 
        minHeight: '120px', 
        ...(format === 'vertical' ? { aspectRatio: '300/600' } : format === 'horizontal' ? { aspectRatio: '728/90' } : {}) 
      }}
    >
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
