import type { NextFunction, Request, Response } from "express";
import { asyncHandler } from "../http/async";
import { parseCookies } from "../http/cookies";
import { HttpError } from "../http/errors";
import { getUserBySessionToken, sessionCookieName } from "./session";

function parseBearerToken(header: string | undefined): string | null {
  if (!header) return null;
  const m = header.match(/^Bearer\s+(.+)$/i);
  return m?.[1]?.trim() || null;
}

export const authMiddleware = asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
  const bearer = parseBearerToken(req.header("authorization"));
  const cookies = parseCookies(req.header("cookie"));
  const token = bearer ?? cookies[sessionCookieName] ?? null;
  if (!token) {
    next();
    return;
  }

  const user = await getUserBySessionToken(token);
  if (user) {
    req.user = user;
  }
  next();
});

export function requireAuth(req: Request) {
  if (!req.user) {
    throw new HttpError(401, "UNAUTHENTICATED", "Unauthenticated");
  }
  return req.user;
}

export function requireAdmin(req: Request) {
  const user = requireAuth(req);
  if (user.role !== "ADMIN") {
    throw new HttpError(403, "FORBIDDEN", "Forbidden");
  }
  return user;
}
