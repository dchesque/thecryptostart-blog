import Link from 'next/link'
import { getAllCategories } from '@/lib/contentful'

interface CategoryLinksProps {
    categorySlug?: string
    limit?: number
    className?: string
}

export default async function CategoryLinks({
    categorySlug,
    limit = 5,
    className = '',
}: CategoryLinksProps) {
    const categories = await getAllCategories()

    // Filter current category and limit
    const filtered = categories
        .filter(c => c.slug !== categorySlug)
        .slice(0, limit)

    return (
        <ul className={`space-y-3 ${className}`}>
            {filtered.map(cat => (
                <li key={cat.slug}>
                    <Link
                        href={`/blog?category=${cat.slug}`}
                        className="group flex items-center justify-between text-sm text-gray-600 hover:text-crypto-primary transition-colors"
                    >
                        <span className="flex items-center gap-2">
                            <span className="w-1 h-1 rounded-full bg-gray-300 group-hover:bg-crypto-primary transition-colors" />
                            {cat.name}
                        </span>
                    </Link>
                </li>
            ))}
        </ul>
    )
}
