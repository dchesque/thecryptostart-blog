import Link from 'next/link'
import { getAllPosts } from '@/lib/contentful'
import BlogCard from '@/components/BlogCard'
import NewsletterForm from '@/components/NewsletterForm'
import FAQ from '@/components/FAQ'
import { BLOG_CONFIG, SITE_CONFIG, CACHE_CONFIG } from '@/lib/constants'
import { generateWebsiteSchema, generateOrganizationSchema } from '@/lib/seo'

// ISR: Revalidate every hour
export const revalidate = 3600

export default async function Homepage() {
  // Fetch data for sections
  const [fundamentalPosts, recentPosts] = await Promise.all([
    // Picking first 4 as "fundamental" for now (ideally filtered by tag 'fundamental' in the CMS)
    getAllPosts({ limit: 4 }),
    // Picking next 6 as "recent" (skipping the first 4 if they overlap)
    getAllPosts({ limit: 6, skip: 0 }),
  ])

  // In a real scenario, we might want specific "fundamental" articles. 
  // For now, let's use the first 4 for the 'Start Here' section and the top 6 for 'Recent'.
  const displayRecent = recentPosts.filter(rp => !fundamentalPosts.some(fp => fp.id === rp.id)).slice(0, 6);
  // Fallback if filter leaves too few posts
  const finalRecent = displayRecent.length > 0 ? displayRecent : recentPosts;

  return (
    <>
      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            generateWebsiteSchema(),
            generateOrganizationSchema(),
          ])
        }}
      />

      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-32 pb-24 sm:pt-40 sm:pb-32 bg-white">
        {/* Background decorations - Subtle and Professional */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-crypto-primary/3 rounded-full blur-[140px] -mr-64 -mt-64" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-crypto-navy/3 rounded-full blur-[120px] -ml-32 -mb-32" />
        </div>

        <div className="relative container">
          <div className="max-w-4xl">
            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-extrabold text-crypto-navy mb-8 leading-[0.95] tracking-tighter">
              Crypto for <span className="text-crypto-primary">beginners</span>.
            </h1>

            <p className="text-xl sm:text-2xl text-crypto-charcoal/70 mb-12 leading-relaxed max-w-2xl font-medium">
              Learn how to invest in Bitcoin and Web3 with practical, educational guides focused on real security.
            </p>

            <ul className="grid sm:grid-cols-2 gap-6 mb-12">
              {[
                'Step-by-step guides from zero to pro',
                'Security analysis against scams',
                '100% free and independent content',
                'Weekly market updates'
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-lg text-crypto-charcoal font-bold">
                  <svg className="w-6 h-6 text-crypto-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>

            <div className="flex flex-col sm:flex-row gap-5">
              <Link href="/blog?category=bitcoin" className="btn-primary text-lg px-10 py-5">
                Start with the Initial Guide
                <svg className="w-6 h-6 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                href="/blog"
                className="px-10 py-5 rounded-xl text-crypto-navy font-bold hover:bg-gray-50 transition-all border-2 border-gray-100 flex items-center justify-center text-lg"
              >
                View recent articles
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* START HERE - Fundamental Articles */}
      <section className="section-spacing bg-gray-50/50">
        <div className="container">
          <div className="mb-16">
            <span className="text-crypto-primary font-extrabold uppercase tracking-widest text-sm mb-4 block">Knowledge Base</span>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-crypto-navy leading-tight">Start Here</h2>
            <p className="text-crypto-charcoal/60 mt-4 text-xl max-w-2xl">
              The pillars every beginner needs to master before putting their capital at risk.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {fundamentalPosts.length > 0 ? (
              fundamentalPosts.map((post) => (
                <BlogCard key={post.id} post={post} variant="large" />
              ))
            ) : (
              <div className="col-span-full py-20 bg-white rounded-3xl border border-dashed border-gray-200 text-center text-crypto-charcoal/40 font-bold">
                Loading fundamental guides...
              </div>
            )}
          </div>
        </div>
      </section>

      {/* RECENT ARTICLES */}
      <section className="section-spacing bg-white">
        <div className="container">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
            <div>
              <span className="text-crypto-primary font-extrabold uppercase tracking-widest text-sm mb-4 block">Latest Publications</span>
              <h2 className="text-4xl sm:text-5xl font-extrabold text-crypto-navy leading-tight">Recent Articles</h2>
            </div>
            <Link
              href="/blog"
              className="text-crypto-primary font-bold hover:text-crypto-accent transition-colors flex items-center gap-3 group text-lg"
            >
              Explore complete library
              <svg className="w-6 h-6 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {finalRecent.map((post) => (
              <BlogCard key={post.id} post={post} variant="standard" />
            ))}
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="section-spacing bg-gray-50/50">
        <div className="container">
          <div className="text-center mb-16">
            <span className="text-crypto-primary font-extrabold uppercase tracking-widest text-sm mb-4 block">Strategic Navigation</span>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-crypto-navy leading-tight">Explore by Topics</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
            {BLOG_CONFIG.categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/blog?category=${cat.slug}`}
                className="card-topic group"
              >
                <div className="icon-wrapper">
                  {cat.icon}
                </div>
                <h3 className="text-crypto-navy font-extrabold text-sm tracking-tight group-hover:text-crypto-primary transition-colors uppercase">
                  {cat.name}
                </h3>
                <span className="text-[10px] text-crypto-charcoal/40 font-bold mt-2 block">+ articles</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* AUTHORITY BLOCK */}
      <section className="section-spacing bg-crypto-navy text-white overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5 pointer-events-none" />
        <div className="container relative z-10">
          <div className="grid lg:grid-cols-[1fr,1.5fr] gap-20 items-center">
            <div className="text-center lg:text-left">
              <span className="text-crypto-primary font-extrabold uppercase tracking-widest text-sm mb-4 block">E-E-A-T Authority</span>
              <h2 className="text-4xl sm:text-6xl font-extrabold mb-8 leading-[1.1] text-white">Real Crypto Education.</h2>

              <div className="space-y-8">
                <div className="flex items-center gap-6 justify-center lg:justify-start">
                  <div className="text-5xl font-extrabold text-white">+120</div>
                  <div className="text-white/80 font-bold uppercase tracking-wider text-sm">Technical articles <br />published</div>
                </div>
                <div className="flex items-center gap-6 justify-center lg:justify-start">
                  <div className="text-5xl font-extrabold text-white">100%</div>
                  <div className="text-white/80 font-bold uppercase tracking-wider text-sm">Focused on <br />education and security</div>
                </div>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-xl p-10 sm:p-14 rounded-[3rem] border border-white/10 shadow-4">
              <div className="flex flex-col sm:flex-row gap-10 items-start">
                <div className="w-24 h-24 rounded-3xl bg-crypto-primary flex-shrink-0 flex items-center justify-center text-4xl shadow-lg shadow-crypto-primary/20">
                  👨‍🏫
                </div>
                <div>
                  <h3 className="text-3xl font-extrabold mb-4 text-white">Academy Mission</h3>
                  <p className="text-white/90 text-lg leading-relaxed mb-6 font-medium">
                    We believe decentralization is the future, but the journey doesn't have to be dangerous. Our team of experts translates "crypto-speak" into plain English, stripping away the <span className="text-white">hype</span> and focusing on what really matters: your knowledge and your security.
                  </p>
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/60 text-sm font-bold">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    Updated weekly
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <FAQ />

      {/* NEWSLETTER */}
      <section className="section-spacing bg-white">
        <div className="container">
          <div className="bg-crypto-primary/5 rounded-[3.5rem] p-12 md:p-24 border border-crypto-primary/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-crypto-primary/5 rounded-full blur-[100px] -mr-40 -mt-40" />

            <div className="relative z-10 max-w-3xl mx-auto text-center">
              <h2 className="text-4xl sm:text-5xl font-extrabold mb-8 text-crypto-navy tracking-tight leading-tight">
                Receive insights you won't find on YouTube.
              </h2>
              <p className="text-crypto-charcoal/70 mb-12 text-xl max-w-xl mx-auto font-medium">
                Join our weekly educational newsletter. No spam, only practical knowledge.
              </p>
              <div className="max-w-md mx-auto">
                <NewsletterForm />
              </div>
              <p className="mt-8 text-crypto-charcoal/40 text-xs font-bold uppercase tracking-widest">
                Join +2,000 smart readers
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
