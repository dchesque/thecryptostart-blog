'use client'

import React, { useState } from 'react'
import { Plus, Minus } from 'lucide-react'

interface FAQItem {
  question: string
  answer: string
}

interface FAQAccordionProps {
  faqs: FAQItem[]
  className?: string
}

export default function FAQAccordion({ faqs, className = '' }: FAQAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <div className={`divide-y divide-line border-t border-b border-line ${className}`}>
      {faqs.map((faq, index) => {
        const open = openIndex === index
        return (
          <div key={index}>
            <button
              type="button"
              onClick={() => toggle(index)}
              aria-expanded={open}
              className="w-full py-6 flex items-start justify-between gap-6 text-left group"
            >
              <span className="font-heading text-lg md:text-xl font-semibold text-ink leading-snug group-hover:text-accent-deep transition-colors">
                {faq.question}
              </span>
              <span
                className={`shrink-0 w-8 h-8 rounded-full border border-line flex items-center justify-center transition-colors ${open ? 'bg-ink text-paper border-ink' : 'bg-paper text-ink-mute group-hover:border-ink/30'}`}
                aria-hidden
              >
                {open ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              </span>
            </button>
            <div
              className={`grid transition-[grid-template-rows] duration-300 ease-out ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
            >
              <div className="overflow-hidden">
                <p className="pb-6 text-ink-soft text-base leading-relaxed max-w-prose">
                  {faq.answer}
                </p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
