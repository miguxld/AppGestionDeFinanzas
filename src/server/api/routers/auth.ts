// src/server/api/routers/auth.ts
import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import bcrypt from "bcryptjs";

export const authRouter = router({
    register: publicProcedure
        .input(z.object({
            name: z.string().min(2),
            email: z.string().email(),
            password: z.string().min(8),
        }))
        .mutation(async ({ ctx, input }) => {
            // Check if user exists
            const existingUser = await ctx.db.user.findUnique({
                where: { email: input.email.toLowerCase() },
            });

            if (existingUser) {
                throw new TRPCError({
                    code: "CONFLICT",
                    message: "Este correo electrónico ya está registrado.",
                });
            }

            // Hash password
            const passwordHash = await bcrypt.hash(input.password, 12);

            // Create user
            const user = await ctx.db.user.create({
                data: {
                    name: input.name,
                    email: input.email.toLowerCase(),
                    passwordHash,
                    baseCurrency: "COP", // Default as per doc
                },
            });

            return {
                id: user.id,
                email: user.email,
                name: user.name,
            };
        }),

    getMe: protectedProcedure.query(({ ctx }) => {
        return ctx.session.user;
    }),
});
