"use client";
// src/app/(dashboard)/extraordinary/page.tsx
import {
    PlusCircle,
    Gift,
    Coins,
    Briefcase,
    TrendingUp,
    History,
    Info,
    Loader2
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { financialTransactionSchema } from "@/shared/schemas";
import { api } from "@/trpc/react";
import { useCurrencyStore } from "@/store/currency-store";
import { formatCurrencyGlobal } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { z } from "zod";

type ExtraFormValues = z.infer<typeof financialTransactionSchema>;

export default function ExtraordinaryIncomePage() {
    const utils = api.useUtils();
    const { currency, exchangeRate } = useCurrencyStore();

    const { data: history, isLoading: isLoadingHistory } = api.financial.getRecentTransactions.useQuery({
        limit: 20
    });

    const mutation = api.financial.registerTransaction.useMutation({
        onSuccess: () => {
            toast.success("Ingreso extraordinario registrado");
            reset({
                type: "INCOME",
                subtype: "EXTRAORDINARY",
                currency: "COP",
                occurredAt: new Date(),
                category: "Extraordinario",
                description: "",
            });
            utils.financial.getDashboardSummary.invalidate();
            utils.financial.getRecentTransactions.invalidate();
        },
        onError: (err) => {
            toast.error("Error: " + err.message);
        }
    });

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<ExtraFormValues>({
        resolver: zodResolver(financialTransactionSchema),
        defaultValues: {
            type: "INCOME",
            subtype: "EXTRAORDINARY",
            currency: "COP",
            category: "Extraordinario",
            occurredAt: new Date(),
        }
    });

    const selectedType = watch("extraordinaryType");

    const onSubmit = (data: ExtraFormValues) => {
        mutation.mutate({
            ...data,
            idempotencyKey: crypto.randomUUID(),
        });
    };

    const extraItems = [
        { label: "Primas", icon: Gift, color: "text-blue-400", bg: "bg-blue-500/10", type: "PRIMA" },
        { label: "Cesantías", icon: Briefcase, color: "text-violet-400", bg: "bg-violet-500/10", type: "CESANTIAS_INTEREST" },
        { label: "Bonificaciones", icon: Coins, color: "text-emerald-400", bg: "bg-emerald-500/10", type: "BONUS" },
        { label: "Otros Extras", icon: PlusCircle, color: "text-orange-400", bg: "bg-orange-500/10", type: "OTHER" },
    ];

    return (
        <div className="space-y-10">
            {/* ── Page Header ── */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3 text-white">
                        <PlusCircle className="w-8 h-8 text-blue-400" />
                        Ingresos Extraordinarios
                    </h1>
                    <p className="text-[#8899cc] mt-1">Gestiona tus entradas no recurrentes como primas y bonos.</p>
                </div>
            </div>

            {/* ── Selection Cards ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {extraItems.map((item, i) => (
                    <button
                        key={i}
                        type="button"
                        onClick={() => {
                            setValue("extraordinaryType", item.type as any);
                            setValue("description", item.label);
                        }}
                        className={`flex flex-col items-center p-8 rounded-2xl glass border border-white/8 hover:border-white/20 transition-all group ${selectedType === item.type ? 'ring-2 ring-blue-500/50 bg-white/5 border-blue-500/30' : ''}`}
                    >
                        <div className={`w-16 h-16 rounded-2xl ${item.bg} flex items-center justify-center ${item.color} group-hover:scale-110 transition-transform mb-4`}>
                            <item.icon className="w-8 h-8" />
                        </div>
                        <span className="font-bold text-white uppercase tracking-tight text-sm text-center">{item.label}</span>
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* ── Left: Form ── */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="glass border-white/8">
                        <CardHeader>
                            <CardTitle className="text-lg text-white">Detalle del Ingreso</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                <div className="space-y-2 text-white">
                                    <Label className="text-xs font-bold text-[#4a5880] uppercase tracking-wider">Monto Neto</Label>
                                    <Input
                                        type="number"
                                        placeholder="$ 0.00"
                                        className="h-12 rounded-xl bg-white/5 border-white/8 text-white focus:ring-blue-500/20"
                                        {...register("amount", { valueAsNumber: true })}
                                    />
                                    {errors.amount && <p className="text-xs text-rose-400 font-bold">{errors.amount.message}</p>}
                                </div>

                                <div className="space-y-2 text-white">
                                    <Label className="text-xs font-bold text-[#4a5880] uppercase tracking-wider">Descripción / Referencia</Label>
                                    <Input
                                        placeholder="Ej: Prima Diciembre"
                                        className="h-12 rounded-xl bg-white/5 border-white/8 text-white"
                                        {...register("description")}
                                    />
                                    {errors.description && <p className="text-xs text-rose-400 font-bold">{errors.description.message}</p>}
                                </div>

                                <div className="space-y-2 text-white">
                                    <Label className="text-xs font-bold text-[#4a5880] uppercase tracking-wider">Fecha de Recibo</Label>
                                    <Input
                                        type="date"
                                        className="h-12 rounded-xl bg-white/5 border-white/8 text-white"
                                        defaultValue={new Date().toISOString().split('T')[0]}
                                        onChange={(e) => setValue("occurredAt", new Date(e.target.value))}
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    disabled={isSubmitting || mutation.isPending || !selectedType}
                                    className="w-full h-12 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-bold transition-all shadow-lg shadow-blue-500/20"
                                >
                                    {(isSubmitting || mutation.isPending) ? <Loader2 className="w-5 h-5 animate-spin" /> : "Registrar Ingreso Extra"}
                                </Button>
                                {!selectedType && <p className="text-[10px] text-center text-[#4a5880] font-bold">Selecciona un tipo arriba primero</p>}
                            </form>
                        </CardContent>
                    </Card>
                </div>

                {/* ── Right: History ── */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="glass border-white/8">
                        <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 h-20 px-6">
                            <CardTitle className="text-lg flex items-center gap-2 text-white">
                                <History className="w-5 h-5 text-blue-400" />
                                Historial de Extras
                            </CardTitle>
                        </CardHeader>
                        <div className="p-0 overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-white/[0.02] text-[10px] font-black text-[#4a5880] uppercase tracking-widest border-b border-white/5">
                                        <th className="px-6 py-4">Concepto</th>
                                        <th className="px-6 py-4">Tipo</th>
                                        <th className="px-6 py-4">Monto</th>
                                        <th className="px-6 py-4">Fecha</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/[0.03]">
                                    {isLoadingHistory ? (
                                        <tr><td colSpan={4} className="p-10 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-500" /></td></tr>
                                    ) : (history?.filter((t: any) => t.subtype === 'EXTRAORDINARY') || []).map((row: any, i: number) => (
                                        <tr key={i} className="group hover:bg-white/[0.02] transition-colors">
                                            <td className="px-6 py-5">
                                                <span className="font-bold text-white text-sm uppercase tracking-tight">{row.description}</span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <Badge className="bg-blue-500/10 text-blue-400 border-none text-[10px] uppercase font-black">{row.extraordinaryType}</Badge>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className="font-black text-emerald-400">+ {formatCurrencyGlobal(Number(row.amount), currency, exchangeRate)}</span>
                                            </td>
                                            <td className="px-6 py-5 text-xs text-[#8899cc] font-medium">
                                                {new Date(row.occurredAt).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                    {history?.filter((t: any) => t.subtype === 'EXTRAORDINARY').length === 0 && !isLoadingHistory && (
                                        <tr><td colSpan={4} className="p-10 text-center text-[#4a5880] text-sm italic">No hay ingresos extraordinarios</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>

                    {/* AI Insights Card */}
                    <Card className="glass border-white/8 p-6 bg-gradient-to-br from-blue-500/10 to-transparent flex items-start gap-4">
                        <div className="mt-1 w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 flex-shrink-0">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                        <div className="text-white">
                            <h4 className="font-bold text-white">Sugerencia de Distribución</h4>
                            <p className="text-xs text-[#8899cc] mt-1 leading-relaxed">
                                Maximiza tus ingresos extras destinando una parte al ahorro de largo plazo antes de que entren a tu flujo de caja ordinario.
                            </p>
                        </div>
                    </Card>
                </div>

            </div>
        </div>
    );
}
