'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search } from 'lucide-react'

/**
 * Search bar component for blog posts
 * URL-based search with debouncing
 */
export default function SearchBar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams?.get('q') || '')
  const [isFocused, setIsFocused] = useState(false)

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim()) {
        const params = new URLSearchParams(searchParams?.toString() || '')
        params.set('q', query)
        router.push(`/blog?${params.toString()}`)
      } else if (!query.trim() && searchParams?.has('q')) {
        router.push('/blog')
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [query, router, searchParams])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/blog?q=${encodeURIComponent(query.trim())}`)
    }
  }

  return (
    <form 
      onSubmit={handleSubmit}
      className={`relative w-full max-w-md transition-all duration-300 ${
        isFocused ? 'scale-[1.02]' : 'scale-100'
      }`}
    >
      <div className={`relative flex items-center bg-white border-2 rounded-full overflow-hidden transition-all duration-300 ${
        isFocused 
          ? 'border-crypto-primary ring-4 ring-crypto-primary/10' 
          : 'border-gray-200 hover:border-gray-300'
      }`}>
        <div className="pl-4 flex-1">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Search articles..."
            className="w-full py-3 bg-transparent text-gray-900 placeholder-gray-400 outline-none"
            aria-label="Search articles"
          />
        </div>
        
        <button
          type="submit"
          aria-label="Search"
          className="p-3 bg-crypto-primary hover:bg-crypto-accent text-white transition-colors duration-300 flex items-center justify-center"
        >
          <Search className="w-5 h-5" />
        </button>
      </div>
      
      {/* Quick search suggestions */}
      {isFocused && query.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50">
          <div className="p-3 text-sm text-gray-500 border-b border-gray-100">
            Searching for: <strong className="text-gray-900">{query}</strong>
          </div>
          <button
            type="button"
            onClick={() => {
              setQuery('')
              router.push('/blog')
            }}
            className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Clear search
          </button>
        </div>
      )}
    </form>
  )
}
