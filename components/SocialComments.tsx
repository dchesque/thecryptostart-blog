'use client'

import React, { useState } from 'react'
import CommentForm from './CommentForm'
import CommentsList from './CommentsList'
import { MessageSquare } from 'lucide-react'

interface SocialCommentsProps {
    slug: string
}

/**
 * SocialComments component
 * Custom internal commenting system with anti-spam
 */
export default function SocialComments({ slug }: SocialCommentsProps) {
    const [refreshKey, setRefreshKey] = useState(0)

    const handleSuccess = () => {
        setRefreshKey(prev => prev + 1)
    }

    return (
        <section id="comments" className="mt-24 pt-20 border-t border-gray-100">
            <div className="flex items-center gap-4 mb-12">
                <div className="w-12 h-12 bg-crypto-primary/10 text-crypto-primary rounded-2xl flex items-center justify-center">
                    <MessageSquare className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="text-2xl md:text-3xl font-black text-crypto-darker tracking-tight italic">Community & Discussion</h3>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Join the secure conversation</p>
                </div>
                <div className="flex-1 h-px bg-gradient-to-r from-gray-100 to-transparent ml-4" />
            </div>

            <div className="max-w-3xl mx-auto space-y-16">
                {/* Top: Form */}
                <div className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-50/50">
                    <h4 className="text-xl font-bold text-crypto-darker mb-8 flex items-center gap-2">
                        Leave your comment
                    </h4>
                    <CommentForm postSlug={slug} onSuccess={handleSuccess} />
                </div>

                {/* Bottom: List */}
                <div className="pt-8 border-t border-gray-50">
                    <CommentsList postSlug={slug} refreshKey={refreshKey} />
                </div>
            </div>
        </section>
    )
}

