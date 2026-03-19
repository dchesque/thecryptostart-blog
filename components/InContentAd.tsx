'use client'

import AdSense from './AdSense'

interface InContentAdProps {
  slot: string
  className?: string
}

export default function InContentAd({ slot, className = '' }: InContentAdProps) {
  return (
    <div className={`not-prose my-10 flex flex-col items-center justify-center ${className}`}>
      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
        Advertisement
      </span>
      <div className="w-full rounded-xl overflow-hidden bg-gray-50 min-h-[120px] flex items-center justify-center border border-gray-100">
        <AdSense slot={slot as any} />
      </div>
    </div>
  )
}
