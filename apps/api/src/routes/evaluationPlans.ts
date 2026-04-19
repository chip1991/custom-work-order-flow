import express from "express";
import { prisma } from "../db";
import { requireAuth } from "../auth/middleware";
import { requireProjectAccess } from "../auth/project";
import { asyncHandler } from "../http/async";
import { HttpError } from "../http/errors";

export const evaluationPlansRouter = express.Router();

function parseSampleMode(value: unknown) {
  if (value === undefined) return undefined;
  if (value === "ALL" || value === "RANDOM_N") return value;
  throw new HttpError(400, "INVALID_INPUT", "sampleMode must be ALL or RANDOM_N");
}

async function requirePlanAccess(req: express.Request, planId: string) {
  const user = requireAuth(req);
  const plan = await prisma.evaluationPlan.findUnique({ where: { id: planId } });
  if (!plan) throw new HttpError(404, "NOT_FOUND", "EvaluationPlan not found");
  if (user.role !== "ADMIN") {
    const project = await prisma.project.findFirst({ where: { id: plan.projectId, ownerId: user.id } });
    if (!project) throw new HttpError(404, "NOT_FOUND", "EvaluationPlan not found");
  }
  return plan;
}

evaluationPlansRouter.get(
  "/projects/:projectId/plans",
  asyncHandler(async (req, res) => {
    const project = await requireProjectAccess(req, req.params.projectId);
    const plans = await prisma.evaluationPlan.findMany({
      where: { projectId: project.id },
      orderBy: { createdAt: "desc" },
      include: {
        metrics: { include: { metric: true } }
      }
    });
    res.json({ plans });
  })
);

evaluationPlansRouter.post(
  "/projects/:projectId/plans",
  asyncHandler(async (req, res) => {
    const project = await requireProjectAccess(req, req.params.projectId);
    const name = String(req.body?.name ?? "");
    const modelVersionId = String(req.body?.modelVersionId ?? "");
    const datasetId = String(req.body?.datasetId ?? "");
    const promptTemplateId = String(req.body?.promptTemplateId ?? "");
    const sampleMode = parseSampleMode(req.body?.sampleMode);
    const sampleCount = req.body?.sampleCount !== undefined ? Number(req.body.sampleCount) : undefined;
    const config = req.body?.config !== undefined ? req.body.config : undefined;
    const metricIds: string[] = Array.isArray(req.body?.metricIds) ? req.body.metricIds.map(String) : [];

    if (!name || !modelVersionId || !datasetId || !promptTemplateId) {
      throw new HttpError(400, "INVALID_INPUT", "name/modelVersionId/datasetId/promptTemplateId are required");
    }
    if (sampleCount !== undefined && (!Number.isInteger(sampleCount) || sampleCount <= 0)) {
      throw new HttpError(400, "INVALID_INPUT", "sampleCount must be positive integer");
    }

    const [mv, ds, pt] = await Promise.all([
      prisma.modelVersion.findUnique({ where: { id: modelVersionId } }),
      prisma.dataset.findUnique({ where: { id: datasetId } }),
      prisma.promptTemplate.findUnique({ where: { id: promptTemplateId } })
    ]);
    if (!mv) throw new HttpError(404, "NOT_FOUND", "ModelVersion not found");
    if (!ds) throw new HttpError(404, "NOT_FOUND", "Dataset not found");
    if (!pt) throw new HttpError(404, "NOT_FOUND", "PromptTemplate not found");
    if (ds.projectId !== project.id || pt.projectId !== project.id) {
      throw new HttpError(400, "INVALID_INPUT", "datasetId/promptTemplateId must belong to project");
    }
    const model = await prisma.model.findUnique({ where: { id: mv.modelId } });
    if (!model || model.projectId !== project.id) {
      throw new HttpError(400, "INVALID_INPUT", "modelVersionId must belong to project");
    }

    if (metricIds.length > 0) {
      const metrics = await prisma.metric.findMany({ where: { id: { in: metricIds }, projectId: project.id } });
      if (metrics.length !== metricIds.length) throw new HttpError(400, "INVALID_INPUT", "invalid metricIds");
    }

    const plan = await prisma.evaluationPlan
      .create({
        data: {
          name,
          sampleMode: sampleMode ?? undefined,
          sampleCount,
          config,
          projectId: project.id,
          modelVersionId,
          datasetId,
          promptTemplateId,
          metrics: {
            create: metricIds.map((metricId) => ({ metricId }))
          }
        },
        include: {
          metrics: { include: { metric: true } }
        }
      })
      .catch((err) => {
        throw new HttpError(400, "PLAN_CREATE_FAILED", "EvaluationPlan creation failed", String(err));
      });

    res.status(201).json({ plan });
  })
);

evaluationPlansRouter.get(
  "/plans/:planId",
  asyncHandler(async (req, res) => {
    const plan = await requirePlanAccess(req, req.params.planId);
    const full = await prisma.evaluationPlan.findUnique({
      where: { id: plan.id },
      include: {
        metrics: { include: { metric: true } }
      }
    });
    res.json({ plan: full });
  })
);

evaluationPlansRouter.patch(
  "/plans/:planId",
  asyncHandler(async (req, res) => {
    const plan = await requirePlanAccess(req, req.params.planId);

    const name = req.body?.name !== undefined ? String(req.body.name) : undefined;
    const sampleMode = parseSampleMode(req.body?.sampleMode);
    const sampleCount = req.body?.sampleCount !== undefined ? Number(req.body.sampleCount) : undefined;
    const config = req.body?.config !== undefined ? req.body.config : undefined;
    const metricIds: string[] | undefined = Array.isArray(req.body?.metricIds)
      ? req.body.metricIds.map(String)
      : undefined;

    if (sampleCount !== undefined && (!Number.isInteger(sampleCount) || sampleCount <= 0)) {
      throw new HttpError(400, "INVALID_INPUT", "sampleCount must be positive integer");
    }

    if (metricIds) {
      const metrics = await prisma.metric.findMany({ where: { id: { in: metricIds }, projectId: plan.projectId } });
      if (metrics.length !== metricIds.length) throw new HttpError(400, "INVALID_INPUT", "invalid metricIds");
    }

    const updated = await prisma.$transaction(async (tx) => {
      if (metricIds) {
        await tx.evaluationPlanMetric.deleteMany({ where: { planId: plan.id } });
        if (metricIds.length > 0) {
          await tx.evaluationPlanMetric.createMany({
            data: metricIds.map((metricId) => ({ planId: plan.id, metricId }))
          });
        }
      }

      return tx.evaluationPlan.update({
        where: { id: plan.id },
        data: {
          ...(name !== undefined ? { name } : {}),
          ...(sampleMode !== undefined ? { sampleMode } : {}),
          ...(sampleCount !== undefined ? { sampleCount } : {}),
          ...(config !== undefined ? { config } : {})
        },
        include: {
          metrics: { include: { metric: true } }
        }
      });
    });

    res.json({ plan: updated });
  })
);

evaluationPlansRouter.delete(
  "/plans/:planId",
  asyncHandler(async (req, res) => {
    const plan = await requirePlanAccess(req, req.params.planId);
    await prisma.evaluationPlan.delete({ where: { id: plan.id } });
    res.json({ ok: true });
  })
);
