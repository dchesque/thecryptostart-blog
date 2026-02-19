'use client'

import React from 'react'

interface ShareButtonsProps {
    title: string
    url: string
    direction?: 'horizontal' | 'vertical'
}

/**
 * ShareButtons component
 * Handles social sharing interactivity
 */
const ShareButtons: React.FC<ShareButtonsProps> = ({ title, url, direction = 'horizontal' }) => {
    const encodedTitle = encodeURIComponent(title)
    const encodedUrl = encodeURIComponent(url)

    const copyToClipboard = () => {
        if (typeof navigator !== 'undefined' && navigator.clipboard) {
            navigator.clipboard.writeText(url)
                .then(() => {
                    // Using a more modern notification would be better, but alert works for now
                    alert('Link copied to clipboard!')
                })
                .catch(err => {
                    console.error('Erro ao copiar link:', err)
                })
        }
    }

    return (
        <div className={`flex ${direction === 'vertical' ? 'flex-col' : 'flex-row'} gap-3`}>
            {/* Twitter */}
            <a
                href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 flex items-center justify-center bg-white shadow-1 rounded-2xl text-[#1DA1F2] hover:bg-[#1DA1F2] hover:text-white transition-all transform hover:-translate-y-1"
                aria-label="Share on Twitter"
            >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
            </a>

            {/* LinkedIn */}
            <a
                href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 flex items-center justify-center bg-white shadow-1 rounded-2xl text-[#0A66C2] hover:bg-[#0A66C2] hover:text-white transition-all transform hover:-translate-y-1"
                aria-label="Share on LinkedIn"
            >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
            </a>

            {/* Copy Link */}
            <button
                onClick={copyToClipboard}
                className="w-12 h-12 flex items-center justify-center bg-white shadow-1 rounded-2xl text-crypto-navy hover:bg-crypto-primary hover:text-white transition-all transform hover:-translate-y-1"
                aria-label="Copy link"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
            </button>
        </div>
    )
}

export default ShareButtons
