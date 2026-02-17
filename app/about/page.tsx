import { SITE_CONFIG } from '@/lib/constants'

export default function AboutPage() {
  return (
    <div className="py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-white mb-8">About {SITE_CONFIG.name}</h1>

        <div className="prose prose-invert prose-lg max-w-none">
          <p className="text-xl text-gray-300 mb-6">
            Welcome to {SITE_CONFIG.name} — your gateway to understanding cryptocurrency, blockchain, and Web3 technology.
          </p>

          <h2 className="text-3xl font-bold text-white mt-8 mb-4">Our Mission</h2>
          <p className="text-gray-300 mb-6">
            We believe that cryptocurrency and blockchain technology should be accessible to everyone. Our mission is to provide clear, beginner-friendly educational content that helps you navigate the complex world of digital assets.
          </p>

          <h2 className="text-3xl font-bold text-white mt-8 mb-4">What You'll Find Here</h2>
          <ul className="list-disc list-inside text-gray-300 space-y-2 mb-6">
            <li>Comprehensive guides on Bitcoin, Ethereum, and other cryptocurrencies</li>
            <li>Easy-to-understand explanations of blockchain technology</li>
            <li>DeFi (Decentralized Finance) tutorials and insights</li>
            <li>NFT (Non-Fungible Token) guides</li>
            <li>Web3 development resources</li>
            <li>Security best practices for protecting your digital assets</li>
            <li>Trading strategies and market analysis</li>
          </ul>

          <h2 className="text-3xl font-bold text-white mt-8 mb-4">Our Approach</h2>
          <p className="text-gray-300 mb-6">
            We break down complex concepts into digestible pieces. Whether you're a complete beginner or looking to deepen your understanding, our content is designed to meet you where you are and help you grow your knowledge step by step.
          </p>

          <h2 className="text-3xl font-bold text-white mt-8 mb-4">Get In Touch</h2>
          <p className="text-gray-300 mb-6">
            Have questions or suggestions? We'd love to hear from you. Reach out to us at{' '}
            <a href={`mailto:${SITE_CONFIG.email}`} className="text-crypto-primary hover:text-crypto-accent">
              {SITE_CONFIG.email}
            </a>
            {' '}or follow us on Twitter for daily insights and updates.
          </p>
        </div>
      </div>
    </div>
  )
}
