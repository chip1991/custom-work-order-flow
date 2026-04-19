import express from "express";
import { prisma } from "../db";
import { requireAuth } from "../auth/middleware";
import { requireProjectAccess } from "../auth/project";
import { asyncHandler } from "../http/async";
import { HttpError } from "../http/errors";

export const metricsRouter = express.Router();

async function requireMetricAccess(req: express.Request, metricId: string) {
  const user = requireAuth(req);
  const metric = await prisma.metric.findUnique({ where: { id: metricId } });
  if (!metric) throw new HttpError(404, "NOT_FOUND", "Metric not found");
  if (user.role !== "ADMIN") {
    const project = await prisma.project.findFirst({ where: { id: metric.projectId, ownerId: user.id } });
    if (!project) throw new HttpError(404, "NOT_FOUND", "Metric not found");
  }
  return metric;
}

metricsRouter.get(
  "/projects/:projectId/metrics",
  asyncHandler(async (req, res) => {
    const project = await requireProjectAccess(req, req.params.projectId);
    const metrics = await prisma.metric.findMany({
      where: { projectId: project.id },
      orderBy: { createdAt: "desc" }
    });
    res.json({ metrics });
  })
);

metricsRouter.post(
  "/projects/:projectId/metrics",
  asyncHandler(async (req, res) => {
    const project = await requireProjectAccess(req, req.params.projectId);
    const name = String(req.body?.name ?? "");
    const kind = String(req.body?.kind ?? "");
    const config = req.body?.config !== undefined ? req.body.config : undefined;
    if (!name || !kind) throw new HttpError(400, "INVALID_INPUT", "name and kind are required");

    const metric = await prisma.metric
      .create({
        data: {
          name,
          kind,
          config,
          projectId: project.id
        }
      })
      .catch((err) => {
        throw new HttpError(400, "METRIC_CREATE_FAILED", "Metric creation failed", String(err));
      });

    res.status(201).json({ metric });
  })
);

metricsRouter.get(
  "/metrics/:metricId",
  asyncHandler(async (req, res) => {
    const metric = await requireMetricAccess(req, req.params.metricId);
    res.json({ metric });
  })
);

metricsRouter.patch(
  "/metrics/:metricId",
  asyncHandler(async (req, res) => {
    const metric = await requireMetricAccess(req, req.params.metricId);
    const name = req.body?.name !== undefined ? String(req.body.name) : undefined;
    const kind = req.body?.kind !== undefined ? String(req.body.kind) : undefined;
    const config = req.body?.config !== undefined ? req.body.config : undefined;

    const updated = await prisma.metric.update({
      where: { id: metric.id },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(kind !== undefined ? { kind } : {}),
        ...(config !== undefined ? { config } : {})
      }
    });

    res.json({ metric: updated });
  })
);

metricsRouter.delete(
  "/metrics/:metricId",
  asyncHandler(async (req, res) => {
    const metric = await requireMetricAccess(req, req.params.metricId);
    await prisma.metric.delete({ where: { id: metric.id } });
    res.json({ ok: true });
  })
);
