import { describe, expect, it } from "vitest";
import {
  collectCandidates,
  scoreCandidates,
  type CandidateMovie,
} from "@/features/recommendations/lib/score";

const DRAMA = 18;
const THRILLER = 53;
const COMEDY = 35;
const genreNames = new Map([
  [DRAMA, "Drama"],
  [THRILLER, "Thriller"],
  [COMEDY, "Comedy"],
]);
const profile = new Map([
  [DRAMA, 0.6],
  [THRILLER, 0.4],
]);

const movie = (id: number, genreIds: number[], voteAverage = 7): CandidateMovie => ({
  id,
  title: `Movie ${id}`,
  poster_path: null,
  release_date: "2020-01-01",
  vote_average: voteAverage,
  genre_ids: genreIds,
});
const fightClub = { title: "Fight Club", kind: "liked" as const };
const se7en = { title: "Se7en", kind: "watched" as const };

describe("collectCandidates", () => {
  it("merges the same movie from several sources and keeps every seed", () => {
    const candidates = collectCandidates([
      { movies: [movie(1, [DRAMA]), movie(2, [DRAMA])], seed: fightClub },
      { movies: [movie(1, [DRAMA])], seed: se7en },
      { movies: [movie(3, [THRILLER])] },
    ]);

    expect(candidates.map((candidate) => [candidate.movie.id, candidate.seeds])).toEqual([
      [1, [fightClub, se7en]],
      [2, [fightClub]],
      [3, []],
    ]);
  });
});

describe("scoreCandidates", () => {
  it("a movie recommended by several seeds ranks higher", () => {
    const results = scoreCandidates(
      collectCandidates([
        { movies: [movie(1, [DRAMA]), movie(2, [DRAMA])], seed: fightClub },
        { movies: [movie(2, [DRAMA])], seed: se7en },
      ]),
      profile,
      new Set(),
      genreNames,
    );

    expect(results.map((result) => result.id)).toEqual([2, 1]);
  });

  it("matching genres and ratings count too", () => {
    const results = scoreCandidates(
      collectCandidates([
        { movies: [movie(1, [COMEDY], 9), movie(2, [DRAMA], 6), movie(3, [DRAMA], 8)] },
      ]),
      profile,
      new Set(),
      genreNames,
    );

    expect(results.map((result) => result.id)).toEqual([3, 2, 1]);
  });

  it("already favorited, watched or listed movies are excluded", () => {
    const results = scoreCandidates(
      collectCandidates([{ movies: [movie(1, [DRAMA]), movie(2, [DRAMA])], seed: fightClub }]),
      profile,
      new Set([1]),
      genreNames,
    );

    expect(results.map((result) => result.id)).toEqual([2]);
  });

  it("every result explains why", () => {
    const results = scoreCandidates(
      collectCandidates([
        { movies: [movie(1, [DRAMA])], seed: fightClub },
        { movies: [movie(2, [THRILLER])], seed: se7en },
        { movies: [movie(3, [THRILLER, DRAMA])] },
        { movies: [movie(4, [COMEDY])] },
      ]),
      profile,
      new Set(),
      genreNames,
    );

    expect(Object.fromEntries(results.map((result) => [result.id, result.reason]))).toEqual({
      1: "Because you liked Fight Club",
      2: "Because you watched Se7en",
      // The movie's genre that weighs most in the profile
      3: "Because you like Drama",
      4: "Highly rated",
    });
  });

  it("returns at most 20, without the genre IDs", () => {
    const many = Array.from({ length: 30 }, (_, index) => movie(index + 1, [DRAMA]));
    const results = scoreCandidates(
      collectCandidates([{ movies: many }]),
      profile,
      new Set(),
      genreNames,
    );

    expect(results).toHaveLength(20);
    expect(results[0]).not.toHaveProperty("genre_ids");
  });
});
