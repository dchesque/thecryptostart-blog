'use client'

import React from 'react'
import { Twitter, Linkedin, Facebook, Link as LinkIcon, Check } from 'lucide-react'

interface ShareButtonsProps {
  title: string
  url: string
  direction?: 'horizontal' | 'vertical'
  variant?: 'plain' | 'pill'
  className?: string
}

const ShareButtons: React.FC<ShareButtonsProps> = ({
  title,
  url,
  direction = 'horizontal',
  variant = 'plain',
  className = '',
}) => {
  const [mounted, setMounted] = React.useState(false)
  const [copied, setCopied] = React.useState(false)

  React.useEffect(() => setMounted(true), [])

  if (!mounted) {
    return <div className={`h-10 w-40 ${className}`} aria-hidden />
  }

  const encodedTitle = encodeURIComponent(title)
  const encodedUrl = encodeURIComponent(url)

  const copyToClipboard = async () => {
    if (!navigator?.clipboard) return
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch (err) {
      console.error('Could not copy link', err)
    }
  }

  const baseBtn = variant === 'pill'
    ? 'w-10 h-10 rounded-full border border-line bg-paper'
    : 'w-10 h-10 rounded-full'
  const sharedClasses = `inline-flex items-center justify-center text-ink-mute hover:text-ink hover:bg-cream transition-colors ${baseBtn}`

  const layout = direction === 'vertical' ? 'flex-col' : 'flex-row'

  return (
    <div className={`flex ${layout} items-center gap-2 ${className}`}>
      <a
        href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on Twitter"
        className={sharedClasses}
      >
        <Twitter className="w-4 h-4" />
      </a>
      <a
        href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on LinkedIn"
        className={sharedClasses}
      >
        <Linkedin className="w-4 h-4" />
      </a>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on Facebook"
        className={sharedClasses}
      >
        <Facebook className="w-4 h-4" />
      </a>
      <button
        type="button"
        onClick={copyToClipboard}
        aria-label="Copy link"
        className={sharedClasses}
      >
        {copied ? <Check className="w-4 h-4 text-accent-deep" /> : <LinkIcon className="w-4 h-4" />}
      </button>
    </div>
  )
}

export default ShareButtons
