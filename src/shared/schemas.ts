// src/shared/schemas.ts
import { z } from "zod";
import {
    CURRENCIES,
    TRANSACTION_TYPES,
    TRANSACTION_SUBTYPES,
    EXTRAORDINARY_TYPES,
    SAVINGS_STRATEGIES
} from "./constants";

export const financialTransactionSchema = z.object({
    type: z.nativeEnum(TRANSACTION_TYPES),
    subtype: z.nativeEnum(TRANSACTION_SUBTYPES),
    amount: z.number().positive("El monto debe ser positivo"),
    currency: z.nativeEnum(CURRENCIES),
    category: z.string().min(1, "La categoría es obligatoria"),
    description: z.string().max(255),
    source: z.string().optional(),
    occurredAt: z.date(),
    // Extraordinary fields (optional)
    extraordinaryType: z.nativeEnum(EXTRAORDINARY_TYPES).optional(),
});

export const extraordinaryIncomeSchema = z.object({
    extraType: z.nativeEnum(EXTRAORDINARY_TYPES),
    grossAmount: z.number().positive(),
    netAmount: z.number().positive(),
    fiscalPeriod: z.string().optional(),
    isTaxExempt: z.boolean().default(false),
});

export const savingsSectionSchema = z.object({
    name: z.string().min(2, "Nombre muy corto"),
    purpose: z.string().optional(),
    strategyType: z.nativeEnum(SAVINGS_STRATEGIES),
    fixedAmount: z.number().optional(),
    percentage: z.number().min(0).max(100).optional(),
    goalAmount: z.number().optional(),
    goalDate: z.date().optional(),
    color: z.string().optional(),
    emoji: z.string().optional(),
});
