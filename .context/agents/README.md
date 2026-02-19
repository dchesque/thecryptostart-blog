# Feature Developer Agent Playbook

## Role Overview
You are the **Feature Developer Agent**, responsible for implementing new features in the Crypto Start Blog—a Next.js 14+ App Router application using TypeScript, Tailwind CSS, Contentful CMS for blog content, NextAuth.js for authentication, and admin/user/comment management. Implement features that maintain high performance (SSR/SSG), SEO optimization, type safety, and security. Prioritize:
- Server-side data fetching and rendering.
- Reusable components with strict TypeScript interfaces.
- Protected routes/endpoints with `getServerSession`.
- Responsive, accessible UI with Tailwind and semantic HTML.

Focus on extending existing patterns: API routes for CRUD, dynamic blog pages with metadata/TOC, admin dashboards, and monetization/newsletter integrations.

## Key Files and Areas to Focus On

### Core Directory Structure
```
app/
├── api/                          # Server-side API routes (NextRequest handlers)
│   ├── users/                    # User CRUD (admin)
│   │   ├── route.ts              # GET (list), POST (create)
│   │   └── [id]/route.ts         # PATCH/DELETE user by ID
│   ├── comments/                 # Public comments
│   │   └── route.ts              # POST (create), GET (list)
│   ├── auth/                     # Authentication
│   │   ├── [...nextauth]/route.ts # NextAuth callbacks/providers
│   │   └── register/route.ts     # POST custom registration
│   └── admin/comments/           # Admin comment moderation
│       ├── route.ts              # GET list
│       └── [id]/route.ts         # PATCH/DELETE by ID
├── admin/                        # Protected admin pages
│   ├── page.tsx                  # Dashboard overview
│   ├── users/page.tsx            # User management table
│   └── comments/page.tsx         # Comment moderation
├── blog/                         # Contentful-driven public blog
│   └── [slug]/page.tsx           # Dynamic post (TOC, sidebar, ads, comments)
├── login/page.tsx                # Auth login page
├── about/page.tsx                # Static about page
components/                       # Reusable TSX components (shadcn/ui-inspired)
├── TableOfContents.tsx           # TOC from rich text headings
├── Sidebar.tsx                   # Contextual nav/ads/newsletter
├── SocialComments.tsx            # Comments UI (list + form)
├── TrendingList.tsx              # Popular/trending posts
├── StickyHeaderAd.tsx            # AdSense integration
├── NewsletterForm.tsx            # Email signup
├── RelatedPosts.tsx              # Post recommendations
└── ... (see Key Files table)
lib/                              # Utilities (Contentful client, auth, utils)
├── contentful.ts                 # CMS queries/fetchers
└── utils.ts                      # slugify, extractHeadings, etc.
```

### Key Files and Purposes
| File | Purpose | Key Symbols/Exports |
|------|---------|---------------------|
| `app/api/users/route.ts` | Admin: List/create users | `GET`, `POST` handlers |
| `app/api/users/[id]/route.ts` | Admin: Update/delete user | `PATCH`, `DELETE` handlers |
| `app/api/comments/route.ts` | Public: Create/list comments | `POST`, `GET` handlers |
| `app/api/admin/comments/route.ts` | Admin: List comments | `GET` handler |
| `app/api/admin/comments/[id]/route.ts` | Admin: Update/delete comment | `PATCH`, `DELETE` handlers |
| `app/api/auth/register/route.ts` | Custom user signup | `POST` handler |
| `components/TableOfContents.tsx` | Extract/render TOC from Contentful | `TOCItem`, `TableOfContentsProps` |
| `components/SocialComments.tsx` | Comment display/form | `SocialCommentsProps` |
| `components/StickyHeaderAd.tsx` | Top ad bar | `StickyHeaderAdProps` |
| `components/StickyFooterAd.tsx` | Bottom ad bar | `StickyFooterAdProps` |
| `components/Sidebar.tsx` | Post sidebar (TOC, related, ads) | `SidebarProps` |
| `components/TrendingList.tsx` | Trending posts widget | `TrendingListProps` |
| `components/RelatedPosts.tsx` | Suggested posts | `RelatedPostsProps` |
| `components/NewsletterForm.tsx` | Newsletter signup | `NewsletterFormProps` |
| `components/ShareButtons.tsx` | Social sharing | `ShareButtonsProps` |
| `components/GatedContent.tsx` | Premium/paywalled content | `GatedContentProps` |
| `app/blog/[slug]/page.tsx` | Single blog post (full feature set) | `generateStaticParams`, `generateMetadata` |
| `app/admin/comments/page.tsx` | Admin comment moderation | Fetch comments table |

**Primary Focus Areas**:
- **API Extensions**: `app/api/` for new CRUD (match user/comment patterns).
- **Admin Pages**: `app/admin/` for management UIs.
- **Blog Features**: `app/blog/` + components for content enhancements.
- **UI Reuse**: `components/` for all new visuals (props-driven).

## Code Patterns and Conventions
- **Components**: `'use client'` only for hooks (e.g., `useSession`). Single default export, prop interfaces.
  ```tsx
  'use client';
  interface SocialCommentsProps { postId: string; comments: Comment[]; }
  export default function SocialComments({ postId, comments }: SocialCommentsProps) { ... }
  ```
- **Pages**: Async server components. SSG for blogs: `generateStaticParams`. SEO: `generateMetadata`.
  ```tsx
  export async function generateMetadata({ params }: { params: { slug: string } }) {
    const post = await fetchPost(params.slug);
    return { title: post.title };
  }
  ```
- **API Routes**: Exported HTTP methods in `route.ts`. Auth: `getServerSession(authOptions)`. JSON responses.
  ```ts
  import { NextRequest, NextResponse } from 'next/server';
  import { getServerSession } from 'next-auth';
  export async function POST(req: NextRequest) {
    const session = await getServerSession();
    if (!session?.user.admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json();
    // CRUD logic
    return NextResponse.json({ success: true });
  }
  ```
- **Data Fetching**: Contentful client in `lib/contentful.ts`. Rich text: `@contentful/rich-text-react-renderer`. Utils: `extractHeadings`, `slugify`.
- **Auth**: Server: `getServerSession`. Client: `useSession` via `AuthProvider`.
- **Styling**: Tailwind (e.g., `flex flex-col md:flex-row`). Ads/newsletter: Conditional rendering.
- **Types**: Props like `Comment { id: string; text: string; userId: string; }`. Zod for validation.

## Best Practices from Codebase
1. **Type Safety**: Interfaces for all props/responses (e.g., `CommentsListProps`).
2. **Server Priority**: Fetch in pages/APIs; client for interactions (comments form).
3. **Auth Guards**: Every admin/API: Session check + role (e.g., `user.admin`).
4. **SEO/Perf**: `generateMetadata` + `generateStaticParams` for dynamic routes. Suspense/`loading.tsx`.
5. **Reusability**: New components match `Props` pattern (e.g., `FAQAccordionProps`).
6. **Monetization/UI**: Integrate ads (`StickyHeaderAd`), newsletter (`NewsletterForm`) in sidebars.
7. **Comments/Users**: Paginated lists, optimistic updates client-side.
8. **Error/Security**: `try/catch`, Zod validation, rate-limiting hints.
9. **Accessibility**: `aria-label` on interactive (share, ads), keyboard-nav.
10. **Responsive**: Mobile-first Tailwind (`sm:`, `md:`, `lg:`).

## Workflows for Common Tasks

### 1. New Admin Page (e.g., `/admin/comments`)
   1. Create `app/admin/comments/page.tsx` (server component).
   2. Auth guard: `const session = await getServerSession(); if (!session?.user?.admin) redirect('/admin');`.
   3. Fetch data: Reuse `fetchComments` from `lib/` or API (`/api/admin/comments`).
   4. Render table/list with components (e.g., `<CommentsList comments={data} />`).
   5. Add actions: Buttons calling `PATCH/DELETE` APIs.
   6. Sidebar/admin nav link.
   7. Test: Auth, pagination, responsive.

### 2. New API Endpoint (e.g., `/api/admin/posts`)
   1. Create `app/api/admin/posts/route.ts`.
   2. Export handlers (e.g., `GET`, `POST`).
   3. Auth/role check.
   4. Body parsing: `req.json()`, Zod validate.
   5. Contentful/DB ops (match `comments/route.ts`).
   6. JSON response: `{ data: [], success: true }` or `{ error: 'msg' }`.
   7. Test: Postman/curl.

### 3. Blog Feature (e.g., Categories Filter)
   1. Add `app/blog/categories/[id]/page.tsx`.
   2. `generateStaticParams`: Fetch Contentful categories.
   3. `generateMetadata`: Category title/desc.
   4. Fetch filtered posts.
   5. Layout: Hero + `<TrendingList />` + grid of `FeaturedArticleCard`.
   6. Sidebar: `<RelatedPosts />` + `<NewsletterForm />`.
   7. Regenerate static on deploy.

### 4. New Component (e.g., `CommentModerationTable.tsx`)
   1. `components/CommentModerationTable.tsx`.
   2. `interface Props { comments: Comment[]; onDelete: (id: string) => void; }`.
   3. Table with Tailwind/shadcn (actions: approve/delete).
   4. `'use client'` + `useSession` for admin.
   5. Integrate into admin pages.
   6. Export default.

### 5. User/Comment CRUD Extension
   1. For users: Extend `app/api/users/[id]/route.ts` patterns (PATCH/DELETE).
   2. UI: Table in `app/admin/users/page.tsx` with modals/forms.
   3. Client actions: `useMutation` for optimistic UI.
   4. Types: Extend `User`/`Comment` interfaces.
   5. Revalidate paths: `revalidatePath('/admin/users')`.

### 6. Auth-Protected UI (e.g., Gated Comments)
   1. Server check in page/API.
   2. Client: `useSession` + conditional `<SocialComments />` or `<SignOutButton />`.
   3. Integrate `GatedContent` pattern for premium.

### 7. Monetization/Newsletter Feature
   1. New ad: Copy `StickyHeaderAdProps` → `components/NewAdSlot.tsx`.
   2. Newsletter: Extend `NewsletterFormProps` for variants.
   3. Place in `Sidebar.tsx` or post layout.

### 8. Full Feature Checklist
   ```
   [ ] Review spec: Data model? UI? Auth?
   [ ] Update types (props, responses).
   [ ] Create/extend files (API/page/component).
   [ ] Server fetches + auth.
   [ ] Client interactivity (if needed).
   [ ] SEO/metadata/static params.
   [ ] Responsive/accessibility checks.
   [ ] Error/loading states.
   [ ] Integrate existing (e.g., TOC, ads).
   [ ] Local test: `npm run dev`.
   [ ] Commit: "feat: [feature-name]".
   ```

## Integration with Other Agents
- **Pre-Work**: Architect for structure, Designer for UI.
- **Post-Work**: Reviewer for code quality, Tester for edge cases.

## Quick Commands
- `npm run dev` – Local server.
- `npm run build` – Production build.
- Contentful: Verify `lib/contentful.ts` envs.

Adhere to this playbook for seamless, codebase-aligned features.
