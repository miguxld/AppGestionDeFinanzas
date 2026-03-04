"use client";

import React, { useState } from "react";
import { api } from "@/trpc/react";
import { useCurrencyStore } from "@/store/currency-store";
import { formatCurrencyGlobal } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid, Legend } from "recharts";
import { BarChart3, TrendingUp, TrendingDown, DollarSign } from "lucide-react";

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

export default function AnalyticsPage() {
    const { currency, exchangeRate } = useCurrencyStore();

    const [selectedDate, setSelectedDate] = useState({
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
    });

    const { data: distribution, isLoading: distLoading } = api.analytics.getSpendingDistribution.useQuery({
        month: selectedDate.month,
        year: selectedDate.year,
    });

    const { data: evolution, isLoading: evoLoading } = api.analytics.getNetWorthEvolution.useQuery({
        months: 6,
    });

    const { data: comparison, isLoading: compLoading } = api.analytics.getMonthlyComparison.useQuery({
        month: selectedDate.month,
        year: selectedDate.year,
    });

    if (distLoading || evoLoading || compLoading) {
        return <div className="p-8 text-white flex justify-center items-center h-[50vh]">Cargando analíticas...</div>;
    }

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-12">
            {/* Header Section */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-3">
                        <BarChart3 className="w-10 h-10 text-emerald-500" />
                        Analítica Avanzada
                    </h1>
                    <p className="text-[#8899cc] mt-2 text-lg">Distribución de gastos y evolución financiera</p>
                </div>
            </header>

            {/* Top Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="glass border-white/5 relative overflow-hidden group">
                    <CardHeader className="pb-2 flex flex-row items-center justify-between">
                        <CardTitle className="text-sm font-bold text-[#8899cc] uppercase tracking-wider">Ingresos (vs Mes Anterior)</CardTitle>
                        <TrendingUp className="w-4 h-4 text-emerald-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-white">{formatCurrencyGlobal(comparison?.current.income || 0, currency, exchangeRate)}</div>
                        <p className={`text-xs mt-1 font-bold ${comparison?.incomeDiff && comparison.incomeDiff > 0 ? "text-emerald-400" : comparison?.incomeDiff && comparison.incomeDiff < 0 ? "text-rose-400" : "text-[#4a5880]"}`}>
                            {comparison?.incomeDiff && comparison.incomeDiff > 0 ? "+" : ""}{comparison?.incomeDiff.toFixed(1)}% vs mes anterior
                        </p>
                    </CardContent>
                </Card>

                <Card className="glass border-white/5 relative overflow-hidden group">
                    <CardHeader className="pb-2 flex flex-row items-center justify-between">
                        <CardTitle className="text-sm font-bold text-[#8899cc] uppercase tracking-wider">Gastos (vs Mes Anterior)</CardTitle>
                        <TrendingDown className="w-4 h-4 text-rose-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-white">{formatCurrencyGlobal(comparison?.current.expense || 0, currency, exchangeRate)}</div>
                        <p className={`text-xs mt-1 font-bold ${comparison?.expenseDiff && comparison.expenseDiff > 0 ? "text-rose-400" : comparison?.expenseDiff && comparison.expenseDiff < 0 ? "text-emerald-400" : "text-[#4a5880]"}`}>
                            {comparison?.expenseDiff && comparison.expenseDiff > 0 ? "+" : ""}{comparison?.expenseDiff.toFixed(1)}% vs mes anterior
                        </p>
                    </CardContent>
                </Card>

                <Card className="glass border-white/5 relative overflow-hidden group bg-gradient-to-br from-blue-500/10 to-transparent border-blue-500/20">
                    <CardHeader className="pb-2 flex flex-row items-center justify-between">
                        <CardTitle className="text-sm font-bold text-white uppercase tracking-wider">Flujo de Caja del Mes</CardTitle>
                        <DollarSign className="w-4 h-4 text-blue-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-white">{formatCurrencyGlobal((comparison?.current.income || 0) - (comparison?.current.expense || 0), currency, exchangeRate)}</div>
                        <p className="text-xs mt-1 font-bold text-[#8899cc]">
                            Capital libre generado
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Distribution Chart */}
                <Card className="glass border-white/5">
                    <CardHeader>
                        <CardTitle className="text-xl font-bold text-white">Distribución de Gastos</CardTitle>
                        <CardDescription className="text-[#8899cc]">¿En qué estás gastando tu dinero este mes?</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[400px]">
                        {distribution && distribution.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={distribution}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={80}
                                        outerRadius={120}
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="rgba(255,255,255,0.05)"
                                    >
                                        {distribution.map((entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value: any) => formatCurrencyGlobal(Number(value), currency, exchangeRate)}
                                        contentStyle={{ backgroundColor: '#090b16', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                        itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                                    />
                                    <Legend
                                        verticalAlign="bottom"
                                        height={36}
                                        iconType="circle"
                                        wrapperStyle={{ paddingTop: '20px' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-[#4a5880]">
                                <PieChart className="w-16 h-16 opacity-20 mb-4" />
                                <p>No hay gastos registrados este mes</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Net Worth Evolution Chart */}
                <Card className="glass border-white/5">
                    <CardHeader>
                        <CardTitle className="text-xl font-bold text-white">Evolución de Capital</CardTitle>
                        <CardDescription className="text-[#8899cc]">Curva de crecimiento en los últimos 6 meses</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[400px]">
                        {evolution && evolution.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={evolution} margin={{ top: 20, right: 30, left: 20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                    <XAxis
                                        dataKey="date"
                                        stroke="#4a5880"
                                        tick={{ fill: '#4a5880', fontSize: 12 }}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        stroke="#4a5880"
                                        tick={{ fill: '#4a5880', fontSize: 12 }}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(value) => currency === 'USD' ? `$${(value / exchangeRate / 1000).toFixed(1)}k` : `$${(value / 1000000).toFixed(1)}M`}
                                    />
                                    <Tooltip
                                        formatter={(value: any) => formatCurrencyGlobal(Number(value), currency, exchangeRate)}
                                        contentStyle={{ backgroundColor: '#090b16', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                        itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
                                        labelStyle={{ color: '#8899cc', marginBottom: '4px' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="value"
                                        stroke="#10b981"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorValue)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-[#4a5880]">
                                <TrendingUp className="w-16 h-16 opacity-20 mb-4" />
                                <p>No hay datos suficientes para proyectar</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
