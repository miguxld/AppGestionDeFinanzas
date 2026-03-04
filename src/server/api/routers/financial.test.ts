// src/server/api/routers/financial.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { Decimal } from "@prisma/client/runtime/library";

const { mockPrisma } = vi.hoisted(() => ({
    mockPrisma: {
        financialTransaction: {
            findMany: vi.fn(),
            create: vi.fn(),
        },
        savingsSection: {
            findMany: vi.fn(),
            create: vi.fn(),
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

describe("Financial Router", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("getDashboardSummary", () => {
        it("should return correct FCO/FCT/FCL calculations", async () => {
            mockPrisma.financialTransaction.findMany.mockResolvedValue([
                { amount: new Decimal(5000000), type: "INCOME", subtype: "ORDINARY", status: "CONFIRMED" },
                { amount: new Decimal(500000), type: "INCOME", subtype: "EXTRAORDINARY", status: "CONFIRMED" },
                { amount: new Decimal(2000000), type: "EXPENSE", subtype: "ORDINARY", status: "CONFIRMED" },
            ]);

            const caller = createCaller(authSession);
            const result = await caller.financial.getDashboardSummary({ month: 3, year: 2026 });

            expect(result.fco).toBe(3000000);
            expect(result.fct).toBe(3500000);
            expect(result.fcl).toBe(3000000);
            expect(result.totalExpenses).toBe(2000000);
            expect(result.extraordinary).toBe(500000);
        });

        it("should return zeros when no transactions", async () => {
            mockPrisma.financialTransaction.findMany.mockResolvedValue([]);

            const caller = createCaller(authSession);
            const result = await caller.financial.getDashboardSummary({ month: 3, year: 2026 });

            expect(result.fco).toBe(0);
            expect(result.fct).toBe(0);
            expect(result.totalExpenses).toBe(0);
        });

        it("should reject unauthenticated requests", async () => {
            const caller = createCaller(null);
            await expect(
                caller.financial.getDashboardSummary({ month: 3, year: 2026 })
            ).rejects.toThrow();
        });
    });

    describe("registerTransaction", () => {
        it("should create a transaction with idempotency key", async () => {
            mockPrisma.financialTransaction.create.mockResolvedValue({
                id: "tx-001",
                userId: "user-123",
                type: "INCOME",
                subtype: "ORDINARY",
                amount: new Decimal(5000000),
                currency: "COP",
                category: "Salario",
                description: "Pago mensual",
                source: null,
                occurredAt: new Date("2026-03-01"),
                registeredAt: new Date(),
                status: "CONFIRMED",
                idempotencyKey: "key-123",
            });

            const caller = createCaller(authSession);
            const result = await caller.financial.registerTransaction({
                type: "INCOME",
                subtype: "ORDINARY",
                amount: 5000000,
                currency: "COP",
                category: "Salario",
                description: "Pago mensual",
                occurredAt: new Date("2026-03-01"),
                idempotencyKey: "key-123",
            });

            expect(result.id).toBe("tx-001");
            expect(result.type).toBe("INCOME");
            expect(result.amount).toBe(5000000);
            expect(mockPrisma.financialTransaction.create).toHaveBeenCalledOnce();
        });
    });

    describe("getRecentTransactions", () => {
        it("should return limited recent transactions", async () => {
            mockPrisma.financialTransaction.findMany.mockResolvedValue([
                {
                    id: "tx-1",
                    userId: "user-123",
                    type: "INCOME",
                    subtype: "ORDINARY",
                    amount: new Decimal(5000000),
                    currency: "COP",
                    category: "Salario",
                    description: "Test",
                    source: null,
                    occurredAt: new Date(),
                    registeredAt: new Date(),
                    status: "CONFIRMED",
                    idempotencyKey: "k1",
                },
            ]);

            const caller = createCaller(authSession);
            const result = await caller.financial.getRecentTransactions({ limit: 5 });

            expect(result).toHaveLength(1);
            expect(result[0].id).toBe("tx-1");
            expect(mockPrisma.financialTransaction.findMany).toHaveBeenCalledWith({
                where: { userId: "user-123" },
                orderBy: { occurredAt: "desc" },
                take: 5,
            });
        });
    });

    describe("getSavingsSections", () => {
        it("should return user savings sections", async () => {
            mockPrisma.savingsSection.findMany.mockResolvedValue([
                {
                    id: "sav-1",
                    userId: "user-123",
                    name: "Emergencia",
                    strategyType: "GOAL",
                    goalAmount: new Decimal(10000000),
                    currentBalance: new Decimal(2000000),
                    status: "ACTIVE",
                },
            ]);

            const caller = createCaller(authSession);
            const result = await caller.financial.getSavingsSections();

            expect(result).toHaveLength(1);
            expect(result[0].name).toBe("Emergencia");
        });
    });

    describe("createSavingsSection", () => {
        it("should create a new savings section", async () => {
            mockPrisma.savingsSection.create.mockResolvedValue({
                id: "sav-new",
                userId: "user-123",
                name: "Vacaciones",
                purpose: "Viaje a Europa",
                strategyType: "GOAL",
                goalAmount: new Decimal(15000000),
                currentBalance: new Decimal(0),
                status: "ACTIVE",
            });

            const caller = createCaller(authSession);
            const result = await caller.financial.createSavingsSection({
                name: "Vacaciones",
                purpose: "Viaje a Europa",
                strategyType: "GOAL",
                goalAmount: 15000000,
            });

            expect(result.name).toBe("Vacaciones");
            expect(mockPrisma.savingsSection.create).toHaveBeenCalledOnce();
        });
    });
});
