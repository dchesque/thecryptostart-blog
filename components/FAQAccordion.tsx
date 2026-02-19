'use client'

import React, { useState } from 'react'
import { ChevronDown } from 'lucide-react'

interface FAQItem {
    question: string
    answer: string
}

interface FAQAccordionProps {
    faqs: FAQItem[]
    className?: string
}

export default function FAQAccordion({
    faqs,
    className = '',
}: FAQAccordionProps) {
    const [openIndex, setOpenIndex] = useState<number | null>(0)

    const toggle = (index: number) => {
        setOpenIndex(openIndex === index ? null : index)
    }

    return (
        <div className={`space-y-4 ${className}`}>
            {faqs.map((faq, index) => (
                <div
                    key={index}
                    className={`group border transition-all duration-300 rounded-2xl overflow-hidden ${openIndex === index
                            ? 'border-crypto-primary/30 bg-white shadow-xl shadow-crypto-primary/5'
                            : 'border-gray-100 bg-gray-50/30 hover:bg-white hover:border-gray-200 shadow-sm'
                        }`}
                >
                    <button
                        onClick={() => toggle(index)}
                        className="w-full flex items-center justify-between p-5 md:p-6 text-left transition-colors"
                        aria-expanded={openIndex === index}
                    >
                        <span className={`font-bold text-gray-800 text-base md:text-lg leading-tight transition-colors ${openIndex === index ? 'text-crypto-primary' : 'text-gray-700'}`}>
                            {faq.question}
                        </span>
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${openIndex === index ? 'bg-crypto-primary text-white rotate-180' : 'bg-gray-100 text-gray-400'}`}>
                            <ChevronDown className="w-4 h-4" />
                        </div>
                    </button>

                    <div
                        className={`transition-all duration-500 ease-in-out ${openIndex === index
                                ? 'max-h-[1000px] opacity-100'
                                : 'max-h-0 opacity-0'
                            }`}
                        style={{ overflow: 'hidden' }}
                    >
                        <div className="px-5 md:px-6 pb-6 text-gray-600 text-sm md:text-base leading-relaxed">
                            <div className="pt-4 border-t border-gray-100/50">
                                {faq.answer}
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

