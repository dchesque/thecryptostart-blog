import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function calculateReadingTime(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length
  return Math.ceil(words / 200) // 200 words per minute
}

/**
 * Calculate reading time from Contentful rich text
 */
export function calculateReadingTimeFromRichText(content: any): number {
  if (!content) return 1

  const extractText = (node: any): string => {
    if (typeof node === 'string') return node
    if (node.value) return node.value
    if (node.content) {
      return node.content.map(extractText).join(' ')
    }
    return ''
  }

  const text = extractText(content)
  return calculateReadingTime(text)
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text
  return text.slice(0, length).trim() + '...'
}
