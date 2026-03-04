import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
    test: {
        globals: true,
        environment: "happy-dom",
        include: ["src/**/*.test.{ts,tsx}"],
        env: {
            TZ: "UTC",
        },
        setupFiles: ["./src/test/setup.ts"],
        server: {
            deps: {
                inline: [/@csstools.*/, /@asamuzakjp.*/],
            },
        },
    },
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
});
