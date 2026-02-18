'use client'

import { useEffect, useState } from 'react'

/**
 * ReadingProgressBar component
 * Displays a thin progress bar at the top of the viewport
 * indicating how much of the content has been read.
 */
export default function ReadingProgressBar() {
    const [progress, setProgress] = useState(0)

    useEffect(() => {
        const handleScroll = () => {
            const windowHeight = window.innerHeight
            const documentHeight = document.documentElement.scrollHeight
            const scrollTop = window.scrollY

            // Calculate progress percentage
            // We subtract windowHeight from documentHeight because the scroll stops when
            // the bottom of the window hits the bottom of the document
            const scrollableHeight = documentHeight - windowHeight
            const scrolled = (scrollTop / scrollableHeight) * 100

            setProgress(scrolled)
        }

        window.addEventListener('scroll', handleScroll, { passive: true })
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return (
        <div className="fixed top-0 left-0 w-full h-1 z-[100] pointer-events-none">
            <div
                className="h-full bg-crypto-primary shadow-[0_0_10px_rgba(255,107,53,0.5)] transition-all duration-150 ease-out"
                style={{ width: `${progress}%` }}
                role="progressbar"
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
            />
        </div>
    )
}
