import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    // Same alias as tsconfig.json "paths"
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    environment: "node",
    include: ["src/**/__tests__/**/*.test.ts"],
    // Tests stub env vars and timers; reset them so tests can't leak state into each other
    unstubEnvs: true,
    unstubGlobals: true,
    restoreMocks: true,
    coverage: {
      provider: "v8",
      include: [
        "src/features/**/*.ts",
        "src/shared/*.ts",
        "src/shared/lib/**/*.ts",
        "src/server/**/*.ts",
      ],
      exclude: ["**/__tests__/**"],
      reporter: ["text", "html"],
    },
  },
});
