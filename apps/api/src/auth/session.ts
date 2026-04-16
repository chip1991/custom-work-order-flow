import { prisma } from "../db";
import { env } from "../env";
import { hashToken } from "../security/token";

export const sessionCookieName = "session";

export async function getUserBySessionToken(token: string) {
  const tokenHash = hashToken(token);
  const now = new Date();

  const session = await prisma.session.findFirst({
    where: {
      tokenHash,
      revokedAt: null,
      expiresAt: { gt: now }
    },
    select: {
      user: { select: { id: true, email: true, role: true } }
    }
  });

  return session?.user ?? null;
}

export async function createSession(userId: string, token: string) {
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + env.sessionTtlDays * 24 * 60 * 60 * 1000);

  await prisma.session.create({
    data: {
      tokenHash,
      userId,
      expiresAt
    }
  });

  return { expiresAt };
}

export async function revokeSession(token: string) {
  const tokenHash = hashToken(token);
  await prisma.session.updateMany({
    where: { tokenHash, revokedAt: null },
    data: { revokedAt: new Date() }
  });
}
