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
        <div className={`space-y-3 ${className}`}>
            {faqs.map((faq, index) => (
                <div
                    key={index}
                    className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:border-crypto-primary/30 transition-colors"
                >
                    <button
                        onClick={() => toggle(index)}
                        className="w-full flex items-center justify-between p-5 text-left transition-colors"
                        aria-expanded={openIndex === index}
                    >
                        <span className="font-bold text-gray-800 text-base md:text-lg leading-tight">
                            {faq.question}
                        </span>
                        <ChevronDown
                            className={`w-5 h-5 text-crypto-primary transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''}`}
                        />
                    </button>

                    <div
                        className={`transition-all duration-300 ease-in-out ${openIndex === index ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}
                    >
                        <div className="p-5 pt-0 text-gray-600 text-sm md:text-base leading-relaxed border-t border-gray-50 bg-gray-50/30">
                            {faq.answer}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}
