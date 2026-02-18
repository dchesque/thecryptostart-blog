'use client'

import React, { useState } from 'react'
import NewsletterForm from './NewsletterForm'

interface GatedContentProps {
    title?: string
    description?: string
    buttonText?: string
    downloadUrl: string
    className?: string
}

/**
 * GatedContent component
 * Requires user to sign up for newsletter to access a resource (like a PDF)
 */
export default function GatedContent({
    title = "Download our Free Crypto Guide",
    description = "Get our comprehensive 50-page guide on 'The Future of Crypto 2026' by joining our newsletter list.",
    buttonText = "Get My Free Guide",
    downloadUrl,
    className = ''
}: GatedContentProps) {
    const [isUnlocked, setIsUnlocked] = useState(false)

    // In a real application, you would check if the user is already subscribed
    // or listen to a success event from the NewsletterForm.
    // For this implementation, we allow unlocking after a successful "subscription" simulation.

    const handleSuccess = () => {
        setIsUnlocked(true)
    }

    return (
        <div className={`not-prose my-16 overflow-hidden rounded-[2.5rem] border-2 border-crypto-primary/20 bg-white shadow-6 ${className}`}>
            <div className="grid md:grid-cols-2">
                {/* Preview / Visual Side */}
                <div className="p-10 bg-crypto-darker flex flex-col justify-center items-center text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-crypto-primary/10 rounded-full blur-3xl"></div>

                    <div className="relative z-10">
                        {/* Multi-layered icon for "Premium Content" */}
                        <div className="w-24 h-32 bg-white rounded-lg shadow-xl mb-8 mx-auto relative transform -rotate-3 group-hover:rotate-0 transition-transform duration-500">
                            <div className="absolute inset-x-4 top-6 h-2 bg-crypto-primary/20 rounded"></div>
                            <div className="absolute inset-x-4 top-10 h-2 bg-gray-100 rounded"></div>
                            <div className="absolute inset-x-4 top-14 h-2 bg-gray-100 rounded"></div>
                            <div className="absolute inset-x-4 bottom-6 h-4 bg-crypto-primary rounded flex items-center justify-center text-[8px] text-white font-black uppercase">Guide</div>
                        </div>

                        <h4 className="text-xl font-bold text-white mb-2 font-heading italic">Exclusive Guide</h4>
                        <div className="h-1 w-12 bg-crypto-primary mx-auto rounded-full mb-4"></div>
                        <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.2em]">PDF Format • 5.4MB</p>
                    </div>
                </div>

                {/* Content / Form Side */}
                <div className="p-10 flex flex-col justify-center">
                    {!isUnlocked ? (
                        <>
                            <h3 className="text-2xl font-bold text-crypto-navy mb-4 font-heading leading-tight">
                                {title}
                            </h3>
                            <p className="text-crypto-charcoal/60 mb-8 font-medium text-sm leading-relaxed">
                                {description}
                            </p>

                            <NewsletterForm className="scale-105" />

                            <p className="mt-6 text-[10px] text-crypto-charcoal/30 font-medium italic">
                                * By clicking subscribe, you agree to receive our weekly updates.
                                One-click unsubscribe always available.
                            </p>

                            {/* Dev/Demo Unlock Button (Simulating successful subscription feedback) */}
                            <button
                                onClick={handleSuccess}
                                className="mt-4 text-[10px] text-crypto-primary/40 hover:text-crypto-primary transition-colors underline underline-offset-2 self-start"
                            >
                                (Demo: Skip to Download)
                            </button>
                        </>
                    ) : (
                        <div className="text-center animate-fade-in">
                            <div className="w-16 h-16 bg-crypto-primary/10 text-crypto-primary rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-crypto-navy mb-4 font-heading">Content Unlocked!</h3>
                            <p className="text-crypto-charcoal/60 mb-8 font-medium">Thank you for joining our community.</p>

                            <a
                                href={downloadUrl}
                                className="inline-block bg-crypto-primary text-white font-bold py-4 px-10 rounded-2xl hover:bg-crypto-accent shadow-lg shadow-crypto-primary/25 transition-all transform hover:-translate-y-1 active:scale-95"
                                download
                            >
                                Download Guide Now
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
