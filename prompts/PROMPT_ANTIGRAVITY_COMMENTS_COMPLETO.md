# PROMPT ANTIGRAVITY — SISTEMA DE COMENTÁRIOS COM ANTI-SPAM
## TheCryptoStart Blog — Comentários Gerenciados por Admin com Proteção Anti-Spam Robusta

---

## 1️⃣ VISÃO GERAL

### Objetivo Principal
Implementar um sistema completo de comentários para o blog com:
- ✅ Usuários podem comentar (email + nome + conteúdo)
- ✅ Admin gerencia comentários (approve/reject/delete)
- ✅ Anti-spam em 5 camadas (honeypot, rate limit, email validation, keywords, IP tracking)
- ✅ SocialComments component integrado
- ✅ Admin dashboard funcional
- ✅ Database (Prisma) com modelos Comment e SpamLog

### Problema que Resolve
```
ANTES:
❌ SocialComments renderiza Giscus (quebrado)
❌ Sem sistema de comentários do próprio blog
❌ Sem anti-spam
❌ Sem admin moderation

DEPOIS:
✅ Comentários funcionam (form + list)
✅ Anti-spam em 5 camadas
✅ Admin dashboard ativo
✅ SocialComments integrado
✅ Database ready
```

### Escopo
- ✅ Atualizar Prisma schema (Comment + SpamLog)
- ✅ Criar API: POST/GET comentários
- ✅ Criar API: Admin GET/PATCH/DELETE
- ✅ Criar componentes: CommentForm, CommentsList
- ✅ Atualizar SocialComments
- ✅ Criar admin dashboard
- ✅ Implementar spam prevention (5 layers)
- ✅ Testar tudo

---

## 2️⃣ ANÁLISE DE CONTEXTO

### Stack Existente
```
✅ Next.js 14+ App Router
✅ TypeScript
✅ Tailwind CSS
✅ Prisma ORM + PostgreSQL
✅ Contentful CMS
✅ NextAuth.js v5 (pode ser usado para admin auth)
```

### Banco de Dados Atual
- User model (exists with roles)
- Post model (Contentful)
- SpamLog model (NOVO)
- Comment model (NOVO)

### Componentes Existentes
```
✅ SocialComments.tsx (ATUALIZAR - remover Giscus)
✅ NewsletterForm.tsx (referência para form pattern)
✅ AuthorCard.tsx (referência para styling)
```

---

## 3️⃣ PLANO DE IMPLEMENTAÇÃO (14 TAREFAS)

### BLOCO 1: DATABASE (Tarefas 1-2)

#### Tarefa 1: Atualizar prisma/schema.prisma - Comment Model
**Arquivo**: `prisma/schema.prisma`

**Código esperado**:
```prisma
model Comment {
  id            String    @id @default(cuid())
  postSlug      String
  authorName    String
  authorEmail   String
  content       String    @db.Text
  status        String    @default("pending") // pending, approved, rejected, spam
  spamScore     Float     @default(0) // 0-1
  ipAddress     String?
  userAgent     String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  modifiedBy    String?   // admin user ID
  modifiedAt    DateTime?
  
  // Relations
  replies       Comment[] @relation("CommentReplies")
  parentId      String?
  parent        Comment?  @relation("CommentReplies", fields: [parentId], references: [id], onDelete: Cascade)

  @@index([postSlug])
  @@index([status])
  @@index([authorEmail])
  @@index([createdAt])
}
```

**Localização**: Adicionar após User model em `prisma/schema.prisma` (~line 50-100)

---

#### Tarefa 2: Atualizar prisma/schema.prisma - SpamLog Model
**Arquivo**: `prisma/schema.prisma`

**Código esperado**:
```prisma
model SpamLog {
  id            String    @id @default(cuid())
  authorEmail   String
  ipAddress     String?
  reason        String    // "rate_limit", "honeypot", "invalid_email", "spam_keywords", "excessive_links"
  severity      String    @default("low") // low, medium, high, critical
  content       String?   @db.Text // armazenar conteúdo suspeito
  createdAt     DateTime  @default(now())

  @@index([authorEmail])
  @@index([ipAddress])
  @@index([createdAt])
}
```

**Localização**: Adicionar após Comment model

---

### BLOCO 2: SPAM PREVENTION (Tarefas 3-4)

#### Tarefa 3: Criar lib/spam-prevention.ts
**Arquivo**: `lib/spam-prevention.ts` (NOVO)

**O que fazer**:
- Email validation regex
- IP extraction from request
- Rate limiting check (5 comments per hour per IP)
- Spam keyword detection
- Excessive content check (links, caps, punctuation)

**Código esperado**:
```typescript
import { prisma } from '@/lib/prisma'
import { NextRequest } from 'next/server'

const RATE_LIMIT_WINDOW = 60 * 60 * 1000 // 1 hour
const MAX_COMMENTS_PER_HOUR = 5
const MIN_COMMENT_LENGTH = 5
const MAX_COMMENT_LENGTH = 2000

// Spam keywords (common spam patterns)
const SPAM_KEYWORDS = [
  'viagra', 'cialis', 'casino', 'poker', 'betting', 'lottery', 'forex',
  'quick money', 'bitcoin mining', 'click here', 'buy now', 'limited offer',
  'act now', 'call now', 'free money', 'get rich', 'work from home',
  'amazing offer', 'incredible deal', 'guaranteed', 'make $', 'earn $',
]

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateEmail(email: string): boolean {
  return EMAIL_REGEX.test(email) && email.length < 255
}

export function getClientIP(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    request.headers.get('x-real-ip') ||
    request.headers.get('cf-connecting-ip') ||
    'unknown'
  )
}

export async function checkRateLimit(
  ipAddress: string,
  email: string
): Promise<boolean> {
  try {
    const oneHourAgo = new Date(Date.now() - RATE_LIMIT_WINDOW)

    const recentCount = await prisma.comment.count({
      where: {
        OR: [
          { ipAddress, createdAt: { gte: oneHourAgo } },
          { authorEmail: email, createdAt: { gte: oneHourAgo } },
        ],
      },
    })

    return recentCount >= MAX_COMMENTS_PER_HOUR
  } catch (error) {
    console.error('Rate limit check error:', error)
    return false
  }
}

export function detectSpam(content: string, email: string): number {
  let score = 0
  const lowerContent = content.toLowerCase()

  // 1. Check length
  if (content.length < MIN_COMMENT_LENGTH) score += 0.5
  if (content.length > MAX_COMMENT_LENGTH) score += 0.3

  // 2. Check for spam keywords
  SPAM_KEYWORDS.forEach(keyword => {
    if (lowerContent.includes(keyword)) score += 0.15
  })

  // 3. Check for excessive links
  const linkCount = (content.match(/https?:\/\//g) || []).length
  if (linkCount > 2) score += 0.3
  if (linkCount > 5) score += 0.4

  // 4. Check for excessive caps (more than 30% caps)
  const capsCount = (content.match(/[A-Z]/g) || []).length
  const capsRatio = capsCount / content.length
  if (capsRatio > 0.3) score += 0.15
  if (capsRatio > 0.5) score += 0.25

  // 5. Check for excessive punctuation
  const exclamationCount = (content.match(/!/g) || []).length
  if (exclamationCount > 3) score += 0.1
  if (exclamationCount > 10) score += 0.3

  const questionCount = (content.match(/\?/g) || []).length
  if (questionCount > 5) score += 0.1

  // 6. Check for multiple consecutive spaces
  if (/\s{2,}/.test(content)) score += 0.1

  // 7. Check for repetitive characters
  if (/(.)\1{4,}/.test(content)) score += 0.2

  // 8. Email red flags (suspicious patterns)
  if (email.includes('+')) score += 0.05 // disposable email pattern
  if (email.includes('@test') || email.includes('@fake')) score += 0.4

  // 9. Content is just URLs/numbers/gibberish
  const wordCount = content.split(/\s+/).length
  const urlWords = (content.match(/https?:\/\/\S+/g) || []).length
  if (wordCount < 5 && urlWords > 2) score += 0.3

  return Math.min(score, 1) // Cap at 1.0
}

export async function logSpam(
  email: string,
  ipAddress: string | null,
  reason: string,
  severity: string = 'low',
  content?: string
) {
  try {
    await prisma.spamLog.create({
      data: {
        authorEmail: email,
        ipAddress: ipAddress || undefined,
        reason,
        severity,
        content,
      },
    })
  } catch (error) {
    console.error('Error logging spam:', error)
  }
}
```

**Localização**: Criar novo arquivo `lib/spam-prevention.ts`

---

#### Tarefa 4: Atualizar lib/prisma.ts (se necessário)
**Arquivo**: `lib/prisma.ts`

**O que fazer**:
- Verificar que Prisma client está exportado corretamente
- Se não existe, criar com singleton pattern

**Código esperado**:
```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

---

### BLOCO 3: API COMENTÁRIOS (Tarefas 5-7)

#### Tarefa 5: Criar app/api/comments/route.ts
**Arquivo**: `app/api/comments/route.ts` (NOVO)

**O que fazer**:
- POST: Submit comment (com validações)
- GET: List approved comments by postSlug

**Código esperado**:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  validateEmail,
  getClientIP,
  checkRateLimit,
  detectSpam,
  logSpam,
} from '@/lib/spam-prevention'

const HONEYPOT_FIELD = 'website'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { postSlug, authorName, authorEmail, content, website } = body

    // 1. Validate required fields
    if (!postSlug || !authorName || !authorEmail || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const clientIP = getClientIP(request)

    // 2. Honeypot check (if filled, it's a bot)
    if (website && website.trim() !== '') {
      await logSpam(authorEmail, clientIP, 'honeypot', 'high')
      // Return success but don't save (trick bots)
      return NextResponse.json(
        { message: 'Comment submitted', success: true },
        { status: 201 }
      )
    }

    // 3. Validate email format
    if (!validateEmail(authorEmail)) {
      await logSpam(authorEmail, clientIP, 'invalid_email', 'medium')
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      )
    }

    // 4. Rate limiting check
    const isRateLimited = await checkRateLimit(clientIP, authorEmail)
    if (isRateLimited) {
      await logSpam(authorEmail, clientIP, 'rate_limit', 'medium')
      return NextResponse.json(
        { error: 'Too many comments. Please try again later.' },
        { status: 429 }
      )
    }

    // 5. Spam detection
    const spamScore = detectSpam(content, authorEmail)
    const isSpam = spamScore > 0.7

    if (isSpam) {
      await logSpam(
        authorEmail,
        clientIP,
        'spam_keywords',
        'high',
        content.substring(0, 500)
      )
    }

    // 6. Trim and validate content
    const trimmedContent = content.trim()
    if (trimmedContent.length < 5 || trimmedContent.length > 2000) {
      return NextResponse.json(
        { error: 'Comment must be between 5 and 2000 characters' },
        { status: 400 }
      )
    }

    // 7. Create comment
    const comment = await prisma.comment.create({
      data: {
        postSlug,
        authorName: authorName.trim(),
        authorEmail: authorEmail.toLowerCase().trim(),
        content: trimmedContent,
        status: isSpam ? 'spam' : 'pending',
        spamScore,
        ipAddress: clientIP,
        userAgent: request.headers.get('user-agent') || '',
      },
    })

    return NextResponse.json(
      {
        message: 'Comment submitted successfully',
        commentId: comment.id,
        status: isSpam ? 'spam' : 'pending',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Comment submission error:', error)
    return NextResponse.json(
      { error: 'Failed to submit comment' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const postSlug = searchParams.get('postSlug')

    if (!postSlug) {
      return NextResponse.json(
        { error: 'postSlug parameter required' },
        { status: 400 }
      )
    }

    // Fetch approved comments only (public API)
    const comments = await prisma.comment.findMany({
      where: {
        postSlug,
        status: 'approved',
      },
      select: {
        id: true,
        authorName: true,
        content: true,
        createdAt: true,
        replies: {
          where: { status: 'approved' },
          select: {
            id: true,
            authorName: true,
            content: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(comments, { status: 200 })
  } catch (error) {
    console.error('Error fetching comments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    )
  }
}
```

**Localização**: Criar novo arquivo `app/api/comments/route.ts`

---

#### Tarefa 6: Criar app/api/admin/comments/route.ts
**Arquivo**: `app/api/admin/comments/route.ts` (NOVO)

**O que fazer**:
- GET: List all comments com filtros (status, page)
- Require admin auth

**Código esperado**:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// TODO: Implement proper admin auth check with NextAuth
async function checkAdminAuth(request: NextRequest): Promise<boolean> {
  // For now, return true (implement with NextAuth later)
  const authHeader = request.headers.get('authorization')
  return !!authHeader // placeholder
}

export async function GET(request: NextRequest) {
  try {
    // if (!(await checkAdminAuth(request))) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = 20

    const where: any = {}
    if (status && status !== 'all') {
      where.status = status
    }

    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where,
        include: {
          replies: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.comment.count({ where }),
    ])

    return NextResponse.json(
      {
        comments,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error fetching comments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    )
  }
}
```

**Localização**: Criar novo arquivo `app/api/admin/comments/route.ts`

---

#### Tarefa 7: Criar app/api/admin/comments/[id]/route.ts
**Arquivo**: `app/api/admin/comments/[id]/route.ts` (NOVO)

**O que fazer**:
- PATCH: Update comment status (approve, reject, spam)
- DELETE: Remove comment and replies

**Código esperado**:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

async function checkAdminAuth(request: NextRequest): Promise<boolean> {
  return true // TODO: implement with NextAuth
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // if (!(await checkAdminAuth(request))) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    const { id } = params
    const body = await request.json()
    const { status } = body

    if (!['approved', 'rejected', 'spam', 'pending'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      )
    }

    const comment = await prisma.comment.update({
      where: { id },
      data: {
        status,
        modifiedAt: new Date(),
        // modifiedBy: userId, // Add when auth is implemented
      },
    })

    return NextResponse.json(comment, { status: 200 })
  } catch (error) {
    console.error('Error updating comment:', error)
    return NextResponse.json(
      { error: 'Failed to update comment' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // if (!(await checkAdminAuth(request))) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    const { id } = params

    // Delete replies first
    await prisma.comment.deleteMany({
      where: { parentId: id },
    })

    // Delete main comment
    await prisma.comment.delete({
      where: { id },
    })

    return NextResponse.json(
      { message: 'Comment deleted' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting comment:', error)
    return NextResponse.json(
      { error: 'Failed to delete comment' },
      { status: 500 }
    )
  }
}
```

**Localização**: Criar novo arquivo `app/api/admin/comments/[id]/route.ts`

---

### BLOCO 4: COMPONENTES (Tarefas 8-10)

#### Tarefa 8: Criar components/CommentForm.tsx
**Arquivo**: `components/CommentForm.tsx` (NOVO)

**O que fazer**:
- Client component com form
- Fields: authorName, authorEmail, content
- Honeypot field (hidden)
- Validação frontend
- Submit via POST /api/comments
- Loading state + error/success messages

**Código esperado**:
```typescript
'use client'

import { useState } from 'react'

interface CommentFormProps {
  postSlug: string
  onSuccess?: () => void
}

export default function CommentForm({
  postSlug,
  onSuccess,
}: CommentFormProps) {
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    authorName: '',
    authorEmail: '',
    content: '',
    website: '', // honeypot
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setIsPending(true)

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postSlug,
          ...formData,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to submit comment')
      }

      setSuccess(true)
      setFormData({
        authorName: '',
        authorEmail: '',
        content: '',
        website: '',
      })

      if (onSuccess) onSuccess()

      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsPending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          ❌ {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
          ✅ Comment submitted! It will appear after moderation.
        </div>
      )}

      {/* Honeypot field (hidden) */}
      <input
        type="text"
        name="website"
        value={formData.website}
        onChange={handleChange}
        style={{ display: 'none' }}
        tabIndex={-1}
        autoComplete="off"
      />

      {/* Name + Email */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input
          type="text"
          name="authorName"
          placeholder="Your Name *"
          value={formData.authorName}
          onChange={handleChange}
          required
          minLength={2}
          maxLength={100}
          className="px-4 py-3 rounded-lg border border-gray-300 focus:border-crypto-primary focus:ring-2 focus:ring-crypto-primary/20 outline-none transition-all disabled:opacity-50"
          disabled={isPending}
        />

        <input
          type="email"
          name="authorEmail"
          placeholder="your@email.com *"
          value={formData.authorEmail}
          onChange={handleChange}
          required
          maxLength={255}
          className="px-4 py-3 rounded-lg border border-gray-300 focus:border-crypto-primary focus:ring-2 focus:ring-crypto-primary/20 outline-none transition-all disabled:opacity-50"
          disabled={isPending}
        />
      </div>

      {/* Content */}
      <textarea
        name="content"
        placeholder="Share your thoughts... *"
        value={formData.content}
        onChange={handleChange}
        required
        minLength={5}
        maxLength={2000}
        rows={5}
        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-crypto-primary focus:ring-2 focus:ring-crypto-primary/20 outline-none transition-all resize-none disabled:opacity-50"
        disabled={isPending}
      />

      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500">
          💬 Comments are moderated. Your email won't be published.
        </p>
        <button
          type="submit"
          disabled={isPending}
          className="px-8 py-3 bg-crypto-primary hover:bg-crypto-accent text-white font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? 'Submitting...' : 'Post Comment'}
        </button>
      </div>
    </form>
  )
}
```

**Localização**: Criar novo arquivo `components/CommentForm.tsx`

---

#### Tarefa 9: Criar components/CommentsList.tsx
**Arquivo**: `components/CommentsList.tsx` (NOVO)

**O que fazer**:
- Client component
- Fetch GET /api/comments?postSlug=
- Display approved comments com loading skeleton
- Show: name, date, content, replies (indented)

**Código esperado**:
```typescript
'use client'

import { useEffect, useState } from 'react'

interface Comment {
  id: string
  authorName: string
  content: string
  createdAt: string
  replies?: Comment[]
}

interface CommentsListProps {
  postSlug: string
}

export default function CommentsList({ postSlug }: CommentsListProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await fetch(
          `/api/comments?postSlug=${encodeURIComponent(postSlug)}`
        )
        if (!response.ok) throw new Error('Failed to fetch')
        const data = await response.json()
        setComments(data)
      } catch (error) {
        console.error('Error fetching comments:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchComments()
  }, [postSlug])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div
            key={i}
            className="p-4 bg-gray-100 rounded-lg animate-pulse h-24"
          />
        ))}
      </div>
    )
  }

  if (comments.length === 0) {
    return (
      <p className="text-center text-gray-500 py-8">
        No comments yet. Be the first to share your thoughts!
      </p>
    )
  }

  return (
    <div className="space-y-6">
      {comments.map(comment => (
        <div key={comment.id}>
          {/* Main comment */}
          <div className="p-6 bg-white rounded-lg border border-gray-200">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="font-bold text-crypto-navy">
                  {comment.authorName}
                </h4>
                <p className="text-xs text-gray-500 mt-1">
                  {formatDate(comment.createdAt)}
                </p>
              </div>
            </div>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {comment.content}
            </p>
          </div>

          {/* Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="ml-6 mt-4 space-y-4">
              {comment.replies.map(reply => (
                <div
                  key={reply.id}
                  className="p-4 bg-gray-50 rounded-lg border border-gray-100"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h5 className="font-bold text-sm text-crypto-navy">
                        {reply.authorName}
                      </h5>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {formatDate(reply.createdAt)}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {reply.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
```

**Localização**: Criar novo arquivo `components/CommentsList.tsx`

---

#### Tarefa 10: Atualizar components/SocialComments.tsx
**Arquivo**: `components/SocialComments.tsx`

**O que fazer**:
- Remover Giscus integration (script tag)
- Renderizar CommentForm + CommentsList
- State: refreshKey para atualizar lista após novo comentário
- Keep existing styling/structure

**Código esperado**:
```typescript
'use client'

import { useState } from 'react'
import CommentForm from '@/components/CommentForm'
import CommentsList from '@/components/CommentsList'

interface SocialCommentsProps {
  postSlug: string
}

export default function SocialComments({
  postSlug,
}: SocialCommentsProps) {
  const [refreshKey, setRefreshKey] = useState(0)

  const handleCommentSuccess = () => {
    // Refresh comments list
    setRefreshKey(prev => prev + 1)
  }

  return (
    <section className="mt-20 pt-20 border-t border-crypto-light">
      <div className="flex items-center gap-3 mb-10">
        <h3 className="text-2xl font-bold text-crypto-navy font-heading italic">
          💬 Join the Discussion
        </h3>
        <div className="flex-1 h-px bg-crypto-light" />
      </div>

      {/* Comment Form */}
      <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-200 mb-12">
        <h4 className="text-lg font-bold text-crypto-navy mb-6">
          Share Your Thoughts
        </h4>
        <CommentForm
          postSlug={postSlug}
          onSuccess={handleCommentSuccess}
        />
      </div>

      {/* Comments List */}
      <div>
        <h4 className="text-lg font-bold text-crypto-navy mb-6">
          Comments ({refreshKey})
        </h4>
        <CommentsList key={refreshKey} postSlug={postSlug} />
      </div>
    </section>
  )
}
```

**Localização**: Atualizar arquivo existente `components/SocialComments.tsx`

---

### BLOCO 5: ADMIN DASHBOARD (Tarefa 11)

#### Tarefa 11: Criar app/admin/comments/page.tsx
**Arquivo**: `app/admin/comments/page.tsx` (NOVO)

**O que fazer**:
- Admin dashboard
- Listar comments com filtros (all, pending, approved, rejected, spam)
- Table: author, post, content, status, spamScore, date, actions
- Actions buttons: approve, reject, delete
- Paginação (20 por página)
- Status colors

**Código esperado**:
```typescript
'use client'

import { useEffect, useState, useTransition } from 'react'
import Link from 'next/link'

interface Comment {
  id: string
  postSlug: string
  authorName: string
  authorEmail: string
  content: string
  status: string
  spamScore: number
  createdAt: string
}

export default function CommentsAdminPage() {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const url = `/api/admin/comments?status=${filter}&page=${page}`
        const response = await fetch(url)
        if (!response.ok) throw new Error('Failed to fetch')
        const data = await response.json()
        setComments(data.comments)
        setTotal(data.pagination.total)
      } catch (error) {
        console.error('Error fetching comments:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchComments()
  }, [filter, page])

  const handleApprove = (commentId: string) => {
    startTransition(async () => {
      try {
        const response = await fetch(`/api/admin/comments/${commentId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'approved' }),
        })
        if (response.ok) {
          setComments(comments.map(c =>
            c.id === commentId ? { ...c, status: 'approved' } : c
          ))
        }
      } catch (error) {
        console.error('Error approving:', error)
      }
    })
  }

  const handleReject = (commentId: string) => {
    startTransition(async () => {
      try {
        const response = await fetch(`/api/admin/comments/${commentId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'rejected' }),
        })
        if (response.ok) {
          setComments(comments.map(c =>
            c.id === commentId ? { ...c, status: 'rejected' } : c
          ))
        }
      } catch (error) {
        console.error('Error rejecting:', error)
      }
    })
  }

  const handleDelete = (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return
    startTransition(async () => {
      try {
        const response = await fetch(`/api/admin/comments/${commentId}`, {
          method: 'DELETE',
        })
        if (response.ok) {
          setComments(comments.filter(c => c.id !== commentId))
        }
      } catch (error) {
        console.error('Error deleting:', error)
      }
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      case 'spam':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-crypto-navy mb-6">
        Comments Management
      </h1>

      {/* Filters */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {['all', 'pending', 'approved', 'rejected', 'spam'].map(status => (
          <button
            key={status}
            onClick={() => {
              setFilter(status)
              setPage(1)
            }}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === status
                ? 'bg-crypto-primary text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)} ({
              status === 'all' ? total : '?'
            })
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-lg border border-gray-200">
        <table className="w-full">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-bold">Author</th>
              <th className="px-6 py-3 text-left text-sm font-bold">Post</th>
              <th className="px-6 py-3 text-left text-sm font-bold">Content</th>
              <th className="px-6 py-3 text-left text-sm font-bold">Status</th>
              <th className="px-6 py-3 text-left text-sm font-bold">Score</th>
              <th className="px-6 py-3 text-left text-sm font-bold">Date</th>
              <th className="px-6 py-3 text-left text-sm font-bold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={7} className="p-4 text-center text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : comments.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-4 text-center text-gray-500">
                  No comments found
                </td>
              </tr>
            ) : (
              comments.map(comment => (
                <tr key={comment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {comment.authorName}
                    </div>
                    <div className="text-xs text-gray-500">
                      {comment.authorEmail}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      href={`/blog/${comment.postSlug}`}
                      target="_blank"
                      className="text-sm text-crypto-primary hover:underline"
                    >
                      {comment.postSlug}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-700 line-clamp-2">
                      {comment.content}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(
                        comment.status
                      )}`}
                    >
                      {comment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-700">
                      {(comment.spamScore * 100).toFixed(0)}%
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-500">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      {comment.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(comment.id)}
                            disabled={isPending}
                            className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 disabled:opacity-50"
                          >
                            ✓
                          </button>
                          <button
                            onClick={() => handleReject(comment.id)}
                            disabled={isPending}
                            className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 disabled:opacity-50"
                          >
                            ✕
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleDelete(comment.id)}
                        disabled={isPending}
                        className="px-3 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600 disabled:opacity-50"
                      >
                        🗑
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center gap-2 mt-6">
        <button
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
        >
          ← Previous
        </button>
        <span className="px-4 py-2">
          Page {page} of {Math.ceil(total / 20)}
        </span>
        <button
          onClick={() => setPage(p => p + 1)}
          disabled={page >= Math.ceil(total / 20)}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
        >
          Next →
        </button>
      </div>
    </div>
  )
}
```

**Localização**: Criar novo arquivo `app/admin/comments/page.tsx`

---

### BLOCO 6: CORREÇÕES E VALIDAÇÃO (Tarefas 12-14)

#### Tarefa 12: Criar/Atualizar Database Migrations
**O que fazer**:
- Run prisma migrations
- Criar Comment e SpamLog tables

**Comandos**:
```bash
npx prisma migrate dev --name add_comments
npx prisma generate
```

---

#### Tarefa 13: Testar Anti-Spam
**O que fazer**:
- Testar honeypot (hidden field)
- Testar rate limiting (submit 6 comments em 1 min)
- Testar email validation (emails inválidos)
- Testar spam keywords (comment com "viagra", etc)
- Testar spam score calculation

**Checklist**:
```
[ ] Honeypot rejeita bots
[ ] Rate limit bloqueia após 5 comentários
[ ] Email inválido é rejeitado
[ ] Spam keywords incrementam score
[ ] Spam score > 0.7 move para spam
[ ] Comments pending aparecem em admin
[ ] Approve funciona
[ ] Reject funciona
[ ] Delete funciona
```

---

#### Tarefa 14: Validar Responsiveness e Performance
**O que fazer**:
- Testar CommentForm responsiveness (mobile/desktop)
- Testar CommentsList (loading state, empty state)
- Admin dashboard (filtros, paginação)
- npm run build (sem erros)
- Lighthouse validation

---

## 4️⃣ VERIFICAÇÃO FINAL

### Checklist de Sucesso
```
✅ Database migrations ran
✅ Comment + SpamLog models created
✅ POST /api/comments funciona
✅ GET /api/comments?postSlug= funciona
✅ GET /api/admin/comments funciona
✅ PATCH /api/admin/comments/[id] funciona
✅ DELETE /api/admin/comments/[id] funciona
✅ CommentForm renderiza
✅ CommentsList renderiza
✅ SocialComments integrado
✅ Admin dashboard abre
✅ Honeypot funciona
✅ Rate limiting funciona
✅ Email validation funciona
✅ Spam detection funciona
✅ Responsiveness OK
✅ Build sem erros
```

---

## 5️⃣ RESULTADO ESPERADO

### Post Page
```
✅ SocialComments renderiza com CommentForm
✅ Usuários podem comentar
✅ Comentários aparecem após aprovação
✅ Anti-spam protege o blog
```

### Admin Dashboard
```
✅ Dashboard abre em /admin/comments
✅ Lista todos comentários (pending, approved, rejected, spam)
✅ Pode aprovar/rejeitar/deletar
✅ Paginação funciona
✅ Filtros funcionam
```

### Spam Prevention
```
✅ Honeypot bloqueia bots
✅ Rate limiting: max 5 por hora
✅ Email validation: rejeita inválidos
✅ Keywords detection: identifica spam
✅ IP tracking: log de suspeitos
```

---

## 🚀 PRÓXIMOS PASSOS (PÓS-ANTIGRAVITY)

```bash
# 1. Database
npx prisma migrate dev --name add_comments
npx prisma generate

# 2. Testar local
npm run dev

# 3. Testar comentários
curl -X POST http://localhost:3000/api/comments \
  -H "Content-Type: application/json" \
  -d '{
    "postSlug": "test-post",
    "authorName": "John",
    "authorEmail": "john@example.com",
    "content": "Great article!"
  }'

# 4. Build & Deploy
npm run build
git push
```

---

**OBJETIVO: Sistema de comentários profissional com anti-spam robusto em 5 camadas! 🎯**

Antigravity: Execute 14 tarefas, implemente banco de dados, crie APIs, componentes UI, admin dashboard, anti-spam, teste tudo.
