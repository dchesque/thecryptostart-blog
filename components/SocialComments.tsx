'use client'

import React, { useState } from 'react'
import { MessageSquare } from 'lucide-react'
import CommentForm from './CommentForm'
import CommentsList from './CommentsList'

interface SocialCommentsProps {
  slug: string
}

/**
 * Editorial comments section. Form sits above the discussion. Quiet,
 * minimal, designed to fit alongside the article body without pulling
 * attention from the read.
 */
export default function SocialComments({ slug }: SocialCommentsProps) {
  const [refreshKey, setRefreshKey] = useState(0)
  const handleSuccess = () => setRefreshKey((prev) => prev + 1)

  return (
    <section id="comments" aria-labelledby="comments-heading" className="not-prose">
      <div className="flex items-center gap-3 mb-8">
        <MessageSquare className="w-5 h-5 text-accent-deep shrink-0" aria-hidden />
        <h2
          id="comments-heading"
          className="font-heading text-2xl md:text-[1.625rem] font-bold text-ink tracking-tight"
        >
          Discussion
        </h2>
        <div className="flex-1 h-px bg-line" />
      </div>

      <div className="rounded-2xl border border-line bg-paper p-6 sm:p-8 mb-10">
        <h3 className="font-heading text-base font-bold text-ink mb-5">
          Leave a comment
        </h3>
        <CommentForm postSlug={slug} onSuccess={handleSuccess} />
      </div>

      <CommentsList postSlug={slug} refreshKey={refreshKey} />
    </section>
  )
}
