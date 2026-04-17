const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();

const prisma = new PrismaClient();

// Get all agents
router.get('/', async (req, res) => {
  try {
    const agents = await prisma.agent.findMany({
      include: {
        model: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(agents);
  } catch (error) {
    console.error('Error fetching agents:', error);
    res.status(500).json({ error: 'Failed to fetch agents' });
  }
});

// Get a single agent by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const agent = await prisma.agent.findUnique({
      where: { id },
      include: {
        model: true
      }
    });
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }
    res.json(agent);
  } catch (error) {
    console.error('Error fetching agent:', error);
    res.status(500).json({ error: 'Failed to fetch agent' });
  }
});

// Create a new agent
router.post('/', async (req, res) => {
  try {
    const { name, description, systemPrompt, modelId } = req.body;
    
    // Validate required fields
    if (!name || !modelId) {
      return res.status(400).json({ error: 'Name and modelId are required' });
    }

    // Check if model exists
    const modelExists = await prisma.model.findUnique({ where: { id: modelId } });
    if (!modelExists) {
      return res.status(400).json({ error: 'Model not found' });
    }

    const agent = await prisma.agent.create({
      data: {
        name,
        description,
        systemPrompt,
        modelId
      },
      include: {
        model: true
      }
    });
    res.status(201).json(agent);
  } catch (error) {
    console.error('Error creating agent:', error);
    res.status(500).json({ error: 'Failed to create agent' });
  }
});

// Update an existing agent
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, systemPrompt, modelId } = req.body;
    
    // Check if agent exists
    const existingAgent = await prisma.agent.findUnique({ where: { id } });
    if (!existingAgent) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    if (modelId) {
      const modelExists = await prisma.model.findUnique({ where: { id: modelId } });
      if (!modelExists) {
        return res.status(400).json({ error: 'Model not found' });
      }
    }

    const agent = await prisma.agent.update({
      where: { id },
      data: {
        name: name !== undefined ? name : existingAgent.name,
        description: description !== undefined ? description : existingAgent.description,
        systemPrompt: systemPrompt !== undefined ? systemPrompt : existingAgent.systemPrompt,
        modelId: modelId !== undefined ? modelId : existingAgent.modelId
      },
      include: {
        model: true
      }
    });
    res.json(agent);
  } catch (error) {
    console.error('Error updating agent:', error);
    res.status(500).json({ error: 'Failed to update agent' });
  }
});

// Delete an agent
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if agent exists
    const existingAgent = await prisma.agent.findUnique({ where: { id } });
    if (!existingAgent) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    await prisma.agent.delete({
      where: { id }
    });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting agent:', error);
    res.status(500).json({ error: 'Failed to delete agent' });
  }
});

module.exports = router;
