const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// 1. 获取工单流程列表
router.get('/', async (req, res) => {
  try {
    const workOrders = await prisma.workOrderFlow.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(workOrders);
  } catch (error) {
    console.error('Get work orders error:', error);
    res.status(500).json({ error: 'Failed to fetch work orders' });
  }
});

// 2. 获取单条工单流程
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const workOrder = await prisma.workOrderFlow.findUnique({
      where: { id }
    });

    if (!workOrder) {
      return res.status(404).json({ error: 'Work order flow not found' });
    }

    res.json(workOrder);
  } catch (error) {
    console.error('Get work order error:', error);
    res.status(500).json({ error: 'Failed to fetch work order' });
  }
});

// 3. 创建工单流程
router.post('/', async (req, res) => {
  try {
    const { name, description, formSchema, workflowData } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const workOrder = await prisma.workOrderFlow.create({
      data: {
        name,
        description,
        formSchema: formSchema ? JSON.stringify(formSchema) : null,
        workflowData: workflowData ? JSON.stringify(workflowData) : null
      }
    });

    res.status(201).json(workOrder);
  } catch (error) {
    console.error('Create work order error:', error);
    res.status(500).json({ error: 'Failed to create work order' });
  }
});

// 4. 更新工单流程
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, formSchema, workflowData } = req.body;

    // Verify if it exists first
    const existing = await prisma.workOrderFlow.findUnique({
      where: { id }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Work order flow not found' });
    }

    const updatedWorkOrder = await prisma.workOrderFlow.update({
      where: { id },
      data: {
        name: name !== undefined ? name : existing.name,
        description: description !== undefined ? description : existing.description,
        formSchema: formSchema !== undefined ? (formSchema ? JSON.stringify(formSchema) : null) : existing.formSchema,
        workflowData: workflowData !== undefined ? (workflowData ? JSON.stringify(workflowData) : null) : existing.workflowData
      }
    });

    res.json(updatedWorkOrder);
  } catch (error) {
    console.error('Update work order error:', error);
    res.status(500).json({ error: 'Failed to update work order' });
  }
});

// 5. 删除工单流程
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verify if it exists first
    const existing = await prisma.workOrderFlow.findUnique({
      where: { id }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Work order flow not found' });
    }

    await prisma.workOrderFlow.delete({
      where: { id }
    });
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Delete work order error:', error);
    res.status(500).json({ error: 'Failed to delete work order' });
  }
});

module.exports = router;
