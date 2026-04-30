import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Mail } from 'lucide-react'
import { SITE_CONFIG } from '@/lib/constants'
import Breadcrumb from '@/components/Breadcrumb'

export const metadata: Metadata = {
  title: `About — ${SITE_CONFIG.name}`,
  description: `${SITE_CONFIG.name} is a plain-language crypto blog for beginners. Learn about our editorial approach, our values and how to get in touch.`,
}

export default function AboutPage() {
  return (
    <div className="bg-paper">
      <header className="border-b border-line">
        <div className="container-hub pt-8 sm:pt-10 md:pt-14 pb-10 sm:pb-12 md:pb-16">
          <Breadcrumb
            items={[
              { name: 'Home', url: '/' },
              { name: 'About', url: '/about' },
            ]}
            className="mb-6 sm:mb-7"
          />
          <span className="eyebrow">About</span>
          <h1 className="mt-3 page-title text-balance max-w-3xl">
            A patient, beginner-first guide to crypto.
          </h1>
          <p className="mt-5 sm:mt-6 text-base sm:text-lg md:text-xl text-ink-soft leading-relaxed max-w-2xl">
            {SITE_CONFIG.name} exists for one reason: to help curious newcomers
            understand digital money without being overwhelmed, misled, or sold to.
          </p>
        </div>
      </header>

      <section className="container-hub py-12 sm:py-16 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">
          <article className="lg:col-span-8 prose prose-lg article-body max-w-none">
            <h2>Our mission</h2>
            <p>
              We believe cryptocurrency and Web3 should be accessible to anyone
              willing to spend a few minutes learning. Our mission is to publish
              clear, honest, beginner-friendly material that helps you navigate this
              space with confidence — and without losing money to easily-avoided
              mistakes.
            </p>

            <h2>What you'll find here</h2>
            <ul>
              <li>Fundamentals on Bitcoin, Ethereum and the major networks.</li>
              <li>Plain-language explainers for blockchain concepts.</li>
              <li>Practical DeFi tutorials that show real risks alongside the upside.</li>
              <li>Security guides — wallets, seed phrases, hardware, multisig.</li>
              <li>Long-form research on Web3 and the structure of crypto markets.</li>
              <li>Honest takes on common beginner pitfalls.</li>
            </ul>

            <h2>How we write</h2>
            <p>
              We pick a topic, read everything credible we can find on it, and then
              translate it into something a smart non-specialist can actually use.
              We avoid jargon when an everyday word will do. We add jargon only
              when it has to be there — and explain it the first time it appears.
            </p>

            <h2>What we won't do</h2>
            <p>
              We don't shill tokens. We don't run pump-and-dump newsletters. We
              don't promise returns. Crypto is interesting precisely because it's
              risky and weird, and pretending otherwise would be doing readers a
              disservice.
            </p>

            <h2>Get in touch</h2>
            <p>
              Have a question, a correction, or a guide you wish we'd write? Email
              us at{' '}
              <a href={`mailto:${SITE_CONFIG.email}`}>{SITE_CONFIG.email}</a>. We
              read everything.
            </p>
          </article>

          <aside className="lg:col-span-4 lg:pl-8 lg:border-l lg:border-line">
            <div className="lg:sticky lg:top-[6.5rem] space-y-8">
              <div className="rounded-2xl bg-cream border border-line p-5 sm:p-7">
                <span className="eyebrow">Stay close</span>
                <h3 className="mt-3 font-heading text-lg font-bold text-ink leading-snug">
                  Get our best beginner guides every Sunday.
                </h3>
                <p className="mt-2 text-ink-mute text-sm leading-relaxed">
                  One short email a week. No spam, no shilling.
                </p>
                <Link href="/#newsletter" className="mt-5 btn-primary inline-flex">
                  Subscribe <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div>
                <span className="eyebrow-mute">Contact</span>
                <a
                  href={`mailto:${SITE_CONFIG.email}`}
                  className="mt-3 inline-flex items-center gap-2 text-ink hover:text-accent-deep transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  {SITE_CONFIG.email}
                </a>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  )
}
