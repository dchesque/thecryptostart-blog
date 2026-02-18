'use client'

import { useEffect, useState } from 'react'
import AdSense from '@/components/AdSense'
import { ADSENSE_SLOTS } from '@/lib/constants'

type AdSlot = keyof typeof ADSENSE_SLOTS

interface StickyFooterAdProps {
    slot: AdSlot
    className?: string
}

/**
 * StickyFooterAd component
 * Mobile-only sticky ad fixed at the bottom of the screen
 * Dismissible by user
 */
export default function StickyFooterAd({ slot, className = '' }: StickyFooterAdProps) {
    const [dismissed, setDismissed] = useState(false)
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        // Show after a short delay to not interfere with initial load
        const timer = setTimeout(() => setVisible(true), 2000)
        return () => clearTimeout(timer)
    }, [])

    if (dismissed || !visible) return null

    return (
        <div
            className={`
        fixed bottom-0 left-0 right-0 z-40
        md:hidden
        bg-white border-t border-gray-200 shadow-lg
        transition-transform duration-300
        ${className}
      `}
            style={{ minHeight: '60px' }}
            aria-label="Advertisement"
        >
            {/* Close button */}
            <button
                onClick={() => setDismissed(true)}
                className="absolute top-1 right-2 w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600 text-xs rounded-full hover:bg-gray-100 transition-colors z-10"
                aria-label="Close advertisement"
            >
                ✕
            </button>

            <div className="px-4 py-2">
                <AdSense slot={slot} />
            </div>
        </div>
    )
}
