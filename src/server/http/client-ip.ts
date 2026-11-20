const UNKNOWN_CLIENT = "unknown";

/**
 * The client's IP address, for rate limiting. On Vercel these headers are set by the platform and
 * can't be forged by the client. A self-hosted server must sit behind a proxy that sets them;
 * otherwise clients could choose their own address.
 */
export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwardedFor || request.headers.get("x-real-ip")?.trim() || UNKNOWN_CLIENT;
}
