const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();
const prisma = new PrismaClient();

// GET /api/feedback
router.get('/', async (req, res) => {
  try {
    const feedbacks = await prisma.ticketFeedback.findMany({
      include: {
        ticket: { select: { ticketNo: true, title: true, service: { select: { name: true } } } },
        user: { select: { account: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    // Process JSON tags
    const formatted = feedbacks.map(f => {
      let tags = [];
      try {
        tags = JSON.parse(f.tags || '[]');
      } catch (e) {}
      return { ...f, tags };
    });

    res.json(formatted);
  } catch (error) {
    console.error('Error fetching feedbacks:', error);
    res.status(500).json({ error: 'Failed to fetch feedbacks' });
  }
});

// GET /api/feedback/stats
router.get('/stats', async (req, res) => {
  try {
    const total = await prisma.ticketFeedback.count();
    
    const aggregations = await prisma.ticketFeedback.aggregate({
      _avg: { rating: true },
      _count: { _all: true },
      where: { rating: { lte: 3 } }
    });

    const badReviews = aggregations._count._all;

    res.json({
      total,
      averageRating: aggregations._avg.rating ? Number(aggregations._avg.rating).toFixed(1) : '0.0',
      badReviews,
      badReviewRate: total > 0 ? ((badReviews / total) * 100).toFixed(1) + '%' : '0.0%'
    });
  } catch (error) {
    console.error('Error fetching feedback stats:', error);
    res.status(500).json({ error: 'Failed to fetch feedback stats' });
  }
});

// POST /api/feedback (For mocking customer evaluation submission)
router.post('/', async (req, res) => {
  try {
    const { ticketId, userId, rating, content, tags } = req.body;
    if (!ticketId) return res.status(400).json({ error: 'ticketId is required' });

    const feedback = await prisma.ticketFeedback.upsert({
      where: { ticketId: String(ticketId) },
      update: {
        userId: userId ? String(userId) : null,
        rating: Number(rating) || 5,
        content: content ? String(content) : null,
        tags: tags ? JSON.stringify(tags) : '[]'
      },
      create: {
        ticketId: String(ticketId),
        userId: userId ? String(userId) : null,
        rating: Number(rating) || 5,
        content: content ? String(content) : null,
        tags: tags ? JSON.stringify(tags) : '[]'
      }
    });

    // Write log
    await prisma.ticketLog.create({
      data: {
        ticketId: String(ticketId),
        userId: userId ? String(userId) : null,
        level: 'info',
        action: 'evaluate',
        message: `用户提交了评价: ${Number(rating) || 5}星`,
      }
    });

    res.json(feedback);
  } catch (error) {
    console.error('Error creating feedback:', error);
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
});

// PUT /api/feedback/:id/callback (Admin records callback info)
router.put('/:id/callback', async (req, res) => {
  try {
    const { callback } = req.body;
    if (!callback) return res.status(400).json({ error: 'callback notes required' });

    const feedback = await prisma.ticketFeedback.update({
      where: { id: req.params.id },
      data: { callback: String(callback) }
    });

    res.json(feedback);
  } catch (error) {
    console.error('Error recording callback:', error);
    res.status(500).json({ error: 'Failed to record callback' });
  }
});

module.exports = router;
