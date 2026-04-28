import FAQAccordion from './FAQAccordion'

interface FAQItem {
  question: string
  answer: string
}

interface FAQProps {
  items?: FAQItem[]
  title?: string
  className?: string
}

const DEFAULT_ITEMS: FAQItem[] = [
  {
    question: 'What is cryptocurrency?',
    answer:
      'Cryptocurrencies are digital assets secured by cryptography and recorded on a blockchain. Unlike traditional money, they are decentralised — no central bank or government controls them.',
  },
  {
    question: 'How do I invest in Bitcoin safely?',
    answer:
      'Use a reputable, regulated exchange, enable two-factor authentication, and for meaningful holdings move funds to a hardware wallet. Never share your recovery phrase with anyone.',
  },
  {
    question: 'How do I avoid crypto scams?',
    answer:
      'Treat any “guaranteed return” as a red flag. Never share recovery phrases, double-check website URLs before connecting your wallet, and prefer well-known projects over anonymous ones.',
  },
  {
    question: 'Is crypto secure?',
    answer:
      'The technology behind major networks like Bitcoin is robust. Most losses come from user mistakes — phishing, lost seed phrases, careless custody. Self-custody hygiene matters more than picking the “right” coin.',
  },
  {
    question: 'What is DeFi?',
    answer:
      'DeFi (decentralised finance) is a set of blockchain-based services — lending, swaps, savings — that work without traditional intermediaries. It’s powerful but rewards careful, well-informed users.',
  },
]

/**
 * Standalone FAQ section block, with embedded JSON-LD schema. Use this when
 * you want a self-contained FAQ band on a marketing page; for article-level
 * FAQs (driven by post data), use FAQSection instead.
 */
export default function FAQ({
  items = DEFAULT_ITEMS,
  title = 'Frequently asked questions',
  className = '',
}: FAQProps) {
  const schemaMarkup = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  }

  return (
    <section className={`section-tight ${className}`}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
      />
      <div className="container-hub">
        <div className="max-w-2xl mb-10">
          <span className="eyebrow">FAQ</span>
          <h2 className="mt-2 section-title">{title}</h2>
        </div>
        <FAQAccordion faqs={items} />
      </div>
    </section>
  )
}
