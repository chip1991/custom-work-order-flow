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
        { description: { contains: String(q), mode: 'insensitive' } },
        { ticketNo: { contains: String(q), mode: 'insensitive' } }
      ];
    }

    const tickets = await prisma.ticket.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      include: {
        service: true,
        process: true,
        assignee: { select: { account: true, email: true } },
      }
    });

    res.json(tickets.map(formatTicket));
  } catch (error) {
    console.error('Failed to fetch tickets:', error);
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
});

// GET /api/tickets/stats/dashboard
router.get('/stats/dashboard', async (req, res) => {
  try {
    const totalTickets = await prisma.ticket.count();
    const closedTickets = await prisma.ticket.count({ where: { status: 'closed' } });
    const openTickets = totalTickets - closedTickets;
    
    // Average completion time (for closed tickets)
    const closedList = await prisma.ticket.findMany({
      where: { status: 'closed', closedAt: { not: null } },
      select: { createdAt: true, closedAt: true }
    });
    
    let totalTimeMs = 0;
    closedList.forEach(t => {
      totalTimeMs += (new Date(t.closedAt).getTime() - new Date(t.createdAt).getTime());
    });
    const avgTimeHours = closedList.length > 0 
      ? (totalTimeMs / closedList.length / (1000 * 60 * 60)).toFixed(1) 
      : 0;

    // SLA pre-warnings (we can reuse the logic, but let's just count open ones)
    const openList = await prisma.ticket.findMany({
      where: { status: { not: 'closed' } },
      include: { process: { select: { timeLimit: true } } }
    });

    let overdueCount = 0;
    let warningCount = 0;
    const now = new Date().getTime();

    openList.forEach(t => {
      const limitHours = t.process?.timeLimit || 24;
      const limitMs = limitHours * 60 * 60 * 1000;
      const elapsedMs = now - new Date(t.createdAt).getTime();
      const remainingMs = limitMs - elapsedMs;

      if (remainingMs < 0) overdueCount++;
      else if (remainingMs < limitMs * 0.2) warningCount++;
    });

    res.json({
      total: totalTickets,
      closed: closedTickets,
      open: openTickets,
      completionRate: totalTickets > 0 ? ((closedTickets / totalTickets) * 100).toFixed(1) : 0,
      avgTimeHours,
      overdue: overdueCount,
      warning: warningCount
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

// GET /api/tickets/sla/status
router.get('/sla/status', async (req, res) => {
  try {
    const openTickets = await prisma.ticket.findMany({
      where: { status: { not: 'closed' } },
      include: {
        service: true,
        process: true,
        assignee: { select: { account: true } }
      }
    });

    const now = new Date().getTime();
    const slaTickets = openTickets.map(t => {
      const timeLimitHours = t.process?.timeLimit || 24;
      const limitMs = timeLimitHours * 60 * 60 * 1000;
      const elapsedMs = now - new Date(t.createdAt).getTime();
      const remainingMs = limitMs - elapsedMs;
      
      let slaStatus = 'normal';
      if (remainingMs < 0) slaStatus = 'overdue';
      else if (remainingMs < limitMs * 0.2) slaStatus = 'warning';

      return {
        ...formatTicket(t),
        slaStatus,
        remainingHours: (remainingMs / (1000 * 60 * 60)).toFixed(1)
      };
    }).filter(t => t.slaStatus !== 'normal');

    // Sort by most overdue
    slaTickets.sort((a, b) => Number(a.remainingHours) - Number(b.remainingHours));

    res.json(slaTickets);
  } catch (error) {
    console.error('Failed to fetch SLA tickets:', error);
    res.status(500).json({ error: 'Failed to fetch SLA tickets' });
  }
});

// POST /api/tickets/batch/status
router.post('/batch/status', async (req, res) => {
  const { ids, status } = req.body || {};
  const nextStatus = status ? String(status) : '';
  const allowed = new Set(['open', 'closed', 'on_hold', 'canceled']);

  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: 'ids is required' });
  }
  if (!allowed.has(nextStatus)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  const authHeader = req.headers.authorization;
  let currentUserId = null;
  if (authHeader) {
    try {
      const jwt = require('jsonwebtoken');
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key_here');
      currentUserId = decoded.id;
    } catch (err) {}
  }

  try {
    const now = new Date();
    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.ticket.updateMany({
        where: { id: { in: ids.map((x) => String(x)) } },
        data: {
          status: nextStatus,
          closedAt: nextStatus === 'closed' ? now : null
        }
      });

      await tx.ticketLog.createMany({
        data: ids.map((ticketId) => ({
          ticketId: String(ticketId),
          userId: currentUserId,
          level: 'info',
          action: 'batch_change_status',
          message: `批量变更工单状态为: ${nextStatus}`,
          meta: safeStringifyJson({ status: nextStatus }, '{}')
        }))
      });

      return updated;
    });

    res.json({ updated: result.count });
  } catch (error) {
    console.error('Error batch updating tickets:', error);
    res.status(500).json({ error: 'Failed to batch update tickets' });
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

// PUT /api/tickets/:id/assign
router.put('/:id/assign', async (req, res) => {
  const { id } = req.params;
  const { assigneeId } = req.body;
  const authHeader = req.headers.authorization;
  let currentUserId = null;

  if (authHeader) {
    try {
      const jwt = require('jsonwebtoken');
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key_here');
      currentUserId = decoded.id;
    } catch (err) {}
  }

  try {
    await prisma.ticket.update({
      where: { id },
      data: { assigneeId }
    });

    const assignee = await prisma.user.findUnique({ where: { id: assigneeId } });

    await prisma.ticketLog.create({
      data: {
        ticketId: id,
        userId: currentUserId,
        level: 'info',
        action: 'assign',
        message: `工单分配给了处理人: ${assignee ? assignee.account : assigneeId}`,
        meta: safeStringifyJson({ assigneeId }, '{}')
      }
    });

    const fresh = await prisma.ticket.findUnique({
      where: { id },
      include: {
        service: true,
        process: true,
        assignee: { select: { account: true, email: true } },
        tasks: { orderBy: { createdAt: 'asc' } },
        logs: { orderBy: { createdAt: 'asc' } }
      }
    });

    res.json(formatTicket(fresh));
  } catch (error) {
    console.error('Error assigning ticket:', error);
    res.status(500).json({ error: 'Failed to assign ticket' });
  }
});

// PUT /api/tickets/:id/status
router.put('/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body || {};
  const authHeader = req.headers.authorization;
  let currentUserId = null;

  if (authHeader) {
    try {
      const jwt = require('jsonwebtoken');
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key_here');
      currentUserId = decoded.id;
    } catch (err) {}
  }

  const nextStatus = status ? String(status) : '';
  const allowed = new Set(['open', 'closed', 'on_hold', 'canceled']);
  if (!allowed.has(nextStatus)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  try {
    const now = new Date();
    await prisma.ticket.update({
      where: { id },
      data: {
        status: nextStatus,
        closedAt: nextStatus === 'closed' ? now : null
      }
    });

    await prisma.ticketLog.create({
      data: {
        ticketId: id,
        userId: currentUserId,
        level: 'info',
        action: 'change_status',
        message: `工单状态变更为: ${nextStatus}`,
        meta: safeStringifyJson({ status: nextStatus }, '{}')
      }
    });

    const fresh = await prisma.ticket.findUnique({
      where: { id },
      include: {
        service: true,
        process: true,
        assignee: { select: { account: true, email: true } },
        tasks: { orderBy: { createdAt: 'asc' } },
        logs: { orderBy: { createdAt: 'asc' } }
      }
    });

    res.json(formatTicket(fresh));
  } catch (error) {
    console.error('Error updating ticket status:', error);
    res.status(500).json({ error: 'Failed to update ticket status' });
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
