const express = require('express');
const { PrismaClient } = require('@prisma/client');
const engine = require('../services/engine');

const router = express.Router();
const prisma = new PrismaClient();

// Create a new task
router.post('/', async (req, res) => {
  try {
    const { name, modelIds, questionIds } = req.body;
    
    if (!name || !modelIds || !questionIds || modelIds.length === 0 || questionIds.length === 0) {
      return res.status(400).json({ error: 'Missing required fields or empty arrays' });
    }

    const task = await prisma.task.create({
      data: {
        name,
        status: 'pending',
        models: {
          connect: modelIds.map(id => ({ id }))
        },
        questions: {
          connect: questionIds.map(id => ({ id }))
        }
      },
      include: {
        models: true,
        questions: {
          include: {
            messages: true
          }
        }
      }
    });

    // Start evaluation engine in background
    engine.startTask(task.id).catch(err => {
      console.error(`Task ${task.id} execution failed:`, err);
    });

    res.status(201).json(task);
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// Get task list
router.get('/', async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        models: true,
        questions: true,
      }
    });
    res.json(tasks);
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// Get task details
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        models: true,
        questions: {
          include: {
            messages: {
              orderBy: { createdAt: 'asc' }
            }
          }
        },
        results: true
      }
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(task);
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ error: 'Failed to fetch task' });
  }
});

// SSE endpoint for task streams
router.get('/:id/stream', (req, res) => {
  const { id } = req.params;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders(); // flush the headers to establish SSE with client

  const clientId = Date.now().toString();
  
  // Add client to engine's active connections for this task
  engine.addClient(id, clientId, res);

  req.on('close', () => {
    engine.removeClient(id, clientId);
  });
});

// Delete a task
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.task.delete({
      where: { id }
    });
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

module.exports = router;
