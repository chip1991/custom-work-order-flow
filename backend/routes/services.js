const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

const safeParseJson = (value, fallback) => {
  if (value === undefined || value === null) return fallback;
  if (typeof value !== 'string') return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const safeStringifyJson = (value, fallback = '{}') => {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value === 'string') return value;
  try {
    return JSON.stringify(value);
  } catch {
    return fallback;
  }
};

router.get('/', async (req, res) => {
  try {
    const services = await prisma.service.findMany({
      include: {
        process: true
      },
      orderBy: { updatedAt: 'desc' }
    });

    res.json(
      services.map((service) => ({
        ...service,
        config: safeParseJson(service.config, {}),
        process: service.process
          ? {
              ...service.process,
              communities: safeParseJson(service.process.communities, []),
              nodes: safeParseJson(service.process.nodes, []),
              edges: safeParseJson(service.process.edges, []),
              formConfig: safeParseJson(service.process.formConfig, [])
            }
          : null
      }))
    );
  } catch (error) {
    console.error('Failed to fetch services:', error);
    res.status(500).json({ error: 'Failed to fetch services' });
  }
});

router.get('/public', async (req, res) => {
  try {
    const { community } = req.query;
    const services = await prisma.service.findMany({
      where: { enabled: true },
      include: { process: true },
      orderBy: { updatedAt: 'desc' }
    });

    const filtered = services.filter((service) => {
      if (!service.process) return false;
      if (!community) return true;
      const communities = safeParseJson(service.process.communities, []);
      if (!Array.isArray(communities)) return false;
      if (communities.length === 0) return true;
      return communities.includes(String(community));
    });

    res.json(
      filtered.map((service) => ({
        ...service,
        config: safeParseJson(service.config, {}),
        process: service.process
          ? {
              ...service.process,
              communities: safeParseJson(service.process.communities, [])
            }
          : null
      }))
    );
  } catch (error) {
    console.error('Failed to fetch public services:', error);
    res.status(500).json({ error: 'Failed to fetch public services' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { processId, name, description, config, enabled, createdById } = req.body;

    if (!processId || !name) {
      return res.status(400).json({ error: 'processId and name are required' });
    }

    const process = await prisma.process.findUnique({ where: { id: processId } });
    if (!process) {
      return res.status(400).json({ error: 'Process not found' });
    }

    const service = await prisma.service.create({
      data: {
        processId,
        name,
        description: description !== undefined ? description : undefined,
        config: safeStringifyJson(config, '{}') ?? '{}',
        enabled: enabled !== undefined ? Boolean(enabled) : true,
        createdById: createdById || null
      },
      include: {
        process: true
      }
    });

    res.status(201).json({
      ...service,
      config: safeParseJson(service.config, {}),
      process: service.process
        ? {
            ...service.process,
            communities: safeParseJson(service.process.communities, [])
          }
        : null
    });
  } catch (error) {
    console.error('Failed to create service:', error);
    res.status(500).json({ error: 'Failed to create service' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { processId, name, description, config, enabled } = req.body;

    const existing = await prisma.service.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: 'Service not found' });
    }

    if (processId !== undefined && processId) {
      const process = await prisma.process.findUnique({ where: { id: processId } });
      if (!process) {
        return res.status(400).json({ error: 'Process not found' });
      }
    }

    const updateData = {};
    if (processId !== undefined) updateData.processId = processId;
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (config !== undefined) updateData.config = safeStringifyJson(config, '{}');
    if (enabled !== undefined) updateData.enabled = Boolean(enabled);

    const service = await prisma.service.update({
      where: { id },
      data: updateData,
      include: { process: true }
    });

    res.json({
      ...service,
      config: safeParseJson(service.config, {}),
      process: service.process
        ? {
            ...service.process,
            communities: safeParseJson(service.process.communities, [])
          }
        : null
    });
  } catch (error) {
    console.error('Failed to update service:', error);
    res.status(500).json({ error: 'Failed to update service' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await prisma.service.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    console.error('Failed to delete service:', error);
    res.status(500).json({ error: 'Failed to delete service' });
  }
});

module.exports = router;
