const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();

const prisma = new PrismaClient();

// Get all models
router.get('/', async (req, res) => {
  try {
    const models = await prisma.model.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(models);
  } catch (error) {
    console.error('Error fetching models:', error);
    res.status(500).json({ error: 'Failed to fetch models' });
  }
});

// Get a single model by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const model = await prisma.model.findUnique({
      where: { id }
    });
    if (!model) {
      return res.status(404).json({ error: 'Model not found' });
    }
    res.json(model);
  } catch (error) {
    console.error('Error fetching model:', error);
    res.status(500).json({ error: 'Failed to fetch model' });
  }
});

// Create a new model
router.post('/', async (req, res) => {
  try {
    const { name, provider, baseUrl, apiKey, enabled } = req.body;
    
    // Validate required fields
    if (!name || !provider) {
      return res.status(400).json({ error: 'Name and provider are required' });
    }

    const model = await prisma.model.create({
      data: {
        name,
        provider,
        baseUrl,
        apiKey,
        enabled: enabled !== undefined ? enabled : true
      }
    });
    res.status(201).json(model);
  } catch (error) {
    console.error('Error creating model:', error);
    res.status(500).json({ error: 'Failed to create model' });
  }
});

// Update an existing model
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, provider, baseUrl, apiKey, enabled } = req.body;
    
    // Check if model exists
    const existingModel = await prisma.model.findUnique({ where: { id } });
    if (!existingModel) {
      return res.status(404).json({ error: 'Model not found' });
    }

    const model = await prisma.model.update({
      where: { id },
      data: {
        name: name !== undefined ? name : existingModel.name,
        provider: provider !== undefined ? provider : existingModel.provider,
        baseUrl: baseUrl !== undefined ? baseUrl : existingModel.baseUrl,
        apiKey: apiKey !== undefined ? apiKey : existingModel.apiKey,
        enabled: enabled !== undefined ? enabled : existingModel.enabled
      }
    });
    res.json(model);
  } catch (error) {
    console.error('Error updating model:', error);
    res.status(500).json({ error: 'Failed to update model' });
  }
});

// Toggle model status
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { enabled } = req.body;
    
    if (enabled === undefined) {
      return res.status(400).json({ error: 'Enabled status is required' });
    }

    // Check if model exists
    const existingModel = await prisma.model.findUnique({ where: { id } });
    if (!existingModel) {
      return res.status(404).json({ error: 'Model not found' });
    }

    const model = await prisma.model.update({
      where: { id },
      data: { enabled }
    });
    res.json(model);
  } catch (error) {
    console.error('Error updating model status:', error);
    res.status(500).json({ error: 'Failed to update model status' });
  }
});

// Delete a model
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if model exists
    const existingModel = await prisma.model.findUnique({ where: { id } });
    if (!existingModel) {
      return res.status(404).json({ error: 'Model not found' });
    }

    await prisma.model.delete({
      where: { id }
    });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting model:', error);
    res.status(500).json({ error: 'Failed to delete model' });
  }
});

module.exports = router;