'use client'

import { useState, FormEvent } from 'react'
import { ArrowRight } from 'lucide-react'

interface NewsletterFormProps {
  className?: string
  variant?: 'light' | 'dark'
  buttonLabel?: string
}

export default function NewsletterForm({
  className = '',
  variant = 'light',
  buttonLabel = 'Subscribe',
}: NewsletterFormProps) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setStatus('loading')
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), source: 'newsletter-form' }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data?.error || 'Subscription failed')
      }
      setStatus('success')
      setMessage(data?.message || 'Subscribed. Check your inbox to confirm.')
      setEmail('')
    } catch (err: any) {
      setStatus('error')
      setMessage(err?.message || 'Something went wrong. Please try again.')
    }
  }

  const isDark = variant === 'dark'

  const inputCls = isDark
    ? 'bg-white/5 border-white/15 text-paper placeholder:text-white/40 focus:border-white/40'
    : 'bg-paper border-line text-ink placeholder:text-ink-faint focus:border-ink/30'

  const buttonCls = isDark
    ? 'bg-paper text-ink hover:bg-cream'
    : 'bg-ink text-paper hover:bg-ink-soft'

  const messageCls = isDark
    ? status === 'success' ? 'text-paper/90' : 'text-red-300'
    : status === 'success' ? 'text-accent-deep' : 'text-red-600'

  return (
    <div className={`w-full ${className}`}>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
        <label className="sr-only" htmlFor="newsletter-email">Email address</label>
        <input
          id="newsletter-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          disabled={status === 'loading'}
          autoComplete="email"
          className={`flex-1 px-5 py-3 rounded-full border outline-none text-base transition-colors disabled:opacity-50 ${inputCls}`}
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full font-semibold text-sm transition-all disabled:opacity-50 ${buttonCls}`}
        >
          {status === 'loading' ? (
            <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
          ) : (
            <>
              {buttonLabel}
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {(status === 'success' || status === 'error') && (
        <p className={`mt-3 text-sm ${messageCls}`} role="status" aria-live="polite">
          {message}
        </p>
      )}
    </div>
  )
}
