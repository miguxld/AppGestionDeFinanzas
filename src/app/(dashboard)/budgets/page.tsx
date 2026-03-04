"use client";

import React, { useState } from "react";
import { api } from "@/trpc/react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger
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
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    Target,
    AlertTriangle,
    CheckCircle2,
    Plus,
    Trash2,
    Calendar
} from "lucide-react";
import { cn } from "@/lib/utils";

const budgetFormSchema = z.object({
    category: z.string().min(1, "Selecciona una categoría"),
    amount: z.number().positive("El monto debe ser positivo"),
});

type BudgetFormValues = z.infer<typeof budgetFormSchema>;

export default function BudgetsPage() {
    const [selectedDate, setSelectedDate] = useState({
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
    });

    const utils = api.useUtils();

    // 1. Fetch Budgets
    const { data: budgets, isLoading } = api.budget.getBudgets.useQuery({
        month: selectedDate.month,
        year: selectedDate.year,
    });

    // 2. Mutations
    const upsertMutation = api.budget.upsertBudget.useMutation({
        onSuccess: () => {
            toast.success("Presupuesto actualizado");
            utils.budget.getBudgets.invalidate();
        },
        onError: (err) => toast.error(`Error: ${err.message}`),
    });

    const deleteMutation = api.budget.deleteBudget.useMutation({
        onSuccess: () => {
            toast.success("Presupuesto eliminado");
            utils.budget.getBudgets.invalidate();
        },
    });

    // 3. Form Handling
    const {
        register,
        handleSubmit,
        reset,
        setValue,
        formState: { errors }
    } = useForm<BudgetFormValues>({
        resolver: zodResolver(budgetFormSchema),
        defaultValues: {
            category: "",
            amount: 0,
        }
    });

    const onSubmit = (values: BudgetFormValues) => {
        upsertMutation.mutate({
            ...values,
            month: selectedDate.month,
            year: selectedDate.year,
        });
        reset();
    };

    if (isLoading) return <div className="p-8 text-white">Cargando presupuestos...</div>;

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            {/* Header Section */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-3">
                        <Target className="w-10 h-10 text-blue-500" />
                        Presupuestos
                    </h1>
                    <p className="text-[#8899cc] mt-2 text-lg">Controla tus límites de gasto por categoría</p>
                </div>

                <div className="flex items-center gap-4">
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6 h-12 font-bold shadow-lg shadow-blue-500/20 transition-all active:scale-95">
                                <Plus className="w-5 h-5 mr-2" />
                                Definir Límite
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="glass border-white/10 bg-[#090b16]/95 text-white">
                            <DialogHeader>
                                <DialogTitle className="text-xl font-bold">Asignar Presupuesto</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-4">
                                <div className="space-y-2">
                                    <Label>Categoría</Label>
                                    <Select onValueChange={(val) => setValue("category", val)}>
                                        <SelectTrigger className="glass border-white/10">
                                            <SelectValue placeholder="Selecciona categoría" />
                                        </SelectTrigger>
                                        <SelectContent className="glass border-white/10 bg-[#090b16] text-white">
                                            <SelectItem value="Alimentación">Alimentación</SelectItem>
                                            <SelectItem value="Transporte">Transporte</SelectItem>
                                            <SelectItem value="Vivienda">Vivienda</SelectItem>
                                            <SelectItem value="Salud">Salud</SelectItem>
                                            <SelectItem value="Entretenimiento">Entretenimiento</SelectItem>
                                            <SelectItem value="Otros">Otros</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.category && <p className="text-xs text-rose-400">{errors.category.message}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label>Monto Mensual (COP)</Label>
                                    <Input
                                        type="number"
                                        placeholder="0.00"
                                        className="glass border-white/10"
                                        {...register("amount", { valueAsNumber: true })}
                                    />
                                    {errors.amount && <p className="text-xs text-rose-400">{errors.amount.message}</p>}
                                </div>

                                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 h-12 font-bold">
                                    Guardar Presupuesto
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </header>

            {/* Grid of Budgets */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {budgets?.map((budget) => {
                    const isOver = budget.progress >= 100;
                    const isWarning = budget.progress >= 80 && !isOver;

                    return (
                        <Card key={budget.id} className="glass border-white/5 overflow-hidden group hover:border-white/10 transition-all duration-300">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <div className="space-y-1">
                                    <CardTitle className="text-lg font-bold text-white">{budget.category}</CardTitle>
                                    <p className="text-xs text-[#8899cc]">Límite: ${budget.amount.toLocaleString()}</p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => deleteMutation.mutate({ id: budget.id })}
                                    className="opacity-0 group-hover:opacity-100 text-rose-400 hover:bg-rose-500/10 transition-all rounded-lg"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </CardHeader>
                            <CardContent className="pt-4">
                                <div className="flex justify-between items-end mb-2">
                                    <div className="space-y-1">
                                        <span className="text-2xl font-black text-white">${budget.consumed.toLocaleString()}</span>
                                        <p className="text-[10px] text-[#4a5880] uppercase font-bold tracking-wider">Consumido</p>
                                    </div>
                                    <div className="text-right">
                                        <span className={cn(
                                            "text-sm font-bold",
                                            isOver ? "text-rose-400" : isWarning ? "text-amber-400" : "text-emerald-400"
                                        )}>
                                            {budget.progress.toFixed(0)}%
                                        </span>
                                    </div>
                                </div>

                                <Progress
                                    value={budget.progress}
                                    className="h-2 bg-white/5"
                                    indicatorClassName={cn(
                                        isOver ? "bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.3)]" :
                                            isWarning ? "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.3)]" :
                                                "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                                    )}
                                />

                                <div className="mt-4 flex items-center gap-2 pt-4 border-t border-white/5">
                                    {isOver ? (
                                        <AlertTriangle className="w-4 h-4 text-rose-500" />
                                    ) : (
                                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                    )}
                                    <p className="text-xs text-[#8899cc]">
                                        {isOver
                                            ? `Excedido por $${Math.abs(budget.remaining).toLocaleString()}`
                                            : `Quedan $${budget.remaining.toLocaleString()} disponibles`}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}

                {budgets?.length === 0 && (
                    <div className="col-span-full py-20 flex flex-col items-center justify-center text-center space-y-4 glass border-white/5 rounded-3xl">
                        <div className="w-20 h-20 rounded-full bg-blue-500/5 flex items-center justify-center">
                            <Target className="w-10 h-10 text-blue-500/30" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-white font-bold text-xl">Sin presupuestos activos</p>
                            <p className="text-[#8899cc]">Define límites para tus categorías de gasto y mantén el control.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
