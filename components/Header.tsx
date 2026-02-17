'use client'

import Link from 'next/link'
import { useState } from 'react'
import { SITE_CONFIG } from '@/lib/constants'

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="navbar">
      <nav className="container flex justify-between items-center w-full">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-2xl font-bold text-crypto-navy">
            {SITE_CONFIG.name}
          </span>
          <span className="text-crypto-primary font-bold">Blog</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center space-x-10">
          <Link href="/blog?category=bitcoin" className="text-crypto-charcoal hover:text-crypto-primary font-bold text-sm uppercase tracking-widest transition-all">
            Bitcoin
          </Link>
          <Link href="/blog?category=ethereum" className="text-crypto-charcoal hover:text-crypto-primary font-bold text-sm uppercase tracking-widest transition-all">
            Ethereum
          </Link>
          <Link href="/blog?category=defi" className="text-crypto-charcoal hover:text-crypto-primary font-bold text-sm uppercase tracking-widest transition-all">
            DeFi
          </Link>
          <Link href="/blog?category=crypto-security" className="text-crypto-charcoal hover:text-crypto-primary font-bold text-sm uppercase tracking-widest transition-all">
            Security
          </Link>
        </div>

        {/* Search & Subscribe */}
        <div className="hidden md:flex items-center space-x-4">
          <div className="input-search">
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent border-none outline-none text-sm w-40"
            />
            <button className="text-xs uppercase font-bold">Search</button>
          </div>
          <button className="btn-primary py-2 px-6 text-sm">
            Subscribe
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-crypto-navy"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {mobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-white border-b border-gray-100 p-4 space-y-4 md:hidden animate-fade-in shadow-lg">
          <Link href="/blog" className="block text-crypto-charcoal hover:text-crypto-primary py-2 font-medium">
            Blog
          </Link>
          <Link href="/about" className="block text-crypto-charcoal hover:text-crypto-primary py-2 font-medium">
            About
          </Link>
          <div className="input-search w-full">
            <input type="text" placeholder="Search..." className="bg-transparent border-none outline-none text-sm w-full" />
            <button className="text-xs uppercase font-bold">Search</button>
          </div>
        </div>
      )}
    </header>
  )
}
