'use client'

import FAQAccordion from './FAQAccordion'

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
 * Article FAQ section. Generated/curated questions about the topic, paired
 * with an accordion. Schema markup is emitted by the page-level JSON-LD.
 */
export default function FAQSection({
  items,
  title = 'Frequently asked questions',
  className = '',
}: FAQSectionProps) {
  if (!items || items.length === 0) return null

  return (
    <section className={`not-prose ${className}`}>
      <div className="flex items-end justify-between gap-4 mb-6">
        <h2 className="font-heading text-2xl md:text-[1.625rem] font-bold text-ink tracking-tight">
          {title}
        </h2>
      </div>
      <FAQAccordion faqs={items} />
    </section>
  )
}
