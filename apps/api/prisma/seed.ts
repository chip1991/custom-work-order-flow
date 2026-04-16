import { PrismaClient, UserRole } from "@prisma/client";
import path from "node:path";
import "../src/loadEnv";
import { hashPassword } from "../src/security/password";

function resolveDatasourceUrl(): string | undefined {
  const url = process.env.DATABASE_URL;
  if (!url) return undefined;
  if (!url.startsWith("file:")) return url;

  const filePath = url.slice("file:".length);
  if (!filePath.startsWith(".")) return url;

  const absolutePath = path.resolve(__dirname, filePath);
  return `file:${absolutePath}`;
}

const datasourceUrl = resolveDatasourceUrl();
const prisma = datasourceUrl
  ? new PrismaClient({ datasources: { db: { url: datasourceUrl } } })
  : new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@example.com";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "admin123456";

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { role: UserRole.ADMIN },
    create: {
      email: adminEmail,
      passwordHash: hashPassword(adminPassword),
      role: UserRole.ADMIN
    }
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (err) => {
    await prisma.$disconnect();
    throw err;
  });
