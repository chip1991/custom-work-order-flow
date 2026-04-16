import express from "express";
import { prisma } from "../db";
import { requireAuth } from "../auth/middleware";
import { asyncHandler } from "../http/async";
import { HttpError } from "../http/errors";

export const samplesRouter = express.Router();

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

async function requireSampleAccess(req: express.Request, sampleId: string) {
  const user = requireAuth(req);
  const sample = await prisma.sample.findUnique({ where: { id: sampleId } });
  if (!sample) throw new HttpError(404, "NOT_FOUND", "Sample not found");
  if (user.role !== "ADMIN") {
    const dataset = await prisma.dataset.findUnique({ where: { id: sample.datasetId } });
    if (!dataset) throw new HttpError(404, "NOT_FOUND", "Sample not found");
    const project = await prisma.project.findFirst({ where: { id: dataset.projectId, ownerId: user.id } });
    if (!project) throw new HttpError(404, "NOT_FOUND", "Sample not found");
  }
  return sample;
}

samplesRouter.get(
  "/datasets/:datasetId/samples",
  asyncHandler(async (req, res) => {
    const dataset = await requireDatasetAccess(req, req.params.datasetId);
    const limit = Math.min(200, Math.max(1, Number(req.query.limit ?? 50)));
    const offset = Math.max(0, Number(req.query.offset ?? 0));

    const samples = await prisma.sample.findMany({
      where: { datasetId: dataset.id },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset
    });
    res.json({ samples, limit, offset });
  })
);

samplesRouter.post(
  "/datasets/:datasetId/samples",
  asyncHandler(async (req, res) => {
    const dataset = await requireDatasetAccess(req, req.params.datasetId);
    const input = req.body?.input;
    const context = req.body?.context;
    const metadata = req.body?.metadata;
    if (input === undefined) throw new HttpError(400, "INVALID_INPUT", "input is required");

    const sample = await prisma.sample.create({
      data: {
        datasetId: dataset.id,
        input,
        context: context ?? undefined,
        metadata: metadata ?? undefined
      }
    });
    res.status(201).json({ sample });
  })
);

samplesRouter.get(
  "/samples/:sampleId",
  asyncHandler(async (req, res) => {
    const sample = await requireSampleAccess(req, req.params.sampleId);
    res.json({ sample });
  })
);

samplesRouter.patch(
  "/samples/:sampleId",
  asyncHandler(async (req, res) => {
    const sample = await requireSampleAccess(req, req.params.sampleId);
    const input = req.body?.input;
    const context = req.body?.context;
    const metadata = req.body?.metadata;

    const updated = await prisma.sample.update({
      where: { id: sample.id },
      data: {
        ...(input !== undefined ? { input } : {}),
        ...(context !== undefined ? { context: context ?? null } : {}),
        ...(metadata !== undefined ? { metadata: metadata ?? null } : {})
      }
    });
    res.json({ sample: updated });
  })
);

samplesRouter.delete(
  "/samples/:sampleId",
  asyncHandler(async (req, res) => {
    const sample = await requireSampleAccess(req, req.params.sampleId);
    await prisma.sample.delete({ where: { id: sample.id } });
    res.json({ ok: true });
  })
);
