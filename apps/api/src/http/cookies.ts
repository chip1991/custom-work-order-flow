export function parseCookies(headerValue: string | undefined): Record<string, string> {
  if (!headerValue) return {};
  const out: Record<string, string> = {};
  for (const part of headerValue.split(";")) {
    const [rawName, ...rest] = part.trim().split("=");
    if (!rawName) continue;
    const rawValue = rest.join("=");
    out[rawName] = decodeURIComponent(rawValue ?? "");
  }
  return out;
}

export type CookieOptions = {
  httpOnly?: boolean;
  sameSite?: "lax" | "strict" | "none";
  secure?: boolean;
  path?: string;
  maxAgeSeconds?: number;
};

export function serializeCookie(name: string, value: string, options: CookieOptions = {}): string {
  const parts: string[] = [`${name}=${encodeURIComponent(value)}`];
  if (options.path) parts.push(`Path=${options.path}`);
  if (options.httpOnly) parts.push("HttpOnly");
  if (options.secure) parts.push("Secure");
  if (options.sameSite) parts.push(`SameSite=${options.sameSite[0].toUpperCase()}${options.sameSite.slice(1)}`);
  if (options.maxAgeSeconds !== undefined) parts.push(`Max-Age=${Math.floor(options.maxAgeSeconds)}`);
  return parts.join("; ");
}
