// src/server/api/routers/ai.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockPrisma, mockFetch } = vi.hoisted(() => ({
    mockPrisma: {
        financialTransaction: {
            findMany: vi.fn(),
        },
        savingsSection: {
            findMany: vi.fn(),
        },
    },
    mockFetch: vi.fn(),
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

vi.stubGlobal("fetch", mockFetch);

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

describe("AI Router", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("ask", () => {
        it("should return AI response with financial context", async () => {
            mockPrisma.financialTransaction.findMany.mockResolvedValue([
                { amount: 5000000, type: "INCOME", occurredAt: new Date() },
                { amount: 2000000, type: "EXPENSE", occurredAt: new Date() },
            ]);
            mockPrisma.savingsSection.findMany.mockResolvedValue([
                { name: "Emergencia", currentBalance: 1000000, goalAmount: 5000000 },
            ]);

            mockFetch.mockResolvedValue({
                json: () =>
                    Promise.resolve({
                        choices: [
                            {
                                message: {
                                    content: "Tu flujo de caja es positivo. Estás en buen camino.",
                                },
                            },
                        ],
                    }),
            });

            const caller = createCaller(authSession);
            const result = await caller.ai.ask({
                question: "¿Cómo van mis finanzas?",
            });

            expect(result.answer).toBe("Tu flujo de caja es positivo. Estás en buen camino.");

            expect(mockFetch).toHaveBeenCalledOnce();
            const fetchCall = mockFetch.mock.calls[0];
            expect(fetchCall[0]).toBe("https://openrouter.ai/api/v1/chat/completions");
            const body = JSON.parse(fetchCall[1].body);
            expect(body.model).toBe("google/gemini-flash-1.5");
            expect(body.messages).toHaveLength(2);
            expect(body.messages[0].role).toBe("system");
            expect(body.messages[1].role).toBe("user");
            expect(body.messages[1].content).toBe("¿Cómo van mis finanzas?");
        });

        it("should include financial context in the system prompt", async () => {
            mockPrisma.financialTransaction.findMany.mockResolvedValue([
                { amount: 5000000, type: "INCOME" },
                { amount: 1000000, type: "EXPENSE" },
            ]);
            mockPrisma.savingsSection.findMany.mockResolvedValue([]);

            mockFetch.mockResolvedValue({
                json: () =>
                    Promise.resolve({
                        choices: [{ message: { content: "Respuesta de prueba" } }],
                    }),
            });

            const caller = createCaller(authSession);
            await caller.ai.ask({ question: "Test" });

            const body = JSON.parse(mockFetch.mock.calls[0][1].body);
            const systemPrompt = body.messages[0].content;

            expect(systemPrompt).toContain("5000000");
            expect(systemPrompt).toContain("1000000");
            expect(systemPrompt).toContain("TheOneShot AI");
        });

        it("should return fallback message on API error", async () => {
            mockPrisma.financialTransaction.findMany.mockResolvedValue([]);
            mockPrisma.savingsSection.findMany.mockResolvedValue([]);

            mockFetch.mockRejectedValue(new Error("Network error"));

            const caller = createCaller(authSession);
            const result = await caller.ai.ask({ question: "Test" });

            expect(result.answer).toContain("Lo siento");
        });

        it("should reject unauthenticated requests", async () => {
            const caller = createCaller(null);
            await expect(caller.ai.ask({ question: "Test" })).rejects.toThrow();
        });
    });
});
