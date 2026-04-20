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

const isEndNode = (node) => {
  if (!node) return false;
  const type = String(node.type || '').toLowerCase();
  if (type === 'end' || type.endsWith('endnode')) return true;
  const dataType = String(node.data?.type || node.data?.nodeType || '').toLowerCase();
  return dataType === 'end';
};

const getNodeName = (node) => {
  return (
    node?.data?.label ||
    node?.data?.name ||
    node?.label ||
    node?.type ||
    node?.id ||
    'Task'
  );
};

const pickStartNextNode = (nodes, edges) => {
  const startNode =
    nodes.find((n) => String(n.type || '').toLowerCase() === 'start') ||
    nodes.find((n) => String(n.type || '').toLowerCase().endsWith('startnode')) ||
    nodes.find((n) => String(n.data?.type || '').toLowerCase() === 'start') ||
    nodes.find((n) => String(n.data?.type || '').toLowerCase().endsWith('startnode')) ||
    nodes.find((n) => String(n.data?.nodeType || '').toLowerCase() === 'start') ||
    nodes.find((n) => String(n.data?.nodeType || '').toLowerCase().endsWith('startnode')) ||
    nodes[0];

  if (!startNode) return null;

  const outgoing = edges.filter((e) => e && e.source === startNode.id);
  const nextId = outgoing[0]?.target;
  if (!nextId) return startNode;
  return nodes.find((n) => n.id === nextId) || startNode;
};

const pickNextNodeFromEdges = (nodes, edges, currentNodeId) => {
  if (!currentNodeId) return null;
  const outgoing = edges.filter((e) => e && e.source === currentNodeId);
  if (outgoing.length > 1) return null;
  const nextId = outgoing[0]?.target;
  if (!nextId) return null;
  return nodes.find((n) => n.id === nextId) || null;
};

const formatTicket = (ticket) => {
  return {
    ...ticket,
    formData: safeParseJson(ticket.formData, {}),
    service: ticket.service
      ? {
          ...ticket.service,
          config: safeParseJson(ticket.service.config, {})
        }
      : ticket.service,
    process: ticket.process
      ? {
          ...ticket.process,
          communities: safeParseJson(ticket.process.communities, []),
          nodes: safeParseJson(ticket.process.nodes, []),
          edges: safeParseJson(ticket.process.edges, []),
          formConfig: safeParseJson(ticket.process.formConfig, [])
        }
      : ticket.process,
    tasks: Array.isArray(ticket.tasks)
      ? ticket.tasks.map((t) => ({
          ...t,
          input: safeParseJson(t.input, {}),
          output: safeParseJson(t.output, {})
        }))
      : ticket.tasks,
    logs: Array.isArray(ticket.logs)
      ? ticket.logs.map((l) => ({
          ...l,
          meta: safeParseJson(l.meta, {})
        }))
      : ticket.logs
  };
};

const generateTicketNo = () => {
  const date = new Date();
  const y = String(date.getFullYear());
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `T${y}${m}${d}-${Date.now().toString(36).toUpperCase()}-${rand}`;
};

router.get('/', async (req, res) => {
  try {
    const { status, q, serviceId, processId } = req.query;

    const where = {};
    if (status) where.status = String(status);
    if (serviceId) where.serviceId = String(serviceId);
    if (processId) where.processId = String(processId);
    if (q) {
      where.OR = [
        { title: { contains: String(q), mode: 'insensitive' } },
        { description: { contains: String(q), mode: 'insensitive' } }
      ];
    }

    const tickets = await prisma.ticket.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      include: {
        service: true,
        process: true
      }
    });

    res.json(tickets.map(formatTicket));
  } catch (error) {
    console.error('Failed to fetch tickets:', error);
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id: req.params.id },
      include: {
        service: true,
        process: true,
        tasks: {
          orderBy: { createdAt: 'asc' }
        },
        logs: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    res.json(formatTicket(ticket));
  } catch (error) {
    console.error('Failed to fetch ticket:', error);
    res.status(500).json({ error: 'Failed to fetch ticket' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { serviceId, title, description, formData, createdById } = req.body;

    if (!serviceId || !title || !createdById) {
      return res.status(400).json({ error: 'serviceId, title, createdById are required' });
    }

    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: { process: true }
    });
    if (!service) {
      return res.status(400).json({ error: 'Service not found' });
    }
    if (!service.process) {
      return res.status(400).json({ error: 'Service process not found' });
    }

    const process = service.process;
    const nodes = safeParseJson(process.nodes, []);
    const edges = safeParseJson(process.edges, []);

    const startNext = pickStartNextNode(Array.isArray(nodes) ? nodes : [], Array.isArray(edges) ? edges : []);

    const ticketNo = generateTicketNo();
    const now = new Date();

    const created = await prisma.$transaction(async (tx) => {
      const ticket = await tx.ticket.create({
        data: {
          ticketNo,
          title: String(title),
          description: description !== undefined ? String(description) : null,
          status: 'open',
          processId: process.id,
          serviceId: service.id,
          createdById: String(createdById),
          formData: safeStringifyJson(formData, '{}') ?? '{}'
        }
      });

      const isEnd = isEndNode(startNext);
      const task = await tx.ticketTask.create({
        data: {
          ticketId: ticket.id,
          name: getNodeName(startNext),
          nodeKey: startNext?.id ? String(startNext.id) : null,
          status: isEnd ? 'completed' : 'pending',
          input: safeStringifyJson({ formData: safeParseJson(ticket.formData, {}) }, '{}') ?? '{}',
          startedAt: isEnd ? now : now,
          finishedAt: isEnd ? now : null
        }
      });

      const logs = [
        tx.ticketLog.create({
          data: {
            ticketId: ticket.id,
            userId: String(createdById),
            level: 'info',
            action: 'create_ticket',
            message: `Ticket created: ${ticket.ticketNo}`,
            meta: safeStringifyJson(
              {
                ticketNo: ticket.ticketNo,
                serviceId: ticket.serviceId,
                processId: ticket.processId
              },
              '{}'
            )
          }
        }),
        tx.ticketLog.create({
          data: {
            ticketId: ticket.id,
            taskId: task.id,
            userId: String(createdById),
            level: 'info',
            action: 'create_task',
            message: `First task created: ${task.name}`,
            meta: safeStringifyJson({ nodeKey: task.nodeKey, status: task.status }, '{}')
          }
        })
      ];

      await Promise.all(logs);

      let finalTicket = ticket;
      if (isEnd) {
        finalTicket = await tx.ticket.update({
          where: { id: ticket.id },
          data: { status: 'closed', closedAt: now }
        });
        await tx.ticketLog.create({
          data: {
            ticketId: ticket.id,
            userId: String(createdById),
            level: 'info',
            action: 'close_ticket',
            message: 'Ticket closed (start reached end node)',
            meta: safeStringifyJson({ reason: 'start_end' }, '{}')
          }
        });
      }

      return finalTicket;
    });

    const ticket = await prisma.ticket.findUnique({
      where: { id: created.id },
      include: {
        service: true,
        process: true,
        tasks: { orderBy: { createdAt: 'asc' } },
        logs: { orderBy: { createdAt: 'asc' } }
      }
    });

    res.status(201).json(formatTicket(ticket));
  } catch (error) {
    console.error('Failed to create ticket:', error);
    res.status(500).json({ error: 'Failed to create ticket' });
  }
});

router.post('/:id/advance', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, output, nextNodeId } = req.body || {};

    const ticket = await prisma.ticket.findUnique({
      where: { id },
      include: {
        process: true,
        tasks: { orderBy: { createdAt: 'asc' } }
      }
    });

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    if (!ticket.process) {
      return res.status(400).json({ error: 'Process not found' });
    }

    const currentTask = (ticket.tasks || []).find((t) => t.status === 'pending');
    if (!currentTask) {
      return res.status(400).json({ error: 'No pending task to advance' });
    }

    const nodes = safeParseJson(ticket.process.nodes, []);
    const edges = safeParseJson(ticket.process.edges, []);

    const outgoing = Array.isArray(edges)
      ? edges.filter((e) => e && e.source === currentTask.nodeKey)
      : [];
    if (!nextNodeId && outgoing.length > 1) {
      return res.status(400).json({
        error: 'Multiple outgoing branches, nextNodeId is required'
      });
    }

    const nextNode =
      (nextNodeId && Array.isArray(nodes) ? nodes.find((n) => n.id === nextNodeId) : null) ||
      pickNextNodeFromEdges(Array.isArray(nodes) ? nodes : [], Array.isArray(edges) ? edges : [], currentTask.nodeKey);

    const now = new Date();

    await prisma.$transaction(async (tx) => {
      await tx.ticketTask.update({
        where: { id: currentTask.id },
        data: {
          status: 'completed',
          finishedAt: now,
          output: safeStringifyJson(output, '{}') ?? '{}'
        }
      });

      await tx.ticketLog.create({
        data: {
          ticketId: ticket.id,
          taskId: currentTask.id,
          userId: userId ? String(userId) : null,
          level: 'info',
          action: 'complete_task',
          message: `Task completed: ${currentTask.name}`,
          meta: safeStringifyJson({ output: safeParseJson(safeStringifyJson(output), {}) }, '{}')
        }
      });

      if (!nextNode || isEndNode(nextNode)) {
        await tx.ticket.update({
          where: { id: ticket.id },
          data: { status: 'closed', closedAt: now }
        });

        await tx.ticketLog.create({
          data: {
            ticketId: ticket.id,
            userId: userId ? String(userId) : null,
            level: 'info',
            action: 'close_ticket',
            message: 'Ticket closed',
            meta: safeStringifyJson(
              {
                reason: !nextNode ? 'no_next_node' : 'reach_end_node',
                nextNodeId: nextNode?.id || null
              },
              '{}'
            )
          }
        });

        return;
      }

      const task = await tx.ticketTask.create({
        data: {
          ticketId: ticket.id,
          name: getNodeName(nextNode),
          nodeKey: nextNode?.id ? String(nextNode.id) : null,
          status: 'pending',
          input: safeStringifyJson({ prevTaskId: currentTask.id }, '{}') ?? '{}',
          startedAt: now
        }
      });

      await tx.ticketLog.create({
        data: {
          ticketId: ticket.id,
          taskId: task.id,
          userId: userId ? String(userId) : null,
          level: 'info',
          action: 'create_task',
          message: `Next task created: ${task.name}`,
          meta: safeStringifyJson({ nodeKey: task.nodeKey, prevTaskId: currentTask.id }, '{}')
        }
      });
    });

    const fresh = await prisma.ticket.findUnique({
      where: { id: ticket.id },
      include: {
        service: true,
        process: true,
        tasks: { orderBy: { createdAt: 'asc' } },
        logs: { orderBy: { createdAt: 'asc' } }
      }
    });

    res.json(formatTicket(fresh));
  } catch (error) {
    console.error('Failed to advance ticket:', error);
    res.status(500).json({ error: 'Failed to advance ticket' });
  }
});

module.exports = router;
