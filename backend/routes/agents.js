const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { DagEngine } = require('../services/dag-engine');
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
    res.json(agents.map(agent => ({
      ...agent,
      workflow: agent.workflow ? JSON.parse(agent.workflow) : null
    })));
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
    res.json({
      ...agent,
      workflow: agent.workflow ? JSON.parse(agent.workflow) : null
    });
  } catch (error) {
    console.error('Error fetching agent:', error);
    res.status(500).json({ error: 'Failed to fetch agent' });
  }
});

// Create a new agent
router.post('/', async (req, res) => {
  try {
    const { name, description, systemPrompt, modelId, workflow } = req.body;
    
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
        modelId,
        workflow: workflow ? JSON.stringify(workflow) : null
      },
      include: {
        model: true
      }
    });
    res.status(201).json({
      ...agent,
      workflow: agent.workflow ? JSON.parse(agent.workflow) : null
    });
  } catch (error) {
    console.error('Error creating agent:', error);
    res.status(500).json({ error: 'Failed to create agent' });
  }
});

// Update an existing agent
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, systemPrompt, modelId, workflow } = req.body;
    
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
        modelId: modelId !== undefined ? modelId : existingAgent.modelId,
        workflow: workflow !== undefined ? (workflow ? JSON.stringify(workflow) : null) : existingAgent.workflow
      },
      include: {
        model: true
      }
    });
    res.json({
      ...agent,
      workflow: agent.workflow ? JSON.parse(agent.workflow) : null
    });
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

// Execute an agent's workflow
router.post('/execute', async (req, res) => {
  try {
    const { input, stream, workflow } = req.body;
    
    if (!workflow) {
      return res.status(400).json({ error: 'Workflow is required' });
    }

    const nodes = workflow.nodes || [];
    const edges = workflow.edges || [];

    const engine = new DagEngine();
    const initialContext = { input };

    if (stream) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      const onEvent = (event) => {
        res.write(`data: ${JSON.stringify(event)}\n\n`);
      };

      try {
        await engine.run(nodes, edges, initialContext, onEvent);
      } catch (error) {
        res.write(`data: ${JSON.stringify({ type: 'workflow_error', error: error.message })}\n\n`);
      }
      res.write('data: [DONE]\n\n');
      res.end();
    } else {
      const results = await engine.run(nodes, edges, initialContext);
      res.json({ results });
    }
  } catch (error) {
    console.error('Error executing agent workflow:', error);
    res.status(500).json({ error: 'Failed to execute workflow' });
  }
});

// Execute an agent's workflow by ID
router.post('/:id/execute', async (req, res) => {
  try {
    const { id } = req.params;
    const { input, stream, workflow: overrideWorkflow } = req.body;
    
    let workflow = overrideWorkflow;

    if (!workflow) {
      const agent = await prisma.agent.findUnique({ where: { id } });
      if (!agent) {
        return res.status(404).json({ error: 'Agent not found' });
      }

      if (!agent.workflow) {
        return res.status(400).json({ error: 'Agent has no workflow defined' });
      }

      workflow = JSON.parse(agent.workflow);
    }

    const nodes = workflow.nodes || [];
    const edges = workflow.edges || [];

    const engine = new DagEngine();
    const initialContext = { input };

    if (stream) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      const onEvent = (event) => {
        res.write(`data: ${JSON.stringify(event)}\n\n`);
      };

      try {
        await engine.run(nodes, edges, initialContext, onEvent);
      } catch (error) {
        res.write(`data: ${JSON.stringify({ type: 'workflow_error', error: error.message })}\n\n`);
      }
      res.write('data: [DONE]\n\n');
      res.end();
    } else {
      const results = await engine.run(nodes, edges, initialContext);
      res.json({ results });
    }
  } catch (error) {
    console.error('Error executing agent workflow:', error);
    res.status(500).json({ error: 'Failed to execute workflow' });
  }
});

module.exports = router;
