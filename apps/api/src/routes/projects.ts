import express from "express";
import { prisma } from "../db";
import { requireAuth } from "../auth/middleware";
import { requireProjectAccess } from "../auth/project";
import { asyncHandler } from "../http/async";
import { HttpError } from "../http/errors";

export const projectsRouter = express.Router();

projectsRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const user = requireAuth(req);
    const projects = await prisma.project.findMany({
      where: user.role === "ADMIN" ? undefined : { ownerId: user.id },
      orderBy: { createdAt: "desc" }
    });
    res.json({ projects });
  })
);

projectsRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const user = requireAuth(req);
    const name = String(req.body?.name ?? "");
    const description = req.body?.description !== undefined ? String(req.body.description) : null;
    if (!name) {
      throw new HttpError(400, "INVALID_INPUT", "name is required");
    }

    const project = await prisma.project
      .create({
        data: {
          name,
          description: description || undefined,
          ownerId: user.id
        }
      })
      .catch((err) => {
        throw new HttpError(400, "PROJECT_CREATE_FAILED", "Project creation failed", String(err));
      });

    res.status(201).json({ project });
  })
);

projectsRouter.get(
  "/:projectId",
  asyncHandler(async (req, res) => {
    const project = await requireProjectAccess(req, req.params.projectId);
    res.json({ project });
  })
);

projectsRouter.patch(
  "/:projectId",
  asyncHandler(async (req, res) => {
    const project = await requireProjectAccess(req, req.params.projectId);
    const name = req.body?.name !== undefined ? String(req.body.name) : undefined;
    const description = req.body?.description !== undefined ? String(req.body.description) : undefined;

    const updated = await prisma.project.update({
      where: { id: project.id },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(description !== undefined ? { description: description || null } : {})
      }
    });

    res.json({ project: updated });
  })
);

projectsRouter.delete(
  "/:projectId",
  asyncHandler(async (req, res) => {
    const project = await requireProjectAccess(req, req.params.projectId);
    await prisma.project.delete({ where: { id: project.id } });
    res.json({ ok: true });
  })
);
