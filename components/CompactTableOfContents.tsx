'use client'

import React from 'react'
import { ChevronDown } from 'lucide-react'

interface Heading {
  id: string
  text: string
  level: 1 | 2 | 3
}

interface CompactTableOfContentsProps {
  headings: Heading[]
  className?: string
  defaultOpen?: boolean
}

/**
 * Mobile / inline TOC. A simple disclosure widget.
 */
export default function CompactTableOfContents({
  headings,
  className = '',
  defaultOpen = false,
}: CompactTableOfContentsProps) {
  if (!headings || headings.length === 0) return null

  return (
    <details
      className={`group rounded-xl border border-line bg-cream open:bg-paper transition-colors ${className}`}
      open={defaultOpen}
    >
      <summary className="flex items-center justify-between gap-4 px-5 py-4 cursor-pointer list-none">
        <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-ink-mute">
          On this page
        </span>
        <ChevronDown className="w-4 h-4 text-ink-mute transition-transform group-open:rotate-180" />
      </summary>
      <nav className="px-5 pb-5">
        <ol className="space-y-1.5 border-l border-line">
          {headings.map((heading) => (
            <li
              key={heading.id}
              className={heading.level === 3 ? 'ml-4' : ''}
            >
              <a
                href={`#${heading.id}`}
                className="block py-1 pl-4 -ml-px border-l-2 border-transparent text-sm text-ink-mute hover:text-ink hover:border-accent transition-colors leading-snug"
              >
                {heading.text}
              </a>
            </li>
          ))}
        </ol>
      </nav>
    </details>
  )
}
