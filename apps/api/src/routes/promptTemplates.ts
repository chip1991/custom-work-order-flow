import express from "express";
import { prisma } from "../db";
import { requireAuth } from "../auth/middleware";
import { requireProjectAccess } from "../auth/project";
import { asyncHandler } from "../http/async";
import { HttpError } from "../http/errors";

export const promptTemplatesRouter = express.Router();

async function requirePromptTemplateAccess(req: express.Request, promptTemplateId: string) {
  const user = requireAuth(req);
  const pt = await prisma.promptTemplate.findUnique({ where: { id: promptTemplateId } });
  if (!pt) throw new HttpError(404, "NOT_FOUND", "PromptTemplate not found");
  if (user.role !== "ADMIN") {
    const project = await prisma.project.findFirst({ where: { id: pt.projectId, ownerId: user.id } });
    if (!project) throw new HttpError(404, "NOT_FOUND", "PromptTemplate not found");
  }
  return pt;
}

promptTemplatesRouter.get(
  "/projects/:projectId/prompt-templates",
  asyncHandler(async (req, res) => {
    const project = await requireProjectAccess(req, req.params.projectId);
    const promptTemplates = await prisma.promptTemplate.findMany({
      where: { projectId: project.id },
      orderBy: { createdAt: "desc" }
    });
    res.json({ promptTemplates });
  })
);

promptTemplatesRouter.post(
  "/projects/:projectId/prompt-templates",
  asyncHandler(async (req, res) => {
    const project = await requireProjectAccess(req, req.params.projectId);
    const name = String(req.body?.name ?? "");
    const template = String(req.body?.template ?? "");
    if (!name || !template) throw new HttpError(400, "INVALID_INPUT", "name and template are required");

    const promptTemplate = await prisma.promptTemplate
      .create({
        data: {
          name,
          template,
          projectId: project.id
        }
      })
      .catch((err) => {
        throw new HttpError(400, "PROMPT_TEMPLATE_CREATE_FAILED", "PromptTemplate creation failed", String(err));
      });

    res.status(201).json({ promptTemplate });
  })
);

promptTemplatesRouter.get(
  "/prompt-templates/:promptTemplateId",
  asyncHandler(async (req, res) => {
    const promptTemplate = await requirePromptTemplateAccess(req, req.params.promptTemplateId);
    res.json({ promptTemplate });
  })
);

promptTemplatesRouter.patch(
  "/prompt-templates/:promptTemplateId",
  asyncHandler(async (req, res) => {
    const promptTemplate = await requirePromptTemplateAccess(req, req.params.promptTemplateId);
    const name = req.body?.name !== undefined ? String(req.body.name) : undefined;
    const template = req.body?.template !== undefined ? String(req.body.template) : undefined;

    const updated = await prisma.promptTemplate.update({
      where: { id: promptTemplate.id },
      data: { ...(name !== undefined ? { name } : {}), ...(template !== undefined ? { template } : {}) }
    });
    res.json({ promptTemplate: updated });
  })
);

promptTemplatesRouter.delete(
  "/prompt-templates/:promptTemplateId",
  asyncHandler(async (req, res) => {
    const promptTemplate = await requirePromptTemplateAccess(req, req.params.promptTemplateId);
    await prisma.promptTemplate.delete({ where: { id: promptTemplate.id } });
    res.json({ ok: true });
  })
);
