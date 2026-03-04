"use client";
// src/app/(dashboard)/page.tsx
// Dashboard Overview — Connected to tRPC and Financial Store

import {
  TrendingUp,
  TrendingDown,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Trophy,
  Activity,
  AlertTriangle
} from "lucide-react";
import { useSession } from "next-auth/react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";
import { useFinancialStore } from "@/store/financial-store";
import { useCurrencyStore } from "@/store/currency-store";
import { formatCurrencyGlobal } from "@/lib/utils";

export default function DashboardPage() {
  const { data: session } = useSession();
  const { month, year } = useFinancialStore();
  const { currency, exchangeRate } = useCurrencyStore();

  const { data: summary, isLoading } = api.financial.getDashboardSummary.useQuery({
    month,
    year
  });

  const { data: recentTransactions } = api.financial.getRecentTransactions.useQuery({
    limit: 5
  });

  return (
    <div className="space-y-10">
      {/* ── Welcome Section ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Hola, <span className="text-blue-400">{session?.user?.name?.split(' ')[0] || "Usuario"}</span> 👋
          </h1>
          <p className="text-[#8899cc] mt-1">Aquí tienes el resumen de tu salud financiera hoy.</p>
        </div>
        <div className="flex items-center gap-2 glass p-1.5 rounded-2xl border-white/5 bg-white/5">
          <Button variant="ghost" size="sm" className="rounded-xl text-[#8899cc] h-8 px-4 text-xs font-bold uppercase tracking-wider">Histórico</Button>
          <div className="h-4 w-[1px] bg-white/10 mx-1" />
          <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest px-4">Marzo 2026</p>
        </div>
      </div>

      {/* ── Main Stats ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[
          {
            label: "Flujo de Caja (FCO)",
            value: formatCurrencyGlobal(summary?.fco ?? 0, currency, exchangeRate),
            change: "+12.5%",
            icon: TrendingUp,
            color: "text-emerald-400",
            glow: "bg-emerald-500/10"
          },
          {
            label: "Egresos Totales",
            value: formatCurrencyGlobal(summary?.totalExpenses ?? 0, currency, exchangeRate),
            change: "-4.2%",
            icon: TrendingDown,
            color: "text-rose-400",
            glow: "bg-rose-500/10"
          },
          {
            label: "Patrimonio Líquido",
            value: formatCurrencyGlobal(summary?.fct ?? 0, currency, exchangeRate),
            change: "+$450k",
            icon: Wallet,
            color: "text-blue-400",
            glow: "bg-blue-500/10"
          },
        ].map((stat, i) => (
          <Card key={i} className="glass border-white/8 relative overflow-hidden group hover:scale-[1.02] transition-all">
            {isLoading && (
              <div className="absolute inset-0 bg-white/5 animate-pulse z-20" />
            )}
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className={`w-12 h-12 rounded-2xl ${stat.glow} flex items-center justify-center ${stat.color} group-hover:scale-110 transition-transform`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${stat.change.startsWith('+') ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                  {stat.change}
                </div>
              </div>
              <p className="text-xs font-bold text-[#4a5880] uppercase tracking-widest">{stat.label}</p>
              <h3 className="text-3xl font-black text-white mt-1 tracking-tight">{stat.value}</h3>
            </CardContent>
            <div className={`absolute bottom-0 left-0 h-1 ${stat.glow.replace('/10', '/30')} w-full`} />
          </Card>
        ))}
      </div>

      {/* ── Secondary Section ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Performance Chart Placeholder */}
        <Card className="lg:col-span-2 glass border-white/8 group">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Rendimiento Mensual</CardTitle>
              <p className="text-xs text-[#4a5880]">Ingresos vs Gastos · Últimos 6 meses</p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2 text-[10px] font-bold text-[#8899cc] uppercase tracking-tighter">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" /> Ingresos
              </div>
              <div className="flex items-center gap-2 text-[10px] font-bold text-[#8899cc] uppercase tracking-tighter">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]" /> Gastos
              </div>
            </div>
          </CardHeader>
          <CardContent className="h-72 flex items-end justify-between px-6 pb-2 pt-8 gap-4">
            {[45, 75, 52, 95, 65, 85].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-4 group/bar">
                <div className="w-full flex justify-center items-end gap-1.5 h-full min-h-[150px]">
                  <div
                    style={{ height: `${h}%` }}
                    className="w-full max-w-[14px] rounded-full bg-gradient-to-t from-blue-600/80 to-blue-400 group-hover/bar:scale-y-110 transition-all origin-bottom"
                  />
                  <div
                    style={{ height: `${h * 0.4}%` }}
                    className="w-full max-w-[14px] rounded-full bg-gradient-to-t from-rose-600/60 to-rose-400/80 group-hover/bar:scale-y-110 transition-all origin-bottom shadow-[0_5px_15px_rgba(0,0,0,0.3)]"
                  />
                </div>
                <span className="text-[10px] font-black text-[#4a5880] uppercase tracking-tighter">Mes {i + 1}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Real-time Budget Alerts */}
        <div className="space-y-8">
          <BudgetAlerts month={month} year={year} />

          <Card className="glass border-white/8">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm border-l-4 border-amber-500 pl-3">Metas de Ahorro</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              {[
                { name: "Fondo Emergencia", progress: 65, color: "bg-amber-500" },
                { name: "Viaje a Japón", progress: 21, color: "bg-blue-500" },
              ].map((item) => (
                <div key={item.name} className="space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-[#c4d0ec]">{item.name}</span>
                    <span className="text-white">{item.progress}%</span>
                  </div>
                  <Progress value={item.progress} className={`h-1.5 ${item.color}`} />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="glass border-violet-500/20 bg-gradient-to-br from-violet-500/10 to-transparent p-6 relative overflow-hidden group">
            <Trophy className="absolute -right-6 -bottom-6 w-32 h-32 text-violet-500/10 group-hover:rotate-12 group-hover:scale-110 transition-transform" />
            <h4 className="text-sm font-bold text-white mb-2">Próximo Hito</h4>
            <p className="text-xs text-[#8899cc] leading-relaxed mb-4">
              Estás a solo <span className="text-white font-bold">$1.5M</span> de completar tu Fondo de Emergencia de 3 meses.
            </p>
            <Button size="sm" className="bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-[10px] h-8 font-bold uppercase tracking-wider">
              Aumentar Ahorro
            </Button>
          </Card>
        </div>
      </div>

      {/* ── Recent Activity ── */}
      <Card className="glass border-white/8 overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 px-6 h-20">
          <div className="flex items-center gap-3">
            <Activity className="w-5 h-5 text-blue-400" />
            <CardTitle className="text-lg">Actividad Reciente</CardTitle>
          </div>
          <Button variant="ghost" size="sm" className="text-blue-400 text-xs font-bold">Ver Todo</Button>
        </CardHeader>
        <div className="divide-y divide-white/[0.03]">
          {recentTransactions?.map((activity: any, i: number) => (
            <div key={i} className="p-6 flex items-center justify-between hover:bg-white/[0.02] transition-all group">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${activity.type === 'INCOME' ? 'bg-emerald-500/10 text-emerald-400' :
                  'bg-rose-500/10 text-rose-400'
                  }`}>
                  {activity.type === 'INCOME' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors uppercase tracking-tight">{activity.description}</h4>
                  <p className="text-[10px] text-[#4a5880] font-black uppercase tracking-tighter mt-0.5">{activity.category} · {new Date(activity.occurredAt).toLocaleDateString()}</p>
                </div>
              </div>
              <div className={`text-base font-black ${activity.type === 'INCOME' ? 'text-emerald-400' : 'text-white'}`}>
                {activity.type === 'INCOME' ? "+ " : "- "}{formatCurrencyGlobal(Number(activity.amount), currency, exchangeRate)}
              </div>
            </div>
          ))}
          {(!recentTransactions || recentTransactions.length === 0) && (
            <div className="p-10 text-center text-[#4a5880] text-sm italic">No hay transacciones recientes</div>
          )}
        </div>
      </Card>
    </div>
  );
}

function BudgetAlerts({ month, year }: { month: number; year: number }) {
  const { data: budgets } = api.budget.getBudgets.useQuery({ month, year });

  const alerts = budgets?.filter((b: any) => b.progress >= 80) || [];

  if (alerts.length === 0) return null;

  return (
    <Card className="glass border-rose-500/20 bg-rose-500/[0.02]">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2 text-rose-400 font-bold uppercase tracking-widest">
          <AlertTriangle className="w-4 h-4" /> Alertas Críticas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        {alerts.map((alert: any) => (
          <div key={alert.id} className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-white font-bold">{alert.category}</span>
              <span className={alert.progress >= 100 ? "text-rose-500" : "text-amber-500"}>
                {alert.progress.toFixed(0)}%
              </span>
            </div>
            <Progress
              value={alert.progress}
              className="h-1 bg-white/5"
              indicatorClassName={alert.progress >= 100 ? "bg-rose-500" : "bg-amber-500"}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
