import React from 'react'
import NewsletterForm from './NewsletterForm'

interface NewsletterCTALargeProps {
  className?: string
}

/**
 * Footer-of-page newsletter CTA, full-width band.
 * Light treatment — same family as the rest of the site.
 */
export default function NewsletterCTALarge({ className = '' }: NewsletterCTALargeProps) {
  return (
    <section
      id="newsletter"
      className={`relative bg-ink text-paper rounded-2xl sm:rounded-3xl overflow-hidden px-5 sm:px-12 py-12 sm:py-16 md:py-24 ${className}`}
    >
      <div className="relative z-10 max-w-3xl mx-auto text-center">
        <span className="inline-block text-[11px] font-bold tracking-[0.16em] uppercase text-paper/60">
          The Sunday Brief
        </span>
        <h2 className="mt-4 font-heading text-2xl sm:text-3xl md:text-5xl font-bold tracking-tight leading-[1.08] text-balance">
          The clearest read on crypto, in your inbox every Sunday.
        </h2>
        <p className="mt-5 sm:mt-6 text-base sm:text-lg text-paper/70 leading-relaxed max-w-xl mx-auto">
          Beginner-friendly guides, security checklists, and a curated digest of the
          best research from across Web3 — written for humans, not algorithms.
        </p>

        <div className="mt-7 sm:mt-9 max-w-md mx-auto">
          <NewsletterForm variant="dark" />
        </div>

        <p className="mt-5 text-xs text-paper/50">
          50,000+ readers · no spam · unsubscribe anytime
        </p>
      </div>
    </section>
  )
}
