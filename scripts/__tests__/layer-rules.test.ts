import { describe, expect, it } from "vitest";
import { layerImportRules } from "../layer-rules.mjs";

type Block = {
  files: string[];
  ignores?: string[];
  rules: { "no-restricted-imports": [string, { patterns: { group: string[] }[] }] };
};

const slices = {
  views: ["home", "stats"],
  widgets: ["app-shell", "movie-hero"],
  features: ["a", "b"],
  entities: ["movie", "user", "stats"],
};
const entityDeps = { movie: ["user"], user: [], stats: ["user", "movie"] };

const blocks = layerImportRules({ slices, entityDeps }) as Block[];

/** Every forbidden import pattern of the block that lints the given files. */
const forbidden = (files: string) => {
  const block = blocks.find((candidate) => candidate.files[0] === files);
  if (!block) throw new Error(`no block for ${files}`);
  return block.rules["no-restricted-imports"][1].patterns.flatMap((pattern) => pattern.group);
};

describe("layerImportRules", () => {
  it("a feature may not import another feature or the layers above", () => {
    const patterns = forbidden("src/features/a/**");

    expect(patterns).toEqual(
      expect.arrayContaining(["@/features/b/*", "@/widgets/*", "@/views/*"]),
    );
    expect(patterns).not.toContain("@/features/a/*");
    expect(patterns).not.toContain("@/entities/*");
  });

  it("an entity may import the entities it depends on, and no others", () => {
    const patterns = forbidden("src/entities/movie/**");

    expect(patterns).toContain("@/entities/stats/*");
    expect(patterns).not.toContain("@/entities/user/*");
    expect(patterns).not.toContain("@/entities/movie/*");
    expect(patterns).toEqual(expect.arrayContaining(["@/features/*", "@/widgets/*", "@/views/*"]));
  });

  it("client code may not import server code, server code may", () => {
    const serverOnly = "@/server/*";

    expect(forbidden("src/entities/movie/**")).toContain(serverOnly);
    expect(forbidden("src/entities/movie/server/**")).not.toContain(serverOnly);
    expect(forbidden("src/entities/movie/server/**")).toContain("@/entities/stats/*");
  });

  it("tests may import server code but keep to the layers", () => {
    const block = blocks.find((candidate) =>
      candidate.files.includes("src/entities/movie/__tests__/**"),
    );
    const patterns = block!.rules["no-restricted-imports"][1].patterns.flatMap((p) => p.group);

    expect(patterns).not.toContain("@/server/*");
    expect(patterns).toContain("@/features/*");
  });

  it("a view may use widgets but not another view", () => {
    const patterns = forbidden("src/views/home/**");

    expect(patterns).toContain("@/views/stats/*");
    expect(patterns).not.toContain("@/widgets/*");
    expect(patterns).not.toContain("@/views/home/*");
  });

  it("a widget may not import another widget", () => {
    const patterns = forbidden("src/widgets/movie-hero/**");

    expect(patterns).toEqual(expect.arrayContaining(["@/widgets/app-shell/*", "@/views/*"]));
    expect(patterns).not.toContain("@/features/*");
  });

  it("shared may not import any layer", () => {
    expect(forbidden("src/shared/**")).toEqual(
      expect.arrayContaining([
        "@/views/*",
        "@/widgets/*",
        "@/features/*",
        "@/entities/*",
        "@/server/*",
      ]),
    );
  });

  it("an entity dependency on an unknown entity is reported", () => {
    expect(() =>
      layerImportRules({ slices, entityDeps: { ...entityDeps, movie: ["actor"] } }),
    ).toThrow(/actor/);
  });

  it("an entity missing from the dependency table is reported", () => {
    const { stats: _stats, ...withoutStats } = entityDeps;
    expect(() => layerImportRules({ slices, entityDeps: withoutStats })).toThrow(/stats/);
  });
});
