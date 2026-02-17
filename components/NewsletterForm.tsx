'use client'

import { useState, FormEvent } from 'react'

/**
 * Newsletter subscription form component
 * Handles email collection for marketing
 */
export default function NewsletterForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!email.trim()) return

    setStatus('loading')

    try {
      // TODO: Implement newsletter API endpoint
      // For now, simulate a successful subscription
      await new Promise(resolve => setTimeout(resolve, 1000))

      setStatus('success')
      setMessage('Thanks for subscribing! Check your inbox to confirm.')
      setEmail('')
    } catch (error) {
      setStatus('error')
      setMessage('Something went wrong. Please try again.')
    }
  }

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="relative group">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          disabled={status === 'loading'}
          className="w-full pl-6 pr-40 py-5 rounded-2xl bg-white border-2 border-crypto-primary/10 text-crypto-navy placeholder:text-crypto-charcoal/30 focus:border-crypto-primary focus:outline-none focus:ring-4 focus:ring-crypto-primary/5 transition-all text-lg font-medium disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="absolute right-2 top-2 bottom-2 px-8 rounded-xl bg-crypto-primary hover:bg-crypto-accent text-white font-bold transition-all flex items-center gap-2 group-hover:shadow-lg disabled:opacity-50"
        >
          {status === 'loading' ? (
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            'Subscribe'
          )}
        </button>
      </form>

      {status !== 'idle' && status !== 'loading' && (
        <p
          className={`mt-4 text-sm font-medium ${status === 'success' ? 'text-crypto-primary' : 'text-crypto-danger'
            }`}
          role="alert"
        >
          {message}
        </p>
      )}
    </div>
  )
}
