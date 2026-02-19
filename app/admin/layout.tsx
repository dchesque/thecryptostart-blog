import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/Sidebar";

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
        <div className="flex min-h-screen bg-gray-50 font-sans">
            {/* Fixed Sidebar */}
            <AdminSidebar
                userRoles={userRoles}
                userName={session.user.name}
                userImage={session.user.image}
            />

            {/* Main Content Area - Shifted right to accommodate fixed sidebar */}
            <main className="flex-1 ml-64 min-w-0">
                <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 px-8 py-4 flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                            <span>Admin</span>
                            <span>/</span>
                            <span className="text-gray-600 font-medium">Overview</span>
                        </div>
                        <h1 className="text-xl font-bold text-gray-900">
                            Welcome back, {session.user.name?.split(' ')[0]}
                        </h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-full border border-green-100">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            <span className="text-xs font-bold uppercase tracking-wide">System Live</span>
                        </div>

                        <div className="h-8 w-px bg-gray-100 mx-2"></div>

                        <div className="flex gap-1">
                            {userRoles.map(role => (
                                <span key={role} className="px-2 py-1 bg-crypto-darker text-white text-[10px] font-bold uppercase rounded-md">
                                    {role}
                                </span>
                            ))}
                        </div>
                    </div>
                </header>

                <div className="p-8 max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {children}
                </div>
            </main>
        </div>
    );
}
