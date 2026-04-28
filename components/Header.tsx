'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Menu, Search, X } from 'lucide-react'
import { SITE_CONFIG } from '@/lib/constants'
import { CategoryConfig } from '@/types/blog'

/**
 * Site header. Dark "terminal" treatment — gives the publication a finance
 * publication feel (Bloomberg / FT) without sacrificing the light, serif
 * editorial body below.
 */
export default function Header({ categories = [] }: { categories?: CategoryConfig[] }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  // Lock scroll while the mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  const navCategories = categories.slice(0, 5)

  return (
    <header className="surface-dark border-b border-white/10">
      <div className="container-wide flex items-center justify-between gap-6 h-14">
        {/* Wordmark */}
        <Link
          href="/"
          className="flex items-center gap-2 group shrink-0"
          aria-label={`${SITE_CONFIG.name} home`}
        >
          <span className="font-heading font-bold text-paper text-base tracking-tight">
            {SITE_CONFIG.name}
          </span>
          <span className="w-1 h-1 rounded-full bg-accent" aria-hidden />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-7">
          <Link
            href="/blog"
            className="text-sm font-medium text-paper/80 hover:text-paper transition-colors"
          >
            All articles
          </Link>
          {navCategories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/blog?category=${cat.slug}`}
              className="text-sm font-medium text-paper/80 hover:text-paper transition-colors"
            >
              {cat.name}
            </Link>
          ))}
          <Link
            href="/about"
            className="text-sm font-medium text-paper/80 hover:text-paper transition-colors"
          >
            About
          </Link>
        </nav>

        {/* Right cluster */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setSearchOpen((o) => !o)}
            aria-label="Search articles"
            aria-expanded={searchOpen}
            className="hidden md:inline-flex items-center justify-center w-9 h-9 rounded-full text-paper/80 hover:bg-white/10 hover:text-paper transition-colors"
          >
            <Search className="w-4 h-4" strokeWidth={2} />
          </button>

          <Link
            href="/#newsletter"
            className="hidden md:inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-accent text-paper text-sm font-semibold hover:bg-accent-deep transition-colors"
          >
            Subscribe
          </Link>

          <button
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            className="lg:hidden inline-flex items-center justify-center w-9 h-9 rounded-full text-paper hover:bg-white/10 transition-colors"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Inline search panel */}
      {searchOpen && (
        <div className="hidden md:block border-t border-white/10 bg-ink">
          <div className="container-wide py-3">
            <form action="/blog" method="GET" className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-paper/50" />
              <input
                type="search"
                name="search"
                autoFocus
                placeholder="Search articles, topics, authors…"
                className="w-full pl-11 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-full text-sm text-paper placeholder:text-paper/40 outline-none focus:border-white/30 transition-colors"
              />
            </form>
          </div>
        </div>
      )}

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-x-0 top-[calc(2.25rem+3.5rem)] bottom-0 z-50 bg-paper text-ink overflow-y-auto">
          <div className="container-wide py-6 space-y-6">
            <form action="/blog" method="GET" className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-mute" />
              <input
                type="search"
                name="search"
                placeholder="Search articles…"
                className="w-full pl-11 pr-4 py-3 bg-cream border border-line rounded-full text-sm text-ink placeholder:text-ink-faint outline-none"
              />
            </form>

            <nav className="space-y-1">
              <Link
                href="/blog"
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-3 rounded-xl text-base font-semibold text-ink hover:bg-cream"
              >
                All articles
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/blog?category=${cat.slug}`}
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-3 rounded-xl text-base font-medium text-ink-soft hover:bg-cream hover:text-ink"
                >
                  {cat.name}
                </Link>
              ))}
              <Link
                href="/about"
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-3 rounded-xl text-base font-medium text-ink-soft hover:bg-cream hover:text-ink"
              >
                About
              </Link>
            </nav>

            <Link
              href="/#newsletter"
              onClick={() => setMobileOpen(false)}
              className="block w-full text-center px-5 py-3 rounded-full bg-accent text-paper text-sm font-semibold"
            >
              Subscribe to newsletter
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
