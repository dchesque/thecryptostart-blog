'use client'

import { documentToReactComponents } from '@contentful/rich-text-react-renderer'
import { INLINES, BLOCKS, MARKS } from '@contentful/rich-text-types'
import Link from 'next/link'
import Image from 'next/image'

interface BlogPostProps {
  content: any
}

/**
 * Custom render options for Contentful rich text
 */
const options = {
  renderMark: {
    [MARKS.BOLD]: (text: any) => <strong className="font-bold text-white">{text}</strong>,
    [MARKS.ITALIC]: (text: any) => <em className="italic text-gray-300">{text}</em>,
    [MARKS.UNDERLINE]: (text: any) => <u className="underline">{text}</u>,
    [MARKS.CODE]: (text: any) => (
      <code className="bg-crypto-darker px-1.5 py-0.5 rounded text-crypto-primary font-mono text-sm">
        {text}
      </code>
    ),
  },
  renderNode: {
    [INLINES.HYPERLINK]: (node: any, children: any) => {
      const { uri } = node.data
      return (
        <a
          href={uri}
          target={uri.startsWith('http') ? '_blank' : undefined}
          rel={uri.startsWith('http') ? 'noopener noreferrer' : undefined}
          className="text-crypto-primary hover:text-crypto-accent underline transition-colors"
        >
          {children}
        </a>
      )
    },
    [INLINES.ENTRY_HYPERLINK]: (node: any, children: any) => {
      const { slug } = node.data.target.sys.contentType
      // Handle internal links if needed
      return <Link href="#" className="text-crypto-primary hover:text-crypto-accent underline">{children}</Link>
    },
    [INLINES.ASSET_HYPERLINK]: (node: any, children: any) => {
      const { title, description } = node.data.target.fields
      return <a href="#" className="text-crypto-primary hover:text-crypto-accent underline">{children}</a>
    },
    [BLOCKS.PARAGRAPH]: (node: any, children: any) => {
      const isEmpty = node.content.every((c: any) => c.nodeType === 'text' && !c.value.trim())
      if (isEmpty) return null
      return <p className="text-gray-300 leading-relaxed mb-4">{children}</p>
    },
    [BLOCKS.HEADING_1]: (node: any, children: any) => {
      return <h1 id={children?.toString()?.toLowerCase().replace(/\s+/g, '-')} className="text-4xl font-bold text-white mb-6 mt-8">{children}</h1>
    },
    [BLOCKS.HEADING_2]: (node: any, children: any) => {
      return <h2 id={children?.toString()?.toLowerCase().replace(/\s+/g, '-')} className="text-3xl font-bold text-white mb-4 mt-8">{children}</h2>
    },
    [BLOCKS.HEADING_3]: (node: any, children: any) => {
      return <h3 id={children?.toString()?.toLowerCase().replace(/\s+/g, '-')} className="text-2xl font-semibold text-white mb-3 mt-6">{children}</h3>
    },
    [BLOCKS.HEADING_4]: (node: any, children: any) => {
      return <h4 id={children?.toString()?.toLowerCase().replace(/\s+/g, '-')} className="text-xl font-semibold text-gray-200 mb-2 mt-4">{children}</h4>
    },
    [BLOCKS.HEADING_5]: (node: any, children: any) => {
      return <h5 id={children?.toString()?.toLowerCase().replace(/\s+/g, '-')} className="text-lg font-semibold text-gray-200 mb-2 mt-2">{children}</h5>
    },
    [BLOCKS.HEADING_6]: (node: any, children: any) => {
      return <h6 id={children?.toString()?.toLowerCase().replace(/\s+/g, '-')} className="text-base font-semibold text-gray-300 mb-2 mt-2">{children}</h6>
    },
    [BLOCKS.UL_LIST]: (node: any, children: any) => {
      return <ul className="list-disc list-inside text-gray-300 space-y-2 mb-4 ml-4">{children}</ul>
    },
    [BLOCKS.OL_LIST]: (node: any, children: any) => {
      return <ol className="list-decimal list-inside text-gray-300 space-y-2 mb-4 ml-4">{children}</ol>
    },
    [BLOCKS.LIST_ITEM]: (node: any, children: any) => {
      return <li className="text-gray-300">{children}</li>
    },
    [BLOCKS.QUOTE]: (node: any, children: any) => {
      return (
        <blockquote className="border-l-4 border-crypto-primary pl-4 italic text-gray-400 my-6 bg-crypto-darker p-4 rounded-r">
          {children}
        </blockquote>
      )
    },
    [BLOCKS.HR]: () => {
      return <hr className="border-crypto-primary/20 my-8" />
    },
    [BLOCKS.EMBEDDED_ENTRY]: (node: any) => {
      // Handle embedded entries (like author, related posts, etc.)
      return <div className="my-4 bg-crypto-darker p-4 rounded text-gray-400">Embedded content</div>
    },
    [BLOCKS.EMBEDDED_ASSET]: (node: any) => {
      const { title, description, file } = node.data.target.fields
      const imageUrl = file.url.startsWith('//') ? `https:${file.url}` : file.url

      return (
        <figure className="my-6">
          <div className="relative rounded-lg overflow-hidden">
            <Image
              src={imageUrl}
              alt={description || title || 'Image'}
              width={file.details.image?.width || 800}
              height={file.details.image?.height || 450}
              className="w-full"
            />
          </div>
          {title && (
            <figcaption className="text-center text-sm text-gray-500 mt-2 italic">
              {title}
            </figcaption>
          )}
        </figure>
      )
    },
  },
}

/**
 * Blog Post content renderer
 * Renders Contentful rich text content with custom styling
 */
export default function BlogPost({ content }: BlogPostProps) {
  if (!content) {
    return <div className="text-gray-400">No content available</div>
  }

  return (
    <article className="prose prose-lg prose-invert max-w-none">
      {documentToReactComponents(content, options)}
    </article>
  )
}
