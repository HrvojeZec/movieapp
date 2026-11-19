import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier/flat";
import { SERVER_ONLY, layerImportRules, readSlices } from "./scripts/layer-rules.mjs";

// Which entities each entity may import; acyclic, checked against the folders in src/entities
const ENTITY_DEPS = {
  notification: [],
  subscription: ["notification"],
  user: ["subscription"],
  movie: ["user"],
  favorites: ["user", "movie", "subscription"],
  watchlist: ["user", "movie", "subscription"],
  "movie-list": ["user", "movie", "subscription"],
  watched: ["user", "movie"],
  recommendation: ["user", "movie"],
  stats: ["user", "movie"],
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
  // Layers import only downwards, and server code stays out of the browser bundle
  ...layerImportRules({
    slices: readSlices(new URL("./src/", import.meta.url)),
    entityDeps: ENTITY_DEPS,
  }),
  {
    files: ["src/app/providers.tsx"],
    rules: { "no-restricted-imports": ["error", { patterns: [SERVER_ONLY] }] },
  },
  // Must stay last so it can disable stylistic rules that conflict with Prettier
  prettier,
];

export default eslintConfig;
