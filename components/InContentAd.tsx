'use client'

import AdSense from './AdSense'

interface InContentAdProps {
  slot: string
  className?: string
}

/**
 * Subtle, single in-article ad zone. Uses cream surface so it visually
 * sits *aside from* the reading flow rather than hijacking it.
 */
export default function InContentAd({ slot, className = '' }: InContentAdProps) {
  return (
    <aside
      className={`not-prose my-12 flex flex-col items-center text-center ${className}`}
      aria-label="Advertisement"
    >
      <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-ink-faint mb-2">
        Sponsored
      </span>
      <div className="w-full max-w-2xl rounded-xl bg-cream border border-line-soft p-3">
        <AdSense slot={slot as any} />
      </div>
    </aside>
  )
}
