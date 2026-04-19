import express from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../db";
import { requireAuth } from "../auth/middleware";
import { requireProjectAccess } from "../auth/project";
import { asyncHandler } from "../http/async";
import { HttpError } from "../http/errors";

export const datasetsRouter = express.Router();

function toJsonValue(value: unknown): Prisma.InputJsonValue | Prisma.NullTypes.JsonNull {
  if (value === null) return Prisma.JsonNull;
  return value as Prisma.InputJsonValue;
}

async function requireDatasetAccess(req: express.Request, datasetId: string) {
  const user = requireAuth(req);
  const dataset = await prisma.dataset.findUnique({ where: { id: datasetId } });
  if (!dataset) throw new HttpError(404, "NOT_FOUND", "Dataset not found");
  if (user.role !== "ADMIN") {
    const project = await prisma.project.findFirst({ where: { id: dataset.projectId, ownerId: user.id } });
    if (!project) throw new HttpError(404, "NOT_FOUND", "Dataset not found");
  }
  return dataset;
}

datasetsRouter.get(
  "/projects/:projectId/datasets",
  asyncHandler(async (req, res) => {
    const project = await requireProjectAccess(req, req.params.projectId);
    const datasets = await prisma.dataset.findMany({
      where: { projectId: project.id },
      orderBy: { createdAt: "desc" }
    });
    res.json({ datasets });
  })
);

datasetsRouter.post(
  "/projects/:projectId/datasets",
  asyncHandler(async (req, res) => {
    const project = await requireProjectAccess(req, req.params.projectId);
    const name = String(req.body?.name ?? "");
    const description = req.body?.description !== undefined ? String(req.body.description) : null;
    if (!name) throw new HttpError(400, "INVALID_INPUT", "name is required");

    const dataset = await prisma.dataset
      .create({
        data: {
          name,
          description: description || undefined,
          projectId: project.id
        }
      })
      .catch((err) => {
        throw new HttpError(400, "DATASET_CREATE_FAILED", "Dataset creation failed", String(err));
      });

    res.status(201).json({ dataset });
  })
);

datasetsRouter.get(
  "/datasets/:datasetId",
  asyncHandler(async (req, res) => {
    const dataset = await requireDatasetAccess(req, req.params.datasetId);
    res.json({ dataset });
  })
);

datasetsRouter.patch(
  "/datasets/:datasetId",
  asyncHandler(async (req, res) => {
    const dataset = await requireDatasetAccess(req, req.params.datasetId);
    const name = req.body?.name !== undefined ? String(req.body.name) : undefined;
    const description = req.body?.description !== undefined ? String(req.body.description) : undefined;

    const updated = await prisma.dataset.update({
      where: { id: dataset.id },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(description !== undefined ? { description: description || null } : {})
      }
    });

    res.json({ dataset: updated });
  })
);

datasetsRouter.delete(
  "/datasets/:datasetId",
  asyncHandler(async (req, res) => {
    const dataset = await requireDatasetAccess(req, req.params.datasetId);
    await prisma.dataset.delete({ where: { id: dataset.id } });
    res.json({ ok: true });
  })
);

datasetsRouter.post(
  "/datasets/:datasetId/import/jsonl",
  asyncHandler(async (req, res) => {
    const dataset = await requireDatasetAccess(req, req.params.datasetId);
    const jsonl = String(req.body?.jsonl ?? "");
    if (!jsonl) throw new HttpError(400, "INVALID_INPUT", "jsonl is required");

    const lines = jsonl.split(/\r?\n/);
    const rows: Array<{ input: unknown; context?: unknown; metadata?: unknown }> = [];
    const errors: Array<{ line: number; message: string; raw: string }> = [];

    for (let i = 0; i < lines.length; i += 1) {
      const raw = lines[i] ?? "";
      if (!raw.trim()) continue;
      try {
        const parsed = JSON.parse(raw) as unknown;
        if (
          parsed &&
          typeof parsed === "object" &&
          ("input" in parsed || "context" in parsed || "metadata" in parsed)
        ) {
          const rec = parsed as Record<string, unknown>;
          if (!("input" in rec)) {
            errors.push({ line: i + 1, message: "Missing field: input", raw });
            continue;
          }
          rows.push({
            input: rec.input,
            context: rec.context,
            metadata: rec.metadata
          });
        } else {
          rows.push({ input: parsed });
        }
      } catch (err) {
        errors.push({ line: i + 1, message: err instanceof Error ? err.message : String(err), raw });
      }
    }

    if (errors.length > 0) {
      throw new HttpError(400, "JSONL_IMPORT_FAILED", "JSONL import failed", { errors });
    }

    const result = await prisma.$transaction(async (tx) => {
      return tx.sample.createMany({
        data: rows.map((r) => ({
          datasetId: dataset.id,
          input: toJsonValue(r.input),
          context: r.context === undefined ? undefined : toJsonValue(r.context),
          metadata: r.metadata === undefined ? undefined : toJsonValue(r.metadata)
        }))
      });
    });

    res.json({ ok: true, inserted: result.count });
  })
);
