import express from "express";
import { prisma } from "../db";
import { requireAuth } from "../auth/middleware";
import { requireProjectAccess } from "../auth/project";
import { asyncHandler } from "../http/async";
import { HttpError } from "../http/errors";

export const modelsRouter = express.Router();

async function requireModelAccess(req: express.Request, modelId: string) {
  const user = requireAuth(req);
  const model = await prisma.model.findUnique({ where: { id: modelId } });
  if (!model) throw new HttpError(404, "NOT_FOUND", "Model not found");
  if (user.role !== "ADMIN") {
    const project = await prisma.project.findFirst({ where: { id: model.projectId, ownerId: user.id } });
    if (!project) throw new HttpError(404, "NOT_FOUND", "Model not found");
  }
  return model;
}

modelsRouter.get(
  "/projects/:projectId/models",
  asyncHandler(async (req, res) => {
    const project = await requireProjectAccess(req, req.params.projectId);
    const models = await prisma.model.findMany({
      where: { projectId: project.id },
      orderBy: { createdAt: "desc" }
    });
    res.json({ models });
  })
);

modelsRouter.post(
  "/projects/:projectId/models",
  asyncHandler(async (req, res) => {
    const project = await requireProjectAccess(req, req.params.projectId);
    const name = String(req.body?.name ?? "");
    const provider = req.body?.provider !== undefined ? String(req.body.provider) : undefined;
    if (!name) throw new HttpError(400, "INVALID_INPUT", "name is required");

    const model = await prisma.model
      .create({
        data: {
          name,
          provider,
          projectId: project.id
        }
      })
      .catch((err) => {
        throw new HttpError(400, "MODEL_CREATE_FAILED", "Model creation failed", String(err));
      });

    res.status(201).json({ model });
  })
);

modelsRouter.get(
  "/models/:modelId",
  asyncHandler(async (req, res) => {
    const model = await requireModelAccess(req, req.params.modelId);
    res.json({ model });
  })
);

modelsRouter.patch(
  "/models/:modelId",
  asyncHandler(async (req, res) => {
    const model = await requireModelAccess(req, req.params.modelId);
    const name = req.body?.name !== undefined ? String(req.body.name) : undefined;
    const provider = req.body?.provider !== undefined ? String(req.body.provider) : undefined;

    const updated = await prisma.model.update({
      where: { id: model.id },
      data: { ...(name !== undefined ? { name } : {}), ...(provider !== undefined ? { provider } : {}) }
    });

    res.json({ model: updated });
  })
);

modelsRouter.delete(
  "/models/:modelId",
  asyncHandler(async (req, res) => {
    const model = await requireModelAccess(req, req.params.modelId);
    await prisma.model.delete({ where: { id: model.id } });
    res.json({ ok: true });
  })
);
