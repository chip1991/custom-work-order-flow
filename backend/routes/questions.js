const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();

const prisma = new PrismaClient();

// Get all questions (include messages count or all messages if needed, here we'll include messages)
router.get('/', async (req, res) => {
  try {
    const questions = await prisma.question.findMany({
      include: {
        messages: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(questions);
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ error: 'Failed to fetch questions' });
  }
});

// Get a single question by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const question = await prisma.question.findUnique({
      where: { id },
      include: {
        messages: true
      }
    });
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }
    res.json(question);
  } catch (error) {
    console.error('Error fetching question:', error);
    res.status(500).json({ error: 'Failed to fetch question' });
  }
});

// Create a new question with messages
router.post('/', async (req, res) => {
  try {
    const { name, description, messages } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const question = await prisma.question.create({
      data: {
        name,
        description,
        messages: {
          create: messages && Array.isArray(messages) ? messages.map(msg => ({
            role: msg.role,
            content: msg.content
          })) : []
        }
      },
      include: {
        messages: true
      }
    });
    res.status(201).json(question);
  } catch (error) {
    console.error('Error creating question:', error);
    res.status(500).json({ error: 'Failed to create question' });
  }
});

// Update an existing question and its messages
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, messages } = req.body;
    
    // Check if question exists
    const existingQuestion = await prisma.question.findUnique({ where: { id } });
    if (!existingQuestion) {
      return res.status(404).json({ error: 'Question not found' });
    }

    // Update question
    // To handle messages easily, we can delete existing ones and create new ones
    // Or we can use nested updates. Recreating is often simpler for ordered lists
    // where ids might not be provided from the client
    
    const updateData = {
      name: name !== undefined ? name : existingQuestion.name,
      description: description !== undefined ? description : existingQuestion.description,
    };

    if (messages && Array.isArray(messages)) {
      updateData.messages = {
        deleteMany: {}, // Delete all existing messages
        create: messages.map(msg => ({
          role: msg.role,
          content: msg.content
        }))
      };
    }

    const question = await prisma.question.update({
      where: { id },
      data: updateData,
      include: {
        messages: true
      }
    });
    res.json(question);
  } catch (error) {
    console.error('Error updating question:', error);
    res.status(500).json({ error: 'Failed to update question' });
  }
});

// Delete a question
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if question exists
    const existingQuestion = await prisma.question.findUnique({ where: { id } });
    if (!existingQuestion) {
      return res.status(404).json({ error: 'Question not found' });
    }

    // Messages will be deleted automatically due to onDelete: Cascade in schema
    await prisma.question.delete({
      where: { id }
    });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting question:', error);
    res.status(500).json({ error: 'Failed to delete question' });
  }
});

module.exports = router;