import Link from 'next/link'
import type { Metadata } from 'next'
import { getAllPosts, getAllCategories } from '@/lib/contentful'
import FeaturedArticleCard from '@/components/FeaturedArticleCard'
import BlogCardCompact from '@/components/BlogCardCompact'
import CategoryCard from '@/components/CategoryCard'
import TrendingList from '@/components/TrendingList'
import FAQAccordion from '@/components/FAQAccordion'
import NewsletterCTALarge from '@/components/NewsletterCTALarge'
import AdSense from '@/components/AdSense'

import { SITE_CONFIG } from '@/lib/constants'
import { generateWebsiteSchema, generateOrganizationSchema } from '@/lib/seo'

// ISR: Revalidate every 5 minutes
export const revalidate = 300

export const metadata: Metadata = {
  title: `Crypto for Beginners — Bitcoin, Ethereum & DeFi Guides | ${SITE_CONFIG.name}`,
  description: 'Learn how to invest in Bitcoin and Web3 with practical, educational guides focused on real security. The best starting point for your crypto journey.',
}

export default async function Homepage() {
  const [allPosts, categories] = await Promise.all([
    getAllPosts({ limit: 20 }),
    getAllCategories(),
  ])

  const featuredPost = allPosts[0]
  const recentPosts = allPosts.slice(1, 4)
  const trendingPosts = allPosts.slice(4, 9)

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

      {/* 1. HERO SECTION (Compact & High Conversion) */}
      <section className="pt-32 pb-16 md:pt-40 md:pb-24 bg-gradient-to-r from-crypto-darker to-crypto-navy text-white relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-crypto-primary/5 rounded-full blur-[140px] -mr-64 -mt-64" />
        </div>

        <div className="w-full max-w-[1440px] mx-auto px-4 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-7xl font-black mb-6 leading-[0.95] tracking-tight text-white">
              Learn Crypto from <span className="text-crypto-primary">Zero to Professional</span>.
            </h1>
            <p className="text-xl md:text-2xl text-gray-100 mb-10 leading-relaxed max-w-2xl font-medium">
              Practical and educational guides focused on real security. The best starting point for your Bitcoin and Ethereum journey.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/blog" className="px-8 py-4 bg-crypto-primary hover:bg-crypto-accent text-white font-bold rounded-2xl transition-all shadow-lg shadow-crypto-primary/20 flex items-center justify-center">
                Start Beginner Guide →
              </Link>
              <Link href="/blog" className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl transition-all border border-white/10 flex items-center justify-center backdrop-blur-sm">
                View All Articles
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. HERO BANNER AD */}
      <section className="bg-gray-50 py-4 border-b border-gray-100">
        <div className="w-full max-w-[1440px] mx-auto px-4 lg:px-8">
          <div className="rounded-xl overflow-hidden bg-gray-100 min-h-[120px] flex items-center justify-center">
            <AdSense slot="homepage-hero" />
          </div>
        </div>
      </section>

      {/* 3. FEATURED + SIDEBAR SECTION */}
      <section className="py-12 md:py-16 bg-white">
        <div className="w-full max-w-[1440px] mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Featured Article - 2/3 width */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl md:text-3xl font-black text-crypto-darker tracking-tight">Featured of the Week</h2>
                <div className="w-12 h-1 bg-crypto-primary/20 rounded-full" />
              </div>
              {featuredPost && <FeaturedArticleCard post={featuredPost} />}
            </div>

            {/* Featured Ad - 1/3 width */}
            <div className="hidden lg:block">
              <div className="sticky top-24 space-y-6">
                <div className="text-center">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4 block">Advertisement</span>
                  <div className="rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 aspect-[300/600] flex items-center justify-center">
                    <AdSense slot="homepage-featured-ad" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. RECENT POSTS GRID (3-col) */}
      <section className="py-12 md:py-16 bg-gray-50/50">
        <div className="w-full max-w-[1440px] mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-3xl md:text-4xl font-black text-crypto-darker tracking-tight">Recent Articles</h2>
            <Link href="/blog" className="text-crypto-primary font-bold hover:underline text-sm uppercase tracking-widest">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {recentPosts.map(post => (
              <BlogCardCompact key={post.id} post={post} />
            ))}
          </div>
        </div>
      </section>

      {/* 5. NATIVE AD SECTION */}
      <section className="py-8 bg-white border-y border-gray-50">
        <div className="w-full max-w-[1440px] mx-auto px-4 lg:px-8">
          <div className="rounded-3xl bg-gray-50 p-8 border border-gray-100 min-h-[300px] flex items-center justify-center overflow-hidden">
            <AdSense slot="homepage-recommended" />
          </div>
        </div>
      </section>

      {/* 6. CATEGORIES SECTION */}
      <section className="py-12 md:py-16 bg-white overflow-hidden">
        <div className="w-full max-w-[1440px] mx-auto px-4 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-black text-crypto-darker tracking-tight mb-10">Explore Topics</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.slice(0, 8).map(cat => (
              <CategoryCard key={cat.slug} category={cat} />
            ))}
          </div>
        </div>
      </section>

      {/* 7. TRENDING SECTION */}
      <section className="py-12 md:py-16 bg-gray-50/50">
        <div className="w-full max-w-[1440px] mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <h2 className="text-3xl md:text-4xl font-black text-crypto-darker tracking-tight mb-10">Trending Now</h2>
              <TrendingList posts={trendingPosts} limit={5} />
            </div>
            <div className="hidden lg:block">
              <div className="sticky top-24">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4 block text-center">Sponsored</span>
                <div className="rounded-2xl overflow-hidden bg-white border border-gray-100 aspect-[300/300] shadow-sm flex items-center justify-center">
                  <AdSense slot="homepage-trending-ad" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. FAQ SECTION */}
      <section className="py-12 md:py-16 bg-white">
        <div className="w-full max-w-[1440px] mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <h2 className="text-3xl md:text-4xl font-black text-crypto-darker tracking-tight mb-4">Frequently Asked Questions</h2>
              <p className="text-gray-500 mb-10">Everything you need to know to start securely.</p>
              <FAQAccordion faqs={faqs} />
            </div>
            <div className="hidden lg:block">
              <div className="sticky top-24">
                <div className="rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 aspect-[300/250] flex items-center justify-center">
                  <AdSense slot="homepage-faq-ad" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. NEWSLETTER CTA FINAL */}
      <section className="py-16 md:py-24 bg-white">
        <div className="w-full max-w-[1440px] mx-auto px-4 lg:px-8">
          <NewsletterCTALarge />
        </div>
      </section>
    </>
  )
}

