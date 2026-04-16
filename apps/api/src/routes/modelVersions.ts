import express from "express";
import { prisma } from "../db";
import { requireAuth } from "../auth/middleware";
import { asyncHandler } from "../http/async";
import { HttpError } from "../http/errors";
import { pingOpenAICompatible } from "../engine/openai";

export const modelVersionsRouter = express.Router();

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

async function requireModelVersionAccess(req: express.Request, modelVersionId: string) {
  const user = requireAuth(req);
  const mv = await prisma.modelVersion.findUnique({ where: { id: modelVersionId } });
  if (!mv) throw new HttpError(404, "NOT_FOUND", "ModelVersion not found");
  if (user.role !== "ADMIN") {
    const model = await prisma.model.findUnique({ where: { id: mv.modelId } });
    if (!model) throw new HttpError(404, "NOT_FOUND", "ModelVersion not found");
    const project = await prisma.project.findFirst({ where: { id: model.projectId, ownerId: user.id } });
    if (!project) throw new HttpError(404, "NOT_FOUND", "ModelVersion not found");
  }
  return mv;
}

modelVersionsRouter.get(
  "/models/:modelId/versions",
  asyncHandler(async (req, res) => {
    const user = requireAuth(req);
    const modelId = req.params.modelId;
    const model = await prisma.model.findUnique({ where: { id: modelId } });
    if (!model) throw new HttpError(404, "NOT_FOUND", "Model not found");
    if (user.role !== "ADMIN") {
      const project = await prisma.project.findFirst({ where: { id: model.projectId, ownerId: user.id } });
      if (!project) throw new HttpError(404, "NOT_FOUND", "Model not found");
    }

    const versions = await prisma.modelVersion.findMany({
      where: { modelId },
      orderBy: { createdAt: "desc" }
    });
    res.json({ versions });
  })
);

modelVersionsRouter.post(
  "/models/:modelId/versions",
  asyncHandler(async (req, res) => {
    const user = requireAuth(req);
    const modelId = req.params.modelId;
    const model = await prisma.model.findUnique({ where: { id: modelId } });
    if (!model) throw new HttpError(404, "NOT_FOUND", "Model not found");
    if (user.role !== "ADMIN") {
      const project = await prisma.project.findFirst({ where: { id: model.projectId, ownerId: user.id } });
      if (!project) throw new HttpError(404, "NOT_FOUND", "Model not found");
    }

    const name = String(req.body?.name ?? "");
    const baseUrl = req.body?.baseUrl !== undefined ? String(req.body.baseUrl) : undefined;
    const config = req.body?.config !== undefined ? req.body.config : undefined;
    if (!name) throw new HttpError(400, "INVALID_INPUT", "name is required");

    const version = await prisma.modelVersion
      .create({
        data: {
          name,
          baseUrl,
          config,
          modelId
        }
      })
      .catch((err) => {
        throw new HttpError(400, "MODEL_VERSION_CREATE_FAILED", "ModelVersion creation failed", String(err));
      });

    res.status(201).json({ version });
  })
);

modelVersionsRouter.get(
  "/model-versions/:modelVersionId",
  asyncHandler(async (req, res) => {
    const version = await requireModelVersionAccess(req, req.params.modelVersionId);
    res.json({ version });
  })
);

modelVersionsRouter.patch(
  "/model-versions/:modelVersionId",
  asyncHandler(async (req, res) => {
    const version = await requireModelVersionAccess(req, req.params.modelVersionId);
    const name = req.body?.name !== undefined ? String(req.body.name) : undefined;
    const baseUrl = req.body?.baseUrl !== undefined ? String(req.body.baseUrl) : undefined;
    const config = req.body?.config !== undefined ? req.body.config : undefined;

    const updated = await prisma.modelVersion.update({
      where: { id: version.id },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(baseUrl !== undefined ? { baseUrl } : {}),
        ...(config !== undefined ? { config } : {})
      }
    });
    res.json({ version: updated });
  })
);

modelVersionsRouter.delete(
  "/model-versions/:modelVersionId",
  asyncHandler(async (req, res) => {
    const version = await requireModelVersionAccess(req, req.params.modelVersionId);
    await prisma.modelVersion.delete({ where: { id: version.id } });
    res.json({ ok: true });
  })
);

modelVersionsRouter.get(
  "/model-versions/:modelVersionId/health",
  asyncHandler(async (req, res) => {
    const version = await requireModelVersionAccess(req, req.params.modelVersionId);
    if (!version.baseUrl) throw new HttpError(400, "INVALID_INPUT", "baseUrl is required");
    const cfg = asRecord(version.config) ?? {};
    const headers = (asRecord(cfg.headers) ?? {}) as Record<string, string>;
    const apiKey = typeof cfg.apiKey === "string" ? cfg.apiKey : undefined;
    const timeoutMs = typeof cfg.timeoutMs === "number" ? cfg.timeoutMs : undefined;

    const result = await pingOpenAICompatible({
      baseUrl: version.baseUrl,
      config: {
        apiKey,
        headers,
        timeoutMs
      }
    }).catch((err) => {
      throw new HttpError(502, "MODEL_VERSION_UNHEALTHY", "ModelVersion health check failed", String(err));
    });

    res.json({ ok: true, result });
  })
);
