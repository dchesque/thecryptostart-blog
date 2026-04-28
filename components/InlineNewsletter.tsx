'use client'

import React from 'react'
import NewsletterForm from './NewsletterForm'

interface InlineNewsletterProps {
  className?: string
  title?: string
  description?: string
}

/**
 * In-article newsletter signup. Quiet, editorial — sits inside the
 * reading flow without breaking concentration.
 */
export default function InlineNewsletter({
  className = '',
  title = "Read more like this, every Sunday.",
  description = "One email a week with our best beginner-friendly guides on Bitcoin, security and Web3.",
}: InlineNewsletterProps) {
  return (
    <aside
      id="newsletter"
      className={`not-prose my-14 px-6 sm:px-10 py-10 sm:py-12 rounded-2xl bg-cream border border-line ${className}`}
    >
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-10">
        <div className="flex-1">
          <span className="eyebrow">Newsletter</span>
          <h3 className="mt-2 font-heading text-2xl sm:text-[1.6rem] font-bold text-ink leading-tight tracking-tight max-w-xl">
            {title}
          </h3>
          <p className="mt-3 text-ink-mute leading-relaxed max-w-md">
            {description}
          </p>
        </div>

        <div className="w-full md:w-[360px] shrink-0">
          <NewsletterForm />
          <p className="mt-3 text-xs text-ink-mute">
            No spam. Unsubscribe in one click.
          </p>
        </div>
      </div>
    </aside>
  )
}
