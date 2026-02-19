# PROMPT ANTIGRAVITY — COMPLETAR IMPLEMENTAÇÃO 100%
## TheCryptoStart Blog — 5 Componentes + Sistema de Comentários com Anti-Spam

---

## 🎯 OBJETIVO FINAL

Completar a implementação de 78% para 100% (22% faltando):

**Criar:**
1. ✅ CategoryLinks.tsx
2. ✅ PopularPosts.tsx
3. ✅ TrendingList.tsx
4. ✅ FAQAccordion.tsx
5. ✅ NewsletterCTALarge.tsx

**Implementar:**
6. ✅ Sistema de comentários (API + Components)
7. ✅ Anti-spam (honeypot, rate limiting, validation)
8. ✅ Admin dashboard para gerenciar comentários
9. ✅ Database schema updates (Prisma)

**Corrigir:**
10. ✅ Imports em todas páginas
11. ✅ Responsiveness 320-1920px
12. ✅ Performance & Lighthouse > 85

---

## 📋 TAREFAS (20 TOTAL)

### BLOCO 1: COMPONENTES (Tarefas 1-5)

#### Tarefa 1: CategoryLinks.tsx
- Arquivo: `components/CategoryLinks.tsx`
- Async component
- Props: categorySlug (string), limit=5, className
- Fetch categorias, filtrar pela atual, renderizar como links
- Styling: small text, hover color, gap-2
- Error handling: return null se erro

#### Tarefa 2: PopularPosts.tsx
- Arquivo: `components/PopularPosts.tsx`
- Async component
- Props: categorySlug, limit=3, className
- Fetch posts, filtrar por categoria, mostrar mini cards
- Include: title, reading time, hover effects
- Responsive e styled

#### Tarefa 3: TrendingList.tsx
- Arquivo: `components/TrendingList.tsx`
- Client component ('use client')
- Props: posts[], limit=5, className
- Renderizar com ranking numbers (1, 2, 3...)
- Include: 🔥 icon, reading time, hover effects
- Styled cards com gradients

#### Tarefa 4: FAQAccordion.tsx
- Arquivo: `components/FAQAccordion.tsx`
- Client component ('use client')
- Props: faqs ({ question, answer }[]), className
- State para expand/collapse
- Smooth animations
- Styled cards com borders

#### Tarefa 5: NewsletterCTALarge.tsx
- Arquivo: `components/NewsletterCTALarge.tsx`
- Async/SSR component
- Props: className
- Gradient background (primary to accent)
- Include: NewsletterForm component
- Privacy note at bottom
- Centered, responsive

---

### BLOCO 2: BANCO DE DADOS (Tarefa 6)

#### Tarefa 6: Atualizar prisma/schema.prisma
- Adicionar Comment model:
  - id, postSlug, authorName, authorEmail, content
  - status (pending, approved, rejected, spam)
  - spamScore (Float, 0-1)
  - ipAddress, userAgent
  - createdAt, updatedAt, modifiedAt, modifiedBy
  - parentId (para replies)

- Adicionar SpamLog model:
  - id, authorEmail, ipAddress, reason, severity
  - createdAt

- Indexes: postSlug, status, authorEmail, ipAddress

---

### BLOCO 3: API COMENTÁRIOS (Tarefas 7-9)

#### Tarefa 7: app/api/comments/route.ts
- POST: Criar comentário
  - Validação: name, email, content (required)
  - Honeypot field: website (hidden)
  - Email validation
  - Rate limiting (5 por hora)
  - Spam detection
  - Return 201 se success, 429 se rate limited
  
- GET: Listar comentários
  - Query param: postSlug
  - Filtro: status = 'approved'
  - Include replies
  - Order by createdAt desc

#### Tarefa 8: lib/spam-prevention.ts
- validateEmail(email): bool
- getClientIP(request): string
- checkRateLimit(ip, email): Promise<bool>
  - Max 5 comments per hour
  - Check database
  
- detectSpam(content, email): number (0-1)
  - Spam keywords detection
  - Excessive links
  - Excessive caps
  - Multiple exclamation marks

#### Tarefa 9: components/CommentForm.tsx
- Client component ('use client')
- Props: postSlug, onSuccess?
- Fields: authorName, authorEmail, content
- Honeypot field (hidden): website
- Submit via fetch POST /api/comments
- Loading state, error display, success message
- Validação frontend

---

### BLOCO 4: COMENTÁRIOS UI (Tarefas 10-12)

#### Tarefa 10: components/CommentsList.tsx
- Client component
- Props: postSlug
- Fetch GET /api/comments?postSlug=
- Display comments com loading skeleton
- Show: name, date, content
- Support replies (indent)
- Format date: "Jan 15, 2025"

#### Tarefa 11: Atualizar components/SocialComments.tsx
- Remover Giscus integration
- Renderizar CommentForm + CommentsList
- State: refreshKey para atualizar lista
- Callback onSuccess para refresh

#### Tarefa 12: app/admin/comments/page.tsx
- Admin dashboard
- Listar comments com filtros (all, pending, approved, rejected, spam)
- Table: author, post, content, status, spamScore, date, actions
- Actions: approve, reject, delete (pending)
- Paginação (20 por página)
- Status colors: green (approved), yellow (pending), red (rejected), orange (spam)
- Require admin auth

---

### BLOCO 5: ADMIN API (Tarefas 13-14)

#### Tarefa 13: app/api/admin/comments/route.ts
- GET: Listar comments com filtros
- Params: status (optional), page (optional)
- Require admin auth
- Return comments array com replies
- Paginação: 20 por página

#### Tarefa 14: app/api/admin/comments/[id]/route.ts
- PATCH: Atualizar status
  - Body: { status: 'approved' | 'rejected' | 'spam' }
  - Update modifiedAt, modifiedBy
  
- DELETE: Remover comment
  - Também delete replies (parentId = id)
  - Require admin auth

---

### BLOCO 6: CORREÇÕES (Tarefas 15-17)

#### Tarefa 15: Corrigir app/page.tsx
- Verificar imports dos 5 componentes novos
- Verificar que componentes existem: CategoryCard, BlogCardCompact, FeaturedArticleCard
- Sem imports duplicados
- Sem broken imports

#### Tarefa 16: Corrigir app/blog/[slug]/page.tsx
- Imports: CompactTableOfContents, CategoryLinks, PopularPosts, SocialComments
- Verificar que componentes existem
- Sem import errors

#### Tarefa 17: Atualizar lib/constants.ts
- Adicionar novos ad slots (blog-sidebar-*, homepage-*, etc)
- Total: 15+ slots
- Substituir placeholders com verdadeiros IDs (ou manter para testing)

---

### BLOCO 7: VALIDAÇÃO (Tarefas 18-20)

#### Tarefa 18: Responsiveness Testing
- Testar em 320px, 640px, 768px, 1024px, 1280px, 1440px, 1920px
- Mobile (320-640): 1 column, sem sidebar
- Tablet (768-1024): 2 columns, sem sidebar
- Desktop (1280+): 3+ columns, com sidebar
- Sem horizontal scrolls

#### Tarefa 19: Performance Validation
- npm run build (sem erros)
- npm run start
- Lighthouse: Performance > 85, UX > 90, SEO > 90
- Sem console errors
- Sem broken imports

#### Tarefa 20: Testes Funcionais
- [ ] Homepage renderiza 9 sections
- [ ] Post page 3-column renderiza
- [ ] TOC dots funcionam
- [ ] Sidebar ads carregam
- [ ] CommentForm renderiza
- [ ] CommentsList mostra comments
- [ ] Anti-spam funciona (testar honeypot, rate limit)
- [ ] Admin dashboard abre
- [ ] Approve/reject/delete funcionam

---

## 📦 ENTREGA FINAL

**20 tarefas completadas = 100% de implementação**

✅ 5 componentes novos (CategoryLinks, PopularPosts, TrendingList, FAQAccordion, NewsletterCTALarge)
✅ Sistema de comentários completo (API + UI)
✅ Anti-spam robusto (5 layers)
✅ Admin dashboard funcional
✅ Todas páginas responsivas (320-1920px)
✅ Performance Lighthouse > 85
✅ Imports corrigidos
✅ Zero console errors

**Status Final: 100% COMPLETO ✅**

---

## 🚀 PRÓXIMOS PASSOS

```bash
# Após Antigravity terminar:

# 1. Rodar migrations
npx prisma migrate dev --name add_comments

# 2. Gerar Prisma client
npx prisma generate

# 3. Testar local
npm run dev

# 4. Build
npm run build

# 5. Deploy
git push
```

---

**GO! Antigravity, complete estas 20 tarefas e leve o blog para 100%! 🎯**
