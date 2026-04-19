import express from "express";
import { prisma } from "../db";
import { env } from "../env";
import { asyncHandler } from "../http/async";
import { serializeCookie } from "../http/cookies";
import { HttpError } from "../http/errors";
import { hashPassword, verifyPassword } from "../security/password";
import { generateToken } from "../security/token";
import { requireAuth } from "../auth/middleware";
import { createSession, revokeSession, sessionCookieName } from "../auth/session";

export const authRouter = express.Router();

authRouter.post(
  "/login",
  asyncHandler(async (req, res) => {
    const email = String(req.body?.email ?? "");
    const password = String(req.body?.password ?? "");
    if (!email || !password) {
      throw new HttpError(400, "INVALID_INPUT", "email and password are required");
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, role: true, passwordHash: true }
    });
    if (!user || !verifyPassword(password, user.passwordHash)) {
      throw new HttpError(401, "INVALID_CREDENTIALS", "Invalid credentials");
    }

    const token = generateToken();
    const { expiresAt } = await createSession(user.id, token);

    res.setHeader(
      "set-cookie",
      serializeCookie(sessionCookieName, token, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAgeSeconds: Math.floor((expiresAt.getTime() - Date.now()) / 1000)
      })
    );

    res.json({
      user: { id: user.id, email: user.email, role: user.role },
      token,
      expiresAt: expiresAt.toISOString()
    });
  })
);

authRouter.post(
  "/logout",
  asyncHandler(async (req, res) => {
    const authHeader = req.header("authorization");
    const cookieHeader = req.header("cookie");
    const tokenFromHeader = authHeader?.match(/^Bearer\s+(.+)$/i)?.[1]?.trim() ?? null;
    const tokenFromCookie = cookieHeader
      ?.split(";")
      .map((p) => p.trim())
      .find((p) => p.startsWith(`${sessionCookieName}=`))
      ?.slice(sessionCookieName.length + 1) ?? null;

    const token = tokenFromHeader ?? tokenFromCookie;
    if (token) {
      await revokeSession(decodeURIComponent(token));
    }

    res.setHeader(
      "set-cookie",
      serializeCookie(sessionCookieName, "", {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAgeSeconds: 0
      })
    );
    res.json({ ok: true });
  })
);

authRouter.get(
  "/me",
  asyncHandler(async (req, res) => {
    const user = requireAuth(req);
    res.json({ user });
  })
);

authRouter.post(
  "/register",
  asyncHandler(async (req, res) => {
    if (!env.allowRegistration) {
      throw new HttpError(403, "REGISTRATION_DISABLED", "Registration is disabled");
    }
    const email = String(req.body?.email ?? "");
    const password = String(req.body?.password ?? "");
    if (!email || !password) {
      throw new HttpError(400, "INVALID_INPUT", "email and password are required");
    }

    const created = await prisma.user
      .create({
        data: {
          email,
          passwordHash: hashPassword(password)
        },
        select: { id: true, email: true, role: true }
      })
      .catch((err) => {
        throw new HttpError(400, "USER_CREATE_FAILED", "User creation failed", String(err));
      });

    res.status(201).json({ user: created });
  })
);
