'use client'

import React from 'react'

interface Heading {
    id: string
    text: string
    level: 1 | 2 | 3
}

interface CompactTableOfContentsProps {
    headings: Heading[]
    variant?: 'minimal' | 'compact'
    className?: string
}

export default function CompactTableOfContents({
    headings,
    variant = 'minimal',
    className = '',
}: CompactTableOfContentsProps) {
    if (!headings || headings.length === 0) return null

    if (variant === 'minimal') {
        // Only dots with numbers for floating sidebar
        return (
            <nav
                className={`flex flex-col gap-3 items-center ${className}`}
                aria-label="Table of contents navigation dots"
            >
                {headings.map((heading, i) => (
                    <a
                        key={heading.id}
                        href={`#${heading.id}`}
                        className="group relative w-10 h-10 rounded-full bg-white border border-gray-200 shadow-sm hover:border-crypto-primary hover:text-crypto-primary flex items-center justify-center text-xs font-bold text-gray-400 transition-all duration-200"
                        title={heading.text}
                    >
                        {i + 1}
                        {/* Tooltip on hover */}
                        <span className="absolute left-12 px-2 py-1 bg-crypto-darker text-white text-[10px] rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                            {heading.text}
                        </span>
                        {/* Active indicator dot (optional, can be expanded with IntersectionObserver) */}
                    </a>
                ))}
            </nav>
        )
    }

    // Compact variant for inline or small sidebar
    return (
        <nav className={`bg-white rounded-xl p-5 border border-gray-200 shadow-sm ${className}`}>
            <h4 className="font-bold text-sm mb-4 text-crypto-darker uppercase tracking-wider flex items-center gap-2">
                <span className="w-1.5 h-4 bg-crypto-primary rounded-full" />
                Conteúdo
            </h4>
            <ul className="space-y-3">
                {headings.map((heading) => (
                    <li
                        key={heading.id}
                        className={`${heading.level === 3 ? 'ml-3' : ''} text-xs`}
                    >
                        <a
                            href={`#${heading.id}`}
                            className="text-gray-500 hover:text-crypto-primary transition-colors line-clamp-2 block leading-relaxed"
                        >
                            {heading.text}
                        </a>
                    </li>
                ))}
            </ul>
        </nav>
    )
}
