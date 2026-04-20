const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();

// GET /api/org
router.get('/', async (req, res) => {
  try {
    const orgs = await prisma.organization.findMany({
      orderBy: [{ sort: 'asc' }, { createdAt: 'asc' }]
    });
    res.json(orgs);
  } catch (error) {
    console.error('Error fetching orgs:', error);
    res.status(500).json({ error: 'Failed to fetch organizations' });
  }
});

// POST /api/org
router.post('/', async (req, res) => {
  try {
    const { name, parentId, type, sort } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });

    const org = await prisma.organization.create({
      data: {
        name: String(name),
        parentId: parentId ? String(parentId) : null,
        type: type ? String(type) : 'department',
        sort: Number(sort) || 0
      }
    });
    res.json(org);
  } catch (error) {
    console.error('Error creating org:', error);
    res.status(500).json({ error: 'Failed to create organization' });
  }
});

// DELETE /api/org/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check children
    const children = await prisma.organization.count({ where: { parentId: id } });
    if (children > 0) {
      return res.status(400).json({ error: 'Cannot delete organization with children' });
    }

    await prisma.organization.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting org:', error);
    res.status(500).json({ error: 'Failed to delete organization' });
  }
});

// GET /api/org/roles
router.get('/roles', async (req, res) => {
  try {
    const roles = await prisma.role.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(roles);
  } catch (error) {
    console.error('Error fetching roles:', error);
    res.status(500).json({ error: 'Failed to fetch roles' });
  }
});

// POST /api/org/roles
router.post('/roles', async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });

    const role = await prisma.role.create({
      data: {
        name: String(name),
        description: description ? String(description) : null
      }
    });
    res.json(role);
  } catch (error) {
    console.error('Error creating role:', error);
    res.status(500).json({ error: 'Failed to create role' });
  }
});

// DELETE /api/org/roles/:id
router.delete('/roles/:id', async (req, res) => {
  try {
    await prisma.role.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting role:', error);
    res.status(500).json({ error: 'Failed to delete role' });
  }
});

module.exports = router;
