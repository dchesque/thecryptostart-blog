import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { CategoryConfig } from '@/types/blog'

interface CategoryCardProps {
  category: CategoryConfig
  description?: string
  postCount?: number
  className?: string
}

/**
 * Topic card. Used in topic-cluster grids on the home and blog index.
 * Light, restrained — focused on the topic name + a hint of depth.
 */
export default function CategoryCard({
  category,
  description,
  postCount,
  className = '',
}: CategoryCardProps) {
  return (
    <Link
      href={`/blog?category=${category.slug}`}
      className={`group flex flex-col h-full p-6 rounded-2xl border border-line bg-paper hover:border-ink/30 transition-all ${className}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="text-3xl leading-none" aria-hidden>
          {category.icon || '✦'}
        </div>
        <ArrowUpRight className="w-5 h-5 text-ink-faint group-hover:text-accent transition-colors" />
      </div>

      <h3 className="mt-6 font-heading text-lg font-bold text-ink group-hover:text-accent-deep transition-colors">
        {category.name}
      </h3>

      {description && (
        <p className="mt-2 text-sm text-ink-mute leading-relaxed line-clamp-2">
          {description}
        </p>
      )}

      <div className="mt-auto pt-5 flex items-center justify-between text-xs text-ink-mute">
        <span className="font-medium uppercase tracking-[0.12em]">Browse topic</span>
        {typeof postCount === 'number' && (
          <span>{postCount} {postCount === 1 ? 'article' : 'articles'}</span>
        )}
      </div>
    </Link>
  )
}
