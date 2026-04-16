import { prisma } from "../db";
import { HttpError } from "../http/errors";
import type { Request } from "express";
import { requireAuth } from "./middleware";

export async function requireProjectAccess(req: Request, projectId: string) {
  const user = requireAuth(req);
  if (user.role === "ADMIN") {
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
      throw new HttpError(404, "NOT_FOUND", "Project not found");
    }
    return project;
  }

  const project = await prisma.project.findFirst({
    where: { id: projectId, ownerId: user.id }
  });
  if (!project) {
    throw new HttpError(404, "NOT_FOUND", "Project not found");
  }
  return project;
}
