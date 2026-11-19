import type { QueryFilter } from "mongoose";
import connectDB from "@/server/db/mongodb";
import MovieList, { type IMovieList } from "@/server/models/MovieList";
import { RouteError, notFound } from "@/server/http/route-error";
import { requireFeature } from "@/features/subscription/server/entitlements";
import { LIST_COVER_SIZE, MAX_LISTS, MAX_MOVIES_PER_LIST } from "@/features/lists/constants";
import type { MovieListDetails, MovieListSummary } from "@/features/lists/types";
import { LIST_ID_PATTERN } from "@/features/lists/validations/lists.schema";
import { HTTP_STATUS } from "@/shared/lib/http-status";

// Reading, removing movies and deleting work on every plan, so lists kept after a downgrade can
// still be opened and tidied up; creating, renaming and adding need the customLists feature.

type ListRecord = Pick<IMovieList, "name" | "movieIds" | "createdAt" | "updatedAt"> & {
  _id: unknown;
};

const toDetails = (list: ListRecord): MovieListDetails => ({
  id: String(list._id),
  name: list.name,
  movieIds: [...list.movieIds],
  createdAt: list.createdAt.toISOString(),
  updatedAt: list.updatedAt.toISOString(),
});

const toSummary = (list: ListRecord, movieId?: string): MovieListSummary => ({
  id: String(list._id),
  name: list.name,
  movieCount: list.movieIds.length,
  // Stored newest first (new movies go to the top), so the cover is the start of the list
  coverMovieIds: list.movieIds.slice(0, LIST_COVER_SIZE),
  hasMovie: movieId === undefined ? undefined : list.movieIds.includes(movieId),
  updatedAt: list.updatedAt.toISOString(),
});

/**
 * Filter for one of the user's own lists. Someone else's list, or an ID that can't be one, is a
 * 404 rather than a 403, so list IDs can't be probed.
 */
function ownList(userId: string, listId: string): QueryFilter<IMovieList> {
  if (!LIST_ID_PATTERN.test(listId)) throw notFound("List");
  return { _id: listId, userId };
}

const AFTER_UPDATE = { returnDocument: "after" } as const;

/** The user's lists, recently changed first; with a movie ID, each says whether it holds it. */
export async function listLists(userId: string, movieId?: string): Promise<MovieListSummary[]> {
  await connectDB();
  const lists = await MovieList.find({ userId }).sort({ updatedAt: -1 }).lean();
  return lists.map((list) => toSummary(list, movieId));
}

export async function getList(userId: string, listId: string): Promise<MovieListDetails> {
  const filter = ownList(userId, listId);
  await connectDB();
  const list = await MovieList.findOne(filter).lean();
  if (!list) throw notFound("List");
  return toDetails(list);
}

export async function createList(
  userId: string,
  name: string,
  movieId?: string,
): Promise<MovieListDetails> {
  await requireFeature(userId, "customLists");
  // Count, then create: two requests at once could pass the limit by one, fine for a guard rail
  if ((await MovieList.countDocuments({ userId })) >= MAX_LISTS) {
    throw new RouteError(
      HTTP_STATUS.CONFLICT,
      `You can have up to ${MAX_LISTS} lists. Delete one to make room.`,
    );
  }
  const list = await MovieList.create({ userId, name, movieIds: movieId ? [movieId] : [] });
  return toDetails(list);
}

export async function renameList(
  userId: string,
  listId: string,
  name: string,
): Promise<MovieListDetails> {
  const filter = ownList(userId, listId);
  await requireFeature(userId, "customLists");
  const list = await MovieList.findOneAndUpdate(filter, { $set: { name } }, AFTER_UPDATE).lean();
  if (!list) throw notFound("List");
  return toDetails(list);
}

export async function deleteList(userId: string, listId: string): Promise<void> {
  const filter = ownList(userId, listId);
  await connectDB();
  const { deletedCount } = await MovieList.deleteOne(filter);
  if (deletedCount === 0) throw notFound("List");
}

export async function addMovieToList(
  userId: string,
  listId: string,
  movieId: string,
): Promise<MovieListDetails> {
  const filter = ownList(userId, listId);
  await requireFeature(userId, "customLists");

  // New movies go to the top. Like the favorites limit, the slot after the last allowed one must
  // still be empty, checked in the same update as "not on the list yet"
  const list = await MovieList.findOneAndUpdate(
    {
      ...filter,
      movieIds: { $ne: movieId },
      [`movieIds.${MAX_MOVIES_PER_LIST - 1}`]: { $exists: false },
    },
    { $push: { movieIds: { $each: [movieId], $position: 0 } } },
    AFTER_UPDATE,
  ).lean();
  if (list) return toDetails(list);

  const current = await MovieList.findOne(filter).lean();
  if (!current) throw notFound("List");
  // Already there: adding it again is a no-op, not an error
  if (current.movieIds.includes(movieId)) return toDetails(current);
  throw new RouteError(
    HTTP_STATUS.CONFLICT,
    `A list can hold up to ${MAX_MOVIES_PER_LIST} movies.`,
  );
}

/**
 * Puts the list's movies in a new order. The order must name exactly the movies on the list (the
 * schema rejects duplicates); if the list changed meanwhile, nothing is saved.
 */
export async function reorderList(
  userId: string,
  listId: string,
  movieIds: string[],
): Promise<MovieListDetails> {
  const filter = ownList(userId, listId);
  await requireFeature(userId, "customLists");

  // Same size and containing every given ID means the same movies, checked in the update itself
  const list = await MovieList.findOneAndUpdate(
    { ...filter, movieIds: { $size: movieIds.length, $all: movieIds } },
    { $set: { movieIds } },
    AFTER_UPDATE,
  ).lean();
  if (list) return toDetails(list);

  if (!(await MovieList.findOne(filter).lean())) throw notFound("List");
  throw new RouteError(HTTP_STATUS.CONFLICT, "The list changed, reload and try again.");
}

export async function removeMovieFromList(
  userId: string,
  listId: string,
  movieId: string,
): Promise<MovieListDetails> {
  const filter = ownList(userId, listId);
  await connectDB();
  const list = await MovieList.findOneAndUpdate(
    filter,
    { $pull: { movieIds: movieId } },
    AFTER_UPDATE,
  ).lean();
  if (!list) throw notFound("List");
  return toDetails(list);
}
