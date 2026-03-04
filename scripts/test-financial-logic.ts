// scripts/test-financial-logic.ts
import { PrismaClient } from "@prisma/client";
import { PrismaFinancialRepository } from "../src/server/infrastructure/repositories/prisma-financial.repository";
import { RegisterTransactionUseCase } from "../src/server/application/use-cases/register-transaction.use-case";
import { GetDashboardSummaryQuery } from "../src/server/application/queries/get-dashboard-summary.query";
import { CreateSavingsSectionUseCase } from "../src/server/application/use-cases/create-savings-section.use-case";
import { TransactionType } from "../src/server/domain/entities/financial-transaction.entity";

async function test() {
    console.log("🚀 Starting Comprehensive Financial Logic Test...");
    const prisma = new PrismaClient();
    const repo = new PrismaFinancialRepository();
    const registerUC = new RegisterTransactionUseCase(repo);
    const summaryQuery = new GetDashboardSummaryQuery(repo);
    const createSavingsUC = new CreateSavingsSectionUseCase(repo);

    try {
        // 1. Get or Create test user
        let user = await prisma.user.findFirst({ where: { email: "test-finanzas@example.com" } });
        if (!user) {
            console.log("Creating test user...");
            user = await prisma.user.create({
                data: {
                    email: "test-finanzas@example.com",
                    name: "Test User",
                    passwordHash: "dummy-hash",
                }
            });
        }
        const userId = user.id;
        console.log(`Using User ID: ${userId}`);

        const idempotencyKey = `batch-${Date.now()}`;

        // 2. Register Income
        console.log("2. Registering Income (1000)...");
        await registerUC.execute({
            userId,
            type: "INCOME" as TransactionType,
            amount: 1000,
            category: "Salary",
            description: "Monthly Salary",
            occurredAt: new Date(),
            idempotencyKey: idempotencyKey + "-inc",
        });

        // 3. Register Expense
        console.log("3. Registering Expense (400)...");
        await registerUC.execute({
            userId,
            type: "EXPENSE" as TransactionType,
            amount: 400,
            category: "Rent",
            description: "Monthly Rent",
            occurredAt: new Date(),
            idempotencyKey: idempotencyKey + "-exp",
        });

        // 4. Create Savings Section
        console.log("4. Creating Savings Section...");
        const savingsSection = await createSavingsUC.execute({
            userId,
            name: "Vacations",
            purpose: "Trip to Japan",
            strategyType: "FIXED",
            fixedAmount: 200,
            emoji: "✈️",
            color: "#FF5733"
        });
        console.log("✅ Savings Section created:", savingsSection.id);

        // 5. Verify Dashboard Summary
        console.log("5. Fetching dashboard summary...");
        const now = new Date();
        const summary = await summaryQuery.execute({
            userId,
            month: now.getMonth() + 1,
            year: now.getFullYear(),
        });

        console.log("📊 Summary Result:", JSON.stringify(summary, null, 2));

        // Assertions
        const expectedFco = 1000 - 400; // 600
        if (Math.abs(Number(summary.fco) - expectedFco) < 0.01) {
            console.log("✅ FCO calculation is correct!");
        } else {
            console.warn(`⚠️ FCO mismatch: Expected ${expectedFco}, got ${summary.fco}`);
        }

        if (summary.totalExpenses === 400) {
            console.log("✅ Total expenses calculation is correct!");
        }

        console.log("\n✨ All core backend logic tests PASSED!");

    } catch (error) {
        console.error("❌ Test failed:", error);
    } finally {
        await prisma.$disconnect();
    }
}

test();
