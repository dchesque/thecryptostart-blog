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
    return <div className="text-ink-mute italic">No content available.</div>
  }

  return (
    <article className="prose prose-lg max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSlug, rehypeAutolinkHeadings, rehypeHighlight]}
        components={{
          a: ({ node, href, ...props }) => {
            const linkHref = href || ''
            if (linkHref.startsWith('/')) {
              return <Link href={linkHref} {...props} />
            }
            return <a href={linkHref} target="_blank" rel="noopener noreferrer" {...props} />
          },
          img: ({ node, src, alt }) => (
            <figure className="my-8">
              <div className="relative rounded-xl overflow-hidden w-full aspect-video bg-cream">
                <Image
                  src={src || ''}
                  alt={alt || 'Image'}
                  fill
                  className="object-cover"
                />
              </div>
              {alt && (
                <figcaption className="text-center text-sm text-ink-mute mt-3 italic">
                  {alt}
                </figcaption>
              )}
            </figure>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </article>
  )
}
