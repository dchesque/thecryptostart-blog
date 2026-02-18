'use client'

import React, { useEffect, useState } from 'react'
import NewsletterForm from './NewsletterForm'

/**
 * ExitIntentPopup component
 * Displays a modal when the user intends to leave the page
 * (detected by mouse leaving the viewport from the top)
 */
export default function ExitIntentPopup() {
    const [isOpen, setIsOpen] = useState(false)
    const [hasDismissed, setHasDismissed] = useState(false)

    useEffect(() => {
        // Check if user already saw the popup in this session
        const shown = sessionStorage.getItem('exit_intent_shown')
        if (shown) {
            setHasDismissed(true)
            return
        }

        const handleMouseOut = (e: MouseEvent) => {
            // e.clientY < 10 typically means mouse moved to the top of the browser 
            // where the tabs and address bar are located
            if (e.clientY < 10 && !hasDismissed && !isOpen) {
                setIsOpen(true)
                sessionStorage.setItem('exit_intent_shown', 'true')
            }
        }

        document.addEventListener('mouseout', handleMouseOut)
        return () => document.removeEventListener('mouseout', handleMouseOut)
    }, [hasDismissed, isOpen])

    const closePopup = () => {
        setIsOpen(false)
        setHasDismissed(true)
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-crypto-darker/90 backdrop-blur-sm animate-fade-in"
                onClick={closePopup}
            ></div>

            {/* Modal */}
            <div className="relative w-full max-w-2xl bg-white rounded-[2.5rem] overflow-hidden shadow-6 animate-slide-up">
                {/* Close button */}
                <button
                    onClick={closePopup}
                    className="absolute top-6 right-8 text-crypto-charcoal/30 hover:text-crypto-primary transition-colors text-xl font-bold z-20"
                    aria-label="Close"
                >
                    ✕
                </button>

                <div className="grid md:grid-cols-2">
                    {/* Visual Side */}
                    <div className="hidden md:flex flex-col justify-center p-12 bg-crypto-primary text-white relative overflow-hidden">
                        <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
                        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>

                        <div className="relative z-10">
                            <span className="text-white/70 font-bold uppercase tracking-widest text-[10px] mb-4 block">Exclusive Gift</span>
                            <h2 className="text-4xl font-bold font-heading mb-6 italic leading-tight">
                                Wait! Before you leave...
                            </h2>
                            <p className="text-white/80 font-medium text-lg leading-relaxed">
                                Download our <span className="text-white font-bold underline decoration-white/30 decoration-2 underline-offset-4">"The Crypto 2026 Checklist"</span> for free.
                            </p>
                        </div>
                    </div>

                    {/* Form Side */}
                    <div className="p-8 sm:p-12 flex flex-col justify-center bg-white">
                        <h3 className="text-2xl font-bold text-crypto-navy mb-4 font-heading md:hidden italic">
                            Wait! Free Gift Inside.
                        </h3>
                        <p className="text-crypto-charcoal/60 mb-8 font-medium text-sm leading-relaxed">
                            Sign up for our newsletter and get the exclusive roadmap delivered to your inbox instantly.
                        </p>

                        <NewsletterForm className="scale-105" />

                        <p className="mt-6 text-[10px] text-crypto-charcoal/30 font-medium text-center">
                            Join 25,000+ crypto enthusiasts. 100% Privacy guaranteed.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
