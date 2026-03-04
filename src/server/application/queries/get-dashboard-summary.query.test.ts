// src/server/application/queries/get-dashboard-summary.query.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { GetDashboardSummaryQuery } from "./get-dashboard-summary.query";
import { IFinancialRepository, DashboardSummary } from "../../domain/repositories/financial.repository";

describe("GetDashboardSummaryQuery", () => {
    let query: GetDashboardSummaryQuery;
    let mockRepo: IFinancialRepository;

    const mockSummary: DashboardSummary = {
        fco: 3000000,
        fct: 3500000,
        fcl: 3000000,
        totalExpenses: 2000000,
        extraordinary: 500000,
    };

    beforeEach(() => {
        mockRepo = {
            getDashboardSummary: vi.fn().mockResolvedValue(mockSummary),
            registerTransaction: vi.fn(),
            getRecentTransactions: vi.fn(),
            getSavingsSections: vi.fn(),
            createSavingsSection: vi.fn(),
        };
        query = new GetDashboardSummaryQuery(mockRepo);
    });

    it("should call repository.getDashboardSummary with correct params", async () => {
        await query.execute({ userId: "user-123", month: 3, year: 2026 });

        expect(mockRepo.getDashboardSummary).toHaveBeenCalledOnce();
        expect(mockRepo.getDashboardSummary).toHaveBeenCalledWith("user-123", 3, 2026);
    });

    it("should return the dashboard summary from repository", async () => {
        const result = await query.execute({ userId: "user-123", month: 3, year: 2026 });

        expect(result).toEqual(mockSummary);
        expect(result.fco).toBe(3000000);
        expect(result.fct).toBe(3500000);
        expect(result.totalExpenses).toBe(2000000);
        expect(result.extraordinary).toBe(500000);
    });

    it("should pass different month/year combinations", async () => {
        await query.execute({ userId: "user-456", month: 12, year: 2025 });

        expect(mockRepo.getDashboardSummary).toHaveBeenCalledWith("user-456", 12, 2025);
    });
});
