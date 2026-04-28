'use client'

import { useEffect, useState } from 'react'

interface TOCItem {
  id: string
  text: string
  level: number
}

interface TableOfContentsProps {
  content: string
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function extractHeadings(content: string): TOCItem[] {
  const headings: TOCItem[] = []
  const seenIds = new Map<string, number>()

  if (!content) return headings

  const regex = /^(#{2,3})\s+(.+)$/gm
  let match

  while ((match = regex.exec(content)) !== null) {
    const level = match[1].length as 2 | 3
    const text = match[2].trim().replace(/[*_`]/g, '')
    let id = slugify(text)

    if (seenIds.has(id)) {
      const count = seenIds.get(id)! + 1
      seenIds.set(id, count)
      id = `${id}-${count}`
    } else {
      seenIds.set(id, 0)
    }

    headings.push({ id, text, level })
  }

  return headings
}

/**
 * Editorial table of contents.
 * Tracks the active section while reading and highlights it with a thin
 * vertical rule. Quiet by default — comes alive when used.
 */
export default function TableOfContents({ content }: TableOfContentsProps) {
  const [headings, setHeadings] = useState<TOCItem[]>([])
  const [activeId, setActiveId] = useState<string>('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    setHeadings(extractHeadings(content))
  }, [content])

  useEffect(() => {
    if (headings.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter(entry => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)

        if (visible.length > 0) {
          setActiveId(visible[0].target.id)
        }
      },
      { rootMargin: '-96px 0px -65% 0px', threshold: [0, 1] }
    )

    headings.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [headings])

  if (!mounted || headings.length < 2) return null

  const handleClick = (id: string) => {
    const el = document.getElementById(id)
    if (!el) return
    const offset = 96
    const top = el.getBoundingClientRect().top + window.pageYOffset - offset
    window.scrollTo({ top, behavior: 'smooth' })
    setActiveId(id)
  }

  return (
    <nav aria-label="Table of contents" className="relative">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-ink-mute">
          On this page
        </span>
        <div className="flex-1 h-px bg-line" />
      </div>
      <ul className="space-y-1 border-l border-line">
        {headings.map((heading) => {
          const isActive = activeId === heading.id
          return (
            <li key={heading.id}>
              <button
                onClick={() => handleClick(heading.id)}
                className={`
                  w-full text-left text-sm leading-snug py-1.5 pr-2 -ml-px border-l-2 transition-colors
                  ${heading.level === 3 ? 'pl-7' : 'pl-4'}
                  ${isActive
                    ? 'border-accent text-ink font-semibold'
                    : 'border-transparent text-ink-mute hover:text-ink'}
                `}
              >
                {heading.text}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
