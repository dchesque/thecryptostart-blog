import Link from 'next/link'
import type { Metadata } from 'next'
import { ArrowRight } from 'lucide-react'

import { getAllPosts, getAllCategories } from '@/lib/posts'
import FeaturedArticleCard from '@/components/FeaturedArticleCard'
import BlogCardCompact from '@/components/BlogCardCompact'
import TrendingList from '@/components/TrendingList'
import FAQAccordion from '@/components/FAQAccordion'
import NewsletterCTALarge from '@/components/NewsletterCTALarge'
import MarketSnapshot from '@/components/MarketSnapshot'

import { SITE_CONFIG, getCategoryName } from '@/lib/constants'
import { generateWebsiteSchema, generateOrganizationSchema } from '@/lib/seo'

export const revalidate = 61

export const metadata: Metadata = {
  title: `Crypto for beginners — Bitcoin, Ethereum & Web3 guides | ${SITE_CONFIG.name}`,
  description:
    'Plain-language guides on Bitcoin, Ethereum and Web3, written for people starting their crypto journey. Practical, security-first, no hype.',
}

export default async function Homepage() {
  const [allPosts, categories] = await Promise.all([
    getAllPosts({ limit: 30 }),
    getAllCategories(),
  ])

  const featured = allPosts[0]
  const editorPicks = allPosts.slice(1, 5)
  const latestPosts = allPosts.slice(5, 13)
  const trending = allPosts.slice(13, 19)
  const moreReads = allPosts.slice(19, 25)

  // Topic hubs: up to 4 categories × 4 posts each
  const topicHubs = categories
    .map((cat) => ({
      category: cat,
      items: allPosts.filter((p) => p.category === cat.slug).slice(0, 4),
    }))
    .filter((hub) => hub.items.length >= 2)
    .slice(0, 4)

  const faqs = [
    {
      question: 'Is Bitcoin still a good investment in 2026?',
      answer:
        'Bitcoin remains the primary store of value in the digital asset space. Volatility is real, but institutional adoption and the “digital gold” narrative continue to drive long-term structural demand.',
    },
    {
      question: 'How do I secure my crypto assets properly?',
      answer:
        'True security means hardware wallets, never sharing your seed phrase, and understanding that “not your keys, not your coins”. For meaningful holdings, use air-gapped or multisig setups.',
    },
    {
      question: 'What is the difference between Bitcoin and Ethereum?',
      answer:
        'Bitcoin is digital money and a store of value. Ethereum is a global, programmable computing platform that powers smart contracts and decentralized applications.',
    },
    {
      question: 'Which exchanges are best for beginners?',
      answer:
        'For most beginners, regulated exchanges with strong security records — Coinbase, Kraken, or your regional equivalent — are a sensible starting point. Move funds off-exchange once you’re past the experiment phase.',
    },
    {
      question: 'Do I need to pay taxes on crypto gains?',
      answer:
        'In most jurisdictions, crypto is treated as property. Selling, trading or spending it usually triggers a taxable event. Use crypto tax software and consult a professional in your country.',
    },
    {
      question: 'What is a cold wallet and do I need one?',
      answer:
        'A cold (or hardware) wallet stores your private keys offline, isolated from internet attacks. If you hold more than a token amount, it’s the safest option for self-custody.',
    },
  ]

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([generateWebsiteSchema(), generateOrganizationSchema()]),
        }}
      />

      {/* ============================================================
       *  HERO — preserved (editorial, light, balanced)
       * ============================================================ */}
      <section className="border-b border-line">
        <div className="container-hub pt-12 pb-10 sm:pt-16 sm:pb-12 md:pt-24 md:pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-end">
            <div className="lg:col-span-7">
              <span className="eyebrow">A crypto blog for beginners</span>
              <h1 className="mt-4 font-heading font-bold tracking-tight leading-[1.05] text-ink text-balance text-4xl sm:text-5xl md:text-6xl lg:text-[4.5rem]">
                Crypto, explained without the noise.
              </h1>
              <p className="mt-6 sm:mt-7 text-base sm:text-lg md:text-xl text-ink-soft leading-relaxed max-w-2xl">
                Plain-language guides on Bitcoin, Ethereum, DeFi and Web3 — written
                for people learning their way around digital money. Practical,
                security-first, and free of hype.
              </p>
              <div className="mt-8 sm:mt-10 flex flex-wrap items-center gap-3 sm:gap-4">
                <Link href="/blog" className="btn-accent">
                  Start reading <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="#topics" className="btn-ghost">
                  Browse topics
                </Link>
              </div>
            </div>

            <aside className="lg:col-span-5 lg:pl-6 lg:border-l lg:border-line pt-8 lg:pt-0 mt-6 lg:mt-0 border-t border-line lg:border-t-0">
              <div className="space-y-1.5 text-sm">
                <div className="flex items-baseline gap-3">
                  <span className="num font-bold text-2xl sm:text-3xl text-ink">50k+</span>
                  <span className="text-ink-mute">readers learning every month</span>
                </div>
                <div className="flex items-baseline gap-3">
                  <span className="num font-bold text-2xl sm:text-3xl text-ink">{allPosts.length}+</span>
                  <span className="text-ink-mute">in-depth guides published</span>
                </div>
                <div className="flex items-baseline gap-3">
                  <span className="num font-bold text-2xl sm:text-3xl text-ink">{categories.length}</span>
                  <span className="text-ink-mute">curated topic streams</span>
                </div>
              </div>

              <div className="mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-line text-sm text-ink-mute italic leading-relaxed">
                “The clearest crypto resource I’ve sent to family. No hype, no
                shilling — just patient explainers.”
                <br />
                <span className="not-italic block mt-2 font-medium text-ink-soft">
                  — early reader
                </span>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* ============================================================
       *  FRONT PAGE — lead + 2×2 picks grid + market data
       * ============================================================ */}
      {featured && (
        <section className="border-b border-line">
          <div className="container-hub py-10 md:py-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
              <div className="lg:col-span-7">
                <div className="flex items-center gap-3 mb-5">
                  <span className="eyebrow">The lead</span>
                  <div className="flex-1 h-px bg-line" />
                </div>
                <FeaturedArticleCard post={featured} />
              </div>

              <aside className="lg:col-span-5 lg:pl-10 lg:border-l lg:border-line pt-8 lg:pt-0 border-t border-line lg:border-t-0">
                <div className="flex items-center gap-3 mb-5">
                  <span className="eyebrow-mute">Editor picks</span>
                  <div className="flex-1 h-px bg-line" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6 sm:gap-y-7">
                  {editorPicks.map((post) => (
                    <BlogCardCompact key={post.id} post={post} variant="minimal" />
                  ))}
                </div>
              </aside>
            </div>

            <div className="mt-10 pt-10 border-t border-line">
              <MarketSnapshot />
            </div>
          </div>
        </section>
      )}

      {/* ============================================================
       *  LATEST — 4-col card grid (2 rows × 4 cols = 8 posts)
       * ============================================================ */}
      {latestPosts.length > 0 && (
        <section className="border-b border-line">
          <div className="container-hub py-10 md:py-12">
            <div className="flex items-end justify-between gap-6 mb-7">
              <div>
                <span className="eyebrow">Latest</span>
                <h2 className="mt-1 section-title">Fresh from the desk</h2>
              </div>
              <Link href="/blog" className="btn-link hidden sm:inline-flex">
                All articles <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
              {latestPosts.map((post) => (
                <BlogCardCompact key={post.id} post={post} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============================================================
       *  TOPIC HUBS — 2×2 outer, 2×2 inner grid of titles
       * ============================================================ */}
      {topicHubs.length > 0 && (
        <section id="topics" className="border-b border-line bg-cream">
          <div className="container-hub py-10 md:py-12">
            <div className="flex items-end justify-between gap-6 mb-7">
              <div className="max-w-xl">
                <span className="eyebrow">Topic hubs</span>
                <h2 className="mt-1 section-title">Choose a topic, go deep.</h2>
              </div>
              <Link href="/blog/clusters" className="btn-link hidden sm:inline-flex">
                See the map <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
              {topicHubs.map(({ category, items }) => (
                <article
                  key={category.slug}
                  className="bg-paper rounded-2xl border border-line p-5 md:p-6"
                >
                  <header className="flex items-center justify-between gap-3 pb-3 mb-4 border-b border-line">
                    <div className="flex items-center gap-2 min-w-0">
                      <span aria-hidden className="text-lg shrink-0">
                        {category.icon || '✦'}
                      </span>
                      <h3 className="font-heading font-bold text-base text-ink tracking-tight truncate">
                        {category.name || getCategoryName(category.slug)}
                      </h3>
                    </div>
                    <Link
                      href={`/blog?category=${category.slug}`}
                      className="text-xs font-semibold text-ink-mute hover:text-ink transition-colors whitespace-nowrap"
                    >
                      Browse →
                    </Link>
                  </header>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-3 sm:gap-y-4">
                    {items.map((post) => (
                      <Link
                        key={post.id}
                        href={`/blog/${post.slug}`}
                        className="group block"
                      >
                        <h4 className="font-heading text-[0.95rem] font-semibold leading-snug text-ink group-hover:text-accent-deep transition-colors line-clamp-2 sm:line-clamp-3">
                          {post.title}
                        </h4>
                        <div className="mt-1.5 num text-[11px] text-ink-mute">
                          {post.readingTime} min read
                        </div>
                      </Link>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============================================================
       *  TRENDING + FAQ — combined band
       * ============================================================ */}
      <section className="border-b border-line">
        <div className="container-hub py-10 md:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
            {/* Trending */}
            <div className="lg:col-span-5">
              <div className="flex items-center gap-3 mb-5">
                <span className="eyebrow">Trending</span>
                <div className="flex-1 h-px bg-line" />
              </div>
              <h2 className="section-title">What readers are reading</h2>
              <p className="mt-2 text-ink-mute text-sm mb-6">
                The most-read pieces this week, ranked.
              </p>
              {trending.length > 0 && <TrendingList posts={trending} limit={6} />}

              {moreReads.length > 0 && (
                <div className="mt-8 pt-6 border-t border-line">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="eyebrow-mute">More reads</span>
                    <div className="flex-1 h-px bg-line" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                    {moreReads.map((post) => (
                      <Link
                        key={post.id}
                        href={`/blog/${post.slug}`}
                        className="group flex items-baseline gap-3"
                      >
                        <h4 className="font-heading text-sm font-medium leading-snug text-ink-soft group-hover:text-ink transition-colors line-clamp-2 flex-1">
                          {post.title}
                        </h4>
                        <span className="num text-[11px] text-ink-mute shrink-0">
                          {post.readingTime}m
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* FAQ */}
            <div className="lg:col-span-7 lg:pl-10 lg:border-l lg:border-line pt-10 lg:pt-0 border-t border-line lg:border-t-0">
              <div className="flex items-center gap-3 mb-5">
                <span className="eyebrow">FAQ</span>
                <div className="flex-1 h-px bg-line" />
              </div>
              <h2 className="section-title">Common questions, plain answers.</h2>
              <p className="mt-2 text-ink-mute text-sm mb-6">
                A quick reference to questions we hear from readers every week.
              </p>
              <FAQAccordion faqs={faqs} />
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
       *  NEWSLETTER CTA
       * ============================================================ */}
      <section className="container-hub py-10 md:py-14">
        <NewsletterCTALarge />
      </section>
    </>
  )
}
