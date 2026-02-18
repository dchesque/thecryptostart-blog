'use client'

import { useEffect, useState } from 'react'
import AdSense from '@/components/AdSense'
import { ADSENSE_SLOTS } from '@/lib/constants'

type AdSlot = keyof typeof ADSENSE_SLOTS

interface StickyHeaderAdProps {
    slot: AdSlot
    className?: string
}

/**
 * StickyHeaderAd component
 * Desktop-only sticky ad that appears after scrolling down
 * Hides when scrolling up for better UX
 */
export default function StickyHeaderAd({ slot, className = '' }: StickyHeaderAdProps) {
    const [visible, setVisible] = useState(false)
    const [lastScrollY, setLastScrollY] = useState(0)

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY

            if (currentScrollY > 300) {
                // Show when scrolled down enough
                setVisible(currentScrollY > lastScrollY ? false : true)
            } else {
                setVisible(false)
            }

            setLastScrollY(currentScrollY)
        }

        window.addEventListener('scroll', handleScroll, { passive: true })
        return () => window.removeEventListener('scroll', handleScroll)
    }, [lastScrollY])

    return (
        <div
            className={`
        fixed top-0 left-0 right-0 z-40
        hidden md:flex items-center justify-center
        bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm
        transition-transform duration-300
        ${visible ? 'translate-y-0' : '-translate-y-full'}
        ${className}
      `}
            style={{ minHeight: '90px' }}
            aria-label="Advertisement"
        >
            <div className="w-full max-w-screen-xl px-4 py-2">
                <AdSense slot={slot} />
            </div>
        </div>
    )
}
