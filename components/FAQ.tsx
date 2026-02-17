'use client'

import { useState } from 'react'

interface FAQItem {
    question: string
    answer: string
}

const FAQ_ITEMS: FAQItem[] = [
    {
        question: 'What are cryptocurrencies?',
        answer: 'Cryptocurrencies are digital currencies protected by cryptography and based on blockchain technology. Unlike traditional currencies, they are decentralized, meaning they do not depend on central banks or governments to function.'
    },
    {
        question: 'How to invest in Bitcoin safely?',
        answer: 'Safe Bitcoin investing depends on three pillars: using reliable exchanges, enabling two-factor authentication (2FA), and for large amounts, using a cold wallet (offline physical wallet) to store your private keys.'
    },
    {
        question: 'How to avoid crypto scams?',
        answer: 'To avoid scams, never share your recovery phrases (seed phrases), be wary of promises of guaranteed or exaggerated profits, and always verify the authenticity of websites and apps before connecting your wallet.'
    },
    {
        question: 'Are cryptocurrencies secure?',
        answer: 'The technology behind major cryptocurrencies like Bitcoin is extremely secure. However, user security depends on individual custody practices and choosing legitimate platforms to operate.'
    },
    {
        question: 'What is DeFi?',
        answer: 'DeFi (Decentralized Finance) is a financial system built on blockchain that allows for loans, exchanges, and other financial services without the need for traditional intermediaries like banks.'
    }
]

export default function FAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(null)

    const toggle = (index: number) => {
        setOpenIndex(openIndex === index ? null : index)
    }

    // FAQ Schema for Rich Snippets
    const schemaMarkup = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": FAQ_ITEMS.map(item => ({
            "@type": "Question",
            "name": item.question,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": item.answer
            }
        }))
    }

    return (
        <section className="section-spacing bg-gray-50/50">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
            />

            <div className="container max-w-4xl">
                <div className="text-center mb-16">
                    <span className="text-crypto-primary font-extrabold uppercase tracking-widest text-sm mb-4 block">Frequently Asked Questions</span>
                    <h2 className="text-4xl sm:text-5xl font-extrabold text-crypto-navy leading-tight">Crypto Questions</h2>
                </div>

                <div className="space-y-4">
                    {FAQ_ITEMS.map((item, index) => (
                        <div
                            key={index}
                            className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                        >
                            <button
                                onClick={() => toggle(index)}
                                className="w-full px-8 py-6 text-left flex justify-between items-center group"
                            >
                                <span className="text-lg font-bold text-crypto-navy group-hover:text-crypto-primary transition-colors">
                                    {item.question}
                                </span>
                                <span className={`text-2xl transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''}`}>
                                    {openIndex === index ? '−' : '+'}
                                </span>
                            </button>

                            <div
                                className={`transition-all duration-300 ease-in-out ${openIndex === index ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                                    } overflow-hidden`}
                            >
                                <div className="px-8 pb-8 text-crypto-charcoal/70 leading-relaxed text-lg border-t border-gray-50 pt-4">
                                    {item.answer}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
