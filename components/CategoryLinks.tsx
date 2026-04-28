import Link from 'next/link'
import { getAllCategories } from '@/lib/posts'

interface CategoryLinksProps {
  categorySlug?: string
  limit?: number
  className?: string
}

export default async function CategoryLinks({
  categorySlug,
  limit = 6,
  className = '',
}: CategoryLinksProps) {
  try {
    const categories = await getAllCategories()
    const filtered = categories
      .filter(c => c.slug !== categorySlug)
      .slice(0, limit)

    if (filtered.length === 0) return null

    return (
      <ul className={`flex flex-wrap gap-2 ${className}`}>
        {filtered.map(cat => (
          <li key={cat.slug}>
            <Link href={`/blog?category=${cat.slug}`} className="tag">
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
