'use client'

import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Loader2 } from 'lucide-react'
import { SITE_CONFIG } from '@/lib/constants'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const result = await signIn('credentials', { email, password, redirect: false })
      if (result?.error) {
        setError('Invalid email or password.')
        setLoading(false)
      } else {
        router.push('/admin')
        router.refresh()
      }
    } catch {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-paper grid lg:grid-cols-2">
      {/* Left: editorial column */}
      <aside className="hidden lg:flex flex-col justify-between bg-cream border-r border-line p-12">
        <Link href="/" className="inline-flex items-baseline gap-2">
          <span className="font-heading font-bold text-ink text-xl tracking-tight">
            {SITE_CONFIG.name}
          </span>
          <span className="w-1 h-1 rounded-full bg-accent" aria-hidden />
        </Link>

        <div className="max-w-md">
          <span className="eyebrow">Editorial admin</span>
          <h2 className="mt-4 font-heading text-3xl font-bold text-ink leading-[1.1] tracking-tight">
            A patient, beginner-first guide to crypto.
          </h2>
          <p className="mt-5 text-ink-mute leading-relaxed">
            Sign in to write, edit, and publish on {SITE_CONFIG.name}. This area is
            for editors and contributors only.
          </p>
        </div>

        <p className="text-xs text-ink-mute">
          © {new Date().getFullYear()} {SITE_CONFIG.name}
        </p>
      </aside>

      {/* Right: form */}
      <main className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm">
          <Link href="/" className="lg:hidden inline-flex items-baseline gap-2 mb-10">
            <span className="font-heading font-bold text-ink text-lg tracking-tight">
              {SITE_CONFIG.name}
            </span>
            <span className="w-1 h-1 rounded-full bg-accent" aria-hidden />
          </Link>

          <span className="eyebrow">Sign in</span>
          <h1 className="mt-3 font-heading text-3xl font-bold text-ink tracking-tight">
            Welcome back.
          </h1>
          <p className="mt-2 text-ink-mute">
            Enter your credentials to access the editor.
          </p>

          <form onSubmit={handleSubmit} className="mt-10 space-y-5">
            {error && (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-ink mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full px-4 py-3 bg-cream border border-line rounded-full text-ink placeholder:text-ink-faint outline-none focus:border-ink/30 focus:bg-paper transition-colors"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-ink mb-1.5">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-cream border border-line rounded-full text-ink placeholder:text-ink-faint outline-none focus:border-ink/30 focus:bg-paper transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-accent w-full justify-center"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in…
                </>
              ) : (
                <>
                  Sign in <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-xs text-ink-mute text-center">
            Public site — <Link href="/" className="text-ink hover:text-accent-deep underline-offset-2 underline">go to homepage</Link>
          </p>
        </div>
      </main>
    </div>
  )
}
