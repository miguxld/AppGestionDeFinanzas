// src/server/api/routers/analytics.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockPrisma } = vi.hoisted(() => ({
    mockPrisma: {
        financialTransaction: {
            findMany: vi.fn(),
        },
    },
}));

vi.mock("@/server/infrastructure/db/prisma", () => ({
    db: mockPrisma,
}));

vi.mock("@/server/auth", () => ({
    auth: vi.fn().mockResolvedValue(null),
    handlers: {},
    signIn: vi.fn(),
    signOut: vi.fn(),
}));

import { appRouter } from "@/server/api/root";

function createCaller(session: any = null) {
    return appRouter.createCaller({
        db: mockPrisma as any,
        session,
        req: {} as any,
    });
}

const authSession = {
    user: { id: "user-123", email: "test@test.com", name: "Test" },
};

describe("Analytics Router", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("getSpendingDistribution", () => {
        it("should group expenses by category", async () => {
            mockPrisma.financialTransaction.findMany.mockResolvedValue([
                { category: "Alimentación", amount: 350000 },
                { category: "Alimentación", amount: 200000 },
                { category: "Transporte", amount: 150000 },
                { category: "Entretenimiento", amount: 100000 },
            ]);

            const caller = createCaller(authSession);
            const result = await caller.analytics.getSpendingDistribution({
                month: 3,
                year: 2026,
            });

            expect(result).toHaveLength(3);

            const alimentacion = result.find((d: any) => d.name === "Alimentación");
            expect(alimentacion!.value).toBe(550000);

            const transporte = result.find((d: any) => d.name === "Transporte");
            expect(transporte!.value).toBe(150000);
        });

        it("should return empty array when no expenses", async () => {
            mockPrisma.financialTransaction.findMany.mockResolvedValue([]);

            const caller = createCaller(authSession);
            const result = await caller.analytics.getSpendingDistribution({
                month: 3,
                year: 2026,
            });

            expect(result).toEqual([]);
        });

        it("should reject unauthenticated requests", async () => {
            const caller = createCaller(null);
            await expect(
                caller.analytics.getSpendingDistribution({ month: 3, year: 2026 })
            ).rejects.toThrow();
        });
    });

    describe("getNetWorthEvolution", () => {
        it("should return monthly accumulated balance", async () => {
            mockPrisma.financialTransaction.findMany.mockResolvedValue([
                { amount: 5000000, type: "INCOME", occurredAt: new Date(Date.UTC(2026, 0, 15)) },
                { amount: 2000000, type: "EXPENSE", occurredAt: new Date(Date.UTC(2026, 0, 20)) },
                { amount: 5000000, type: "INCOME", occurredAt: new Date(Date.UTC(2026, 1, 15)) },
                { amount: 1500000, type: "EXPENSE", occurredAt: new Date(Date.UTC(2026, 1, 20)) },
            ]);

            const caller = createCaller(authSession);
            const result = await caller.analytics.getNetWorthEvolution({ months: 6 });

            expect(result).toHaveLength(2);
            expect(result[0].date).toBe("2026-01");
            expect(result[0].value).toBe(3000000);
            expect(result[1].date).toBe("2026-02");
            expect(result[1].value).toBe(6500000);
        });

        it("should return sorted by date", async () => {
            mockPrisma.financialTransaction.findMany.mockResolvedValue([
                { amount: 1000000, type: "INCOME", occurredAt: new Date(Date.UTC(2026, 2, 1)) },
                { amount: 2000000, type: "INCOME", occurredAt: new Date(Date.UTC(2026, 0, 1)) },
            ]);

            const caller = createCaller(authSession);
            const result = await caller.analytics.getNetWorthEvolution({ months: 6 });

            expect(result[0].date).toBe("2026-01");
            expect(result[1].date).toBe("2026-03");
        });
    });

    describe("getMonthlyComparison", () => {
        it("should compare current vs previous month", async () => {
            mockPrisma.financialTransaction.findMany
                .mockResolvedValueOnce([
                    { amount: 5000000, type: "INCOME" },
                    { amount: 2000000, type: "EXPENSE" },
                ])
                .mockResolvedValueOnce([
                    { amount: 4500000, type: "INCOME" },
                    { amount: 1800000, type: "EXPENSE" },
                ]);

            const caller = createCaller(authSession);
            const result = await caller.analytics.getMonthlyComparison({
                month: 3,
                year: 2026,
            });

            expect(result.current.income).toBe(5000000);
            expect(result.current.expense).toBe(2000000);
            expect(result.previous.income).toBe(4500000);
            expect(result.previous.expense).toBe(1800000);
            expect(result.incomeDiff).toBeCloseTo(11.11, 1);
        });

        it("should handle zero previous income without division by zero", async () => {
            mockPrisma.financialTransaction.findMany
                .mockResolvedValueOnce([{ amount: 5000000, type: "INCOME" }])
                .mockResolvedValueOnce([]);

            const caller = createCaller(authSession);
            const result = await caller.analytics.getMonthlyComparison({
                month: 1,
                year: 2026,
            });

            expect(result.incomeDiff).toBe(0);
            expect(result.expenseDiff).toBe(0);
        });
    });
});
