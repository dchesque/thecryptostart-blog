"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    MessageSquare,
    Users,
    Bot,
    BarChart,
    Search,
    ArrowLeft,
    LogOut,
    Settings,
    FileText,
    FolderTree,
    UserCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
    userRoles: string[];
    userName?: string | null;
    userImage?: string | null;
}

export function AdminSidebar({ userRoles, userName, userImage }: SidebarProps) {
    const pathname = usePathname();

    const links = [
        {
            href: "/admin",
            label: "Dashboard",
            icon: LayoutDashboard,
            exact: true,
        },
        {
            href: "/admin/ai-optimization",
            label: "AI Optimization",
            icon: Bot,
            badge: "NEW",
        },
        {
            href: "/admin/comments",
            label: "Comments",
            icon: MessageSquare,
        },
        {
            href: "/admin/posts",
            label: "Posts",
            icon: FileText,
        },
        {
            href: "/admin/categories",
            label: "Categories",
            icon: FolderTree,
        },
        {
            href: "/admin/authors",
            label: "Authors",
            icon: UserCircle,
        },
        {
            href: "/admin/gsc-dashboard",
            label: "GSC Dashboard",
            icon: BarChart,
        },
        {
            href: "/admin/seo",
            label: "SEO Intelligence",
            icon: Search,
        },
    ];

    if (userRoles.includes("ADMIN")) {
        links.splice(2, 0, {
            href: "/admin/users",
            label: "Users",
            icon: Users,
        });
    }

    const isActive = (path: string, exact = false) => {
        return exact ? pathname === path : pathname.startsWith(path);
    };

    return (
        <aside className="w-64 bg-crypto-darker text-white flex flex-col h-screen fixed left-0 top-0 z-50 overflow-y-auto border-r border-white/5">
            {/* Brand */}
            <div className="p-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-crypto-primary rounded-lg flex items-center justify-center">
                    <Settings className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h1 className="font-bold text-lg leading-none">Admin Panel</h1>
                    <p className="text-xs text-gray-400 mt-1">TheCryptoStart</p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-1 mt-4">
                {links.map((link) => {
                    const active = isActive(link.href, link.exact);
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative",
                                active
                                    ? "bg-crypto-primary/10 text-crypto-primary font-medium"
                                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                            )}
                        >
                            <link.icon className={cn("w-5 h-5", active ? "text-crypto-primary" : "text-gray-500 group-hover:text-white")} />
                            <span>{link.label}</span>
                            {link.badge && (
                                <span className="ml-auto text-[10px] bg-crypto-primary text-white px-1.5 py-0.5 rounded-md font-bold">
                                    {link.badge}
                                </span>
                            )}
                            {active && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-crypto-primary rounded-r-full" />
                            )}
                        </Link>
                    );
                })}

                <div className="my-6 border-b border-white/5 mx-4" />

                <Link
                    href="/"
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-white/5 hover:text-white transition-all group"
                >
                    <ArrowLeft className="w-5 h-5 text-gray-500 group-hover:text-white" />
                    <span>Back to Blog</span>
                </Link>
            </nav>

            {/* User Footer */}
            <div className="p-4 mt-auto border-t border-white/5 bg-black/20">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-crypto-dark flex items-center justify-center border border-white/10 text-crypto-primary font-bold">
                        {userName?.charAt(0) || "U"}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate text-white">{userName}</p>
                        <p className="text-xs text-gray-500 truncate flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                            Online
                        </p>
                    </div>
                    <button className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </aside>
    );
}
