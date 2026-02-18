'use client'

import { useEffect, useState } from 'react'
import type { Document, Block } from '@contentful/rich-text-types'
import { BLOCKS } from '@contentful/rich-text-types'

interface TOCItem {
  id: string
  text: string
  level: number
}

interface TableOfContentsProps {
  content: Document
}

/**
 * Extract text from a rich text node
 */
function extractText(node: Block): string {
  if (!node.content) return ''

  return node.content
    .map((child: any) => {
      if (child.nodeType === 'text') {
        return child.value || ''
      }
      return ''
    })
    .join('')
}

/**
 * Generate a slug from text
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

/**
 * Extract headings from Contentful rich text
 */
function extractHeadings(document: Document): TOCItem[] {
  const headings: TOCItem[] = []
  const seenIds = new Map<string, number>()

  if (!document?.content) return headings

  document.content.forEach((node) => {
    if (
      node.nodeType === BLOCKS.HEADING_2 ||
      node.nodeType === BLOCKS.HEADING_3
    ) {
      const text = extractText(node as Block)
      if (text) {
        let id = slugify(text)

        // Handle duplicate IDs
        if (seenIds.has(id)) {
          const count = seenIds.get(id)! + 1
          seenIds.set(id, count)
          id = `${id}-${count}`
        } else {
          seenIds.set(id, 0)
        }

        headings.push({
          id,
          text,
          level: node.nodeType === BLOCKS.HEADING_2 ? 2 : 3,
        })
      }
    }
  })

  return headings
}

/**
 * Table of Contents component
 * Sticky sidebar navigation for blog posts
 */
export default function TableOfContents({ content }: TableOfContentsProps) {
  const [headings, setHeadings] = useState<TOCItem[]>([])
  const [activeId, setActiveId] = useState<string>('')

  useEffect(() => {
    const items = extractHeadings(content)
    setHeadings(items)
  }, [content])

  useEffect(() => {
    if (headings.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        // Find the intersection that is most "active" (at the top of the viewport)
        const visibleHeadings = entries
          .filter(entry => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)

        if (visibleHeadings.length > 0) {
          setActiveId(visibleHeadings[0].target.id)
        }
      },
      {
        rootMargin: '-80px 0px -70% 0px',
        threshold: [0, 1.0],
      }
    )

    headings.forEach(({ id }) => {
      const element = document.getElementById(id)
      if (element) {
        observer.observe(element)
      }
    })

    return () => observer.disconnect()
  }, [headings])

  if (headings.length < 2) {
    return null
  }

  const handleClick = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      const offset = 120 // Increased offset for better visibility under sticky header
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - offset

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      })
      setActiveId(id)
    }
  }

  return (
    <nav
      aria-label="Table of Contents"
      className="relative"
    >
      <ul className="space-y-4 relative z-10">
        {headings.map((heading) => (
          <li
            key={heading.id}
            className={`${heading.level === 3 ? 'ml-6' : ''} transition-all duration-300`}
          >
            <button
              onClick={() => handleClick(heading.id)}
              className={`
                text-left text-sm transition-all duration-300 block w-full pl-4 py-1.5 border-l-2
                ${activeId === heading.id
                  ? 'text-crypto-primary font-bold border-crypto-primary bg-crypto-primary/5 rounded-r-lg'
                  : 'text-crypto-charcoal/50 border-transparent hover:text-crypto-primary hover:border-crypto-primary/30 hover:translate-x-1'
                }
              `}
            >
              {heading.text}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}
