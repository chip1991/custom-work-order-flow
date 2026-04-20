require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({});
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Basic health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running' });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/models', require('./routes/models'));
app.use('/api/agents', require('./routes/agents'));
app.use('/api/questions', require('./routes/questions'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/api-keys', require('./routes/api-keys'));
app.use('/api/processes', require('./routes/processes'));
app.use('/api/services', require('./routes/services'));
app.use('/api/tickets', require('./routes/tickets'));

// v1 API (OpenAI compatible)
app.use('/api/v1', require('./routes/v1-chat'));

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
