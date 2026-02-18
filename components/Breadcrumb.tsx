import Link from 'next/link'

interface BreadcrumbItem {
    name: string
    url: string
}

interface BreadcrumbProps {
    items: BreadcrumbItem[]
    className?: string
}

/**
 * Breadcrumb visual component
 * Renders navigation breadcrumbs with separators
 */
export default function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
    return (
        <nav
            aria-label="Breadcrumb"
            className={`flex items-center gap-2 text-sm text-crypto-charcoal/50 flex-wrap ${className}`}
        >
            <ol className="flex items-center gap-2 flex-wrap">
                {items.map((item, index) => {
                    const isLast = index === items.length - 1
                    return (
                        <li key={item.url} className="flex items-center gap-2">
                            {isLast ? (
                                <span
                                    aria-current="page"
                                    className="text-crypto-primary font-semibold truncate max-w-[200px] sm:max-w-xs"
                                >
                                    {item.name}
                                </span>
                            ) : (
                                <Link
                                    href={item.url}
                                    className="hover:text-crypto-primary transition-colors font-medium"
                                >
                                    {item.name}
                                </Link>
                            )}
                            {!isLast && (
                                <span className="text-crypto-charcoal/30 select-none">/</span>
                            )}
                        </li>
                    )
                })}
            </ol>
        </nav>
    )
}
