import Link from 'next/link'
import type { Metadata } from 'next'
import { getAllPosts, getAllCategories } from '@/lib/posts'
import FeaturedArticleCard from '@/components/FeaturedArticleCard'
import BlogCardCompact from '@/components/BlogCardCompact'
import CategoryCard from '@/components/CategoryCard'
import TrendingList from '@/components/TrendingList'
import FAQAccordion from '@/components/FAQAccordion'
import NewsletterCTALarge from '@/components/NewsletterCTALarge'
import InlineNewsletter from '@/components/InlineNewsletter'
import AdSense from '@/components/AdSense'

import { SITE_CONFIG, CACHE_CONFIG } from '@/lib/constants'
import { generateWebsiteSchema, generateOrganizationSchema } from '@/lib/seo'

import { unstable_noStore as noStore } from 'next/cache'

// Always fetch fresh data in production for debugging
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: `Crypto for Beginners — Bitcoin, Ethereum & DeFi Guides | ${SITE_CONFIG.name}`,
  description: 'Learn how to invest in Bitcoin and Web3 with practical, educational guides focused on real security. The best starting point for your crypto journey.',
}

export default async function Homepage() {
  noStore()
  const [allPosts, categories] = await Promise.all([
    getAllPosts({ limit: 20 }),
    getAllCategories(),
  ])

  const featuredPost = allPosts[0]
  const recentPosts = allPosts.slice(1, 7) // Expanded to 6 articles
  const trendingPosts = allPosts.slice(7, 12)
  const secondaryFeaturedPosts = allPosts.slice(1, 4) // For the sidebar in featured section

  const faqs = [
    {
      question: "Is Bitcoin still a good investment in 2026?",
      answer: "Bitcoin remains the primary store of value in the digital asset space. While volatility persists, its institutional adoption and the 'digital gold' narrative continue to drive long-term structural demand."
    },
    {
      question: "How do I secure my crypto assets properly?",
      answer: "True security involves using hardware wallets, never sharing your seed phrase, and understanding that 'not your keys, not your coins'. We recommend air-gapped solutions for significant holdings."
    },
    {
      question: "What is the difference between Ethereum and Bitcoin?",
      answer: "Bitcoin is primarily digital money and a store of value. Ethereum is a global, decentralized computing platform that enables smart contracts and decentralized applications (dApps)."
    },
    {
      question: "What are the best crypto exchanges for beginners?",
      answer: "For beginners, we recommend regulated exchanges like Coinbase, Kraken, or Binance (depending on your region). Look for platforms with high liquidity, strong security records, and user-friendly interfaces."
    },
    {
      question: "Do I need to pay taxes on my crypto gains?",
      answer: "In most jurisdictions, cryptocurrency is treated as property or capital assets. Selling, trading, or spending crypto usually triggers a taxable event. We strongly recommend using crypto tax software and consulting a professional."
    },
    {
      question: "What is a 'Cold Wallet' and do I need one?",
      answer: "A cold wallet (or hardware wallet) is a physical device that stores your private keys offline. It is the gold standard for security because it protects your assets from online hacks. If you hold more than $500 in crypto, it's worth the investment."
    }
  ]

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            generateWebsiteSchema(),
            generateOrganizationSchema(),
          ])
        }}
      />

      {/* 1. HERO SECTION (High Impact) */}
      <section className="pt-24 pb-12 md:pt-32 md:pb-20 bg-gradient-to-r from-crypto-darker to-crypto-navy text-white relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-crypto-primary/10 rounded-full blur-[160px] -mr-80 -mt-80" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-crypto-secondary/5 rounded-full blur-[120px] -ml-40 -mb-40" />
        </div>

        <div className="w-full max-w-[1440px] mx-auto px-4 lg:px-8 relative z-10 text-center md:text-left">
          <div className="max-w-4xl mx-auto md:mx-0">
            <h1 className="text-6xl md:text-8xl font-black mb-8 leading-[0.9] tracking-tighter text-white">
              Guide to <span className="text-crypto-primary">Bitcoin</span>, Crypto & Web3.
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-12 leading-relaxed max-w-2xl font-medium">
              Join 50,000+ readers learning how to invest and secure digital assets. Practical, non-technical guides for the next generation of finance.
            </p>
            <div className="flex flex-col sm:flex-row gap-5 justify-center md:justify-start">
              <Link href="/blog" className="px-10 py-5 bg-crypto-primary hover:bg-crypto-accent text-white font-black rounded-2xl transition-all shadow-xl shadow-crypto-primary/30 flex items-center justify-center text-lg">
                Start Learning Now →
              </Link>
              <Link href="/blog" className="px-10 py-5 bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl transition-all border border-white/10 flex items-center justify-center backdrop-blur-md text-lg">
                Explore All Guides
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FEATURED SECTION (No Sidebar/Optimized) */}
      <section className="py-16 md:py-24 bg-white">
        <div className="w-full max-w-[1440px] mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-4 mb-10">
                <span className="w-2 h-8 bg-crypto-primary rounded-full" />
                <h2 className="text-3xl md:text-4xl font-black text-crypto-darker tracking-tight">Featured of the Week</h2>
              </div>
              {featuredPost && <FeaturedArticleCard post={featuredPost} />}
            </div>

            <div className="lg:col-span-1">
              <h3 className="text-xl font-black text-crypto-darker mb-8 uppercase tracking-widest text-secondary opacity-50">Related Highlights</h3>
              <div className="space-y-6">
                {secondaryFeaturedPosts.map(post => (
                  <Link key={post.id} href={`/blog/${post.slug}`} className="group block border-b border-gray-100 pb-6 last:border-0 hover:translate-x-1 transition-transform">
                    <span className="text-[10px] font-black uppercase text-crypto-primary mb-2 block">{post.category}</span>
                    <h4 className="text-lg font-bold text-crypto-darker group-hover:text-crypto-primary transition-colors line-clamp-2 leading-snug">
                      {post.title}
                    </h4>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. LEADERBOARD AD */}
      <section className="bg-gray-50 py-8 border-y border-gray-100">
        <div className="w-full max-w-[1440px] mx-auto px-4 lg:px-8">
          <div className="text-center mb-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Sponsored Content</span>
          </div>
          <AdSense slot="homepage-leaderboard" format="horizontal" />
        </div>
      </section>

      {/* 4. RECENT POSTS GRID (Expanded) */}
      <section className="py-16 md:py-24 bg-white">
        <div className="w-full max-w-[1440px] mx-auto px-4 lg:px-8">
          <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-6">
            <div className="max-w-xl">
              <h2 className="text-4xl md:text-5xl font-black text-crypto-darker tracking-tight mb-4">The Latest Insights</h2>
              <p className="text-gray-500 text-lg">Fresh perspectives on market moves, security updates, and Web3 trends.</p>
            </div>
            <Link href="/blog" className="px-6 py-3 bg-gray-50 hover:bg-gray-100 text-crypto-darker font-bold rounded-xl transition-all border border-gray-200 flex items-center gap-2">
              View All Articles <span className="text-crypto-primary">→</span>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {recentPosts.map(post => (
              <BlogCardCompact key={post.id} post={post} />
            ))}
          </div>
        </div>
      </section>

      {/* 5. NEWSLETTER CTA INLINE */}
      <section className="py-8 bg-white">
        <div className="w-full max-w-[1440px] mx-auto px-4 lg:px-8">
          <InlineNewsletter />
        </div>
      </section>

      {/* 6. IN-CONTENT AD */}
      <section className="py-12 bg-gray-50/50">
        <div className="w-full max-w-[1440px] mx-auto px-4 lg:px-8">
          <AdSense slot="homepage-in-content" />
        </div>
      </section>

      {/* 7. CATEGORIES SECTION */}
      <section className="py-16 md:py-24 bg-white overflow-hidden">
        <div className="w-full max-w-[1440px] mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-crypto-darker tracking-tight">Explore by Topic</h2>
            <div className="w-24 h-1 bg-gray-100 rounded-full" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.slice(0, 8).map(cat => (
              <CategoryCard key={cat.slug} category={cat} />
            ))}
          </div>
        </div>
      </section>

      {/* 8. TRENDING SECTION */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="w-full max-w-[1440px] mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 gap-16 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <h2 className="text-3xl md:text-4xl font-black text-crypto-darker tracking-tight mb-10">Trending Now</h2>
              <TrendingList posts={trendingPosts} limit={5} />
            </div>
            <div className="hidden lg:block">
              <div className="sticky top-24">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4 block text-center">Sponsored</span>
                <AdSense slot="homepage-sidebar" format="vertical" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. FAQ SECTION */}
      <section className="py-16 md:py-24 bg-white">
        <div className="w-full max-w-[1440px] mx-auto px-4 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-black text-crypto-darker tracking-tight mb-6">Frequently Asked Questions</h2>
              <p className="text-gray-500 text-xl max-w-2xl mx-auto">Everything you need to know about the crypto world in simple terms.</p>
            </div>
            <FAQAccordion faqs={faqs} />
          </div>
        </div>
      </section>

      {/* 10. NEWSLETTER CTA FINAL */}
      <section className="py-20 md:py-32 bg-crypto-darker">
        <div className="w-full max-w-[1440px] mx-auto px-4 lg:px-8">
          <NewsletterCTALarge />
        </div>
      </section>
    </>
  )
}

