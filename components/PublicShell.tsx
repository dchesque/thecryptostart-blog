'use client'

import { usePathname } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import StickyHeaderAd from '@/components/StickyHeaderAd'
import StickyFooterAd from '@/components/StickyFooterAd'
import ReadingProgressBar from '@/components/ReadingProgressBar'
import ExitIntentPopup from '@/components/ExitIntentPopup'
import { CategoryConfig } from '@/types/blog'

/**
 * Wraps content with public site chrome (Header, Footer, Ads, etc.)
 * Only renders on non-admin and non-login routes.
 * Uses usePathname() so this component is client-side only — no headers() call
 * which would cause DYNAMIC_SERVER_USAGE on the entire layout tree.
 */
export function PublicShell({ 
    children,
    categories = []
}: { 
    children: React.ReactNode,
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

    return (
        <>
            <ReadingProgressBar />
            <Header categories={categories} />
            <StickyHeaderAd slot="header-ad" />
            <main id="main-content" className="min-h-screen">
                {children}
            </main>
            <Footer categories={categories} />
            <StickyFooterAd slot="footer-ad" />
            <ExitIntentPopup />
        </>
    )
}
