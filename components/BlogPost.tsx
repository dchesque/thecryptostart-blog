'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeHighlight from 'rehype-highlight'
import Link from 'next/link'
import Image from 'next/image'

interface BlogPostProps {
  content: string
}

export default function BlogPost({ content }: BlogPostProps) {
  if (!content) {
    return <div className="text-gray-400">No content available</div>
  }

  return (
    <article className="prose prose-lg prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSlug, rehypeAutolinkHeadings, rehypeHighlight]}
        components={{
          a: ({ node, href, ...props }) => {
            const linkHref = href || ''
            const className = "text-crypto-primary hover:text-crypto-accent underline transition-colors"

            if (linkHref.startsWith('/')) {
              return <Link href={linkHref} className={className} {...props} />
            }

            return <a href={linkHref} target="_blank" rel="noopener noreferrer" className={className} {...props} />
          },
          img: ({ node, src, alt, ...props }) => (
            <figure className="my-6">
              <div className="relative rounded-lg overflow-hidden w-full aspect-video bg-crypto-darker">
                <Image
                  src={src || ''}
                  alt={alt || 'Image'}
                  fill
                  className="object-cover"
                />
              </div>
              {alt && (
                <figcaption className="text-center text-sm text-gray-500 mt-2 italic">
                  {alt}
                </figcaption>
              )}
            </figure>
          ),
          blockquote: ({ node, ...props }) => (
            <blockquote className="border-l-4 border-crypto-primary pl-4 italic text-gray-400 my-6 bg-crypto-darker p-4 rounded-r" {...props} />
          ),
          code: ({ node, className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || '')
            const isInline = !match && !className?.includes('language-')

            if (isInline) {
              return (
                <code className="bg-crypto-darker px-1.5 py-0.5 rounded text-crypto-primary font-mono text-sm" {...props}>
                  {children}
                </code>
              )
            }

            return (
              <code className={className} {...props}>
                {children}
              </code>
            )
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </article>
  )
}
