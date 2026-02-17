import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { SignOutButton } from '@/components/SignOutButton'
import { getTotalPostsCount } from '@/lib/contentful'

export default async function AdminPage() {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  // Fetch real statistics from Contentful
  const totalPosts = await getTotalPostsCount()
  // Currently we don't have a direct count for published vs drafts in the simplified lib
  // but we can assume totalPosts are the published ones fetched by getAllPosts
  const publishedPosts = totalPosts
  const draftPosts = 0 // Contentful stats would require more complex querying

  return (
    <div className="min-h-screen bg-crypto-dark py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">
              Admin Dashboard
            </h1>
            <p className="text-gray-400 mt-1">
              Welcome back, {session.user?.name || session.user?.email}
            </p>
          </div>
          <SignOutButton />
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-crypto-darker rounded-xl p-6 border border-crypto-primary/20 hover:border-crypto-primary/40 transition">
            <div className="flex items-center justify-between">
              <h3 className="text-gray-400 text-sm">Total Posts</h3>
              <svg className="w-5 h-5 text-crypto-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-3xl font-bold text-white mt-2">{totalPosts}</p>
          </div>
          <div className="bg-crypto-darker rounded-xl p-6 border border-green-500/20 hover:border-green-500/40 transition">
            <div className="flex items-center justify-between">
              <h3 className="text-gray-400 text-sm">Published</h3>
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-3xl font-bold text-white mt-2">{publishedPosts}</p>
          </div>
          <div className="bg-crypto-darker rounded-xl p-6 border border-yellow-500/20 hover:border-yellow-500/40 transition">
            <div className="flex items-center justify-between">
              <h3 className="text-gray-400 text-sm">Drafts</h3>
              <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <p className="text-3xl font-bold text-white mt-2">{draftPosts}</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-crypto-darker rounded-xl p-6 border border-crypto-primary/20">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-crypto-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Quick Actions
            </h2>
            <div className="grid gap-3">
              <a
                href="https://app.contentful.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 bg-crypto-primary hover:bg-crypto-accent text-white font-semibold py-3 px-4 rounded-lg transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create New Post (Contentful)
              </a>
              <a
                href="https://app.contentful.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 border border-crypto-primary text-crypto-primary hover:bg-crypto-primary/10 font-semibold py-3 px-4 rounded-lg transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Open Contentful
              </a>
            </div>
          </div>

          <div className="bg-crypto-darker rounded-xl p-6 border border-crypto-primary/20">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-crypto-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Session Info
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-crypto-primary/10">
                <span className="text-gray-400">Email</span>
                <span className="text-white font-mono text-sm">{session.user?.email}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-crypto-primary/10">
                <span className="text-gray-400">Role</span>
                <span className="text-crypto-primary font-medium">Admin</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-400">Status</span>
                <span className="flex items-center gap-2 text-green-400">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  Active
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
