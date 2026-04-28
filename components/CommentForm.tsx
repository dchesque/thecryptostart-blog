'use client'

import React, { useState } from 'react'
import { Send, Loader2, CheckCircle2 } from 'lucide-react'

interface CommentFormProps {
  postSlug: string
  parentId?: string | null
  onSuccess?: () => void
}

export default function CommentForm({
  postSlug,
  parentId = null,
  onSuccess,
}: CommentFormProps) {
  const [formData, setFormData] = useState({
    authorName: '',
    authorEmail: '',
    content: '',
    website: '', // Honeypot
  })
  const [status, setStatus] = useState<'IDLE' | 'LOADING' | 'SUCCESS' | 'ERROR'>('IDLE')
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('LOADING')
    setErrorMsg('')
    try {
      const resp = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, postSlug, parentId }),
      })
      const data = await resp.json()
      if (!resp.ok) throw new Error(data.error || 'Something went wrong')

      setStatus('SUCCESS')
      setFormData({ authorName: '', authorEmail: '', content: '', website: '' })
      if (onSuccess) onSuccess()
      setTimeout(() => setStatus('IDLE'), 5000)
    } catch (err: any) {
      setStatus('ERROR')
      setErrorMsg(err.message)
    }
  }

  if (status === 'SUCCESS') {
    return (
      <div className="rounded-xl bg-cream border border-line p-6 text-center">
        <CheckCircle2 className="w-7 h-7 text-accent mx-auto mb-3" />
        <h3 className="font-heading font-bold text-ink text-lg">Comment received</h3>
        <p className="mt-2 text-sm text-ink-mute max-w-xs mx-auto">
          Thanks for joining the discussion. Your message is awaiting moderation.
        </p>
        <button
          onClick={() => setStatus('IDLE')}
          className="mt-4 text-sm font-semibold text-ink hover:text-accent-deep transition-colors"
        >
          Post another comment
        </button>
      </div>
    )
  }

  const inputCls =
    'w-full px-4 py-3 bg-cream border border-line rounded-xl text-ink placeholder:text-ink-faint outline-none focus:border-ink/30 focus:bg-paper transition-colors text-[0.95rem]'

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Honeypot */}
      <div className="hidden" aria-hidden>
        <input
          type="text"
          name="website"
          value={formData.website}
          onChange={(e) => setFormData({ ...formData, website: e.target.value })}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="comment-name" className="block text-xs font-medium text-ink-soft mb-1.5">
            Name
          </label>
          <input
            id="comment-name"
            required
            type="text"
            placeholder="Your display name"
            className={inputCls}
            value={formData.authorName}
            onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
          />
        </div>
        <div>
          <label htmlFor="comment-email" className="block text-xs font-medium text-ink-soft mb-1.5">
            Email
            <span className="ml-1 text-ink-mute">(not published)</span>
          </label>
          <input
            id="comment-email"
            required
            type="email"
            placeholder="you@example.com"
            className={inputCls}
            value={formData.authorEmail}
            onChange={(e) => setFormData({ ...formData, authorEmail: e.target.value })}
          />
        </div>
      </div>

      <div>
        <label htmlFor="comment-body" className="block text-xs font-medium text-ink-soft mb-1.5">
          Comment
        </label>
        <textarea
          id="comment-body"
          required
          rows={5}
          placeholder="Share your thoughts or ask a question…"
          className={`${inputCls} resize-y leading-relaxed`}
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
        />
      </div>

      {status === 'ERROR' && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMsg}
        </div>
      )}

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <p className="text-xs text-ink-mute">
          Comments are moderated for spam.
        </p>
        <button
          type="submit"
          disabled={status === 'LOADING'}
          className="btn-primary disabled:opacity-50"
        >
          {status === 'LOADING' ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Submitting…
            </>
          ) : (
            <>
              Post comment
              <Send className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </form>
  )
}
