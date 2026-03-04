// src/trpc/shared.ts
import { type AppRouter } from "@/server/api/root";
import { type TRPCClientErrorLike } from "@trpc/client";
import { type UseTRPCQueryResult } from "@trpc/react-query/shared";
import superjson from "superjson";

export const transformer = superjson;

function getBaseUrl() {
    if (typeof window !== "undefined") return "";
    if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
    return `http://localhost:${process.env.PORT ?? 3000}`;
}

export function getUrl() {
    return getBaseUrl() + "/api/trpc";
}

/**
 * Inference helper for query results.
 */
export type RouterOutputs = {
    [K in keyof AppRouter]: AppRouter[K] extends { _def: { query: infer T } } ? T : never;
};

/**
 * Inference helper for input types.
 */
export type RouterInputs = {
    [K in keyof AppRouter]: AppRouter[K] extends { _def: { input: infer T } } ? T : never;
};
