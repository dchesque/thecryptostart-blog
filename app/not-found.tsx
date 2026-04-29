import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { getAllPosts } from '@/lib/posts'

export const metadata = {
  title: 'Page not found',
  description: 'We couldn’t find the page you were looking for. Browse our latest articles instead.',
}

export default async function NotFound() {
  let suggestions: any[] = []
  try {
    suggestions = (await getAllPosts({ limit: 4 })) ?? []
  } catch {
    suggestions = []
  }

  return (
    <div className="bg-paper">
      <div className="container-hub py-16 sm:py-24 md:py-32">
        <div className="max-w-2xl">
          <span className="eyebrow">404</span>
          <h1 className="mt-3 page-title text-balance">
            We couldn't find that page.
          </h1>
          <p className="mt-5 sm:mt-6 text-base sm:text-lg text-ink-soft leading-relaxed">
            The link may be broken or the page may have moved. Try the homepage,
            or head into the library — there are plenty of articles waiting for
            you.
          </p>

          <div className="mt-7 sm:mt-8 flex flex-wrap items-center gap-3 sm:gap-4">
            <Link href="/" className="btn-accent">
              Go to homepage <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/blog" className="btn-ghost">
              Browse the library
            </Link>
          </div>
        </div>

        {suggestions.length > 0 && (
          <section className="mt-16 sm:mt-20 pt-10 sm:pt-12 border-t border-line">
            <div className="flex items-center gap-3 mb-6 sm:mb-8">
              <span className="eyebrow-mute">Latest from the desk</span>
              <div className="flex-1 h-px bg-line" />
            </div>

            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 sm:gap-x-8 gap-y-5 sm:gap-y-6">
              {suggestions.map((post) => (
                <li key={post.id}>
                  <Link href={`/blog/${post.slug}`} className="group block">
                    <h3 className="font-heading text-base sm:text-lg font-bold text-ink leading-snug group-hover:text-accent-deep transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="mt-1.5 text-sm text-ink-mute line-clamp-2">
                      {post.description}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  )
}
