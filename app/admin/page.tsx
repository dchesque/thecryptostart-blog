import { auth } from "@/auth";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  Users,
  FileText,
  MessageSquare,
  Activity,
  Plus,
  ExternalLink,
  Search,
  Bot
} from "lucide-react";
import { format } from "date-fns";

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const session = await auth();

  let userCount = 0;
  let postCount = 0;
  let commentCount = 0;
  let pendingComments: any[] = [];
  let pendingCount = 0;
  let error: string | null = null;

  try {
    // Fetch real stats
    const [uCount, pCount, cCount, pComments] = await Promise.all([
      prisma.user.count(),
      prisma.post.count(),
      prisma.comment.count(),
      prisma.comment.findMany({
        where: { status: "PENDING" },
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { post: { select: { title: true, slug: true } } }
      }),
    ]);

    userCount = uCount;
    postCount = pCount;
    commentCount = cCount;
    pendingComments = pComments;
    pendingCount = await prisma.comment.count({ where: { status: "PENDING" } });
  } catch (err: any) {
    console.error("[AdminDashboard] Error fetching stats:", err);
    error = err.message || "Failed to fetch dashboard stats. Check database connection.";
  }

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const stats = [
    {
      label: "Total Posts",
      value: postCount.toLocaleString(),
      icon: FileText,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Total Users",
      value: userCount.toLocaleString(),
      icon: Users,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      label: "Total Comments",
      value: commentCount.toLocaleString(),
      icon: MessageSquare,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Pending Review",
      value: pendingCount.toLocaleString(),
      icon: Activity,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-crypto-darker to-crypto-navy rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">
            {getGreeting()}, {session?.user?.name?.split(" ")[0]}!
          </h1>
          <p className="text-gray-400">Here's what's happening with your blog today.</p>
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-white/5 to-transparent skew-x-12" />
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-crypto-primary/20 rounded-full blur-3xl" />
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-xl shadow-sm">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700 font-bold">
                Critical System Error
              </p>
              <p className="text-xs text-red-600 mt-1">
                {error}
              </p>
              <p className="text-[10px] text-red-500 mt-2 italic">
                Tip: Ensure database migrations are up to date and connection strings are correct.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                <stat.icon size={24} />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
            <p className="text-sm text-gray-500 font-medium mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-lg font-bold text-gray-900">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <a
              href={`https://app.contentful.com/spaces/${process.env.NEXT_PUBLIC_CONTENTFUL_SPACE_ID}/entries?contentTypeId=blogPost`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-6 bg-white border border-gray-100 rounded-2xl hover:border-blue-500 hover:shadow-lg transition-all group text-left"
            >
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Plus size={20} />
              </div>
              <h3 className="font-bold text-gray-900 group-hover:text-blue-600">New Post</h3>
              <p className="text-xs text-gray-500 mt-1">Create content in Contentful</p>
            </a>

            <Link
              href="/admin/comments"
              className="p-6 bg-white border border-gray-100 rounded-2xl hover:border-emerald-500 hover:shadow-lg transition-all group text-left"
            >
              <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <MessageSquare size={20} />
              </div>
              <h3 className="font-bold text-gray-900 group-hover:text-emerald-600">Comments</h3>
              <p className="text-xs text-gray-500 mt-1">Moderate user discussions</p>
            </Link>

            <Link
              href="/admin/seo"
              className="p-6 bg-white border border-gray-100 rounded-2xl hover:border-cyan-500 hover:shadow-lg transition-all group text-left"
            >
              <div className="w-10 h-10 bg-cyan-50 text-cyan-600 rounded-lg flex items-center justify-center mb-4 group-hover:bg-cyan-600 group-hover:text-white transition-colors">
                <Search size={20} />
              </div>
              <h3 className="font-bold text-gray-900 group-hover:text-cyan-600">SEO Intelligence</h3>
              <p className="text-xs text-gray-500 mt-1">Analyze content performance</p>
            </Link>

            <Link
              href="/admin/ai-optimization"
              className="p-6 bg-white border border-gray-100 rounded-2xl hover:border-crypto-primary hover:shadow-lg transition-all group text-left"
            >
              <div className="w-10 h-10 bg-orange-50 text-crypto-primary rounded-lg flex items-center justify-center mb-4 group-hover:bg-crypto-primary group-hover:text-white transition-colors">
                <Bot size={20} />
              </div>
              <h3 className="font-bold text-gray-900 group-hover:text-crypto-primary">AI Optimization</h3>
              <p className="text-xs text-gray-500 mt-1">Prepare for AI Search</p>
            </Link>

            <Link
              href="/admin/users"
              className="p-6 bg-white border border-gray-100 rounded-2xl hover:border-purple-500 hover:shadow-lg transition-all group text-left"
            >
              <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                <Users size={20} />
              </div>
              <h3 className="font-bold text-gray-900 group-hover:text-purple-600">Users</h3>
              <p className="text-xs text-gray-500 mt-1">Manage accounts & roles</p>
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-50 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-900">Recent Comments</h2>
            <Link href="/admin/comments" className="text-xs font-bold text-blue-600 hover:underline">
              View All
            </Link>
          </div>
          <div className="flex-1 overflow-y-auto">
            {pendingComments.length > 0 ? (
              <div className="divide-y divide-gray-50">
                {pendingComments.map((comment) => (
                  <div key={comment.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-bold text-sm text-gray-900">{comment.authorName}</span>
                      <span className="text-[10px] text-gray-400">{format(new Date(comment.createdAt), "MMM d")}</span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2 italic">"{comment.content}"</p>
                    <div className="mt-2 text-xs text-blue-600 font-medium truncate">
                      on: {comment.post?.title}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-400">
                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <MessageSquare size={20} className="text-gray-300" />
                </div>
                <p className="text-sm">No pending comments.</p>
              </div>
            )}
          </div>
          <div className="p-4 bg-gray-50 border-t border-gray-100">
            <Link
              href="/admin/comments"
              className="block w-full py-2 bg-white border border-gray-200 text-gray-600 text-center rounded-lg text-sm font-bold hover:bg-gray-50 transition-colors"
            >
              Manage Comments
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
