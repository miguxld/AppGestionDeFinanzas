"use client";
// src/app/(dashboard)/savings/page.tsx
import { useState } from "react";
import {
    Wallet,
    Plus,
    Target,
    TrendingUp,
    MoreVertical,
    ChevronRight,
    PieChart,
    Coins,
    Loader2
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { savingsSectionSchema } from "@/shared/schemas";
import { api } from "@/trpc/react";
import { useCurrencyStore } from "@/store/currency-store";
import { formatCurrencyGlobal } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { z } from "zod";

type SavingsSectionValues = z.infer<typeof savingsSectionSchema>;

export default function SavingsPage() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const utils = api.useUtils();
    const { currency, exchangeRate } = useCurrencyStore();

    const { data: sections, isLoading } = api.financial.getSavingsSections.useQuery();

    const createMutation = api.financial.createSavingsSection.useMutation({
        onSuccess: () => {
            toast.success("Sección de ahorro creada");
            setIsDialogOpen(false);
            reset();
            utils.financial.getSavingsSections.invalidate();
        },
        onError: (err) => {
            toast.error("Error: " + err.message);
        }
    });

    const {
        register,
        handleSubmit,
        setValue,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<SavingsSectionValues>({
        resolver: zodResolver(savingsSectionSchema),
        defaultValues: {
            strategyType: "FIXED",
            color: "#3b65f5",
            emoji: "🏦",
        }
    });

    const onSubmit = (data: SavingsSectionValues) => {
        createMutation.mutate(data);
    };

    return (
        <div className="space-y-10">
            {/* ── Page Header ── */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3 text-white">
                        <Wallet className="w-8 h-8 text-blue-400" />
                        Ahorros
                    </h1>
                    <p className="text-[#8899cc] mt-1">Gestiona tus fondos y alcanza tus metas financieras.</p>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-blue-500 hover:bg-blue-600 text-white gap-2 px-6 rounded-xl shadow-lg shadow-blue-500/20">
                            <Plus className="w-4 h-4" />
                            Nueva Sección
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="glass border-white/10 text-white">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold">Crear Sección de Ahorro</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
                            <div className="space-y-2">
                                <Label className="text-xs uppercase font-bold text-[#4a5880]">Nombre</Label>
                                <Input
                                    placeholder="Ej: Fondo de Emergencia"
                                    className="bg-white/5 border-white/10"
                                    {...register("name")}
                                />
                                {errors.name && <p className="text-xs text-rose-400 font-bold">{errors.name.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs uppercase font-bold text-[#4a5880]">Propósito</Label>
                                <Input
                                    placeholder="Ej: 6 meses de gastos"
                                    className="bg-white/5 border-white/10"
                                    {...register("purpose")}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs uppercase font-bold text-[#4a5880]">Meta (Opcional)</Label>
                                    <Input
                                        type="number"
                                        placeholder="0"
                                        className="bg-white/5 border-white/10"
                                        {...register("goalAmount", { valueAsNumber: true })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs uppercase font-bold text-[#4a5880]">Estrategia</Label>
                                    <Select onValueChange={(val) => setValue("strategyType", val as "FIXED" | "PERCENTAGE" | "GOAL")}>
                                        <SelectTrigger className="bg-white/5 border-white/10">
                                            <SelectValue placeholder="Seleccionar" />
                                        </SelectTrigger>
                                        <SelectContent className="glass border-white/10 text-white">
                                            <SelectItem value="FIXED">Monto Fijo</SelectItem>
                                            <SelectItem value="PERCENTAGE">Porcentaje</SelectItem>
                                            <SelectItem value="GOAL">Meta Final</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <Button
                                type="submit"
                                disabled={isSubmitting || createMutation.isPending}
                                className="w-full bg-blue-600 hover:bg-blue-500 font-bold h-12 rounded-xl mt-4"
                            >
                                {(isSubmitting || createMutation.isPending) ? <Loader2 className="w-5 h-5 animate-spin" /> : "Crear Sección"}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* ── Stats Overview ── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: "Total Ahorrado", value: formatCurrencyGlobal(sections?.reduce((acc: number, s: any) => acc + Number(s.currentBalance), 0) ?? 0, currency, exchangeRate), icon: Wallet, color: "text-blue-400", bg: "bg-blue-500/10" },
                    { label: "Secciones Activas", value: sections?.length.toString() ?? "0", icon: Target, color: "text-emerald-400", bg: "bg-emerald-500/10" },
                    { label: "Crecimiento", value: "+$0", icon: TrendingUp, color: "text-violet-400", bg: "bg-violet-500/10" },
                ].map((stat, i) => (
                    <Card key={i} className="glass border-white/8 relative overflow-hidden group">
                        <CardContent className="p-6 flex items-center gap-5">
                            <div className={`w-14 h-14 rounded-2xl ${stat.bg} flex items-center justify-center ${stat.color} group-hover:scale-110 transition-transform`}>
                                <stat.icon className="w-7 h-7" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-[#4a5880] uppercase tracking-widest">{stat.label}</p>
                                <h3 className="text-2xl font-black text-white mt-1">{stat.value}</h3>
                            </div>
                        </CardContent>
                        <div className={`absolute bottom-0 left-0 h-1 ${stat.bg.replace('/10', '/30')} w-full`} />
                    </Card>
                ))}
            </div>

            {/* ── Sections Grid ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {isLoading ? (
                    <div className="col-span-full py-20 flex justify-center"><Loader2 className="w-12 h-12 animate-spin text-blue-400" /></div>
                ) : sections?.map((section: any, i: number) => {
                    const target = Number(section.goalAmount) || 0;
                    const balance = Number(section.currentBalance);
                    const progress = target > 0 ? Math.min(Math.round((balance / target) * 100), 100) : 0;

                    return (
                        <Card key={i} className="glass border-white/8 group hover:border-white/20 transition-all">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <div className="flex items-center gap-4">
                                    <div className="text-3xl">{section.emoji || "💰"}</div>
                                    <div>
                                        <CardTitle className="text-xl font-bold text-white uppercase tracking-tight">{section.name}</CardTitle>
                                        <p className="text-xs text-[#4a5880] font-medium">{section.purpose || section.strategyType}</p>
                                    </div>
                                </div>
                                <Button variant="ghost" size="icon" className="text-[#4a5880] hover:text-white">
                                    <MoreVertical className="w-5 h-5" />
                                </Button>
                            </CardHeader>
                            <CardContent className="space-y-6 pt-4">
                                <div className="flex justify-between items-end">
                                    <div>
                                        <p className="text-[10px] font-bold text-[#4a5880] uppercase tracking-tighter mb-1">Balance Actual</p>
                                        <h4 className="text-2xl font-black text-white">{formatCurrencyGlobal(balance, currency, exchangeRate)}</h4>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-bold text-[#4a5880] uppercase tracking-tighter mb-1">Meta: {target > 0 ? formatCurrencyGlobal(target, currency, exchangeRate) : "N/A"}</p>
                                        <Badge className="bg-white/5 text-[#8899cc] border-white/8">{progress}% completado</Badge>
                                    </div>
                                </div>

                                <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden relative">
                                    <div
                                        className={`h-full bg-gradient-to-r transition-all duration-1000 ease-out rounded-full from-blue-600 to-blue-400`}
                                        style={{ width: `${target > 0 ? progress : 100}%` }}
                                    />
                                    <div className="absolute inset-0 bg-white/5 animate-pulse-subtle pointer-events-none" />
                                </div>

                                <div className="flex items-center justify-between pt-2">
                                    <div className="flex -space-x-2">
                                        <div className="w-6 h-6 rounded-full border-2 border-[#0a0f1e] bg-white/5 flex items-center justify-center">
                                            <Plus className="w-2.5 h-2.5 text-[#4a5880]" />
                                        </div>
                                    </div>
                                    <Button variant="ghost" className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/5 gap-1.5 text-xs font-bold px-3 py-1 rounded-lg">
                                        Detalles
                                        <ChevronRight className="w-3 h-3" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
                {(!sections || sections.length === 0) && !isLoading && (
                    <div className="col-span-full py-20 text-center glass border-dashed border-white/10 rounded-3xl">
                        <Coins className="w-12 h-12 text-[#4a5880] mx-auto mb-4" />
                        <p className="text-[#8899cc] font-medium">No tienes secciones de ahorro creadas todavía.</p>
                        <Button variant="link" className="text-blue-400" onClick={() => setIsDialogOpen(true)}>
                            Crea tu primera meta ahora
                        </Button>
                    </div>
                )}
            </div>

            {/* ── Additional Info ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2 glass border-white/8 p-8 flex flex-col md:flex-row gap-8 items-center bg-gradient-to-r from-blue-500/5 to-transparent">
                    <div className="w-32 h-32 rounded-3xl bg-blue-500/10 flex items-center justify-center text-blue-400 flex-shrink-0">
                        <PieChart className="w-16 h-16" />
                    </div>
                    <div className="space-y-4 text-white">
                        <h3 className="text-2xl font-bold">Optimiza tus Ahorros</h3>
                        <p className="text-[#8899cc] leading-relaxed">
                            Basado en tu flujo de caja promedio (FCO), podrías aumentar tu ahorro mensual un <span className="text-white font-bold">12%</span> si optimizas tus gastos ordinarios.
                        </p>
                        <Button className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 rounded-xl px-6">
                            Ver sugerencia IA
                        </Button>
                    </div>
                </Card>

                <Card className="glass border-white/8 p-8 bg-gradient-to-br from-violet-500/10 to-transparent">
                    <div className="w-12 h-12 rounded-2xl bg-violet-500/20 flex items-center justify-center text-violet-400 mb-6">
                        <Coins className="w-6 h-6" />
                    </div>
                    <h4 className="text-lg font-bold mb-3 text-white">Depósitos Recientes</h4>
                    <div className="space-y-4">
                        <div className="p-10 text-center text-[#4a5880] text-xs italic">Próximamente...</div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
