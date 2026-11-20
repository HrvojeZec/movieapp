import { beforeEach, describe, expect, it, vi } from "vitest";
import { RECENTLY_VIEWED_STORAGE_KEY } from "@/entities/movie/constants";
import type { MovieSummary } from "@/entities/movie/types";

const movie = (id: number): MovieSummary => ({
  id,
  title: `Movie ${id}`,
  poster_path: null,
  release_date: "2024-01-01",
  vote_average: 7,
});

let storage: Map<string, string>;

// A fresh store module per test, created after localStorage is stubbed, like in a new browser tab
async function loadStore(saved?: object[], version = 2) {
  storage = new Map();
  if (saved) {
    storage.set(RECENTLY_VIEWED_STORAGE_KEY, JSON.stringify({ state: { movies: saved }, version }));
  }
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => void storage.set(key, value),
    removeItem: (key: string) => void storage.delete(key),
  });
  vi.resetModules();
  return import("@/entities/movie/store/recently-viewed.store");
}

const savedIds = () =>
  (
    JSON.parse(storage.get(RECENTLY_VIEWED_STORAGE_KEY)!) as { state: { movies: MovieSummary[] } }
  ).state.movies.map((m) => m.id);

const DAY = 24 * 60 * 60 * 1000;
const viewed = (id: number, daysAgo = 0) => ({
  ...movie(id),
  viewedAt: Date.now() - daysAgo * DAY,
});

describe("recently viewed store", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it("forgets movies viewed more than 180 days ago when it loads", async () => {
    const { useRecentlyViewedStore, hydrateRecentlyViewed } = await loadStore([
      viewed(1, 3),
      viewed(2, 200),
    ]);
    await hydrateRecentlyViewed();

    expect(useRecentlyViewedStore.getState().movies.map((m) => m.id)).toEqual([1]);
  });

  it("forgets a list saved before views had dates", async () => {
    const { useRecentlyViewedStore, hydrateRecentlyViewed } = await loadStore([movie(1)], 1);
    await hydrateRecentlyViewed();

    expect(useRecentlyViewedStore.getState().movies).toEqual([]);
  });

  it("starts empty and reads the saved list only when hydrated", async () => {
    const { useRecentlyViewedStore, hydrateRecentlyViewed } = await loadStore([viewed(1)]);

    // Matches the server render until the client explicitly loads localStorage
    expect(useRecentlyViewedStore.getState().movies).toEqual([]);

    await hydrateRecentlyViewed();
    expect(useRecentlyViewedStore.getState().movies.map((m) => m.id)).toEqual([1]);
  });

  it("saves added movies to localStorage, newest first", async () => {
    const { useRecentlyViewedStore, hydrateRecentlyViewed } = await loadStore([viewed(1)]);
    await hydrateRecentlyViewed();

    useRecentlyViewedStore.getState().add(movie(2));

    expect(savedIds()).toEqual([2, 1]);
  });

  it("clears the list", async () => {
    const { useRecentlyViewedStore, hydrateRecentlyViewed } = await loadStore([viewed(1)]);
    await hydrateRecentlyViewed();

    useRecentlyViewedStore.getState().clear();

    expect(useRecentlyViewedStore.getState().movies).toEqual([]);
    expect(savedIds()).toEqual([]);
  });
});
