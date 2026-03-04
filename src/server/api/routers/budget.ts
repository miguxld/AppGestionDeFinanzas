import { z } from "zod";
import { router, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const budgetRouter = router({
    getBudgets: protectedProcedure
        .input(z.object({ month: z.number(), year: z.number() }))
        .query(async ({ ctx, input }) => {
            const userId = ctx.session.user.id;

            // 1. Fetch all budgets for the period
            const budgets = await ctx.db.budget.findMany({
                where: {
                    userId,
                    month: input.month,
                    year: input.year,
                },
            });

            // 2. Fetch all expenses for those categories in the same period
            // We'll aggregate them to calculate consumption
            const expenses = await ctx.db.financialTransaction.findMany({
                where: {
                    userId,
                    type: "EXPENSE",
                    status: "CONFIRMED",
                    category: { in: budgets.map((b: any) => b.category) },
                    occurredAt: {
                        gte: new Date(input.year, input.month - 1, 1),
                        lt: new Date(input.year, input.month, 1),
                    },
                },
            });

            // 3. Merge data
            return budgets.map((budget: any) => {
                const consumed = expenses
                    .filter((t: any) => t.category === budget.category)
                    .reduce((acc: number, curr: any) => acc + Number(curr.amount), 0);

                return {
                    id: budget.id,
                    category: budget.category,
                    amount: Number(budget.amount),
                    month: budget.month,
                    year: budget.year,
                    consumed,
                    remaining: Number(budget.amount) - consumed,
                    progress: Math.min((consumed / Number(budget.amount)) * 100, 100),
                };
            });
        }),

    upsertBudget: protectedProcedure
        .input(z.object({
            category: z.string(),
            amount: z.number().positive(),
            month: z.number().min(1).max(12),
            year: z.number(),
        }))
        .mutation(async ({ ctx, input }) => {
            const userId = ctx.session.user.id;

            return ctx.db.budget.upsert({
                where: {
                    userId_category_month_year: {
                        userId,
                        category: input.category,
                        month: input.month,
                        year: input.year,
                    },
                },
                update: { amount: input.amount },
                create: {
                    userId,
                    category: input.category,
                    amount: input.amount,
                    month: input.month,
                    year: input.year,
                },
            });
        }),

    deleteBudget: protectedProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const budget = await ctx.db.budget.findUnique({
                where: { id: input.id },
            });

            if (!budget || budget.userId !== ctx.session.user.id) {
                throw new TRPCError({ code: "NOT_FOUND" });
            }

            return ctx.db.budget.delete({
                where: { id: input.id },
            });
        }),
});
