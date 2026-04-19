const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { OpenAI } = require('openai');

const prisma = new PrismaClient();

// Auth middleware
const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: {
        message: 'Missing or invalid authorization header',
        type: 'invalid_request_error',
        param: null,
        code: 'invalid_api_key'
      }
    });
  }

  const token = authHeader.split(' ')[1];
  const apiKey = await prisma.apiKey.findUnique({
    where: { key: token }
  });

  if (!apiKey) {
    return res.status(401).json({
      error: {
        message: 'Invalid API key',
        type: 'invalid_request_error',
        param: null,
        code: 'invalid_api_key'
      }
    });
  }

  req.apiKey = apiKey;
  next();
};

router.post('/chat/completions', authMiddleware, async (req, res) => {
  try {
    const { model: agentId, messages, stream, temperature, top_p, max_tokens } = req.body;

    if (!agentId) {
      return res.status(400).json({
        error: { message: 'Missing model parameter', type: 'invalid_request_error' }
      });
    }

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({
        error: { message: 'Missing or invalid messages parameter', type: 'invalid_request_error' }
      });
    }

    // Extract agent and its underlying model
    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
      include: { model: true }
    });

    if (!agent) {
      return res.status(404).json({
        error: { message: `Agent with id ${agentId} not found`, type: 'invalid_request_error' }
      });
    }

    const dbModel = agent.model;
    if (!dbModel) {
      return res.status(500).json({
        error: { message: 'Underlying model configuration not found for this agent', type: 'api_error' }
      });
    }

    // Inject system prompt
    let newMessages = [...messages];
    if (agent.systemPrompt) {
      if (newMessages.length > 0 && newMessages[0].role === 'system') {
        newMessages[0] = {
          ...newMessages[0],
          content: agent.systemPrompt + '\n\n' + newMessages[0].content
        };
      } else {
        newMessages.unshift({ role: 'system', content: agent.systemPrompt });
      }
    }

    // Initialize OpenAI client
    const config = {
      apiKey: dbModel.apiKey || 'dummy-key',
    };
    if (dbModel.baseUrl) {
      config.baseURL = dbModel.baseUrl;
    }

    const openai = new OpenAI(config);

    // Call engine (OpenAI API)
    if (stream) {
      const responseStream = await openai.chat.completions.create({
        model: dbModel.name,
        messages: newMessages,
        stream: true,
        stream_options: { include_usage: true },
        temperature: temperature !== undefined ? temperature : dbModel.temperature,
        top_p: top_p !== undefined ? top_p : dbModel.topP,
        max_tokens: max_tokens !== undefined ? max_tokens : dbModel.maxTokens,
      });

      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      let totalTokens = 0;
      for await (const chunk of responseStream) {
        if (chunk.usage && chunk.usage.total_tokens) {
          totalTokens = chunk.usage.total_tokens;
        }
        res.write(`data: ${JSON.stringify(chunk)}\n\n`);
      }
      res.write('data: [DONE]\n\n');
      res.end();

      if (totalTokens > 0) {
        prisma.apiKey.update({
          where: { id: req.apiKey.id },
          data: { totalTokensUsed: { increment: totalTokens } }
        }).catch(err => console.error('Failed to update token usage:', err));
      }
    } else {
      const response = await openai.chat.completions.create({
        model: dbModel.name,
        messages: newMessages,
        stream: false,
        temperature: temperature !== undefined ? temperature : dbModel.temperature,
        top_p: top_p !== undefined ? top_p : dbModel.topP,
        max_tokens: max_tokens !== undefined ? max_tokens : dbModel.maxTokens,
      });

      if (response.usage && response.usage.total_tokens) {
        prisma.apiKey.update({
          where: { id: req.apiKey.id },
          data: { totalTokensUsed: { increment: response.usage.total_tokens } }
        }).catch(err => console.error('Failed to update token usage:', err));
      }

      return res.json(response);
    }
  } catch (error) {
    console.error('OpenAI API Error:', error);
    const statusCode = error.status || 500;
    const errorBody = error.error || { message: error.message || 'Internal server error' };
    res.status(statusCode).json({ error: errorBody });
  }
});

module.exports = router;
