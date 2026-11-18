import { beforeEach, describe, expect, it, vi } from "vitest";

const requireFeature = vi.fn();
const find = vi.fn();
const findOne = vi.fn();
const findOneAndUpdate = vi.fn();
const countDocuments = vi.fn();
const create = vi.fn();
const deleteOne = vi.fn();
const exists = vi.fn();

vi.mock("@/server/db/mongodb", () => ({ default: vi.fn() }));
vi.mock("@/features/subscription/server/entitlements", () => ({
  requireFeature: (...args: unknown[]) => requireFeature(...args),
}));
vi.mock("@/server/models/MovieList", () => ({
  default: {
    find: (filter: unknown) => ({
      sort: (sort: unknown) => ({ lean: () => find(filter, sort) }),
    }),
    findOne: (filter: unknown) => ({ lean: () => findOne(filter) }),
    findOneAndUpdate: (...args: unknown[]) => ({ lean: () => findOneAndUpdate(...args) }),
    countDocuments: (filter: unknown) => countDocuments(filter),
    create: (doc: unknown) => create(doc),
    deleteOne: (filter: unknown) => deleteOne(filter),
    exists: (filter: unknown) => exists(filter),
  },
}));

const lists = await import("@/features/lists/server/lists");

const USER_ID = "507f1f77bcf86cd799439011";
const LIST_ID = "65a1f0c2e4b0a1b2c3d4e5f6";
const CREATED = new Date("2026-11-10T10:00:00Z");
const UPDATED = new Date("2026-11-18T10:00:00Z");
const doc = (movieIds: string[] = ["550", "680"]) => ({
  _id: LIST_ID,
  userId: USER_ID,
  name: "Sunday classics",
  movieIds,
  createdAt: CREATED,
  updatedAt: UPDATED,
});
const forbidden = Object.assign(new Error("Custom lists requires the Premium plan"), {
  status: 403,
});
const ownList = { _id: LIST_ID, userId: USER_ID };

describe("lists", () => {
  beforeEach(() => {
    requireFeature.mockReset().mockResolvedValue({});
    find.mockReset().mockResolvedValue([doc()]);
    findOne.mockReset().mockResolvedValue(doc());
    findOneAndUpdate.mockReset().mockResolvedValue(doc());
    countDocuments.mockReset().mockResolvedValue(0);
    create.mockReset().mockImplementation(async (input) => ({ ...doc([]), ...input }));
    deleteOne.mockReset().mockResolvedValue({ deletedCount: 1 });
    exists.mockReset().mockResolvedValue(null);
  });

  describe("reading", () => {
    it("summarizes the user's lists, recently changed first", async () => {
      await expect(lists.listLists(USER_ID, "550")).resolves.toEqual([
        {
          id: LIST_ID,
          name: "Sunday classics",
          movieCount: 2,
          coverMovieIds: ["680", "550"],
          hasMovie: true,
          updatedAt: UPDATED.toISOString(),
        },
      ]);
      expect(find).toHaveBeenCalledWith({ userId: USER_ID }, { updatedAt: -1 });
    });

    it("returns one list with its movies", async () => {
      await expect(lists.getList(USER_ID, LIST_ID)).resolves.toEqual({
        id: LIST_ID,
        name: "Sunday classics",
        movieIds: ["550", "680"],
        createdAt: CREATED.toISOString(),
        updatedAt: UPDATED.toISOString(),
      });
      expect(findOne).toHaveBeenCalledWith(ownList);
    });

    it("another user's list is not found", async () => {
      findOne.mockResolvedValue(null);

      await expect(lists.getList(USER_ID, LIST_ID)).rejects.toMatchObject({ status: 404 });
    });

    it("a malformed list ID is not found", async () => {
      await expect(lists.getList(USER_ID, "not-an-id")).rejects.toMatchObject({ status: 404 });
      expect(findOne).not.toHaveBeenCalled();
    });
  });

  describe("creating", () => {
    it("creates a list, optionally with a first movie", async () => {
      const list = await lists.createList(USER_ID, "Sunday classics", "550");

      expect(requireFeature).toHaveBeenCalledWith(USER_ID, "customLists");
      expect(create).toHaveBeenCalledWith({
        userId: USER_ID,
        name: "Sunday classics",
        movieIds: ["550"],
      });
      expect(list.movieIds).toEqual(["550"]);
    });

    it("creating needs the customLists feature", async () => {
      requireFeature.mockRejectedValue(forbidden);

      await expect(lists.createList(USER_ID, "Sunday classics")).rejects.toBe(forbidden);
      expect(create).not.toHaveBeenCalled();
    });

    it("limits are enforced: 50 lists", async () => {
      countDocuments.mockResolvedValue(50);

      await expect(lists.createList(USER_ID, "One more")).rejects.toMatchObject({
        status: 409,
        message: "You can have up to 50 lists. Delete one to make room.",
      });
    });
  });

  describe("changing", () => {
    it("renames only the user's own list", async () => {
      await lists.renameList(USER_ID, LIST_ID, "Weekend classics");

      expect(requireFeature).toHaveBeenCalledWith(USER_ID, "customLists");
      expect(findOneAndUpdate.mock.calls[0].slice(0, 2)).toEqual([
        ownList,
        { $set: { name: "Weekend classics" } },
      ]);
    });

    it("adds a movie while the list has room, in one atomic update", async () => {
      await lists.addMovieToList(USER_ID, LIST_ID, "13");

      expect(requireFeature).toHaveBeenCalledWith(USER_ID, "customLists");
      const [filter, update] = findOneAndUpdate.mock.calls[0];
      // The 500th slot must still be empty, unless the movie is already on the list
      expect(filter).toEqual({
        ...ownList,
        $or: [{ movieIds: "13" }, { "movieIds.499": { $exists: false } }],
      });
      expect(update).toEqual({ $addToSet: { movieIds: "13" } });
    });

    it("limits are enforced: 500 movies per list", async () => {
      findOneAndUpdate.mockResolvedValue(null);
      exists.mockResolvedValue({ _id: LIST_ID });

      await expect(lists.addMovieToList(USER_ID, LIST_ID, "13")).rejects.toMatchObject({
        status: 409,
        message: "A list can hold up to 500 movies.",
      });
    });

    it("adding to another user's list is not found", async () => {
      findOneAndUpdate.mockResolvedValue(null);

      await expect(lists.addMovieToList(USER_ID, LIST_ID, "13")).rejects.toMatchObject({
        status: 404,
      });
      expect(exists).toHaveBeenCalledWith(ownList);
    });

    it("adding needs the customLists feature", async () => {
      requireFeature.mockRejectedValue(forbidden);

      await expect(lists.addMovieToList(USER_ID, LIST_ID, "13")).rejects.toBe(forbidden);
      expect(findOneAndUpdate).not.toHaveBeenCalled();
    });
  });

  describe("removing works on every plan", () => {
    it("removes a movie without checking the plan", async () => {
      await lists.removeMovieFromList(USER_ID, LIST_ID, "550");

      expect(requireFeature).not.toHaveBeenCalled();
      expect(findOneAndUpdate.mock.calls[0].slice(0, 2)).toEqual([
        ownList,
        { $pull: { movieIds: "550" } },
      ]);
    });

    it("deletes a list without checking the plan", async () => {
      await lists.deleteList(USER_ID, LIST_ID);

      expect(requireFeature).not.toHaveBeenCalled();
      expect(deleteOne).toHaveBeenCalledWith(ownList);
    });

    it("deleting another user's list is not found", async () => {
      deleteOne.mockResolvedValue({ deletedCount: 0 });

      await expect(lists.deleteList(USER_ID, LIST_ID)).rejects.toMatchObject({ status: 404 });
    });
  });
});
