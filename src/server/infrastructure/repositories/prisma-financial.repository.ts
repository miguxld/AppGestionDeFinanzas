// src/server/infrastructure/repositories/prisma-financial.repository.ts
import { db } from "@/server/infrastructure/db/prisma";
import { IFinancialRepository, DashboardSummary } from "../../domain/repositories/financial.repository";
import { FinancialTransaction, TransactionType, TransactionSubtype, TransactionStatus } from "../../domain/entities/financial-transaction.entity";
import { Decimal } from "@prisma/client/runtime/library";

export class PrismaFinancialRepository implements IFinancialRepository {
    async getDashboardSummary(userId: string, month: number, year: number): Promise<DashboardSummary> {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);

        const transactions = await db.financialTransaction.findMany({
            where: {
                userId,
                occurredAt: {
                    gte: startDate,
                    lte: endDate,
                },
                status: "CONFIRMED",
            },
        });

        let fco_income = 0;
        let fco_expense = 0;
        let extraordinary_income = 0;

        transactions.forEach((t) => {
            const amount = Number(t.amount);
            if (t.type === "INCOME") {
                if (t.subtype === "ORDINARY") {
                    fco_income += amount;
                } else {
                    extraordinary_income += amount;
                }
            } else if (t.type === "EXPENSE") {
                fco_expense += amount;
            }
        });

        const fco = fco_income - fco_expense;
        const fct = fco_income + extraordinary_income - fco_expense;
        // In this implementation, FCL is FCO - Savings Deposits (internal transfers)
        // We'll refine this later when savings deposits are fully implemented
        const fcl = fco;

        return {
            fco,
            fct,
            fcl,
            totalExpenses: fco_expense,
            extraordinary: extraordinary_income,
        };
    }

    async registerTransaction(transaction: FinancialTransaction): Promise<FinancialTransaction> {
        const created = await db.financialTransaction.create({
            data: {
                userId: transaction.userId,
                type: transaction.type,
                subtype: transaction.subtype,
                amount: new Decimal(transaction.amount),
                currency: transaction.currency,
                category: transaction.category,
                description: transaction.description,
                source: transaction.source,
                occurredAt: transaction.occurredAt,
                idempotencyKey: transaction.idempotencyKey,
                status: transaction.status,
            },
        });

        return new FinancialTransaction(
            created.id,
            created.userId,
            created.type as TransactionType,
            created.subtype as TransactionSubtype,
            Number(created.amount),
            created.currency,
            created.category,
            created.description,
            created.source,
            created.occurredAt,
            created.registeredAt,
            created.status as TransactionStatus,
            created.idempotencyKey
        );
    }

    async getRecentTransactions(userId: string, limit: number): Promise<FinancialTransaction[]> {
        const transactions = await db.financialTransaction.findMany({
            where: { userId },
            orderBy: { occurredAt: "desc" },
            take: limit,
        });

        return transactions.map((t) => new FinancialTransaction(
            t.id,
            t.userId,
            t.type as TransactionType,
            t.subtype as TransactionSubtype,
            Number(t.amount),
            t.currency,
            t.category,
            t.description,
            t.source,
            t.occurredAt,
            t.registeredAt,
            t.status as TransactionStatus,
            t.idempotencyKey
        ));
    }

    async getSavingsSections(userId: string): Promise<any[]> {
        return db.savingsSection.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
        });
    }

    async createSavingsSection(userId: string, data: any): Promise<any> {
        return db.savingsSection.create({
            data: {
                ...data,
                userId,
                fixedAmount: data.fixedAmount ? new Decimal(data.fixedAmount) : null,
                percentage: data.percentage ? new Decimal(data.percentage) : null,
                goalAmount: data.goalAmount ? new Decimal(data.goalAmount) : null,
            },
        });
    }
}
