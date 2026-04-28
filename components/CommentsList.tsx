'use client'

import React, { useEffect, useState } from 'react'
import { MessageSquare, CornerDownRight, Loader2 } from 'lucide-react'

interface Comment {
  id: string
  authorName: string
  content: string
  createdAt: string
  replies?: Comment[]
}

interface CommentsListProps {
  postSlug: string
  refreshKey: number
}

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

function CommentBubble({
  comment,
  isReply = false,
}: {
  comment: Comment
  isReply?: boolean
}) {
  const initial = comment.authorName?.charAt(0).toUpperCase() || '·'

  return (
    <article
      className={`${isReply ? 'rounded-xl bg-cream border border-line-soft p-5' : 'rounded-xl bg-paper border border-line p-6'}`}
    >
      <header className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-full bg-cream border border-line flex items-center justify-center text-ink font-heading font-bold text-sm shrink-0">
          {isReply ? <CornerDownRight className="w-4 h-4 text-ink-mute" /> : initial}
        </div>
        <div className="min-w-0">
          <h4 className="font-heading text-sm font-bold text-ink leading-tight truncate">
            {comment.authorName}
          </h4>
          <time className="block text-xs text-ink-mute mt-0.5">
            {formatDate(comment.createdAt)}
          </time>
        </div>
      </header>
      <p className="text-[0.95rem] text-ink-soft leading-relaxed whitespace-pre-wrap">
        {comment.content}
      </p>
    </article>
  )
}

export default function CommentsList({ postSlug, refreshKey }: CommentsListProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)
  const [isNearScreen, setIsNearScreen] = useState(false)
  const containerRef = React.useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsNearScreen(true)
          observer.disconnect()
        }
      },
      { rootMargin: '200px' }
    )
    if (containerRef.current) observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!isNearScreen || hasLoaded) return
    let cancelled = false
    const fetchComments = async () => {
      setLoading(true)
      try {
        const resp = await fetch(`/api/comments?postSlug=${postSlug}`)
        if (!resp.ok) throw new Error('Failed to fetch comments')
        const data = await resp.json()
        if (!cancelled) setComments(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error('Failed to fetch comments:', err)
        if (!cancelled) setComments([])
      } finally {
        if (!cancelled) {
          setLoading(false)
          setHasLoaded(true)
        }
      }
    }
    fetchComments()
    return () => { cancelled = true }
  }, [isNearScreen, postSlug, refreshKey, hasLoaded])

  if (loading) {
    return (
      <div ref={containerRef} className="flex items-center justify-center gap-3 py-12 text-ink-mute">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-sm">Loading the discussion…</span>
      </div>
    )
  }

  if (!Array.isArray(comments) || comments.length === 0) {
    return (
      <div ref={containerRef} className="rounded-2xl border border-dashed border-line p-10 text-center">
        <MessageSquare className="w-7 h-7 text-ink-mute mx-auto mb-3" />
        <h3 className="font-heading font-semibold text-ink">Be the first to comment</h3>
        <p className="mt-1.5 text-sm text-ink-mute">
          No conversations have started yet. Got thoughts on this article?
        </p>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="space-y-6">
      {comments.map((comment) => (
        <div key={comment.id} className="space-y-3">
          <CommentBubble comment={comment} />
          {comment.replies && comment.replies.length > 0 && (
            <div className="ml-6 sm:ml-10 space-y-3">
              {comment.replies.map((reply) => (
                <CommentBubble key={reply.id} comment={reply} isReply />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
