import Link from 'next/link'
import { CategoryConfig } from '@/types/blog'

interface CategoryCardProps {
    category: CategoryConfig
    className?: string
}

export default function CategoryCard({
    category,
    className = '',
}: CategoryCardProps) {
    return (
        <Link
            href={`/blog?category=${category.slug}`}
            className={`group flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:border-crypto-primary hover:shadow-md transition-all ${className}`}
        >
            <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300">
                {category.icon || '📚'}
            </div>
            <div>
                <h3 className="font-bold text-crypto-darker group-hover:text-crypto-primary transition-colors">
                    {category.name}
                </h3>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">
                    Explore Topics →
                </p>
            </div>
        </Link>
    )
}
