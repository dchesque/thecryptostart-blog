'use client'

import { Fragment } from 'react'

export interface FAQItem {
    question: string
    answer: string
}

interface FAQSectionProps {
    items: FAQItem[]
    title?: string
    className?: string
}

/**
 * FAQ Section Component
 * Renderiza FAQ com schema.org markup automático (FAQPage)
 * Otimizado para visual "premium" do blog
 */
export default function FAQSection({
    items,
    title = 'Frequently Asked Questions',
    className = '',
}: FAQSectionProps) {
    if (!items || items.length === 0) return null

    return (
        <section className={`my-16 ${className}`}>
            {/* Schema.org FAQPage JSON-LD */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'FAQPage',
                        'mainEntity': items.map(item => ({
                            '@type': 'Question',
                            'name': item.question,
                            'acceptedAnswer': {
                                '@type': 'Answer',
                                'text': item.answer,
                            },
                        })),
                    }),
                }}
            />

            {/* Visual Design */}
            <div className="bg-white rounded-3xl p-8 lg:p-12 border border-gray-100 shadow-xl shadow-gray-200/50">
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-2 h-8 bg-crypto-primary rounded-full"></div>
                    <h2 className="text-3xl font-bold text-crypto-navy font-heading">{title}</h2>
                </div>

                <div className="grid gap-6 md:gap-8">
                    {items.map((item, idx) => (
                        <div
                            key={idx}
                            className="group bg-gray-50/50 rounded-2xl p-6 border border-transparent hover:border-crypto-primary/20 hover:bg-white transition-all duration-300"
                        >
                            <h3 className="font-bold text-xl text-crypto-navy mb-3 flex gap-3">
                                <span className="text-crypto-primary shrink-0">Q:</span>
                                {item.question}
                            </h3>
                            <div className="flex gap-3">
                                <span className="text-gray-400 font-bold shrink-0">A:</span>
                                <p className="text-crypto-charcoal/80 leading-relaxed text-lg">
                                    {item.answer}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-8 pt-8 border-t border-gray-100 flex justify-between items-center">
                    <p className="text-sm text-gray-400">
                        Expert knowledge provided by <span className="font-bold text-crypto-navy">TheCryptoStart Research Team</span>
                    </p>
                    <div className="flex gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        <span className="text-[10px] font-bold uppercase tracking-tighter text-gray-400">AI-Verified Content</span>
                    </div>
                </div>
            </div>
        </section>
    )
}
