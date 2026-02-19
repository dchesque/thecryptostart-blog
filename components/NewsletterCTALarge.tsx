import React from 'react'
import NewsletterForm from './NewsletterForm'

interface NewsletterCTALargeProps {
    className?: string
}

export default function NewsletterCTALarge({
    className = '',
}: NewsletterCTALargeProps) {
    return (
        <div className={`relative overflow-hidden bg-[#0A0B14] rounded-[2.5rem] p-8 md:p-16 lg:p-20 text-center text-white shadow-2xl ${className}`}>
            {/* Background Decor - High Contrast Gradients */}
            <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[60%] bg-crypto-primary opacity-20 blur-[120px] rounded-full animate-pulse" />
            <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[60%] bg-blue-600 opacity-15 blur-[120px] rounded-full" />

            {/* Mesh Pattern Overlay */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4v-4H4v4H0v2h4v4h2v-4h4v-2H6zM36 4v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }} />

            <div className="relative z-10 max-w-3xl mx-auto">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-crypto-primary mb-8 border border-white/10 shadow-inner">
                    <span className="w-2 h-2 rounded-full bg-crypto-primary shadow-[0_0_8px_rgba(37,99,235,0.8)] animate-pulse" />
                    Trusted by 50,000+ Investors
                </div>

                <h2 className="text-3xl md:text-5xl lg:text-6xl font-black mb-8 leading-[1.1] tracking-tight text-white">
                    Secure your <span className="text-transparent bg-clip-text bg-gradient-to-r from-crypto-primary to-cyan-400">Financial Future</span>
                </h2>

                <p className="text-white/90 text-base md:text-xl mb-12 leading-relaxed max-w-2xl mx-auto font-medium">
                    The only newsletter that combines deep on-chain analysis with practical security guides. Stay ahead of the curve and keep your keys safe.
                </p>

                <div className="max-w-md mx-auto relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-crypto-primary/50 to-blue-500/50 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                    <NewsletterForm className="relative bg-white/5 backdrop-blur-xl p-3 rounded-2xl border border-white/10 shadow-2xl" />
                </div>

                <div className="mt-10 flex flex-wrap justify-center gap-6 text-[9px] md:text-[10px] uppercase tracking-widest font-bold text-white/50">
                    <span className="flex items-center gap-2">🛡️ AES-256 Protected</span>
                    <span className="flex items-center gap-2">🚫 Zero Spam Policy</span>
                    <span className="flex items-center gap-2">⚡ Instant Delivery</span>
                </div>
            </div>
        </div>
    )
}

