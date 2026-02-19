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
    try {
        const categories = await getAllCategories()

        // Filter current category and limit
        const filtered = categories
            .filter(c => c.slug !== categorySlug)
            .slice(0, limit)

        if (filtered.length === 0) return null

        return (
            <ul className={`flex flex-wrap gap-2 ${className}`}>
                {filtered.map(cat => (
                    <li key={cat.slug}>
                        <Link
                            href={`/blog?category=${cat.slug}`}
                            className="px-3 py-1 text-xs font-medium text-gray-600 hover:text-crypto-primary hover:bg-crypto-primary/5 border border-gray-100 rounded-full transition-all"
                        >
                            {cat.name}
                        </Link>
                    </li>
                ))}
            </ul>
        )
    } catch (error) {
        console.error('Error fetching categories:', error)
        return null
    }
}

