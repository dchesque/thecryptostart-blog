import { auth } from "@/auth";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminDashboard() {
  const session = await auth();

  // Fetch real stats
  const [userCount, postCount, commentCount] = await Promise.all([
    prisma.user.count(),
    prisma.post.count(),
    prisma.comment.count(),
  ]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Total Users</h3>
          <p className="text-3xl font-bold text-gray-800 dark:text-white mt-2">{userCount}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Total Posts</h3>
          <p className="text-3xl font-bold text-gray-800 dark:text-white mt-2">{postCount}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Comments</h3>
          <p className="text-3xl font-bold text-gray-800 dark:text-white mt-2">{commentCount}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Quick Actions</h2>
        <div className="flex gap-4">
          <a
            href={`https://app.contentful.com/spaces/${process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID}/entries?contentTypeId=blogPost`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition flex items-center gap-2"
          >
            Create Post
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-external-link">
              <path d="M15 3h6v6" /><path d="M10 14 21 3" /><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            </svg>
          </a>
          <Link
            href="/admin/users"
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition"
          >
            Manage Users
          </Link>
          <Link
            href="/admin/seo"
            className="px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 transition flex items-center gap-2"
          >
            SEO Intelligence
          </Link>
        </div>
      </div>
    </div>
  );
}
