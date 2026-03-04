// src/server/domain/repositories/financial.repository.ts
import { FinancialTransaction } from "../entities/financial-transaction.entity";

export interface DashboardSummary {
    fco: number;
    fct: number;
    fcl: number;
    totalExpenses: number;
    extraordinary: number;
}

export interface IFinancialRepository {
    getDashboardSummary(userId: string, month: number, year: number): Promise<DashboardSummary>;
    registerTransaction(transaction: FinancialTransaction): Promise<FinancialTransaction>;
    getRecentTransactions(userId: string, limit: number): Promise<FinancialTransaction[]>;
    getSavingsSections(userId: string): Promise<any[]>; // Will refine savings entity later
    createSavingsSection(userId: string, data: any): Promise<any>;
}
