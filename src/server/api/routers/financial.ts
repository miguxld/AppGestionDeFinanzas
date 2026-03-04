// src/server/api/routers/financial.ts
import { z } from "zod";
import { router, protectedProcedure } from "@/server/api/trpc";
import { financialTransactionSchema, savingsSectionSchema } from "@/shared/schemas";
import { PrismaFinancialRepository } from "../../infrastructure/repositories/prisma-financial.repository";
import { RegisterTransactionUseCase } from "../../application/use-cases/register-transaction.use-case";
import { GetDashboardSummaryQuery } from "../../application/queries/get-dashboard-summary.query";
import { CreateSavingsSectionUseCase } from "../../application/use-cases/create-savings-section.use-case";
import { TransactionType, TransactionSubtype } from "../../domain/entities/financial-transaction.entity";

const financialRepo = new PrismaFinancialRepository();
const registerTransactionUseCase = new RegisterTransactionUseCase(financialRepo);
const getDashboardSummaryQuery = new GetDashboardSummaryQuery(financialRepo);
const createSavingsSectionUseCase = new CreateSavingsSectionUseCase(financialRepo);

export const financialRouter = router({
    getDashboardSummary: protectedProcedure
        .input(z.object({ month: z.number(), year: z.number() }))
        .query(async ({ ctx, input }) => {
            return await getDashboardSummaryQuery.execute({
                userId: ctx.session.user.id,
                month: input.month,
                year: input.year,
            });
        }),

    registerTransaction: protectedProcedure
        .input(financialTransactionSchema.extend({
            idempotencyKey: z.string()
        }))
        .mutation(async ({ ctx, input }) => {
            return await registerTransactionUseCase.execute({
                userId: ctx.session.user.id,
                type: input.type as TransactionType,
                subtype: input.subtype as TransactionSubtype,
                amount: input.amount,
                currency: input.currency,
                category: input.category,
                description: input.description,
                source: input.source,
                occurredAt: input.occurredAt,
                idempotencyKey: input.idempotencyKey,
            });
        }),

    getRecentTransactions: protectedProcedure
        .input(z.object({ limit: z.number().default(10) }))
        .query(async ({ ctx, input }) => {
            const transactions = await financialRepo.getRecentTransactions(ctx.session.user.id, input.limit);
            // Convert domain entities back to plain objects for tRPC
            return transactions;
        }),

    getSavingsSections: protectedProcedure.query(async ({ ctx }) => {
        return await financialRepo.getSavingsSections(ctx.session.user.id);
    }),

    createSavingsSection: protectedProcedure
        .input(savingsSectionSchema)
        .mutation(async ({ ctx, input }) => {
            return await createSavingsSectionUseCase.execute({
                userId: ctx.session.user.id,
                ...input,
                strategyType: input.strategyType as "FIXED" | "PERCENTAGE" | "GOAL",
            });
        }),
});

