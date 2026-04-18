const express = require('express');
const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const router = express.Router();
const prisma = new PrismaClient();

// Get all API keys
router.get('/', async (req, res) => {
  try {
    const apiKeys = await prisma.apiKey.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(apiKeys);
  } catch (error) {
    console.error('Error fetching API keys:', error);
    res.status(500).json({ error: 'Failed to fetch API keys' });
  }
});

// Create a new API key
router.post('/', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    // Generate a secure API key
    const key = 'sk-' + crypto.randomBytes(24).toString('hex');

    const apiKey = await prisma.apiKey.create({
      data: {
        name,
        key
      }
    });

    res.status(201).json(apiKey);
  } catch (error) {
    console.error('Error creating API key:', error);
    res.status(500).json({ error: 'Failed to create API key' });
  }
});

// Delete an API key
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.apiKey.delete({
      where: { id }
    });
    res.json({ message: 'API key deleted successfully' });
  } catch (error) {
    console.error('Error deleting API key:', error);
    res.status(500).json({ error: 'Failed to delete API key' });
  }
});

module.exports = router;
