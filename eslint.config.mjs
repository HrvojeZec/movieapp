import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import prettier from "eslint-config-prettier/flat";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  {
    ignores: [".next/**", "out/**", "build/**", "coverage/**", "next-env.d.ts"],
  },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
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
      "src/features/*/components/**",
      "src/features/*/views/**",
      "src/features/*/AuthContext.tsx",
      "src/features/*/api.ts",
      "src/shared/**",
      "src/app/providers.tsx",
    ],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/server/*", "@/features/*/server/*"],
              message: "Server-only module: import it from route handlers or other server code.",
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
