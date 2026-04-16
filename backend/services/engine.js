const { PrismaClient } = require('@prisma/client');
const { OpenAI } = require('openai');

const prisma = new PrismaClient();

class EvaluationEngine {
  constructor() {
    this.clients = new Map(); // taskId -> Map(clientId -> res)
  }

  addClient(taskId, clientId, res) {
    if (!this.clients.has(taskId)) {
      this.clients.set(taskId, new Map());
    }
    this.clients.get(taskId).set(clientId, res);
  }

  removeClient(taskId, clientId) {
    if (this.clients.has(taskId)) {
      this.clients.get(taskId).delete(clientId);
      if (this.clients.get(taskId).size === 0) {
        this.clients.delete(taskId);
      }
    }
  }

  // Send an SSE message to all clients listening to a specific task
  broadcast(taskId, data) {
    if (this.clients.has(taskId)) {
      const taskClients = this.clients.get(taskId);
      const message = `data: ${JSON.stringify(data)}\n\n`;
      for (const res of taskClients.values()) {
        res.write(message);
      }
    }
  }

  async startTask(taskId) {
    try {
      // 1. Fetch task details
      const task = await prisma.task.findUnique({
        where: { id: taskId },
        include: {
          models: true,
          questions: {
            include: {
              messages: {
                orderBy: { createdAt: 'asc' }
              }
            }
          }
        }
      });

      if (!task || task.status !== 'pending') return;

      // Update task status to running
      await prisma.task.update({
        where: { id: taskId },
        data: { status: 'running' }
      });

      this.broadcast(taskId, { type: 'task_started', taskId });

      // 2. Prepare task results records
      const combinations = [];
      for (const model of task.models) {
        for (const question of task.questions) {
          const result = await prisma.taskResult.create({
            data: {
              taskId,
              modelId: model.id,
              questionId: question.id,
              status: 'running'
            }
          });
          combinations.push({ model, question, resultId: result.id });
        }
      }

      // 3. Concurrently run evaluations
      const promises = combinations.map(combo => this.runEvaluation(taskId, combo));
      await Promise.allSettled(promises);

      // 4. Update task to completed
      await prisma.task.update({
        where: { id: taskId },
        data: { status: 'completed' }
      });

      this.broadcast(taskId, { type: 'task_completed', taskId });
    } catch (error) {
      console.error(`Task ${taskId} engine error:`, error);
      await prisma.task.update({
        where: { id: taskId },
        data: { status: 'failed' }
      });
      this.broadcast(taskId, { type: 'task_failed', taskId, error: error.message });
    }
  }

  async runEvaluation(taskId, { model, question, resultId }) {
    const startTime = Date.now();
    let firstTokenTime = null;
    let fullResponse = '';
    
    try {
      // Prepare OpenAI client
      const config = {
        apiKey: model.apiKey || 'dummy-key',
      };
      if (model.baseUrl) {
        config.baseURL = model.baseUrl;
      }

      const openai = new OpenAI(config);
      
      const messages = question.messages.map(m => ({
        role: m.role,
        content: m.content
      }));

      // Start stream
      const stream = await openai.chat.completions.create({
        model: model.name,
        messages,
        stream: true,
      });

      for await (const chunk of stream) {
        if (!firstTokenTime) {
          firstTokenTime = Date.now() - startTime;
        }
        
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          fullResponse += content;
          // broadcast the chunk
          this.broadcast(taskId, {
            type: 'chunk',
            resultId,
            modelId: model.id,
            questionId: question.id,
            content
          });
        }
      }

      const timeTaken = Date.now() - startTime;

      // Update TaskResult as success
      await prisma.taskResult.update({
        where: { id: resultId },
        data: {
          status: 'success',
          response: fullResponse,
          timeTaken,
          firstTokenTime,
          // tokensUsed: we'd need a tokenizer to count precisely, skip or estimate if needed
        }
      });

      this.broadcast(taskId, {
        type: 'result_completed',
        resultId,
        modelId: model.id,
        questionId: question.id,
        timeTaken,
        firstTokenTime
      });

    } catch (error) {
      console.error(`Evaluation failed for model ${model.name}, question ${question.name}:`, error);
      const timeTaken = Date.now() - startTime;
      
      // Update TaskResult as error
      await prisma.taskResult.update({
        where: { id: resultId },
        data: {
          status: 'error',
          error: error.message || 'Unknown error',
          timeTaken,
          firstTokenTime
        }
      });

      this.broadcast(taskId, {
        type: 'result_error',
        resultId,
        modelId: model.id,
        questionId: question.id,
        error: error.message || 'Unknown error'
      });
    }
  }
}

module.exports = new EvaluationEngine();
