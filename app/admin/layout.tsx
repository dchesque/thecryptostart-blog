import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    if (!session || !session.user) {
        redirect("/login");
    }

    const userRoles = session.user.roles || [];

    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Sidebar */}
            <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
                <div className="p-6">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">Admin Panel</h2>
                </div>
                <nav className="mt-4">
                    <Link
                        href="/admin"
                        className="block px-6 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        Dashboard
                    </Link>
                    {userRoles.includes("ADMIN") && (
                        <Link
                            href="/admin/users"
                            className="block px-6 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                            Users
                        </Link>
                    )}
                    <Link
                        href="/admin/ai-optimization"
                        className="block px-6 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                    >
                        AI Optimization
                        <span className="text-[10px] bg-crypto-primary/10 text-crypto-primary px-1.5 py-0.5 rounded-full font-bold uppercase tracking-tighter">NEW</span>
                    </Link>
                    <Link
                        href="/"
                        className="block px-6 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        Back to Blog
                    </Link>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8">
                <header className="mb-8 flex justify-between items-center">
                    <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
                        Welcome, {session.user.name}
                    </h1>
                    <div className="flex items-center gap-4">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            {userRoles.join(", ")}
                        </span>
                    </div>
                </header>
                {children}
            </main>
        </div>
    );
}
