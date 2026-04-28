import Link from 'next/link'
import type { Metadata } from 'next'
import { ArrowRight } from 'lucide-react'

import { getAllPosts, getAllCategories } from '@/lib/posts'
import FeaturedArticleCard from '@/components/FeaturedArticleCard'
import BlogCardCompact from '@/components/BlogCardCompact'
import CategoryCard from '@/components/CategoryCard'
import TrendingList from '@/components/TrendingList'
import FAQAccordion from '@/components/FAQAccordion'
import NewsletterCTALarge from '@/components/NewsletterCTALarge'

import { SITE_CONFIG } from '@/lib/constants'
import { generateWebsiteSchema, generateOrganizationSchema } from '@/lib/seo'

export const revalidate = 61

export const metadata: Metadata = {
  title: `Crypto for beginners — Bitcoin, Ethereum & Web3 guides | ${SITE_CONFIG.name}`,
  description:
    'Plain-language guides on Bitcoin, Ethereum and Web3, written for people starting their crypto journey. Practical, security-first, no hype.',
}

export default async function Homepage() {
  const [allPosts, categories] = await Promise.all([
    getAllPosts({ limit: 24 }),
    getAllCategories(),
  ])

  const featured = allPosts[0]
  const editorPicks = allPosts.slice(1, 4)
  const latestPosts = allPosts.slice(4, 10)
  const trending = allPosts.slice(10, 15)

  // Topic hubs: 4 most populated categories with their latest 3 posts
  const topicHubs = categories
    .map((cat) => {
      const items = allPosts.filter((p) => p.category === cat.slug).slice(0, 3)
      return { category: cat, items }
    })
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
       *  HERO — editorial, light, balanced
       * ============================================================ */}
      <section className="border-b border-line">
        <div className="container-hub pt-16 pb-12 md:pt-24 md:pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-end">
            <div className="lg:col-span-7">
              <span className="eyebrow">A crypto blog for beginners</span>
              <h1 className="mt-4 font-heading font-bold tracking-tight leading-[1.02] text-ink text-balance text-5xl md:text-6xl lg:text-[4.5rem]">
                Crypto, explained without the noise.
              </h1>
              <p className="mt-7 text-lg md:text-xl text-ink-soft leading-relaxed max-w-2xl">
                Plain-language guides on Bitcoin, Ethereum, DeFi and Web3 — written
                for people learning their way around digital money. Practical,
                security-first, and free of hype.
              </p>
              <div className="mt-10 flex flex-wrap items-center gap-4">
                <Link href="/blog" className="btn-accent">
                  Start reading <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="#topics" className="btn-ghost">
                  Browse topics
                </Link>
              </div>
            </div>

            <aside className="lg:col-span-5 lg:pl-6 lg:border-l lg:border-line">
              <div className="space-y-1.5 text-sm">
                <div className="flex items-baseline gap-3">
                  <span className="font-heading font-bold text-3xl text-ink tabular-nums">
                    50k+
                  </span>
                  <span className="text-ink-mute">readers learning every month</span>
                </div>
                <div className="flex items-baseline gap-3">
                  <span className="font-heading font-bold text-3xl text-ink tabular-nums">
                    {allPosts.length}+
                  </span>
                  <span className="text-ink-mute">in-depth guides published</span>
                </div>
                <div className="flex items-baseline gap-3">
                  <span className="font-heading font-bold text-3xl text-ink tabular-nums">
                    {categories.length}
                  </span>
                  <span className="text-ink-mute">curated topic streams</span>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-line text-sm text-ink-mute italic leading-relaxed">
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
       *  LEAD STORY + EDITOR PICKS
       * ============================================================ */}
      {featured && (
        <section className="border-b border-line">
          <div className="container-hub py-16 md:py-20">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
              <div className="lg:col-span-8">
                <span className="eyebrow">The lead</span>
                <div className="mt-6">
                  <FeaturedArticleCard post={featured} />
                </div>
              </div>

              <aside className="lg:col-span-4 lg:pl-8 lg:border-l lg:border-line">
                <div className="flex items-center gap-3 mb-6">
                  <span className="eyebrow-mute">Editor picks</span>
                  <div className="flex-1 h-px bg-line" />
                </div>
                <div className="space-y-7">
                  {editorPicks.map((post) => (
                    <BlogCardCompact key={post.id} post={post} variant="minimal" />
                  ))}
                </div>
              </aside>
            </div>
          </div>
        </section>
      )}

      {/* ============================================================
       *  LATEST GRID
       * ============================================================ */}
      {latestPosts.length > 0 && (
        <section className="border-b border-line">
          <div className="container-hub py-16 md:py-20">
            <div className="flex items-end justify-between gap-6 mb-10">
              <div className="max-w-xl">
                <span className="eyebrow">Latest</span>
                <h2 className="mt-2 section-title">Fresh from the desk</h2>
                <p className="mt-3 text-ink-mute">
                  Just-published explainers, security checklists and market notes.
                </p>
              </div>
              <Link href="/blog" className="btn-link hidden sm:inline-flex">
                All articles <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
              {latestPosts.map((post) => (
                <BlogCardCompact key={post.id} post={post} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============================================================
       *  TOPIC HUBS — content clusters
       * ============================================================ */}
      {topicHubs.length > 0 && (
        <section id="topics" className="border-b border-line bg-cream">
          <div className="container-hub py-16 md:py-20">
            <div className="max-w-2xl mb-12">
              <span className="eyebrow">Topic hubs</span>
              <h2 className="mt-2 section-title">Choose a topic, go deep.</h2>
              <p className="mt-3 text-ink-mute">
                Each topic gathers our best work in one place — start anywhere and
                keep reading until it clicks.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-12">
              {topicHubs.map(({ category, items }) => (
                <article key={category.slug} className="bg-paper rounded-2xl border border-line p-7 md:p-8">
                  <div className="flex items-start justify-between gap-4 mb-5">
                    <div>
                      <div className="flex items-center gap-2 text-2xl">
                        <span aria-hidden>{category.icon || '✦'}</span>
                        <h3 className="font-heading font-bold text-xl text-ink tracking-tight">
                          {category.name}
                        </h3>
                      </div>
                    </div>
                    <Link
                      href={`/blog?category=${category.slug}`}
                      className="text-sm font-semibold text-ink-mute hover:text-ink transition-colors whitespace-nowrap"
                    >
                      Browse →
                    </Link>
                  </div>

                  <ol className="divide-y divide-line">
                    {items.map((post) => (
                      <li key={post.id} className="py-4 first:pt-0 last:pb-0">
                        <BlogCardCompact post={post} variant="horizontal" />
                      </li>
                    ))}
                  </ol>
                </article>
              ))}
            </div>

            <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {categories.slice(0, 8).map((cat) => (
                <CategoryCard key={cat.slug} category={cat} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============================================================
       *  TRENDING
       * ============================================================ */}
      {trending.length > 0 && (
        <section className="border-b border-line">
          <div className="container-hub py-16 md:py-20">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
              <div className="lg:col-span-7">
                <span className="eyebrow">Trending now</span>
                <h2 className="mt-2 section-title">What readers are reading</h2>
                <p className="mt-3 text-ink-mute mb-10 max-w-xl">
                  The most-read pieces this week, ranked.
                </p>
                <TrendingList posts={trending} limit={5} />
              </div>

              <aside className="lg:col-span-5 lg:pl-8 lg:border-l lg:border-line">
                <div className="rounded-2xl bg-cream border border-line p-7">
                  <span className="eyebrow">Get the Sunday brief</span>
                  <h3 className="mt-3 font-heading text-xl font-bold text-ink leading-tight">
                    The week, distilled into one short email.
                  </h3>
                  <p className="mt-3 text-ink-mute text-sm leading-relaxed">
                    Beginner-friendly explainers and security checklists, every Sunday.
                  </p>
                  <Link href="#newsletter" className="mt-5 btn-primary inline-flex">
                    Subscribe <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </aside>
            </div>
          </div>
        </section>
      )}

      {/* ============================================================
       *  FAQ
       * ============================================================ */}
      <section className="border-b border-line">
        <div className="container-hub py-16 md:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-4">
              <span className="eyebrow">FAQ</span>
              <h2 className="mt-2 section-title">Common questions, plain answers.</h2>
              <p className="mt-3 text-ink-mute leading-relaxed">
                A quick reference to questions we hear from readers every week. For
                deeper dives, head to our library.
              </p>
            </div>
            <div className="lg:col-span-8">
              <FAQAccordion faqs={faqs} />
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
       *  NEWSLETTER CTA
       * ============================================================ */}
      <section className="container-hub py-16 md:py-20">
        <NewsletterCTALarge />
      </section>
    </>
  )
}
