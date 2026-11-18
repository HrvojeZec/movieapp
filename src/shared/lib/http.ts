/** Error thrown by fetchJson for non-2xx responses, carrying the status and the API's message. */
export class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly body?: unknown,
  ) {
    super(message);
    this.name = "HttpError";
  }
}

type QueryParams = Record<string, string | number | boolean | undefined>;

export function withQuery(path: string, params: QueryParams = {}): string {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) query.set(key, String(value));
  }
  const queryString = query.toString();
  return queryString ? `${path}?${queryString}` : path;
}

/** fetch() for our own JSON API: throws HttpError on failure so TanStack Query sees an error state. */
export async function fetchJson<T>(input: string, init?: RequestInit): Promise<T> {
  const response = await fetch(input, {
    ...init,
    headers: init?.body ? { "Content-Type": "application/json", ...init.headers } : init?.headers,
  });

  const body: unknown = await response.json().catch(() => undefined);
  if (!response.ok) {
    const message =
      body && typeof body === "object" && "message" in body && typeof body.message === "string"
        ? body.message
        : `Request to ${input} failed with status ${response.status}`;
    throw new HttpError(response.status, message, body);
  }
  return body as T;
}

/** POST with an optional JSON body. */
export const postJson = <T>(input: string, body?: unknown) =>
  fetchJson<T>(input, {
    method: "POST",
    body: body === undefined ? undefined : JSON.stringify(body),
  });

export const deleteJson = <T>(input: string) => fetchJson<T>(input, { method: "DELETE" });

/** PUT with a JSON body. */
export const putJson = <T>(input: string, body: unknown) =>
  fetchJson<T>(input, { method: "PUT", body: JSON.stringify(body) });
