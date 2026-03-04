// src/server/application/use-cases/register-transaction.use-case.ts
import { IFinancialRepository } from "../../domain/repositories/financial.repository";
import { FinancialTransaction, TransactionType, TransactionSubtype } from "../../domain/entities/financial-transaction.entity";

export interface RegisterTransactionInput {
    userId: string;
    type: TransactionType;
    subtype?: TransactionSubtype;
    amount: number;
    currency?: string;
    category: string;
    description: string;
    source?: string;
    occurredAt: Date;
    idempotencyKey: string;
}

export class RegisterTransactionUseCase {
    constructor(private financialRepository: IFinancialRepository) { }

    async execute(input: RegisterTransactionInput): Promise<FinancialTransaction> {
        // Business Rule: Confirm non-negative amounts are handled at domain creation
        const transaction = FinancialTransaction.create(input);

        // Business Rule: Check for idempotency (handled by the unique constraint in DB for now)
        // Future: Check if an active session or specific account flags allow this operation

        return await this.financialRepository.registerTransaction(transaction);
    }
}
