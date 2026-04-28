'use client'

import { ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ReadingProgressBar from '@/components/ReadingProgressBar'
import { CategoryConfig } from '@/types/blog'

/**
 * Wraps public content with the editorial chrome (TickerBar, Header, Footer).
 *
 * The TickerBar is passed in as a prop from the layout (server-rendered)
 * because it's an async server component. PublicShell itself is client-only
 * to avoid a `headers()` call on the entire layout subtree.
 */
export function PublicShell({
  children,
  categories = [],
  ticker,
}: {
  children: ReactNode
  categories?: CategoryConfig[]
  ticker?: ReactNode
}) {
  const pathname = usePathname()

  const isAdminRoute = pathname.startsWith('/admin')
  const isLoginRoute = pathname.startsWith('/login')
  const isApiRoute = pathname.startsWith('/api')
  const isPublic = !isAdminRoute && !isLoginRoute && !isApiRoute

  if (!isPublic) {
    return <>{children}</>
  }

  // Reading progress bar is most useful on article pages
  const isArticle = pathname.startsWith('/blog/') && pathname.split('/').length > 2

  return (
    <>
      {isArticle && <ReadingProgressBar />}
      <div className="sticky top-0 z-40">
        {ticker}
        <Header categories={categories} />
      </div>
      <main id="main-content" className="min-h-screen">
        {children}
      </main>
      <Footer categories={categories} />
    </>
  )
}
