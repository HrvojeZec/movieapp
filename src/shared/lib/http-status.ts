// HTTP status codes used by the API routes and checked by the client
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
} as const;

/** 4xx: the request itself is wrong, so sending it again won't help. */
export const isClientError = (status: number): boolean =>
  status >= HTTP_STATUS.BAD_REQUEST && status < HTTP_STATUS.INTERNAL_SERVER_ERROR;
