// src/middleware.ts
// Route protection — uses edge-compatible auth config (no bcrypt/prisma)

import NextAuth from "next-auth";
import { authConfig } from "@/server/auth.config";

export default NextAuth(authConfig).auth;

export const config = {
    matcher: ["/((?!login|register|api/auth|api/trpc|_next/static|_next/image|favicon.ico).*)"],
};
