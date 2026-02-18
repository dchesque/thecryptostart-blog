import { ReactNode } from 'react'

type InfoBoxType = 'tip' | 'warning' | 'info' | 'success'

interface InfoBoxProps {
    type?: InfoBoxType
    title?: string
    children: ReactNode
    className?: string
}

const typeConfig: Record<InfoBoxType, {
    bg: string
    border: string
    icon: string
    iconColor: string
    titleColor: string
}> = {
    tip: {
        bg: 'bg-blue-50',
        border: 'border-l-4 border-blue-500',
        icon: '💡',
        iconColor: 'text-blue-500',
        titleColor: 'text-blue-700',
    },
    warning: {
        bg: 'bg-amber-50',
        border: 'border-l-4 border-amber-500',
        icon: '⚠️',
        iconColor: 'text-amber-500',
        titleColor: 'text-amber-700',
    },
    info: {
        bg: 'bg-cyan-50',
        border: 'border-l-4 border-cyan-500',
        icon: 'ℹ️',
        iconColor: 'text-cyan-500',
        titleColor: 'text-cyan-700',
    },
    success: {
        bg: 'bg-green-50',
        border: 'border-l-4 border-green-500',
        icon: '✅',
        iconColor: 'text-green-500',
        titleColor: 'text-green-700',
    },
}

/**
 * InfoBox component
 * Callout boxes for highlighting important content in blog posts
 */
export default function InfoBox({ type = 'info', title, children, className = '' }: InfoBoxProps) {
    const config = typeConfig[type]

    return (
        <div
            className={`${config.bg} ${config.border} rounded-r-xl p-5 my-6 ${className}`}
            role="note"
        >
            <div className="flex items-start gap-3">
                <span className="text-xl flex-shrink-0 mt-0.5" aria-hidden="true">
                    {config.icon}
                </span>
                <div className="flex-1 min-w-0">
                    {title && (
                        <p className={`font-bold text-sm uppercase tracking-wide mb-1 ${config.titleColor}`}>
                            {title}
                        </p>
                    )}
                    <div className="text-sm text-gray-700 leading-relaxed [&>p]:mb-2 [&>p:last-child]:mb-0">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    )
}
