"use client";
// src/components/layout/header.tsx
import { Search, Bell, User as UserIcon, Calendar } from "lucide-react";
import { useSession } from "next-auth/react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useCurrencyStore } from "@/store/currency-store";

export function Header() {
    const { data: session } = useSession();
    const { currency, toggleCurrency } = useCurrencyStore();

    return (
        <header className="h-20 px-6 lg:px-10 border-b border-white/5 flex items-center justify-between glass sticky top-0 z-40">
            {/* ── Search Bar ── */}
            <div className="hidden md:flex items-center gap-3 px-4 py-2 rounded-xl bg-white/5 border border-white/8 w-96 group focus-within:border-blue-500/50 transition-all">
                <Search className="w-4 h-4 text-[#4a5880] group-focus-within:text-blue-400" />
                <input
                    type="text"
                    placeholder="Buscar transacciones, secciones..."
                    className="bg-transparent border-none outline-none text-sm text-white placeholder-[#4a5880] w-full"
                />
            </div>

            {/* ── Right Section ── */}
            <div className="flex items-center gap-6">
                {/* Date Display */}
                <div className="hidden lg:flex items-center gap-2 text-[#8899cc] text-sm font-medium">
                    <Calendar className="w-4 h-4" />
                    {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                </div>

                {/* Currency Switcher */}
                <button
                    onClick={toggleCurrency}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/8 text-white hover:bg-white/10 transition-all duration-300 group"
                    title="Cambiar Moneda"
                >
                    <span className="text-xs font-bold tracking-widest uppercase">{currency}</span>
                </button>

                {/* Notifications */}
                <button className="relative w-10 h-10 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center text-[#8899cc] hover:text-white hover:bg-white/10 transition-all">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-blue-500 border-2 border-[#0a0f1e]" />
                </button>

                {/* User Profile */}
                <DropdownMenu>
                    <DropdownMenuTrigger className="focus:outline-none">
                        <div className="flex items-center gap-3 cursor-pointer group">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-bold text-white leading-none">{session?.user?.name || "Usuario"}</p>
                                <p className="text-[10px] text-[#4a5880] font-black uppercase tracking-tighter mt-1">Plan Pro</p>
                            </div>
                            <Avatar className="w-10 h-10 border-2 border-white/10 group-hover:border-blue-500/50 transition-all">
                                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-violet-600 text-white font-bold">
                                    {session?.user?.name?.charAt(0) || <UserIcon className="w-5 h-5" />}
                                </AvatarFallback>
                            </Avatar>
                        </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56 glass border-white/10 text-white" align="end">
                        <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-white/5" />
                        <DropdownMenuItem className="hover:bg-white/10 focus:bg-white/10 cursor-pointer">Perfil</DropdownMenuItem>
                        <DropdownMenuItem className="hover:bg-white/10 focus:bg-white/10 cursor-pointer">Suscripción</DropdownMenuItem>
                        <DropdownMenuItem className="hover:bg-white/10 focus:bg-white/10 cursor-pointer">Seguridad</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
