// src/server/auth.config.ts
// Edge-compatible Auth.js configuration (no bcrypt, no prisma, no zod here)
// This file is used by the middleware for route protection only.

import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
    session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
    pages: {
        signIn: "/login",
        error: "/login",
    },
    providers: [], // Providers are added in the full auth.ts
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.email = user.email;
                token.name = user.name;
            }
            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id as string;
                session.user.email = token.email as string;
                session.user.name = token.name as string;
            }
            return session;
        },
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isOnDashboard = !nextUrl.pathname.startsWith("/login") &&
                !nextUrl.pathname.startsWith("/register") &&
                !nextUrl.pathname.startsWith("/api/auth") &&
                !nextUrl.pathname.startsWith("/api/trpc") &&
                !nextUrl.pathname.startsWith("/_next");

            if (isOnDashboard) {
                if (isLoggedIn) return true;
                return false; // Redirect unauthenticated users to login page
            } else if (isLoggedIn && (nextUrl.pathname.startsWith("/login") || nextUrl.pathname.startsWith("/register"))) {
                return Response.redirect(new URL("/", nextUrl));
            }
            return true;
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
};
