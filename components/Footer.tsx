import Link from 'next/link'
import { Twitter, Github, Linkedin } from 'lucide-react'
import { SITE_CONFIG } from '@/lib/constants'
import { CategoryConfig } from '@/types/blog'

export default function Footer({ categories = [] }: { categories?: CategoryConfig[] }) {
  const year = new Date().getFullYear()
  const navCats = categories.length > 0
    ? categories.slice(0, 6)
    : [
        { slug: 'bitcoin', name: 'Bitcoin' } as CategoryConfig,
        { slug: 'ethereum', name: 'Ethereum' } as CategoryConfig,
        { slug: 'crypto-security', name: 'Security' } as CategoryConfig,
      ]

  return (
    <footer className="bg-cream border-t border-line">
      <div className="container-wide py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-10">
          {/* Brand */}
          <div className="md:col-span-5">
            <Link href="/" className="inline-flex items-baseline gap-2">
              <span className="font-heading font-bold text-ink text-xl tracking-tight">
                {SITE_CONFIG.name}
              </span>
              <span className="w-1 h-1 rounded-full bg-accent" aria-hidden />
            </Link>
            <p className="mt-4 text-ink-mute text-sm leading-relaxed max-w-md">
              Plain-language guides on Bitcoin, Ethereum and Web3, written for people
              starting their crypto journey. Practical, security-first, ad-supported.
            </p>

            <div className="mt-6 flex items-center gap-2">
              {SITE_CONFIG.social?.twitter && (
                <a
                  href={SITE_CONFIG.social.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Twitter"
                  className="w-9 h-9 rounded-full border border-line flex items-center justify-center text-ink-mute hover:text-ink hover:border-ink/30 transition-colors"
                >
                  <Twitter className="w-4 h-4" />
                </a>
              )}
              {SITE_CONFIG.social?.github && (
                <a
                  href={SITE_CONFIG.social.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub"
                  className="w-9 h-9 rounded-full border border-line flex items-center justify-center text-ink-mute hover:text-ink hover:border-ink/30 transition-colors"
                >
                  <Github className="w-4 h-4" />
                </a>
              )}
              {SITE_CONFIG.social?.linkedin && (
                <a
                  href={SITE_CONFIG.social.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  className="w-9 h-9 rounded-full border border-line flex items-center justify-center text-ink-mute hover:text-ink hover:border-ink/30 transition-colors"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Navigation */}
          <div className="md:col-span-3">
            <h4 className="text-xs font-bold uppercase tracking-[0.16em] text-ink-mute mb-4">
              Site
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/blog" className="text-ink-soft hover:text-ink transition-colors">All articles</Link></li>
              <li><Link href="/about" className="text-ink-soft hover:text-ink transition-colors">About</Link></li>
              <li><Link href="/guest-post-guidelines" className="text-ink-soft hover:text-ink transition-colors">Write for us</Link></li>
              <li><Link href="/privacy" className="text-ink-soft hover:text-ink transition-colors">Privacy</Link></li>
            </ul>
          </div>

          {/* Topics */}
          <div className="md:col-span-4">
            <h4 className="text-xs font-bold uppercase tracking-[0.16em] text-ink-mute mb-4">
              Topics
            </h4>
            <ul className="grid grid-cols-2 gap-x-6 gap-y-2.5 text-sm">
              {navCats.map((cat) => (
                <li key={cat.slug}>
                  <Link
                    href={`/blog?category=${cat.slug}`}
                    className="text-ink-soft hover:text-ink transition-colors"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 sm:mt-12 pt-6 sm:pt-8 border-t border-line flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="text-xs text-ink-mute">
            © {year} {SITE_CONFIG.name}. Educational content — not financial advice.
          </p>
          <p className="text-xs text-ink-mute">
            Made with care for readers, not algorithms.
          </p>
        </div>
      </div>
    </footer>
  )
}
