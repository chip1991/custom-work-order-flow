import express from "express";
import type { Prisma } from "@prisma/client";
import { prisma } from "../db";
import { requireAuth } from "../auth/middleware";
import { asyncHandler } from "../http/async";
import { HttpError } from "../http/errors";

export const runsRouter = express.Router();

const allowedRunStatuses = ["QUEUED", "RUNNING", "SUCCEEDED", "FAILED", "CANCELED"] as const;
type AllowedRunStatus = (typeof allowedRunStatuses)[number];

async function requireRunAccess(req: express.Request, runId: string) {
  const user = requireAuth(req);
  const run = await prisma.evaluationRun.findUnique({ where: { id: runId } });
  if (!run) throw new HttpError(404, "NOT_FOUND", "Run not found");

  if (user.role !== "ADMIN") {
    const plan = await prisma.evaluationPlan.findUnique({ where: { id: run.planId } });
    if (!plan) throw new HttpError(404, "NOT_FOUND", "Run not found");
    const project = await prisma.project.findFirst({ where: { id: plan.projectId, ownerId: user.id } });
    if (!project) throw new HttpError(404, "NOT_FOUND", "Run not found");
  }

  return run;
}

function shuffle<T>(arr: T[]) {
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const t = arr[i] as T;
    arr[i] = arr[j] as T;
    arr[j] = t;
  }
  return arr;
}

runsRouter.post(
  "/plans/:planId/runs",
  asyncHandler(async (req, res) => {
    const user = requireAuth(req);
    const planId = req.params.planId;
    const plan = await prisma.evaluationPlan.findUnique({
      where: { id: planId },
      include: {
        metrics: true,
        dataset: { select: { id: true, projectId: true } },
        promptTemplate: { select: { id: true, template: true } },
        modelVersion: { select: { id: true, baseUrl: true, config: true, modelId: true } }
      }
    });
    if (!plan) throw new HttpError(404, "NOT_FOUND", "EvaluationPlan not found");

    if (user.role !== "ADMIN") {
      const project = await prisma.project.findFirst({ where: { id: plan.projectId, ownerId: user.id } });
      if (!project) throw new HttpError(404, "NOT_FOUND", "EvaluationPlan not found");
    }

    const sampleIdsAll = await prisma.sample.findMany({
      where: { datasetId: plan.datasetId },
      select: { id: true }
    });
    let sampleIds = sampleIdsAll.map((s) => s.id);

    if (plan.sampleMode === "RANDOM_N") {
      const n = plan.sampleCount ?? 0;
      if (!n || n <= 0) throw new HttpError(400, "INVALID_INPUT", "sampleCount is required for RANDOM_N");
      sampleIds = shuffle(sampleIds).slice(0, Math.min(n, sampleIds.length));
    }

    const snapshot = {
      id: plan.id,
      name: plan.name,
      projectId: plan.projectId,
      modelVersionId: plan.modelVersionId,
      datasetId: plan.datasetId,
      promptTemplateId: plan.promptTemplateId,
      sampleMode: plan.sampleMode,
      sampleCount: plan.sampleCount,
      config: plan.config,
      metricIds: plan.metrics.map((m) => m.metricId),
      promptTemplate: {
        template: plan.promptTemplate.template
      },
      modelVersion: {
        id: plan.modelVersion.id,
        baseUrl: plan.modelVersion.baseUrl,
        config: plan.modelVersion.config
      }
    };

    const run = await prisma.$transaction(async (tx) => {
      const created = await tx.evaluationRun.create({
        data: {
          planId: plan.id,
          createdById: user.id,
          status: "QUEUED",
          planSnapshot: snapshot as Prisma.InputJsonValue
        }
      });

      if (sampleIds.length > 0) {
        await tx.runCase.createMany({
          data: sampleIds.map((sampleId) => ({
            runId: created.id,
            sampleId,
            status: "QUEUED"
          }))
        });
      }

      return created;
    });

    res.status(201).json({ run });
  })
);

runsRouter.get(
  "/runs",
  asyncHandler(async (req, res) => {
    const user = requireAuth(req);
    const planId = req.query.planId ? String(req.query.planId) : undefined;
    const statusRaw = req.query.status ? String(req.query.status) : undefined;
    const status: AllowedRunStatus | undefined = statusRaw
      ? allowedRunStatuses.includes(statusRaw as AllowedRunStatus)
        ? (statusRaw as AllowedRunStatus)
        : (() => {
            throw new HttpError(400, "INVALID_INPUT", "invalid status");
          })()
      : undefined;

    const runs = await prisma.evaluationRun.findMany({
      where: {
        ...(planId ? { planId } : {}),
        ...(status ? { status } : {}),
        ...(user.role === "ADMIN"
          ? {}
          : {
              plan: {
                project: {
                  ownerId: user.id
                }
              }
            })
      },
      orderBy: { createdAt: "desc" },
      include: { plan: true }
    });

    res.json({ runs });
  })
);

runsRouter.get(
  "/runs/:runId",
  asyncHandler(async (req, res) => {
    const run = await requireRunAccess(req, req.params.runId);
    const full = await prisma.evaluationRun.findUnique({
      where: { id: run.id },
      include: {
        plan: true,
        cases: {
          include: {
            sample: true,
            metricResults: { include: { metric: true } }
          },
          orderBy: { createdAt: "asc" }
        }
      }
    });
    res.json({ run: full });
  })
);

runsRouter.post(
  "/runs/:runId/cancel",
  asyncHandler(async (req, res) => {
    const run = await requireRunAccess(req, req.params.runId);
    if (["SUCCEEDED", "FAILED", "CANCELED"].includes(run.status)) {
      res.json({ ok: true, run });
      return;
    }

    const updated = await prisma.$transaction(async (tx) => {
      const r = await tx.evaluationRun.update({
        where: { id: run.id },
        data: {
          status: "CANCELED",
          finishedAt: new Date()
        }
      });

      await tx.runCase.updateMany({
        where: { runId: run.id, status: { in: ["QUEUED", "RUNNING"] } },
        data: { status: "CANCELED", finishedAt: new Date() }
      });

      return r;
    });

    res.json({ ok: true, run: updated });
  })
);
