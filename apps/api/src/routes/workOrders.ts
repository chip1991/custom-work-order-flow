import express from "express";
import { prisma } from "../db";
import { requireAuth } from "../auth/middleware";
import { asyncHandler } from "../http/async";
import { HttpError } from "../http/errors";

export const workOrdersRouter = express.Router();

workOrdersRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    requireAuth(req);
    const workOrders = await prisma.workOrderFlow.findMany({
      orderBy: { createdAt: "desc" }
    });
    res.json(workOrders);
  })
);

workOrdersRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    requireAuth(req);
    const { id } = req.params;
    const workOrder = await prisma.workOrderFlow.findUnique({
      where: { id }
    });

    if (!workOrder) {
      throw new HttpError(404, "NOT_FOUND", "Work order flow not found");
    }

    res.json(workOrder);
  })
);

workOrdersRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    requireAuth(req);
    const { name, description, formSchema, workflowData } = req.body;

    if (!name) {
      throw new HttpError(400, "INVALID_INPUT", "Name is required");
    }

    const workOrder = await prisma.workOrderFlow.create({
      data: {
        name: String(name),
        description: description ? String(description) : null,
        formSchema: formSchema ? (typeof formSchema === "string" ? formSchema : JSON.stringify(formSchema)) : null,
        workflowData: workflowData ? (typeof workflowData === "string" ? workflowData : JSON.stringify(workflowData)) : null
      }
    });

    res.status(201).json(workOrder);
  })
);

workOrdersRouter.put(
  "/:id",
  asyncHandler(async (req, res) => {
    requireAuth(req);
    const { id } = req.params;
    const { name, description, formSchema, workflowData } = req.body;

    const existing = await prisma.workOrderFlow.findUnique({
      where: { id }
    });

    if (!existing) {
      throw new HttpError(404, "NOT_FOUND", "Work order flow not found");
    }

    const updatedWorkOrder = await prisma.workOrderFlow.update({
      where: { id },
      data: {
        name: name !== undefined ? String(name) : existing.name,
        description: description !== undefined ? (description ? String(description) : null) : existing.description,
        formSchema: formSchema !== undefined ? (formSchema ? (typeof formSchema === "string" ? formSchema : JSON.stringify(formSchema)) : null) : existing.formSchema,
        workflowData: workflowData !== undefined ? (workflowData ? (typeof workflowData === "string" ? workflowData : JSON.stringify(workflowData)) : null) : existing.workflowData
      }
    });

    res.json(updatedWorkOrder);
  })
);

workOrdersRouter.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    requireAuth(req);
    const { id } = req.params;
    
    const existing = await prisma.workOrderFlow.findUnique({
      where: { id }
    });

    if (!existing) {
      throw new HttpError(404, "NOT_FOUND", "Work order flow not found");
    }

    await prisma.workOrderFlow.delete({
      where: { id }
    });
    
    res.status(200).json({ success: true });
  })
);
