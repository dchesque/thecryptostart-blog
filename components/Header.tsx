'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Menu, Search, X } from 'lucide-react'
import { SITE_CONFIG } from '@/lib/constants'
import { CategoryConfig } from '@/types/blog'

export default function Header({ categories = [] }: { categories?: CategoryConfig[] }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Lock scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  const navCategories = categories.slice(0, 5)

  return (
    <header
      className={`navbar ${scrolled ? 'shadow-sm' : ''}`}
      style={{ borderBottomColor: scrolled ? 'var(--line)' : 'transparent' }}
    >
      <div className="container-wide flex items-center justify-between gap-6 h-16">
        {/* Wordmark */}
        <Link href="/" className="flex items-center gap-2 group" aria-label={`${SITE_CONFIG.name} home`}>
          <span className="font-heading font-bold text-ink text-lg tracking-tight">
            {SITE_CONFIG.name}
          </span>
          <span className="hidden sm:inline-block w-1 h-1 rounded-full bg-accent" aria-hidden />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-7">
          <Link
            href="/blog"
            className="text-sm font-medium text-ink-soft hover:text-ink transition-colors"
          >
            All articles
          </Link>
          {navCategories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/blog?category=${cat.slug}`}
              className="text-sm font-medium text-ink-soft hover:text-ink transition-colors"
            >
              {cat.name}
            </Link>
          ))}
          <Link
            href="/about"
            className="text-sm font-medium text-ink-soft hover:text-ink transition-colors"
          >
            About
          </Link>
        </nav>

        {/* Right cluster */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSearchOpen((o) => !o)}
            aria-label="Search articles"
            className="hidden md:inline-flex items-center justify-center w-10 h-10 rounded-full text-ink-soft hover:bg-cream transition-colors"
          >
            <Search className="w-4.5 h-4.5" strokeWidth={2} />
          </button>

          <Link
            href="/blog#newsletter"
            className="hidden md:inline-flex items-center justify-center px-4 py-2 rounded-full bg-ink text-paper text-sm font-semibold hover:bg-ink-soft transition-colors"
          >
            Subscribe
          </Link>

          <button
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-full text-ink hover:bg-cream transition-colors"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Inline search panel */}
      {searchOpen && (
        <div className="hidden md:block border-t border-line bg-paper">
          <div className="container-wide py-4">
            <form action="/blog" method="GET" className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-mute" />
              <input
                type="search"
                name="search"
                autoFocus
                placeholder="Search articles, topics, authors..."
                className="w-full pl-11 pr-4 py-3 bg-cream border border-line rounded-full text-sm text-ink placeholder:text-ink-faint outline-none focus:border-ink/30 transition-colors"
              />
            </form>
          </div>
        </div>
      )}

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-x-0 top-16 bottom-0 z-50 bg-paper overflow-y-auto">
          <div className="container-wide py-6 space-y-6">
            <form action="/blog" method="GET" className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-mute" />
              <input
                type="search"
                name="search"
                placeholder="Search articles..."
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
              href="/blog#newsletter"
              onClick={() => setMobileOpen(false)}
              className="block w-full text-center px-5 py-3 rounded-full bg-ink text-paper text-sm font-semibold"
            >
              Subscribe to newsletter
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
