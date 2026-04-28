'use client'

import { usePathname } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ReadingProgressBar from '@/components/ReadingProgressBar'
import { CategoryConfig } from '@/types/blog'

/**
 * Wraps public content with the editorial chrome (Header, Footer).
 *
 * Reading-comfort decisions:
 *  - Sticky header ad and footer ad and exit-intent popup were intentionally
 *    removed from the default shell. They fragmented attention on the
 *    article page. Ads now live inside content where they belong (sidebar
 *    on the article page, dedicated zones on hub pages).
 *  - The reading progress bar stays — it gives quiet feedback without
 *    disrupting the page.
 */
export function PublicShell({
  children,
  categories = [],
}: {
  children: React.ReactNode
  categories?: CategoryConfig[]
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
      <Header categories={categories} />
      <main id="main-content" className="min-h-screen">
        {children}
      </main>
      <Footer categories={categories} />
    </>
  )
}
