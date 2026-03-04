// src/server/api/trpc.ts
// tRPC server configuration with authentication context (Auth.js v5)

import { initTRPC, TRPCError } from "@trpc/server";
import { type NextRequest } from "next/server";
import { auth } from "@/server/auth";
import { db } from "@/server/infrastructure/db/prisma";
import superjson from "superjson";

// Context creation — runs on every request
export const createTRPCContext = async (opts: { req: NextRequest }) => {
  const session = await auth();
  return {
    db,
    session,
    req: opts.req,
  };
};

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;

// tRPC instance
const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape }) {
    return shape;
  },
});

// Reusable middleware — verify authenticated session
const enforceAuthenticated = t.middleware(({ ctx, next }) => {
  if (!ctx.session?.user?.id) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Debes iniciar sesión" });
  }
  return next({
    ctx: {
      ...ctx,
      session: { ...ctx.session, user: ctx.session.user },
    },
  });
});

// Router builders
export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(enforceAuthenticated);
