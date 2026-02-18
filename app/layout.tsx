import type { Metadata } from 'next'
import Script from 'next/script'
import '../styles/globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { AuthProvider } from '@/components/AuthProvider'
import StickyHeaderAd from '@/components/StickyHeaderAd'
import StickyFooterAd from '@/components/StickyFooterAd'
import ReadingProgressBar from '@/components/ReadingProgressBar'
import ExitIntentPopup from '@/components/ExitIntentPopup'
import { SITE_CONFIG } from '@/lib/constants'
import { Montserrat, Open_Sans } from 'next/font/google'

const montserrat = Montserrat({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-montserrat',
})

const openSans = Open_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-open-sans',
})

export const metadata: Metadata = {
  title: {
    default: SITE_CONFIG.name,
    template: `%s | ${SITE_CONFIG.name}`,
  },
  description: SITE_CONFIG.description,
  metadataBase: new URL(SITE_CONFIG.url),
  keywords: [
    'bitcoin',
    'ethereum',
    'cryptocurrency',
    'blockchain',
    'defi',
    'nfts',
    'web3',
    'crypto trading',
    'crypto tutorial',
  ],
  authors: [{ name: SITE_CONFIG.author }],
  creator: SITE_CONFIG.author,
  publisher: SITE_CONFIG.name,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_CONFIG.url,
    title: SITE_CONFIG.name,
    description: SITE_CONFIG.description,
    siteName: SITE_CONFIG.name,
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: SITE_CONFIG.name,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_CONFIG.name,
    description: SITE_CONFIG.description,
    images: ['/og-image.jpg'],
  },
  verification: {
    google: 'your-google-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const ga4Id = process.env.NEXT_PUBLIC_GA4_ID

  return (
    <html lang="en-US" className="scroll-smooth">
      <head>
        {/* Structured Data - Organization */}
        <Script
          id="structured-data-org"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: SITE_CONFIG.name,
              url: SITE_CONFIG.url,
              logo: `${SITE_CONFIG.url}/logo.png`,
              description: SITE_CONFIG.description,
              sameAs: [
                'https://twitter.com/cryptoacademy',
                'https://github.com/cryptoacademy',
              ],
            }),
          }}
        />

        {/* Structured Data - WebSite */}
        <Script
          id="structured-data-website"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: SITE_CONFIG.name,
              url: SITE_CONFIG.url,
              description: SITE_CONFIG.description,
              potentialAction: {
                '@type': 'SearchAction',
                target: `${SITE_CONFIG.url}/blog?q={search_term_string}`,
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />
      </head>

      <body className={`${openSans.variable} ${montserrat.variable} font-sans bg-white text-crypto-charcoal antialiased`}>
        <AuthProvider>
          {/* Skip to main content (a11y) */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 px-4 py-2 bg-crypto-primary text-white rounded"
          >
            Skip to main content
          </a>

          <ReadingProgressBar />
          <Header />

          {/* Sticky Header Ad — desktop only, shows on scroll up */}
          <StickyHeaderAd slot="header-ad" />

          <main id="main-content" className="min-h-screen">
            {children}
          </main>

          <Footer />

          {/* Sticky Footer Ad — mobile only */}
          <StickyFooterAd slot="footer-ad" />

          {/* Exit Intent Popup — Lead Generation */}
          <ExitIntentPopup />
        </AuthProvider>

        {/* Google Analytics 4 */}
        {ga4Id && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${ga4Id}`}
              strategy="afterInteractive"
            />
            <Script
              id="ga4-init"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${ga4Id}');
                `,
              }}
            />
          </>
        )}
      </body>
    </html>
  )
}
