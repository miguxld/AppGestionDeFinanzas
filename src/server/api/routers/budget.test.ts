// src/server/api/routers/budget.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockPrisma } = vi.hoisted(() => ({
    mockPrisma: {
        budget: {
            findMany: vi.fn(),
            upsert: vi.fn(),
            findUnique: vi.fn(),
            delete: vi.fn(),
        },
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

describe("Budget Router", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("getBudgets", () => {
        it("should return budgets with consumption calculated", async () => {
            mockPrisma.budget.findMany.mockResolvedValue([
                { id: "b1", category: "Alimentación", amount: 1000000, month: 3, year: 2026, userId: "user-123" },
                { id: "b2", category: "Transporte", amount: 500000, month: 3, year: 2026, userId: "user-123" },
            ]);

            mockPrisma.financialTransaction.findMany.mockResolvedValue([
                { category: "Alimentación", amount: 350000, type: "EXPENSE" },
                { category: "Alimentación", amount: 200000, type: "EXPENSE" },
                { category: "Transporte", amount: 150000, type: "EXPENSE" },
            ]);

            const caller = createCaller(authSession);
            const result = await caller.budget.getBudgets({ month: 3, year: 2026 });

            expect(result).toHaveLength(2);

            const alimentacion = result.find((b: any) => b.category === "Alimentación");
            expect(alimentacion!.consumed).toBe(550000);
            expect(alimentacion!.remaining).toBe(450000);
            expect(alimentacion!.progress).toBeCloseTo(55, 1);

            const transporte = result.find((b: any) => b.category === "Transporte");
            expect(transporte!.consumed).toBe(150000);
            expect(transporte!.remaining).toBe(350000);
        });

        it("should reject unauthenticated requests", async () => {
            const caller = createCaller(null);
            await expect(caller.budget.getBudgets({ month: 3, year: 2026 })).rejects.toThrow();
        });
    });

    describe("upsertBudget", () => {
        it("should upsert a budget", async () => {
            const mockBudget = {
                id: "b1",
                userId: "user-123",
                category: "Alimentación",
                amount: 1200000,
                month: 3,
                year: 2026,
            };
            mockPrisma.budget.upsert.mockResolvedValue(mockBudget);

            const caller = createCaller(authSession);
            const result = await caller.budget.upsertBudget({
                category: "Alimentación",
                amount: 1200000,
                month: 3,
                year: 2026,
            });

            expect(result).toEqual(mockBudget);
            expect(mockPrisma.budget.upsert).toHaveBeenCalledOnce();
        });

        it("should reject non-positive amount", async () => {
            const caller = createCaller(authSession);
            await expect(
                caller.budget.upsertBudget({
                    category: "Alimentación",
                    amount: -500,
                    month: 3,
                    year: 2026,
                })
            ).rejects.toThrow();
        });

        it("should reject invalid month", async () => {
            const caller = createCaller(authSession);
            await expect(
                caller.budget.upsertBudget({
                    category: "Alimentación",
                    amount: 1000000,
                    month: 13,
                    year: 2026,
                })
            ).rejects.toThrow();
        });
    });

    describe("deleteBudget", () => {
        it("should delete a budget owned by the user", async () => {
            mockPrisma.budget.findUnique.mockResolvedValue({
                id: "b1",
                userId: "user-123",
            });
            mockPrisma.budget.delete.mockResolvedValue({ id: "b1" });

            const caller = createCaller(authSession);
            await caller.budget.deleteBudget({ id: "b1" });

            expect(mockPrisma.budget.delete).toHaveBeenCalledWith({ where: { id: "b1" } });
        });

        it("should reject deletion of another user's budget", async () => {
            mockPrisma.budget.findUnique.mockResolvedValue({
                id: "b1",
                userId: "other-user",
            });

            const caller = createCaller(authSession);
            await expect(caller.budget.deleteBudget({ id: "b1" })).rejects.toThrow();
        });

        it("should reject deletion of non-existent budget", async () => {
            mockPrisma.budget.findUnique.mockResolvedValue(null);

            const caller = createCaller(authSession);
            await expect(caller.budget.deleteBudget({ id: "nonexistent" })).rejects.toThrow();
        });
    });
});
