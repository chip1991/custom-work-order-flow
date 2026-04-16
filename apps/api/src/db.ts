import { PrismaClient } from "@prisma/client";
import path from "node:path";
import "./loadEnv";

function resolveDatasourceUrl(): string | undefined {
  const url = process.env.DATABASE_URL;
  if (!url) return undefined;
  if (!url.startsWith("file:")) return url;

  const filePath = url.slice("file:".length);
  if (!filePath.startsWith(".")) return url;

  const schemaDir = path.resolve(__dirname, "../prisma");
  const absolutePath = path.resolve(schemaDir, filePath);
  return `file:${absolutePath}`;
}

const datasourceUrl = resolveDatasourceUrl();

export const prisma = datasourceUrl
  ? new PrismaClient({ datasources: { db: { url: datasourceUrl } } })
  : new PrismaClient();
