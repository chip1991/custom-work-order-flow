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

      // 2. Initialize memory for each model to maintain multi-turn dialogue context
      const modelHistories = new Map();
      for (const model of task.models) {
        modelHistories.set(model.id, []);
      }

      // 3. Serially iterate through each question
      for (let i = 0; i < task.questions.length; i++) {
        const question = task.questions[i];
        
        // Prepare promises for all models for the current question
        const promises = task.models.map(async (model) => {
          // Create task result record
          const result = await prisma.taskResult.create({
            data: {
              taskId,
              modelId: model.id,
              questionId: question.id,
              status: 'running'
            }
          });
          
          const combo = { model, question, resultId: result.id };
          
          // Get previous history for this model
          const history = modelHistories.get(model.id);
          
          // Get current question messages
          const currentMessages = question.messages.map(m => ({
            role: m.role,
            content: m.content
          }));
          
          // Combine history and current messages
          const customMessages = [...history, ...currentMessages];
          
          // Run evaluation
          const responseText = await this.runEvaluation(taskId, combo, customMessages);
          
          // If successful, append the current messages and the model's response to the history
          if (responseText) {
            history.push(...currentMessages);
            history.push({ role: 'assistant', content: responseText });
          }
        });
        
        // Concurrently run evaluations for all models on this single question
        await Promise.allSettled(promises);
        
        // Wait 10 seconds before proceeding to the next question, unless it's the last question
        if (i < task.questions.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 10000));
        }
      }

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

  async runEvaluation(taskId, { model, question, resultId }, customMessages = null) {
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
      
      const messages = customMessages || question.messages.map(m => ({
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

      return fullResponse;

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

      return null;
    }
  }
}

module.exports = new EvaluationEngine();
