// src/server/api/root.ts
import { router } from "@/server/api/trpc";
import { authRouter } from "@/server/api/routers/auth";
import { financialRouter } from "@/server/api/routers/financial";
import { aiRouter } from "@/server/api/routers/ai";
import { budgetRouter } from "@/server/api/routers/budget";
import { analyticsRouter } from "@/server/api/routers/analytics";

/**
 * This is the primary router for your server.
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = router({
    auth: authRouter,
    financial: financialRouter,
    ai: aiRouter,
    budget: budgetRouter,
    analytics: analyticsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
