import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier/flat";

const SERVER_ONLY = {
  group: ["@/server/*", "@/features/*/server/*"],
  message: "Server-only module: import it from route handlers or other server code.",
};

const eslintConfig = [
  {
    ignores: [
      ".next/**",
      "out/**",
      "build/**",
      "coverage/**",
      "playwright-report/**",
      "test-results/**",
      "next-env.d.ts",
      // Third-party components with their own license, kept as published upstream
      "src/shared/vendor/**",
    ],
  },
  ...nextVitals,
  ...nextTypescript,
  {
    rules: {
      // Allow omitting fields via rest destructuring, e.g. `const { password, ...safe } = user`
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { ignoreRestSiblings: true, argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
  {
    // Client code must not pull server-only modules (DB, Stripe, secrets) into the browser bundle
    files: [
      "src/features/*/api/**",
      "src/features/*/hooks/**",
      "src/features/*/lib/**",
      "src/features/*/ui/**",
      "src/features/*/views/**",
      "src/features/*/store/**",
      "src/features/*/constants.ts",
      "src/features/*/types.ts",
      "src/shell/**",
      "src/app/providers.tsx",
    ],
    rules: {
      "no-restricted-imports": ["error", { patterns: [SERVER_ONLY] }],
    },
  },
  {
    // The bottom layer: features and the app shell build on shared, never the other way round
    files: ["src/shared/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            SERVER_ONLY,
            {
              group: ["@/features/*", "@/shell/*"],
              message: "shared must not depend on features or the app shell; move the code up.",
            },
          ],
        },
      ],
    },
  },
  // Must stay last so it can disable stylistic rules that conflict with Prettier
  prettier,
];

export default eslintConfig;
