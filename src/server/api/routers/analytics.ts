import { z } from "zod";
import { router, protectedProcedure } from "@/server/api/trpc";

export const analyticsRouter = router({
    getSpendingDistribution: protectedProcedure
        .input(z.object({ month: z.number(), year: z.number() }))
        .query(async ({ ctx, input }) => {
            const startDate = new Date(input.year, input.month - 1, 1);
            const endDate = new Date(input.year, input.month, 0);

            const expenses = await ctx.db.financialTransaction.findMany({
                where: {
                    userId: ctx.session.user.id,
                    type: "EXPENSE",
                    status: "CONFIRMED",
                    occurredAt: {
                        gte: startDate,
                        lte: endDate,
                    },
                },
                select: {
                    category: true,
                    amount: true,
                },
            });

            const distribution = expenses.reduce((acc: Record<string, number>, curr: { category: string; amount: any }) => {
                const amount = Number(curr.amount);
                acc[curr.category] = (acc[curr.category] || 0) + amount;
                return acc;
            }, {});

            return Object.entries(distribution).map(([name, value]) => ({
                name,
                value,
            }));
        }),

    getNetWorthEvolution: protectedProcedure
        .input(z.object({ months: z.number().default(6) }))
        .query(async ({ ctx, input }) => {
            // Get all transactions to compute historical accumulation
            // In a real app we would use monthly snapshots, but for now we aggregate
            const transactions = await ctx.db.financialTransaction.findMany({
                where: {
                    userId: ctx.session.user.id,
                    status: "CONFIRMED",
                },
                orderBy: { occurredAt: "asc" },
                select: {
                    amount: true,
                    type: true,
                    occurredAt: true,
                },
            });

            const series: { date: string; value: number }[] = [];
            let runningTotal = 0;

            // Group by month
            const monthlyData: Record<string, number> = {};

            transactions.forEach((t: { amount: any; type: string; occurredAt: Date }) => {
                const amount = Number(t.amount);
                const monthKey = `${t.occurredAt.getFullYear()}-${String(t.occurredAt.getMonth() + 1).padStart(2, "0")}`;

                if (t.type === "INCOME") {
                    runningTotal += amount;
                } else {
                    runningTotal -= amount;
                }

                monthlyData[monthKey] = runningTotal;
            });

            // Convert to sorted array for the chart
            return Object.entries(monthlyData)
                .map(([date, value]) => ({ date, value }))
                .sort((a, b) => a.date.localeCompare(b.date))
                .slice(-input.months);
        }),

    getMonthlyComparison: protectedProcedure
        .input(z.object({ month: z.number(), year: z.number() }))
        .query(async ({ ctx, input }) => {
            const currentStart = new Date(input.year, input.month - 1, 1);
            const currentEnd = new Date(input.year, input.month, 0);

            const prevMonth = input.month === 1 ? 12 : input.month - 1;
            const prevYear = input.month === 1 ? input.year - 1 : input.year;
            const prevStart = new Date(prevYear, prevMonth - 1, 1);
            const prevEnd = new Date(prevYear, prevMonth, 0);

            const getStats = async (start: Date, end: Date) => {
                const txs = await ctx.db.financialTransaction.findMany({
                    where: {
                        userId: ctx.session.user.id,
                        status: "CONFIRMED",
                        occurredAt: { gte: start, lte: end },
                    },
                });

                return txs.reduce((acc: { income: number; expense: number }, t: { amount: any; type: string }) => {
                    const amt = Number(t.amount);
                    if (t.type === "INCOME") acc.income += amt;
                    else acc.expense += amt;
                    return acc;
                }, { income: 0, expense: 0 });
            };

            const current = await getStats(currentStart, currentEnd);
            const previous = await getStats(prevStart, prevEnd);

            return {
                current,
                previous,
                incomeDiff: previous.income === 0 ? 0 : ((current.income - previous.income) / previous.income) * 100,
                expenseDiff: previous.expense === 0 ? 0 : ((current.expense - previous.expense) / previous.expense) * 100,
            };
        }),
});
