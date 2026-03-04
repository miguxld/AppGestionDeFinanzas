// src/shared/constants.ts
// Domain constants based on ARQUITECTURA_LOGICA_NEGOCIO.md

export const CURRENCIES = {
    COP: "COP",
    USD: "USD",
} as const;

export const TRANSACTION_TYPES = {
    INCOME: "INCOME",
    EXPENSE: "EXPENSE",
} as const;

export const TRANSACTION_SUBTYPES = {
    ORDINARY: "ORDINARY",
    EXTRAORDINARY: "EXTRAORDINARY",
} as const;

export const EXTRAORDINARY_TYPES = {
    PRIMA: "PRIMA",
    CESANTIAS_INTEREST: "CESANTIAS_INTEREST",
    BONUS: "BONUS",
    OTHER: "OTHER",
} as const;

export const SAVINGS_STRATEGIES = {
    FIXED: "FIXED",
    PERCENTAGE: "PERCENTAGE",
    GOAL: "GOAL",
} as const;

export const INCOME_CATEGORIES = [
    "Salario",
    "Honorarios",
    "Rentas/Arriendos",
    "Dividendos",
    "Ventas",
    "Otros Ingresos",
] as const;

export const EXPENSE_CATEGORIES = [
    "Vivienda",
    "Alimentación",
    "Transporte",
    "Servicios Públicos",
    "Salud",
    "Educación",
    "Entretenimiento",
    "Deudas/Créditos",
    "Otros Gastos",
] as const;
