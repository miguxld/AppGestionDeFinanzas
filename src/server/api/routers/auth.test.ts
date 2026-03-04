// src/server/api/routers/auth.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";

// Use vi.hoisted so the mock object is available when vi.mock runs
const { mockPrisma } = vi.hoisted(() => ({
    mockPrisma: {
        user: {
            findUnique: vi.fn(),
            create: vi.fn(),
        },
    },
}));

vi.mock("bcryptjs", () => ({
    default: {
        hash: vi.fn().mockResolvedValue("$2a$12$hashedPassword"),
        compare: vi.fn(),
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

describe("Auth Router", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("register", () => {
        it("should register a new user successfully", async () => {
            mockPrisma.user.findUnique.mockResolvedValue(null);
            mockPrisma.user.create.mockResolvedValue({
                id: "user-001",
                email: "test@example.com",
                name: "Test User",
                passwordHash: "$2a$12$hashedPassword",
                baseCurrency: "COP",
                status: "ACTIVE",
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            const caller = createCaller();
            const result = await caller.auth.register({
                name: "Test User",
                email: "test@example.com",
                password: "password123",
            });

            expect(result).toEqual({
                id: "user-001",
                email: "test@example.com",
                name: "Test User",
            });
            expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
                where: { email: "test@example.com" },
            });
            expect(mockPrisma.user.create).toHaveBeenCalledOnce();
        });

        it("should reject duplicate email", async () => {
            mockPrisma.user.findUnique.mockResolvedValue({
                id: "existing-user",
                email: "test@example.com",
            });

            const caller = createCaller();
            await expect(
                caller.auth.register({
                    name: "Test User",
                    email: "test@example.com",
                    password: "password123",
                })
            ).rejects.toThrow();
        });

        it("should lowercase email before checking", async () => {
            mockPrisma.user.findUnique.mockResolvedValue(null);
            mockPrisma.user.create.mockResolvedValue({
                id: "user-002",
                email: "test@example.com",
                name: "Test User",
            });

            const caller = createCaller();
            await caller.auth.register({
                name: "Test User",
                email: "Test@Example.COM",
                password: "password123",
            });

            expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
                where: { email: "test@example.com" },
            });
        });

        it("should reject invalid input - short name", async () => {
            const caller = createCaller();
            await expect(
                caller.auth.register({
                    name: "A",
                    email: "test@example.com",
                    password: "password123",
                })
            ).rejects.toThrow();
        });

        it("should reject invalid input - short password", async () => {
            const caller = createCaller();
            await expect(
                caller.auth.register({
                    name: "Test User",
                    email: "test@example.com",
                    password: "short",
                })
            ).rejects.toThrow();
        });

        it("should reject invalid input - invalid email", async () => {
            const caller = createCaller();
            await expect(
                caller.auth.register({
                    name: "Test User",
                    email: "not-an-email",
                    password: "password123",
                })
            ).rejects.toThrow();
        });
    });

    describe("getMe", () => {
        it("should return the authenticated user", async () => {
            const session = {
                user: { id: "user-001", email: "test@example.com", name: "Test User" },
            };
            const caller = createCaller(session);
            const result = await caller.auth.getMe();

            expect(result).toEqual({
                id: "user-001",
                email: "test@example.com",
                name: "Test User",
            });
        });

        it("should reject unauthenticated requests", async () => {
            const caller = createCaller(null);
            await expect(caller.auth.getMe()).rejects.toThrow();
        });
    });
});
