// ESLint rules for the layered structure in src/: views → widgets → features → entities → shared.
// A slice may import only from the layers below its own; slices of one layer don't import each
// other, except entities along an explicit, acyclic dependency table. Used by eslint.config.mjs.
import { readdirSync } from "node:fs";

/** The layers that hold slices, top first. shared and server sit below them all. */
export const LAYERS = ["views", "widgets", "features", "entities"];

/** Modules that must never end up in the browser bundle. */
export const SERVER_ONLY = {
  group: ["@/server/*", "@/entities/*/server/*", "@/features/*/server/*"],
  message: "Server-only module: import it from route handlers or other server code.",
};

const higherLayers = (layer) => LAYERS.slice(0, LAYERS.indexOf(layer));

function checkEntityDeps(entities, entityDeps) {
  for (const entity of entities) {
    if (!entityDeps[entity]) {
      throw new Error(`Entity "${entity}" is missing from the entity dependency table`);
    }
    for (const dependency of entityDeps[entity]) {
      if (!entities.includes(dependency)) {
        throw new Error(`Entity "${entity}" depends on unknown entity "${dependency}"`);
      }
    }
  }
}

/**
 * Flat-config blocks with `no-restricted-imports` for every slice. Each slice gets one block for
 * its client code and one for its `server/` folder and tests (which never reach the browser and may
 * import server code), because a later block replaces the rule of an earlier one for the same
 * files, so every block has to carry all of its patterns.
 *
 * @param {{ slices: Record<string, string[]>, entityDeps: Record<string, string[]> }} options
 */
export function layerImportRules({ slices, entityDeps }) {
  checkEntityDeps(slices.entities ?? [], entityDeps);
  const blocks = [];

  for (const layer of LAYERS) {
    for (const slice of slices[layer] ?? []) {
      const allowed = layer === "entities" ? [slice, ...entityDeps[slice]] : [slice];
      const patterns = [];
      const above = higherLayers(layer);
      if (above.length > 0) {
        patterns.push({
          group: above.map((name) => `@/${name}/*`),
          message: `${layer} may only import from the layers below it.`,
        });
      }
      const siblings = slices[layer].filter((name) => !allowed.includes(name));
      if (siblings.length > 0) {
        patterns.push({
          group: siblings.map((name) => `@/${layer}/${name}/*`),
          message:
            layer === "entities"
              ? "An entity may only import the entities in ENTITY_DEPS (eslint.config.mjs)."
              : `Slices of ${layer} don't import each other; move the shared part a layer down.`,
        });
      }

      const root = `src/${layer}/${slice}`;
      blocks.push({
        files: [`${root}/**`],
        ignores: [`${root}/server/**`, `${root}/__tests__/**`],
        rules: { "no-restricted-imports": ["error", { patterns: [SERVER_ONLY, ...patterns] }] },
      });
      if (patterns.length > 0) {
        blocks.push({
          files: [`${root}/server/**`, `${root}/__tests__/**`],
          rules: { "no-restricted-imports": ["error", { patterns }] },
        });
      }
    }
  }

  blocks.push({
    files: ["src/shared/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            SERVER_ONLY,
            {
              group: LAYERS.map((name) => `@/${name}/*`),
              message: "shared must not depend on the layers above it; move the code up.",
            },
          ],
        },
      ],
    },
  });
  return blocks;
}

/** The slice folders of every layer under `srcDir`. */
export function readSlices(srcDir) {
  return Object.fromEntries(
    LAYERS.map((layer) => [
      layer,
      readdirSync(new URL(`${layer}/`, srcDir), { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name),
    ]),
  );
}
