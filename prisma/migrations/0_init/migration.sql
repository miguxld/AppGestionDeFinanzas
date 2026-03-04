-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'DELETED');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('INCOME', 'EXPENSE');

-- CreateEnum
CREATE TYPE "TransactionSubtype" AS ENUM ('ORDINARY', 'EXTRAORDINARY');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "SavingsStrategyType" AS ENUM ('FIXED', 'PERCENTAGE', 'GOAL');

-- CreateEnum
CREATE TYPE "SavingsSectionStatus" AS ENUM ('ACTIVE', 'PAUSED', 'COMPLETED', 'DISSOLVED');

-- CreateEnum
CREATE TYPE "ExtraordinaryType" AS ENUM ('PRIMA', 'CESANTIAS_INTEREST', 'BONUS', 'OTHER');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "baseCurrency" TEXT NOT NULL DEFAULT 'COP',
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipAddress" TEXT,
    "userAgent" TEXT,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "financial_transactions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "TransactionType" NOT NULL,
    "subtype" "TransactionSubtype" NOT NULL DEFAULT 'ORDINARY',
    "amount" DECIMAL(19,4) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'COP',
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "source" TEXT,
    "occurredAt" TIMESTAMP(3) NOT NULL,
    "registeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "TransactionStatus" NOT NULL DEFAULT 'CONFIRMED',
    "correlationId" TEXT,
    "idempotencyKey" TEXT NOT NULL,
    "ruleEngineVersion" TEXT NOT NULL DEFAULT '1.0',

    CONSTRAINT "financial_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "savings_sections" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "purpose" TEXT,
    "strategyType" "SavingsStrategyType" NOT NULL,
    "fixedAmount" DECIMAL(19,4),
    "percentage" DECIMAL(5,4),
    "goalAmount" DECIMAL(19,4),
    "goalDate" TIMESTAMP(3),
    "currentBalance" DECIMAL(19,4) NOT NULL DEFAULT 0,
    "status" "SavingsSectionStatus" NOT NULL DEFAULT 'ACTIVE',
    "color" TEXT NOT NULL DEFAULT '#f59e0b',
    "emoji" TEXT NOT NULL DEFAULT '­ƒÅª',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "savings_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "savings_deposits" (
    "id" TEXT NOT NULL,
    "savingsSectionId" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "amount" DECIMAL(19,4) NOT NULL,
    "isWithdrawal" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "savings_deposits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "extraordinary_income" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "extraType" "ExtraordinaryType" NOT NULL,
    "grossAmount" DECIMAL(19,4) NOT NULL,
    "netAmount" DECIMAL(19,4) NOT NULL,
    "fiscalPeriod" TEXT,
    "isTaxExempt" BOOLEAN NOT NULL DEFAULT false,
    "source" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "extraordinary_income_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "balance_snapshots" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "accumulatedBalance" DECIMAL(19,4) NOT NULL,
    "totalIncome" DECIMAL(19,4) NOT NULL,
    "totalExpenses" DECIMAL(19,4) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "balance_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sessionId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "before" JSONB,
    "after" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "budgets" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "amount" DECIMAL(19,4) NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "budgets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_token_key" ON "sessions"("token");

-- CreateIndex
CREATE UNIQUE INDEX "financial_transactions_idempotencyKey_key" ON "financial_transactions"("idempotencyKey");

-- CreateIndex
CREATE INDEX "financial_transactions_userId_occurredAt_idx" ON "financial_transactions"("userId", "occurredAt");

-- CreateIndex
CREATE INDEX "financial_transactions_userId_status_idx" ON "financial_transactions"("userId", "status");

-- CreateIndex
CREATE INDEX "financial_transactions_correlationId_idx" ON "financial_transactions"("correlationId");

-- CreateIndex
CREATE INDEX "savings_sections_userId_status_idx" ON "savings_sections"("userId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "savings_deposits_transactionId_key" ON "savings_deposits"("transactionId");

-- CreateIndex
CREATE UNIQUE INDEX "extraordinary_income_transactionId_key" ON "extraordinary_income"("transactionId");

-- CreateIndex
CREATE INDEX "extraordinary_income_userId_extraType_idx" ON "extraordinary_income"("userId", "extraType");

-- CreateIndex
CREATE UNIQUE INDEX "balance_snapshots_userId_periodEnd_key" ON "balance_snapshots"("userId", "periodEnd");

-- CreateIndex
CREATE INDEX "audit_logs_userId_timestamp_idx" ON "audit_logs"("userId", "timestamp");

-- CreateIndex
CREATE INDEX "audit_logs_entityId_idx" ON "audit_logs"("entityId");

-- CreateIndex
CREATE UNIQUE INDEX "budgets_userId_category_month_year_key" ON "budgets"("userId", "category", "month", "year");

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_transactions" ADD CONSTRAINT "financial_transactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "savings_sections" ADD CONSTRAINT "savings_sections_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "savings_deposits" ADD CONSTRAINT "savings_deposits_savingsSectionId_fkey" FOREIGN KEY ("savingsSectionId") REFERENCES "savings_sections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "savings_deposits" ADD CONSTRAINT "savings_deposits_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "financial_transactions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "extraordinary_income" ADD CONSTRAINT "extraordinary_income_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "financial_transactions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "extraordinary_income" ADD CONSTRAINT "extraordinary_income_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "balance_snapshots" ADD CONSTRAINT "balance_snapshots_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budgets" ADD CONSTRAINT "budgets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

