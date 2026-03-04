// src/middleware.ts
// Route protection — redirects unauthenticated users to /login

export { auth as middleware } from "@/server/auth";

export const config = {
    matcher: ["/((?!login|register|api/auth|api/trpc|_next/static|_next/image|favicon.ico).*)"],
};
