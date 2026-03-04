"use client";
// src/app/login/page.tsx
// Premium login page — dark glassmorphism design

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, TrendingUp, DollarSign, Shield, BarChart3 } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const result = await signIn("credentials", {
                email: email.toLowerCase(),
                password,
                redirect: false,
            });

            if (result?.error) {
                setError("Credenciales incorrectas. Verifica tu email y contraseña.");
            } else {
                router.push("/");
                router.refresh();
            }
        } catch {
            setError("Error de conexión. Intenta de nuevo.");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-[#060912] flex">
            {/* ── Left Panel: Branding ── */}
            <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden">
                {/* Background gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#0f1629] via-[#0a0f1e] to-[#060912]" />
                <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

                <div className="relative z-10">
                    {/* Logo */}
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
                            <DollarSign className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold text-white tracking-tight">Finanzas</span>
                    </div>
                </div>

                {/* Center features */}
                <div className="relative z-10 space-y-6">
                    <div>
                        <h1 className="text-4xl font-bold text-white leading-tight mb-4">
                            Tu vida financiera,<br />
                            <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
                                bajo control total.
                            </span>
                        </h1>
                        <p className="text-[#8899cc] text-lg leading-relaxed">
                            Registra ingresos, controla gastos, construye tu ahorro y gestiona tus ingresos extraordinarios en un solo lugar.
                        </p>
                    </div>

                    <div className="space-y-4">
                        {[
                            { icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-400/10", label: "Flujo de caja en tiempo real" },
                            { icon: BarChart3, color: "text-blue-400", bg: "bg-blue-400/10", label: "Reportes financieros precisos" },
                            { icon: Shield, color: "text-violet-400", bg: "bg-violet-400/10", label: "Datos privados y seguros" },
                        ].map((item) => (
                            <div key={item.label} className="flex items-center gap-4 group">
                                <div className={`w-10 h-10 rounded-lg ${item.bg} flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110`}>
                                    <item.icon className={`w-5 h-5 ${item.color}`} />
                                </div>
                                <span className="text-[#c4d0ec] font-medium">{item.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bottom quote */}
                <div className="relative z-10">
                    <p className="text-[#4a5880] text-sm">
                        &ldquo;El control financiero no es austeridad — es libertad.&rdquo;
                    </p>
                </div>
            </div>

            {/* ── Right Panel: Login Form ── */}
            <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
                <div className="w-full max-w-md animate-fade-in">
                    {/* Mobile logo */}
                    <div className="flex items-center gap-3 mb-8 lg:hidden">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
                            <DollarSign className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold text-white">Finanzas</span>
                    </div>

                    {/* Card */}
                    <div className="glass rounded-2xl p-8 border border-white/8">
                        <div className="mb-8">
                            <h2 className="text-2xl font-bold text-white mb-2">Bienvenido de vuelta</h2>
                            <p className="text-[#8899cc]">Inicia sesión para ver tu resumen financiero</p>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Email */}
                            <div className="space-y-1.5">
                                <label htmlFor="email" className="text-sm font-medium text-[#c4d0ec]">
                                    Correo electrónico
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="tu@email.com"
                                    required
                                    autoComplete="email"
                                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/8 text-white placeholder-[#4a5880] focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all text-sm"
                                />
                            </div>

                            {/* Password */}
                            <div className="space-y-1.5">
                                <label htmlFor="password" className="text-sm font-medium text-[#c4d0ec]">
                                    Contraseña
                                </label>
                                <div className="relative">
                                    <input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                        autoComplete="current-password"
                                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/8 text-white placeholder-[#4a5880] focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all text-sm pr-12"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#4a5880] hover:text-[#8899cc] transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            {/* Submit */}
                            <button
                                id="login-submit"
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 text-white font-semibold text-sm transition-all hover:from-blue-500 hover:to-violet-500 hover:shadow-lg hover:shadow-blue-500/25 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                            >
                                {isLoading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Iniciando sesión...
                                    </span>
                                ) : (
                                    "Iniciar sesión"
                                )}
                            </button>
                        </form>

                        <div className="mt-6 text-center">
                            <p className="text-[#4a5880] text-sm">
                                ¿No tienes cuenta?{" "}
                                <Link href="/register" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                                    Regístrate gratis
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
