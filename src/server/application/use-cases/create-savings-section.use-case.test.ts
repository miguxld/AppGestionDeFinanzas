// src/server/application/use-cases/create-savings-section.use-case.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { CreateSavingsSectionUseCase } from "./create-savings-section.use-case";
import { IFinancialRepository } from "../../domain/repositories/financial.repository";

describe("CreateSavingsSectionUseCase", () => {
    let useCase: CreateSavingsSectionUseCase;
    let mockRepo: IFinancialRepository;

    const mockSection = {
        id: "sav-001",
        userId: "user-123",
        name: "Fondo de emergencia",
        purpose: "Para emergencias",
        strategyType: "GOAL",
        goalAmount: 10000000,
        currentBalance: 0,
        status: "ACTIVE",
    };

    beforeEach(() => {
        mockRepo = {
            createSavingsSection: vi.fn().mockResolvedValue(mockSection),
            registerTransaction: vi.fn(),
            getDashboardSummary: vi.fn(),
            getRecentTransactions: vi.fn(),
            getSavingsSections: vi.fn(),
        };
        useCase = new CreateSavingsSectionUseCase(mockRepo);
    });

    it("should call repository.createSavingsSection with correct userId and data", async () => {
        const input = {
            userId: "user-123",
            name: "Fondo de emergencia",
            purpose: "Para emergencias",
            strategyType: "GOAL" as const,
            goalAmount: 10000000,
        };

        await useCase.execute(input);

        expect(mockRepo.createSavingsSection).toHaveBeenCalledOnce();
        expect(mockRepo.createSavingsSection).toHaveBeenCalledWith("user-123", input);
    });

    it("should return the created savings section from repository", async () => {
        const result = await useCase.execute({
            userId: "user-123",
            name: "Fondo de emergencia",
            purpose: "Para emergencias",
            strategyType: "GOAL",
            goalAmount: 10000000,
        });

        expect(result).toEqual(mockSection);
        expect(result.id).toBe("sav-001");
    });

    it("should work with FIXED strategy type", async () => {
        await useCase.execute({
            userId: "user-123",
            name: "Ahorro mensual",
            strategyType: "FIXED",
            fixedAmount: 500000,
        });

        const calledData = (mockRepo.createSavingsSection as any).mock.calls[0][1];
        expect(calledData.strategyType).toBe("FIXED");
        expect(calledData.fixedAmount).toBe(500000);
    });

    it("should work with PERCENTAGE strategy type", async () => {
        await useCase.execute({
            userId: "user-123",
            name: "10% del salario",
            strategyType: "PERCENTAGE",
            percentage: 10,
        });

        const calledData = (mockRepo.createSavingsSection as any).mock.calls[0][1];
        expect(calledData.strategyType).toBe("PERCENTAGE");
        expect(calledData.percentage).toBe(10);
    });
});
