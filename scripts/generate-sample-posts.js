#!/usr/bin/env node

/**
 * Script: generate-sample-posts.js
 * Gera 10 posts de exemplo para o Crypto Academy Blog
 */

const samplePosts = [
  {
    id: '1',
    title: 'Bitcoin 101: The Complete Beginner\'s Guide',
    slug: 'bitcoin-101-complete-beginners-guide',
    description: 'Learn everything you need to know about Bitcoin, from its origins to how you can start investing today.',
    category: 'bitcoin',
    publishedAt: '2026-02-01T10:00:00Z',
    author: {
      name: 'Crypto Academy',
      image: null,
    },
    featuredImage: null,
    readingTime: 8,
    tags: ['bitcoin', 'beginner', 'guide'],
    content: {
      nodeType: 'document',
      data: {},
      content: [
        {
          nodeType: 'heading-2',
          content: [{ nodeType: 'text', value: 'What is Bitcoin?' }],
        },
        {
          nodeType: 'paragraph',
          content: [
            {
              nodeType: 'text',
              value: 'Bitcoin is the world\'s first decentralized digital currency, created in 2009 by an unknown person using the name Satoshi Nakamoto.',
            },
          ],
        },
        {
          nodeType: 'heading-2',
          content: [{ nodeType: 'text', value: 'How Does Bitcoin Work?' }],
        },
        {
          nodeType: 'paragraph',
          content: [
            {
              nodeType: 'text',
              value: 'Bitcoin uses a technology called blockchain, which is a distributed ledger enforced by a disparate network of computers.',
            },
          ],
        },
      ],
    },
  },
  {
    id: '2',
    title: 'Ethereum Explained: More Than Just Digital Money',
    slug: 'ethereum-explained-more-than-just-digital-money',
    description: 'Discover Ethereum, the blockchain platform that enables smart contracts and decentralized applications.',
    category: 'ethereum',
    publishedAt: '2026-02-02T14:30:00Z',
    author: { name: 'Crypto Academy', image: null },
    featuredImage: null,
    readingTime: 10,
    tags: ['ethereum', 'smart-contracts', 'defi'],
    content: { nodeType: 'document', data: {}, content: [] },
  },
  {
    id: '3',
    title: 'DeFi Revolution: Banking Without Banks',
    slug: 'defi-revolution-banking-without-banks',
    description: 'Decentralized Finance is reshaping the financial world. Learn how DeFi protocols work.',
    category: 'defi',
    publishedAt: '2026-02-03T09:15:00Z',
    author: { name: 'Crypto Academy', image: null },
    featuredImage: null,
    readingTime: 7,
    tags: ['defi', 'lending', 'yield'],
    content: { nodeType: 'document', data: {}, content: [] },
  },
  {
    id: '4',
    title: 'NFTs: Digital Ownership in the Web3 Era',
    slug: 'nfts-digital-ownership-web3-era',
    description: 'Non-Fungible Tokens have taken the world by storm. Understand what makes NFTs unique and valuable.',
    category: 'nfts',
    publishedAt: '2026-02-04T16:45:00Z',
    author: { name: 'Crypto Academy', image: null },
    featuredImage: null,
    readingTime: 6,
    tags: ['nfts', 'collectibles', 'art'],
    content: { nodeType: 'document', data: {}, content: [] },
  },
  {
    id: '5',
    title: 'Crypto Trading Strategies for Beginners',
    slug: 'crypto-trading-strategies-beginners',
    description: 'Start trading cryptocurrency with confidence. Learn essential strategies and risk management.',
    category: 'trading',
    publishedAt: '2026-02-05T11:20:00Z',
    author: { name: 'Crypto Academy', image: null },
    featuredImage: null,
    readingTime: 9,
    tags: ['trading', 'technical-analysis', 'risk-management'],
    content: { nodeType: 'document', data: {}, content: [] },
  },
  {
    id: '6',
    title: 'Securing Your Crypto: Best Practices',
    slug: 'securing-your-crypto-best-practices',
    description: 'Protect your digital assets with these essential security practices for cryptocurrency holders.',
    category: 'security',
    publishedAt: '2026-02-06T13:00:00Z',
    author: { name: 'Crypto Academy', image: null },
    featuredImage: null,
    readingTime: 5,
    tags: ['security', 'wallet', 'best-practices'],
    content: { nodeType: 'document', data: {}, content: [] },
  },
  {
    id: '7',
    title: 'Bitcoin vs Ethereum: Which Should You Buy?',
    slug: 'bitcoin-vs-ethereum-which-should-you-buy',
    description: 'A detailed comparison between the two biggest cryptocurrencies to help you make an informed decision.',
    category: 'bitcoin',
    publishedAt: '2026-02-07T10:30:00Z',
    author: { name: 'Crypto Academy', image: null },
    featuredImage: null,
    readingTime: 8,
    tags: ['bitcoin', 'ethereum', 'comparison'],
    content: { nodeType: 'document', data: {}, content: [] },
  },
  {
    id: '8',
    title: 'Understanding Crypto Wallets: Hot vs Cold',
    slug: 'understanding-crypto-wallets-hot-vs-cold',
    description: 'Learn the difference between hot and cold wallets, and which option suits your needs.',
    category: 'security',
    publishedAt: '2026-02-08T15:00:00Z',
    author: { name: 'Crypto Academy', image: null },
    featuredImage: null,
    readingTime: 6,
    tags: ['wallet', 'hardware', 'storage'],
    content: { nodeType: 'document', data: {}, content: [] },
  },
  {
    id: '9',
    title: 'Yield Farming 101: Earn Passive Income',
    slug: 'yield-farming-101-earn-passive-income',
    description: 'Discover how yield farming works and start earning passive income with your crypto assets.',
    category: 'defi',
    publishedAt: '2026-02-09T12:00:00Z',
    author: { name: 'Crypto Academy', image: null },
    featuredImage: null,
    readingTime: 11,
    tags: ['defi', 'yield-farming', 'passive-income'],
    content: { nodeType: 'document', data: {}, content: [] },
  },
  {
    id: '10',
    title: 'Web3: The Future of the Internet',
    slug: 'web3-future-of-internet',
    description: 'Explore the decentralized web and how Web3 technologies are reshaping online experiences.',
    category: 'ethereum',
    publishedAt: '2026-02-10T14:00:00Z',
    author: { name: 'Crypto Academy', image: null },
    featuredImage: null,
    readingTime: 7,
    tags: ['web3', 'ethereum', 'future-tech'],
    content: { nodeType: 'document', data: {}, content: [] },
  },
]

console.log('✅ Generated 10 sample posts')
console.log('\n📝 Posts:')
samplePosts.forEach((post, i) => {
  console.log(`  ${i + 1}. ${post.title}`)
  console.log(`     Category: ${post.category} | ${post.readingTime} min read`)
})

process.exit(0)
