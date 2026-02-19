import React from 'react'
import NewsletterForm from './NewsletterForm'

interface NewsletterCTALargeProps {
    className?: string
}

export default function NewsletterCTALarge({
    className = '',
}: NewsletterCTALargeProps) {
    return (
        <div className={`relative overflow-hidden bg-gradient-to-br from-crypto-darker to-crypto-navy rounded-3xl p-8 md:p-12 text-center text-white ${className}`}>
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-crypto-primary opacity-10 blur-[100px] -mr-32 -mt-32" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-crypto-invest opacity-10 blur-[100px] -ml-32 -mb-32" />

            <div className="relative z-10 max-w-2xl mx-auto">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-bold uppercase tracking-widest text-crypto-primary mb-6">
                    <span className="w-1.5 h-1.5 rounded-full bg-crypto-primary animate-pulse" />
                    Join 50,000+ Readers
                </div>

                <h2 className="text-3xl md:text-4xl lg:text-5xl font-black mb-6 leading-tight">
                    Master the future of <span className="text-crypto-primary">Crypto & Security</span>
                </h2>

                <p className="text-white/70 text-base md:text-lg mb-10 leading-relaxed">
                    Get weekly curated insights on Bitcoin, Ethereum, and DeFi security directly in your inbox. No fluff, just practical education to keep your assets safe.
                </p>

                <div className="max-w-md mx-auto">
                    <NewsletterForm className="bg-white/5 p-2 rounded-xl border border-white/10" />
                </div>

                <p className="mt-6 text-white/40 text-[10px] uppercase tracking-widest font-medium">
                    Protected by AES-256 Encryption • No Spam Ever • One-click Unsubscribe
                </p>
            </div>
        </div>
    )
}
