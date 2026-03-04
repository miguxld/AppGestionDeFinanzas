"use client";
// src/components/layout/sidebar.tsx
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    TrendingUp,
    TrendingDown,
    Wallet,
    PlusCircle,
    Settings,
    LogOut,
    ChevronLeft,
    DollarSign,
    BarChart3
} from "lucide-react";
import { useState } from "react";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
    { label: "Dashboard", icon: LayoutDashboard, href: "/" },
    { label: "Ingresos", icon: TrendingUp, href: "/income" },
    { label: "Egresos", icon: TrendingDown, href: "/expenses" },
    { label: "Presupuestos", icon: Wallet, href: "/budgets" }, // Using Wallet or similar icon
    { label: "Ahorros", icon: Wallet, href: "/savings" },
    { label: "Extraordinarios", icon: PlusCircle, href: "/extraordinary" },
    { label: "Analítica", icon: BarChart3, href: "/analytics" }
];

export function Sidebar() {
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <aside className={cn(
            "h-screen glass border-r relative flex flex-col transition-all duration-300 z-50",
            isCollapsed ? "w-20" : "w-64"
        )}>
            {/* ── Logo ── */}
            <div className="p-6 h-20 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/20 flex-shrink-0">
                    <DollarSign className="w-5 h-5 text-white" />
                </div>
                {!isCollapsed && <span className="font-bold text-lg tracking-tight text-white animate-fade-in">Finanzas</span>}
            </div>

            {/* ── Navigation ── */}
            <nav className="flex-1 px-3 space-y-1.5 mt-4">
                {NAV_ITEMS.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "sidebar-link flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all group",
                                isActive
                                    ? "bg-blue-500/10 text-blue-400 border-l-2 border-blue-500"
                                    : "text-[#8899cc] hover:text-white hover:bg-white/5"
                            )}
                        >
                            <item.icon className={cn("w-5 h-5", isActive ? "text-blue-400" : "group-hover:scale-110 transition-transform")} />
                            {!isCollapsed && <span className="animate-fade-in">{item.label}</span>}
                            {!isCollapsed && isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500 shadow-lg shadow-blue-500/50" />}
                        </Link>
                    );
                })}
            </nav>

            {/* ── Bottom Section ── */}
            <div className="p-3 space-y-1.5 border-t border-white/5">
                <Link
                    href="/settings"
                    className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-[#c4d0ec] hover:bg-white/5 transition-all group"
                >
                    <Settings className="w-5 h-5 group-hover:rotate-45 transition-transform" />
                    {!isCollapsed && <span>Configuración</span>}
                </Link>
                <button
                    onClick={() => signOut()}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-500/10 transition-all group"
                >
                    <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    {!isCollapsed && <span>Cerrar sesión</span>}
                </button>
            </div>

            {/* ── Collapse Toggle ── */}
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute -right-3 top-24 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white border-2 border-[#0a0f1e] shadow-lg hover:scale-110 transition-all active:scale-90"
            >
                <ChevronLeft className={cn("w-3.5 h-3.5 transition-transform", isCollapsed && "rotate-180")} />
            </button>
        </aside>
    );
}
