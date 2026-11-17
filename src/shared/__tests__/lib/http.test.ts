import { describe, expect, it, vi } from "vitest";
import { HttpError, deleteJson, fetchJson, postJson, withQuery } from "@/shared/lib/http";

describe("withQuery", () => {
  it("appends defined params and skips undefined ones", () => {
    expect(withQuery("/api/movies", { list: "popular", page: 2, genre: undefined })).toBe(
      "/api/movies?list=popular&page=2",
    );
  });

  it("returns the path unchanged without params", () => {
    expect(withQuery("/api/genres")).toBe("/api/genres");
  });

  it("encodes values", () => {
    expect(withQuery("/api/movies/search", { query: "fight club & co" })).toBe(
      "/api/movies/search?query=fight+club+%26+co",
    );
  });
});

describe("fetchJson", () => {
  const mockFetch = (response: Response) => {
    const fetchMock = vi.fn().mockResolvedValue(response);
    vi.stubGlobal("fetch", fetchMock);
    return fetchMock;
  };

  it("returns the parsed body of a successful response", async () => {
    mockFetch(Response.json({ ok: 1 }));
    await expect(fetchJson("/api/x")).resolves.toEqual({ ok: 1 });
  });

  it("sends JSON bodies with a JSON content type", async () => {
    const fetchMock = mockFetch(Response.json({}));
    await fetchJson("/api/x", { method: "POST", body: JSON.stringify({ a: 1 }) });
    expect(fetchMock.mock.calls[0][1].headers).toMatchObject({
      "Content-Type": "application/json",
    });
  });

  it("throws an HttpError with the API's message", async () => {
    mockFetch(Response.json({ message: "Invalid credentials" }, { status: 401 }));
    const error = await fetchJson("/api/auth/login").catch((e: unknown) => e);
    expect(error).toBeInstanceOf(HttpError);
    expect(error).toMatchObject({ status: 401, message: "Invalid credentials" });
  });

  it("falls back to a generic message when the error body isn't JSON", async () => {
    mockFetch(new Response("Bad gateway", { status: 502 }));
    await expect(fetchJson("/api/x")).rejects.toThrow("Request to /api/x failed with status 502");
  });
});

describe("postJson and deleteJson", () => {
  const mockFetch = () => {
    const fetchMock = vi.fn().mockResolvedValue(Response.json({ ok: true }));
    vi.stubGlobal("fetch", fetchMock);
    return fetchMock;
  };

  it("posts a JSON body", async () => {
    const fetchMock = mockFetch();
    await postJson("/api/x", { movieId: "550" });

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/x");
    expect(init).toMatchObject({ method: "POST", body: '{"movieId":"550"}' });
    expect(init.headers).toMatchObject({ "Content-Type": "application/json" });
  });

  it("posts without a body", async () => {
    const fetchMock = mockFetch();
    await postJson("/api/auth/logout");
    expect(fetchMock.mock.calls[0][1]).toMatchObject({ method: "POST", body: undefined });
  });

  it("sends a DELETE", async () => {
    const fetchMock = mockFetch();
    await deleteJson("/api/x/1");
    expect(fetchMock.mock.calls[0][1]).toMatchObject({ method: "DELETE" });
  });
});
