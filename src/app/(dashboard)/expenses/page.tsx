"use client";
// src/app/(dashboard)/expenses/page.tsx
import {
    TrendingDown,
    Plus,
    Calendar as CalendarIcon,
    DollarSign,
    FileText,
    MoreVertical,
    ArrowDownRight,
    Loader2
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { EXPENSE_CATEGORIES } from "@/shared/constants";
import { financialTransactionSchema } from "@/shared/schemas";
import { api } from "@/trpc/react";
import { useCurrencyStore } from "@/store/currency-store";
import { formatCurrencyGlobal } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
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

type ExpenseFormValues = z.infer<typeof financialTransactionSchema>;

export default function ExpensesPage() {
    const utils = api.useUtils();
    const { currency, exchangeRate } = useCurrencyStore();

    const { data: history, isLoading: isLoadingHistory } = api.financial.getRecentTransactions.useQuery({
        limit: 20
    });

    const mutation = api.financial.registerTransaction.useMutation({
        onSuccess: () => {
            toast.success("Gasto registrado correctamente");
            reset();
            utils.financial.getDashboardSummary.invalidate();
            utils.financial.getRecentTransactions.invalidate();
        },
        onError: (err) => {
            toast.error("Error al registrar: " + err.message);
        }
    });

    const {
        register,
        handleSubmit,
        setValue,
        reset,
        formState: { errors, isSubmitting }
    } = useForm<ExpenseFormValues>({
        resolver: zodResolver(financialTransactionSchema),
        defaultValues: {
            type: "EXPENSE",
            subtype: "ORDINARY",
            currency: "COP",
            occurredAt: new Date(),
        }
    });

    const onSubmit = (data: ExpenseFormValues) => {
        mutation.mutate({
            ...data,
            idempotencyKey: crypto.randomUUID(),
        });
    };

    return (
        <div className="space-y-10">
            {/* ── Page Header ── */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                        <TrendingDown className="w-8 h-8 text-rose-400" />
                        Egresos
                    </h1>
                    <p className="text-[#8899cc] mt-1">Registra y controla cada salida de dinero.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* ── Left: Add Form ── */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="glass border-white/8">
                        <CardHeader>
                            <CardTitle className="text-lg">Registrar Gasto</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-[#4a5880] uppercase tracking-wider">Monto</Label>
                                    <div className="relative group">
                                        <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4a5880] group-focus-within:text-rose-400 transition-colors" />
                                        <Input
                                            type="number"
                                            placeholder="0.00"
                                            className="pl-10 h-12 rounded-xl bg-white/5 border-white/8 text-white focus:ring-rose-500/20"
                                            {...register("amount", { valueAsNumber: true })}
                                        />
                                    </div>
                                    {errors.amount && <p className="text-xs text-rose-400 font-bold">{errors.amount.message}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-[#4a5880] uppercase tracking-wider">Categoría</Label>
                                    <Select onValueChange={(val) => setValue("category", val)}>
                                        <SelectTrigger className="h-12 rounded-xl bg-white/5 border-white/8 text-white">
                                            <SelectValue placeholder="Seleccionar categoría" />
                                        </SelectTrigger>
                                        <SelectContent className="glass border-white/10 text-white">
                                            {EXPENSE_CATEGORIES.map(cat => (
                                                <SelectItem key={cat} value={cat} className="hover:bg-white/10 cursor-pointer">{cat}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.category && <p className="text-xs text-rose-400 font-bold">{errors.category.message}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-[#4a5880] uppercase tracking-wider">Descripción</Label>
                                    <div className="relative group">
                                        <FileText className="absolute left-3.5 top-3.5 w-4 h-4 text-[#4a5880] group-focus-within:text-rose-400 transition-colors" />
                                        <Input
                                            placeholder="Escribe un detalle..."
                                            className="pl-10 h-12 rounded-xl bg-white/5 border-white/8 text-white"
                                            {...register("description")}
                                        />
                                    </div>
                                    {errors.description && <p className="text-xs text-rose-400 font-bold">{errors.description.message}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-bold text-[#4a5880] uppercase tracking-wider">Fecha de Gasto</Label>
                                    <div className="relative group">
                                        <CalendarIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4a5880] group-focus-within:text-rose-400 transition-colors" />
                                        <Input
                                            type="date"
                                            className="pl-10 h-12 rounded-xl bg-white/5 border-white/8 text-white"
                                            defaultValue={new Date().toISOString().split('T')[0]}
                                            onChange={(e) => setValue("occurredAt", new Date(e.target.value))}
                                        />
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={isSubmitting || mutation.isPending}
                                    className="w-full h-12 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold transition-all shadow-lg shadow-rose-500/20 active:scale-[0.98]"
                                >
                                    {(isSubmitting || mutation.isPending) ? <Loader2 className="w-5 h-5 animate-spin" /> : "Guardar Egreso"}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    <Card className="glass border-white/8 bg-gradient-to-br from-rose-500/10 to-transparent">
                        <CardContent className="p-6">
                            <h4 className="text-sm font-bold text-white mb-2">Presupuesto</h4>
                            <p className="text-xs text-[#8899cc] leading-relaxed">
                                Los gastos de vivienda no deberían exceder el 30% de tus ingresos totales. ¡Monitoriza de cerca esta categoría!
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* ── Right: List/History ── */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="glass border-white/8 overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 h-20 px-6">
                            <CardTitle className="text-lg text-white">Historial de Gastos</CardTitle>
                        </CardHeader>
                        <div className="divide-y divide-white/[0.03]">
                            {isLoadingHistory ? (
                                <div className="p-10 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-rose-400" /></div>
                            ) : (history?.filter((t: any) => t.type === 'EXPENSE') || []).map((item: any, i: number) => (
                                <div key={i} className="p-6 flex items-center justify-between hover:bg-white/[0.02] transition-colors group">
                                    <div className="flex items-center gap-5">
                                        <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-400 group-hover:scale-110 transition-transform">
                                            <ArrowDownRight className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-white text-base leading-tight uppercase tracking-tight">{item.description}</h4>
                                            <p className="text-xs text-[#4a5880] uppercase font-black tracking-wider mt-1">
                                                {item.category} · {new Date(item.occurredAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                            <p className="text-lg font-black text-rose-400 leading-none">- {formatCurrencyGlobal(Number(item.amount), currency, exchangeRate)}</p>
                                            <p className="text-[10px] text-rose-500/60 font-bold uppercase mt-1 tracking-tighter">
                                                {item.status}
                                            </p>
                                        </div>
                                        <Button variant="ghost" size="icon" className="text-[#4a5880] hover:text-white rounded-xl">
                                            <MoreVertical className="w-5 h-5" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                            {(history?.filter((t: any) => t.type === 'EXPENSE').length === 0) && !isLoadingHistory && (
                                <div className="p-10 text-center text-[#4a5880] text-sm italic py-20">No hay gastos registrados</div>
                            )}
                        </div>
                    </Card>
                </div>

            </div>
        </div>
    );
}
