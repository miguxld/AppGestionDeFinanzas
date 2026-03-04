"use client";
// src/app/register/page.tsx
// Premium registration page with financial features highlights

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, DollarSign, CheckCircle2, ArrowLeft } from "lucide-react";
import { api } from "@/trpc/react";

export default function RegisterPage() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");

    const register = api.auth.register.useMutation({
        onSuccess: () => {
            router.push("/login?registered=true");
        },
        onError: (err) => {
            setError(err.message || "Error al registrar usuario.");
        },
    });

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        register.mutate({ name, email: email.toLowerCase(), password });
    }

    return (
        <div className="min-h-screen bg-[#060912] flex flex-col items-center justify-center p-6">
            {/* Background decoration */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-violet-600/5 rounded-full blur-3xl" />
            </div>

            <div className="w-full max-w-xl animate-fade-in relative z-10">
                {/* Back Link */}
                <Link href="/login" className="inline-flex items-center gap-2 text-[#4a5880] hover:text-[#8899cc] transition-colors mb-8 text-sm font-medium group">
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                    Volver al inicio
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">

                    {/* ── Left: Highlights ── */}
                    <div className="space-y-8 py-4">
                        <div>
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg mb-6">
                                <DollarSign className="w-5 h-5 text-white" />
                            </div>
                            <h1 className="text-3xl font-bold text-white tracking-tight leading-tight">
                                Empieza tu viaje hacia la <span className="text-blue-400">libertad financiera.</span>
                            </h1>
                        </div>

                        <div className="space-y-6">
                            {[
                                { title: "Dashboard Personal", desc: "Vista 360° de tus activos y pasivos." },
                                { title: "Metas de Ahorro", desc: "Crea secciones y ve cómo crecen." },
                                { title: "Ingresos Extra", desc: "Gestiona primas y bonos inteligentemente." },
                            ].map((item, i) => (
                                <div key={i} className="flex gap-4">
                                    <div className="mt-1">
                                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                                    </div>
                                    <div>
                                        <h4 className="text-white font-semibold text-sm">{item.title}</h4>
                                        <p className="text-[#8899cc] text-xs mt-0.5 leading-relaxed">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ── Right: Form Card ── */}
                    <div className="glass rounded-2xl p-8 border border-white/8 glow-brand/5">
                        <h2 className="text-xl font-bold text-white mb-6">Crea tu cuenta</h2>

                        {error && (
                            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm italic">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-1.5">
                                <label htmlFor="name" className="text-xs font-bold text-[#4a5880] uppercase tracking-wider">Nombre Completo</label>
                                <input
                                    id="name"
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Ej: Juan Pérez"
                                    required
                                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/8 text-white placeholder-[#4a5880] focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label htmlFor="email" className="text-xs font-bold text-[#4a5880] uppercase tracking-wider">Correo Electrónico</label>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="tu@email.com"
                                    required
                                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/8 text-white placeholder-[#4a5880] focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label htmlFor="password" className="text-xs font-bold text-[#4a5880] uppercase tracking-wider">Contraseña</label>
                                <div className="relative">
                                    <input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Mínimo 8 caracteres"
                                        required
                                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/8 text-white placeholder-[#4a5880] focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm pr-12"
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

                            <button
                                type="submit"
                                disabled={register.isPending}
                                className="w-full py-4 rounded-xl bg-[#3b65f5] text-white font-bold text-sm transition-all hover:bg-blue-500 hover:shadow-[0_0_20px_rgba(59,101,245,0.3)] disabled:opacity-50 active:scale-[0.98]"
                            >
                                {register.isPending ? "Creando cuenta..." : "Comenzar gratis"}
                            </button>

                            <p className="text-[10px] text-[#4a5880] text-center leading-relaxed">
                                Al registrarte, aceptas nuestros Términos de Servicio y Política de Privacidad centrada en la seguridad de tus datos.
                            </p>
                        </form>

                        <div className="mt-8 pt-6 border-t border-white/5 text-center">
                            <p className="text-[#8899cc] text-xs">
                                ¿Ya tienes una cuenta?{" "}
                                <Link href="/login" className="text-blue-400 hover:text-blue-300 font-bold ml-1 transition-colors">
                                    Inicia sesión
                                </Link>
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
