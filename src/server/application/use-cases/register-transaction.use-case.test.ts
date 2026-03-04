// src/server/application/use-cases/register-transaction.use-case.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { RegisterTransactionUseCase } from "./register-transaction.use-case";
import { IFinancialRepository } from "../../domain/repositories/financial.repository";
import { FinancialTransaction } from "../../domain/entities/financial-transaction.entity";

describe("RegisterTransactionUseCase", () => {
    let useCase: RegisterTransactionUseCase;
    let mockRepo: IFinancialRepository;

    const mockCreatedTx = new FinancialTransaction(
        "tx-001",
        "user-123",
        "INCOME",
        "ORDINARY",
        5000000,
        "COP",
        "Salario",
        "Pago mensual",
        null,
        new Date("2026-03-01"),
        new Date(),
        "CONFIRMED",
        "key-abc-123"
    );

    beforeEach(() => {
        mockRepo = {
            registerTransaction: vi.fn().mockResolvedValue(mockCreatedTx),
            getDashboardSummary: vi.fn(),
            getRecentTransactions: vi.fn(),
            getSavingsSections: vi.fn(),
            createSavingsSection: vi.fn(),
        };
        useCase = new RegisterTransactionUseCase(mockRepo);
    });

    it("should call repository.registerTransaction with a FinancialTransaction entity", async () => {
        const input = {
            userId: "user-123",
            type: "INCOME" as const,
            amount: 5000000,
            category: "Salario",
            description: "Pago mensual",
            occurredAt: new Date("2026-03-01"),
            idempotencyKey: "key-abc-123",
        };

        await useCase.execute(input);

        expect(mockRepo.registerTransaction).toHaveBeenCalledOnce();
        const calledWith = (mockRepo.registerTransaction as any).mock.calls[0][0];
        expect(calledWith).toBeInstanceOf(FinancialTransaction);
        expect(calledWith.userId).toBe("user-123");
        expect(calledWith.type).toBe("INCOME");
        expect(calledWith.amount).toBe(5000000);
        expect(calledWith.category).toBe("Salario");
        expect(calledWith.idempotencyKey).toBe("key-abc-123");
    });

    it("should return the result from the repository", async () => {
        const result = await useCase.execute({
            userId: "user-123",
            type: "INCOME",
            amount: 5000000,
            category: "Salario",
            description: "Pago mensual",
            occurredAt: new Date("2026-03-01"),
            idempotencyKey: "key-abc-123",
        });

        expect(result).toBe(mockCreatedTx);
        expect(result.id).toBe("tx-001");
    });

    it("should default subtype to ORDINARY when not provided", async () => {
        await useCase.execute({
            userId: "user-123",
            type: "EXPENSE",
            amount: 150000,
            category: "Alimentación",
            description: "Mercado semanal",
            occurredAt: new Date("2026-03-02"),
            idempotencyKey: "key-def-456",
        });

        const calledWith = (mockRepo.registerTransaction as any).mock.calls[0][0];
        expect(calledWith.subtype).toBe("ORDINARY");
    });
});
