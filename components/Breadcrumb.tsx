import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

interface BreadcrumbItem {
  name: string
  url: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  className?: string
}

export default function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex items-center text-sm text-ink-mute ${className}`}
    >
      <ol className="flex items-center gap-1.5 flex-wrap">
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          return (
            <li key={item.url} className="flex items-center gap-1.5">
              {isLast ? (
                <span
                  aria-current="page"
                  className="text-ink font-medium truncate max-w-[220px] sm:max-w-xs"
                >
                  {item.name}
                </span>
              ) : (
                <Link
                  href={item.url}
                  className="text-ink-mute hover:text-ink transition-colors"
                >
                  {item.name}
                </Link>
              )}
              {!isLast && (
                <ChevronRight className="w-3.5 h-3.5 text-ink-faint shrink-0" aria-hidden />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
