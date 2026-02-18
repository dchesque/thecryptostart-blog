'use client'

import React, { useEffect, useState } from 'react'

interface SocialCommentsProps {
    slug: string
}

/**
 * SocialComments component
 * Integrates Giscus for post discussions
 */
export default function SocialComments({ slug }: SocialCommentsProps) {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return <div className="min-h-[200px] flex items-center justify-center bg-gray-50 rounded-[2.5rem] mt-20 animate-pulse text-crypto-charcoal/30">Loading comments...</div>

    return (
        <section className="mt-20 pt-20 border-t border-crypto-light">
            <div className="flex items-center gap-3 mb-10">
                <h3 className="text-2xl font-bold text-crypto-navy font-heading italic">Join the Discussion</h3>
                <div className="flex-1 h-px bg-crypto-light" />
            </div>

            <div className="min-h-[200px]">
                {/* Giscus Integration */}
                <script
                    src="https://giscus.app/client.js"
                    data-repo="[REPLACE_WITH_YOUR_REPO]"
                    data-repo-id="[REPLACE_WITH_YOUR_REPO_ID]"
                    data-category="Announcements"
                    data-category-id="[REPLACE_WITH_YOUR_CATEGORY_ID]"
                    data-mapping="pathname"
                    data-strict="0"
                    data-reactions-enabled="1"
                    data-emit-metadata="0"
                    data-input-position="top"
                    data-theme="light_high_contrast"
                    data-lang="en"
                    data-loading="lazy"
                    crossOrigin="anonymous"
                    async
                ></script>

                {/* Fallback if Giscus Repo is not set */}
                <div className="p-10 text-center bg-crypto-light rounded-[2.5rem] border border-crypto-light/50">
                    <p className="text-crypto-navy font-bold text-lg mb-2">Discussion is currently disabled.</p>
                    <p className="text-crypto-charcoal/50 text-sm">Please configure your Giscus repository in <code>SocialComments.tsx</code> to enable comments.</p>
                </div>
            </div>
        </section>
    )
}
