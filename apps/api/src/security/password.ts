import crypto from "node:crypto";

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(password, salt, 64);
  return `scrypt:1:${salt.toString("base64")}:${hash.toString("base64")}`;
}

export function verifyPassword(password: string, passwordHash: string): boolean {
  const [algo, version, saltB64, hashB64] = passwordHash.split(":");
  if (algo !== "scrypt" || version !== "1" || !saltB64 || !hashB64) {
    return false;
  }

  const salt = Buffer.from(saltB64, "base64");
  const expected = Buffer.from(hashB64, "base64");
  const actual = crypto.scryptSync(password, salt, expected.length);
  return crypto.timingSafeEqual(actual, expected);
}
