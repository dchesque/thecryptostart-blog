'use client'

import React from 'react'
import NewsletterForm from './NewsletterForm'

interface InlineNewsletterProps {
    className?: string
    title?: string
    description?: string
}

/**
 * InlineNewsletter component
 * A stylized newsletter signup box to be embedded within blog post content
 */
export default function InlineNewsletter({
    className = '',
    title = "Don't miss the next move.",
    description = "Join our exclusive list for weekly market analysis and alpha."
}: InlineNewsletterProps) {
    return (
        <div className={`not-prose my-12 p-8 sm:p-10 rounded-[2.5rem] bg-crypto-darker border border-white/10 relative overflow-hidden group shadow-5 ${className}`}>
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-crypto-primary/10 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-crypto-primary/20 transition-all duration-700"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-crypto-ethereum/5 rounded-full -ml-12 -mb-12 blur-2xl"></div>

            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                <div className="flex-1 text-center md:text-left">
                    <div className="inline-flex items-center gap-2 bg-crypto-primary/10 px-3 py-1 rounded-full border border-crypto-primary/20 mb-4">
                        <span className="w-1.5 h-1.5 bg-crypto-primary rounded-full"></span>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-crypto-primary">Insider Access</span>
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3 font-heading leading-tight italic">
                        {title}
                    </h3>
                    <p className="text-white/60 text-sm font-medium leading-relaxed max-w-md">
                        {description}
                    </p>
                </div>

                <div className="w-full md:w-[400px] shrink-0">
                    <NewsletterForm />
                    <p className="mt-4 text-[10px] text-white/30 text-center md:text-left font-medium">
                        🔒 Your privacy is priority. Unsubscribe with one click.
                    </p>
                </div>
            </div>
        </div>
    )
}
