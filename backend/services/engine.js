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

      // 2. Models run concurrently, but each model executes questions serially
      const modelPromises = task.models.map(async (model) => {
        for (let i = 0; i < task.questions.length; i++) {
          const question = task.questions[i];
          
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
          
          let fullHistory = [];
          let totalTimeTaken = 0;
          let firstTokenTime = null;
          let hasError = false;
          let errorMessage = '';

          for (const msg of question.messages) {
            fullHistory.push({ role: msg.role, content: msg.content });
            this.broadcast(taskId, { 
              type: 'message', 
              resultId: result.id, 
              modelId: model.id,
              questionId: question.id,
              role: msg.role, 
              content: msg.content 
            });
            
            if (msg.role === 'user') {
              try {
                // Pass fullHistory as the context up to this point
                const res = await this.runEvaluationStream(taskId, combo, fullHistory);
                fullHistory.push({ 
                  role: 'assistant', 
                  content: res.fullResponse,
                  timeTaken: res.timeTaken,
                  firstTokenTime: res.firstTokenTime
                });
                
                this.broadcast(taskId, {
                  type: 'turn_completed',
                  resultId: result.id,
                  modelId: model.id,
                  questionId: question.id,
                  timeTaken: res.timeTaken,
                  firstTokenTime: res.firstTokenTime
                });
                
                totalTimeTaken += res.timeTaken;
                if (!firstTokenTime) firstTokenTime = res.firstTokenTime;
              } catch (error) {
                console.error(`Evaluation failed for model ${model.name}, question ${question.name}:`, error);
                hasError = true;
                errorMessage = error.message || 'Unknown error';
                break;
              }
            }
          }

          if (hasError) {
            await prisma.taskResult.update({
              where: { id: result.id },
              data: {
                status: 'error',
                error: errorMessage,
                response: JSON.stringify(fullHistory)
              }
            });
            this.broadcast(taskId, {
              type: 'result_error',
              resultId: result.id,
              modelId: model.id,
              questionId: question.id,
              error: errorMessage
            });
          } else {
            await prisma.taskResult.update({
              where: { id: result.id },
              data: {
                status: 'success',
                response: JSON.stringify(fullHistory),
                timeTaken: totalTimeTaken,
                firstTokenTime
              }
            });
            this.broadcast(taskId, {
              type: 'result_completed',
              resultId: result.id,
              modelId: model.id,
              questionId: question.id,
              timeTaken: totalTimeTaken,
              firstTokenTime
            });
          }
          
          // Wait 10 seconds before proceeding to the next question for this model, unless it's the last question
          if (i < task.questions.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 10000));
          }
        }
      });

      // 3. Wait for all models to finish all their questions
      await Promise.allSettled(modelPromises);

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

  async runEvaluationStream(taskId, { model, question, resultId }, messages) {
    const startTime = Date.now();
    let firstTokenTime = null;
    let fullResponse = '';
    
    const config = {
      apiKey: model.apiKey || 'dummy-key',
    };
    if (model.baseUrl) {
      config.baseURL = model.baseUrl;
    }

    const openai = new OpenAI(config);
    
    const stream = await openai.chat.completions.create({
      model: model.name,
      messages,
      stream: true,
      ...(model.temperature !== null && { temperature: model.temperature }),
      ...(model.topP !== null && { top_p: model.topP }),
      ...(model.maxTokens !== null && { max_tokens: model.maxTokens }),
    });

    for await (const chunk of stream) {
      if (!firstTokenTime) {
        firstTokenTime = Date.now() - startTime;
      }
      
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        fullResponse += content;
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
    return { fullResponse, timeTaken, firstTokenTime };
  }
}

module.exports = new EvaluationEngine();
