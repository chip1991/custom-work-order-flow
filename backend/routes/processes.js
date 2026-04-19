const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all processes
router.get('/', async (req, res) => {
  try {
    const processes = await prisma.process.findMany({
      orderBy: { updatedAt: 'desc' }
    });
    res.json(processes);
  } catch (error) {
    console.error('Failed to fetch processes:', error);
    res.status(500).json({ error: 'Failed to fetch processes' });
  }
});

// Get a single process by id
router.get('/:id', async (req, res) => {
  try {
    const process = await prisma.process.findUnique({
      where: { id: req.params.id }
    });
    if (!process) {
      return res.status(404).json({ error: 'Process not found' });
    }
    res.json(process);
  } catch (error) {
    console.error('Failed to fetch process:', error);
    res.status(500).json({ error: 'Failed to fetch process' });
  }
});

// Create a new process
router.post('/', async (req, res) => {
  try {
    const { name, description, communities, status, timeLimit, nodes, edges, formConfig } = req.body;
    const process = await prisma.process.create({
      data: {
        name: name || 'Untitled Process',
        description: description || '',
        communities: communities || '[]',
        status: status || 'active',
        timeLimit: timeLimit !== undefined ? parseInt(timeLimit, 10) : 24,
        nodes: nodes || '[]',
        edges: edges || '[]',
        formConfig: formConfig || '[]'
      }
    });
    res.status(201).json(process);
  } catch (error) {
    console.error('Failed to create process:', error);
    res.status(500).json({ error: 'Failed to create process' });
  }
});

// Update an existing process
router.put('/:id', async (req, res) => {
  try {
    const { name, description, communities, status, timeLimit, nodes, edges, formConfig } = req.body;
    
    // Build update data, only include fields that are provided
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (communities !== undefined) updateData.communities = communities;
    if (status !== undefined) updateData.status = status;
    if (timeLimit !== undefined) updateData.timeLimit = parseInt(timeLimit, 10);
    if (nodes !== undefined) updateData.nodes = nodes;
    if (edges !== undefined) updateData.edges = edges;
    if (formConfig !== undefined) updateData.formConfig = formConfig;

    const process = await prisma.process.update({
      where: { id: req.params.id },
      data: updateData
    });
    res.json(process);
  } catch (error) {
    console.error('Failed to update process:', error);
    res.status(500).json({ error: 'Failed to update process' });
  }
});

// Delete a process
router.delete('/:id', async (req, res) => {
  try {
    await prisma.process.delete({
      where: { id: req.params.id }
    });
    res.status(204).send();
  } catch (error) {
    console.error('Failed to delete process:', error);
    res.status(500).json({ error: 'Failed to delete process' });
  }
});

module.exports = router;
