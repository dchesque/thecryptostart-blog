import type { Metadata } from 'next'
import { CheckCircle2, ArrowRight } from 'lucide-react'
import Breadcrumb from '@/components/Breadcrumb'
import { SITE_CONFIG } from '@/lib/constants'

export const metadata: Metadata = {
  title: `Write for us — Guest post guidelines | ${SITE_CONFIG.name}`,
  description: `Pitch a guest post to ${SITE_CONFIG.name} and reach 50K+ monthly readers learning about crypto. Read our submission guidelines.`,
}

const benefits = [
  'Reach 50,000+ monthly readers learning crypto.',
  'Build authority and a quality byline in the space.',
  'A real backlink to your site or project.',
  'Coverage on our newsletter and socials.',
]

const requirements = [
  { label: 'Length',     value: '1,500 – 2,500 words' },
  { label: 'Originality', value: '100% original — never published elsewhere' },
  { label: 'Topics',     value: 'Bitcoin, Ethereum, DeFi, security, Web3' },
  { label: 'Quality',    value: 'Researched, fact-checked, beginner-friendly tone' },
]

const topics = [
  'Bitcoin & Ethereum',
  'DeFi & staking',
  'Security & self-custody',
  'Web3 & NFTs',
  'Project breakdowns',
  'Beginner investment guides',
]

const steps = [
  { step: 'Pitch',       desc: 'Send your topic idea and a short outline.' },
  { step: 'Approval',    desc: 'We review and reply within 2–3 working days.' },
  { step: 'Drafting',    desc: 'Write the piece following our style guide.' },
  { step: 'Editing',     desc: 'We polish copy, structure and SEO together.' },
  { step: 'Publication', desc: 'Goes live with your byline, bio and links.' },
]

export default function GuestPostGuidelines() {
  return (
    <div className="bg-paper">
      <header className="border-b border-line">
        <div className="container-hub pt-10 md:pt-14 pb-12 md:pb-16">
          <Breadcrumb
            items={[
              { name: 'Home', url: '/' },
              { name: 'Write for us', url: '/guest-post-guidelines' },
            ]}
            className="mb-7"
          />
          <span className="eyebrow">Contribute</span>
          <h1 className="mt-3 page-title text-balance max-w-3xl">
            Write for {SITE_CONFIG.name}.
          </h1>
          <p className="mt-6 text-lg md:text-xl text-ink-soft leading-relaxed max-w-2xl">
            We accept guest posts from writers, builders and researchers who can
            explain crypto clearly to beginners. Here's what we publish, and how
            to pitch.
          </p>
        </div>
      </header>

      <section className="container-hub py-16 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 max-w-wide mx-auto">
          <div className="lg:col-span-8 space-y-16">

            {/* Benefits */}
            <div>
              <h2 className="section-title mb-6">Why write with us</h2>
              <ul className="grid sm:grid-cols-2 gap-y-3 gap-x-6">
                {benefits.map((b) => (
                  <li key={b} className="flex items-start gap-3 text-ink-soft">
                    <CheckCircle2 className="w-5 h-5 mt-0.5 text-accent shrink-0" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Requirements */}
            <div>
              <h2 className="section-title mb-6">What we look for</h2>
              <div className="rounded-2xl border border-line overflow-hidden">
                <table className="w-full text-left">
                  <tbody className="divide-y divide-line">
                    {requirements.map((req) => (
                      <tr key={req.label}>
                        <th
                          scope="row"
                          className="py-4 px-5 sm:px-6 align-top font-heading font-semibold text-ink w-1/3 bg-cream"
                        >
                          {req.label}
                        </th>
                        <td className="py-4 px-5 sm:px-6 text-ink-soft">{req.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Topics */}
            <div>
              <h2 className="section-title mb-6">Topics we accept</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {topics.map((topic) => (
                  <div
                    key={topic}
                    className="rounded-xl border border-line bg-cream px-4 py-3 text-center text-sm font-medium text-ink"
                  >
                    {topic}
                  </div>
                ))}
              </div>
            </div>

            {/* Process */}
            <div>
              <h2 className="section-title mb-6">How submission works</h2>
              <ol className="space-y-5">
                {steps.map((item, i) => (
                  <li
                    key={item.step}
                    className="grid grid-cols-[auto_1fr] gap-5 items-start"
                  >
                    <span className="font-heading font-bold text-2xl text-ink-faint tabular-nums leading-none pt-1">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div>
                      <h3 className="font-heading text-lg font-bold text-ink">
                        {item.step}
                      </h3>
                      <p className="mt-1 text-ink-soft">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* Aside */}
          <aside className="lg:col-span-4">
            <div className="lg:sticky lg:top-[6.5rem] rounded-2xl bg-cream border border-line p-5 sm:p-7">
              <span className="eyebrow">Pitch us</span>
              <h3 className="mt-3 font-heading text-xl font-bold text-ink leading-snug">
                Send a short outline.
              </h3>
              <p className="mt-2 text-ink-mute leading-relaxed">
                Email us with the subject line:
              </p>
              <p className="mt-2 font-mono text-xs sm:text-sm text-ink bg-paper border border-line rounded-lg px-3 py-2 break-all">
                Guest pitch: [your topic]
              </p>

              <a
                href={`mailto:${SITE_CONFIG.email}`}
                className="mt-6 btn-accent w-full justify-center"
              >
                <span className="truncate">Email us</span>
                <ArrowRight className="w-4 h-4 shrink-0" />
              </a>
              <p className="mt-2 text-xs text-ink-mute text-center break-all font-mono">
                {SITE_CONFIG.email}
              </p>

              <p className="mt-4 text-xs text-ink-mute leading-relaxed">
                We reserve the right to refuse or edit any submission. Pieces are
                published under your byline with a short bio and one link.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </div>
  )
}
