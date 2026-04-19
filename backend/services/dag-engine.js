const { PrismaClient } = require('@prisma/client');
const { OpenAI } = require('openai');

const prisma = new PrismaClient();

class ContextManager {
  constructor(initialContext = {}) {
    this.context = { ...initialContext };
  }

  set(key, value) {
    this.context[key] = value;
  }

  get(key) {
    return this.context[key];
  }

  // Substitutes variables like {{nodeId.output}} or {{nodeId.field.subfield}}
  substitute(text) {
    if (typeof text !== 'string') return text;
    return text.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
      const keys = path.trim().split('.');
      let current = this.context;
      for (const key of keys) {
        if (current === undefined || current === null) {
          return match;
        }
        current = current[key];
      }
      return current !== undefined ? current : match;
    });
  }

  // Deep substitute for objects
  substituteObject(obj) {
    if (typeof obj === 'string') {
      return this.substitute(obj);
    }
    if (Array.isArray(obj)) {
      return obj.map(item => this.substituteObject(item));
    }
    if (obj !== null && typeof obj === 'object') {
      const result = {};
      for (const [key, value] of Object.entries(obj)) {
        result[key] = this.substituteObject(value);
      }
      return result;
    }
    return obj;
  }
}

class DagEngine {
  constructor() {
    this.executors = {
      start: this.executeStart.bind(this),
      end: this.executeEnd.bind(this),
      llm: this.executeLLM.bind(this),
      knowledge: this.executeKnowledge.bind(this),
      tool: this.executeTool.bind(this),
      condition: this.executeCondition.bind(this),
      database: this.executeDatabase.bind(this),
    };
  }

  // SubTask 3.1: DAG Parser and Topological Sorting
  parseAndSort(nodes, edges) {
    const adjList = new Map();
    const inDegree = new Map();
    const nodeMap = new Map();

    nodes.forEach(node => {
      adjList.set(node.id, []);
      inDegree.set(node.id, 0);
      nodeMap.set(node.id, node);
    });

    edges.forEach(edge => {
      if (adjList.has(edge.source) && adjList.has(edge.target)) {
        adjList.get(edge.source).push(edge.target);
        inDegree.set(edge.target, inDegree.get(edge.target) + 1);
      }
    });

    return { adjList, inDegree, nodeMap };
  }

  // SubTask 3.3: Placeholder Executors
  async executeStart(node, contextManager) {
    console.log(`Executing Start Node: ${node.id}`);
    const output = node.data?.input || contextManager.get('input') || {};
    return { output };
  }

  async executeEnd(node, contextManager) {
    console.log(`Executing End Node: ${node.id}`);
    const substitutedData = contextManager.substituteObject(node.data || {});
    return { output: substitutedData };
  }

  async executeLLM(node, contextManager, onEvent) {
    console.log(`Executing LLM Node: ${node.id}`);
    const input = contextManager.substituteObject(node.data || {});
    
    const modelId = input.modelId;
    if (!modelId) {
      throw new Error(`modelId is required for LLM node ${node.id}`);
    }

    const model = await prisma.model.findUnique({ where: { id: modelId } });
    if (!model) {
      throw new Error(`Model not found: ${modelId}`);
    }

    const config = {
      apiKey: model.apiKey || 'dummy-key',
    };
    if (model.baseUrl) {
      config.baseURL = model.baseUrl;
    }

    const openai = new OpenAI(config);

    const systemPrompt = input.systemPrompt || '';
    const userPrompt = input.prompt || input.userPrompt || '';
    
    const messages = [];
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }
    if (userPrompt) {
      messages.push({ role: 'user', content: userPrompt });
    }

    const temperature = input.temperature !== undefined ? parseFloat(input.temperature) : model.temperature;
    
    try {
      const stream = await openai.chat.completions.create({
        model: model.name || 'gpt-3.5-turbo',
        messages,
        stream: true,
        temperature,
      });

      let fullOutput = "";
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || "";
        if (content) {
          fullOutput += content;
          if (onEvent) {
            onEvent({ type: 'chunk', nodeId: node.id, chunk: content });
          }
        }
      }

      return { output: fullOutput };
    } catch (error) {
      console.error(`OpenAI API Error in LLM node ${node.id}:`, error);
      throw error;
    }
  }

  async executeKnowledge(node, contextManager) {
    console.log(`Executing Knowledge Node: ${node.id}`);
    const input = contextManager.substituteObject(node.data || {});
    return { output: `[Knowledge Base Result placeholder for query: "${input.query || ''}"]` };
  }

  async executeTool(node, contextManager) {
    console.log(`Executing Tool Node: ${node.id}`);
    const input = contextManager.substituteObject(node.data || {});
    return { output: `[Tool Execution Result placeholder for tool: "${input.toolName || ''}"]` };
  }

  async executeCondition(node, contextManager) {
    console.log(`Executing Condition Node: ${node.id}`);
    const input = contextManager.substituteObject(node.data || {});
    
    // Evaluate the condition
    const { condition, variable, operator, value } = input;
    
    let result = false;
    
    if (condition === 'true' || condition === true) {
      result = true;
    } else if (condition === 'false' || condition === false) {
      result = false;
    } else {
      // Evaluate basic operators if variable and value are provided
      if (variable !== undefined && value !== undefined) {
        const strVar = String(variable);
        const strVal = String(value);
        
        switch (operator) {
          case '==':
          case '===':
            result = strVar === strVal;
            break;
          case '!=':
          case '!==':
            result = strVar !== strVal;
            break;
          case '>':
            result = parseFloat(strVar) > parseFloat(strVal);
            break;
          case '<':
            result = parseFloat(strVar) < parseFloat(strVal);
            break;
          case '>=':
            result = parseFloat(strVar) >= parseFloat(strVal);
            break;
          case '<=':
            result = parseFloat(strVar) <= parseFloat(strVal);
            break;
          case 'contains':
            result = strVar.includes(strVal);
            break;
          default:
            result = strVar === strVal; // Default to equality
        }
      } else {
        // If no explicit operator, just evaluate the boolean truthiness of condition
        result = !!condition;
      }
    }
    
    return { result: result ? 'true' : 'false', output: `[Condition evaluated to ${result}]` };
  }

  async executeDatabase(node, contextManager, onEvent) {
    console.log(`Executing Database Node: ${node.id}`);
    const input = contextManager.substituteObject(node.data || {});
    
    let { dbType, configMode, connectionString, host, port, username, password, database, sql, params } = input;
    
    if (configMode === 'form') {
      const safeUser = username ? encodeURIComponent(username) : '';
      const safePass = password ? encodeURIComponent(password) : '';
      
      let credentials = '';
      if (safeUser || safePass) {
        credentials = safeUser;
        if (safePass) {
          credentials += `:${safePass}`;
        }
        credentials += '@';
      }
      
      const hostPart = host || 'localhost';
      const portPart = port ? `:${port}` : '';
      const dbPart = database ? `/${database}` : '';

      if (dbType === 'mysql') {
        connectionString = `mysql://${credentials}${hostPart}${portPart}${dbPart}`;
      } else if (dbType === 'pg' || dbType === 'postgres' || dbType === 'postgresql') {
        connectionString = `postgresql://${credentials}${hostPart}${portPart}${dbPart}`;
      } else {
        connectionString = `${dbType || 'mysql'}://${credentials}${hostPart}${portPart}${dbPart}`;
      }
    }
    
    if (!connectionString || !sql) {
      throw new Error(`Connection string and SQL are required for Database node ${node.id}`);
    }

    let rows = [];

    if (onEvent) {
      onEvent({ type: 'chunk', nodeId: node.id, chunk: `Connecting to ${dbType || 'database'}...\n` });
    }

    try {
      if (dbType === 'mysql') {
        const mysql = require('mysql2/promise');
        const connection = await mysql.createConnection(connectionString);
        try {
          const [results] = await connection.execute(sql, params || []);
          rows = results;
        } finally {
          await connection.end();
        }
      } else if (dbType === 'pg' || dbType === 'postgres' || dbType === 'postgresql') {
        const { Client } = require('pg');
        const client = new Client({ connectionString });
        await client.connect();
        try {
          const res = await client.query(sql, params || []);
          rows = res.rows;
        } finally {
          await client.end();
        }
      } else {
        throw new Error(`Unsupported database type: ${dbType}`);
      }

      if (onEvent) {
        onEvent({ type: 'chunk', nodeId: node.id, chunk: `Execution successful, returned ${Array.isArray(rows) ? rows.length : 1} rows.\n` });
      }

      contextManager.set(node.id, { output: rows });
      
      return { output: rows };
    } catch (error) {
      console.error(`Database Execution Error in node ${node.id}:`, error);
      throw error;
    }
  }

  async executeNode(node, contextManager, onEvent) {
    const executor = this.executors[node.type];
    if (!executor) {
      console.warn(`No executor found for node type: ${node.type}`);
      return { output: {} };
    }
    if (onEvent) {
      onEvent({ type: 'node_start', nodeId: node.id });
    }
    return await executor(node, contextManager, onEvent);
  }

  propagateSkip(nodeId, adjList, inDegree, skippedNodes) {
    if (skippedNodes.has(nodeId)) return;
    skippedNodes.add(nodeId);
    
    const downstream = adjList.get(nodeId) || [];
    for (const childId of downstream) {
      this.propagateSkip(childId, adjList, inDegree, skippedNodes);
    }
  }

  async run(nodes, edges, initialContext = {}, onEvent = null) {
    const { adjList, inDegree, nodeMap } = this.parseAndSort(nodes, edges);
    const contextManager = new ContextManager(initialContext);
    const results = {};
    const skippedNodes = new Set();
    const completedNodes = new Set();
    const runningNodes = new Set();

    return new Promise((resolve, reject) => {
      let isRejected = false;

      const checkCompletion = () => {
        if (completedNodes.size + skippedNodes.size === nodeMap.size) {
          if (onEvent) {
            onEvent({ type: 'workflow_finish', results });
          }
          resolve(results);
        } else if (runningNodes.size === 0 && completedNodes.size + skippedNodes.size < nodeMap.size) {
          const error = new Error("Cycle detected or deadlock in execution");
          if (onEvent) {
            onEvent({ type: 'workflow_error', error: error.message });
          }
          reject(error);
        }
      };

      const executeReadyNodes = () => {
        if (isRejected) return;

        let startedNewNode = false;
        inDegree.forEach((degree, nodeId) => {
          if (degree === 0 && !runningNodes.has(nodeId) && !completedNodes.has(nodeId) && !skippedNodes.has(nodeId)) {
            runningNodes.add(nodeId);
            startedNewNode = true;
            const node = nodeMap.get(nodeId);
            
            this.executeNode(node, contextManager, onEvent).then((response) => {
              if (isRejected) return;
              const { output, result } = response || {};
              
              runningNodes.delete(nodeId);
              completedNodes.add(nodeId);
              results[nodeId] = output;
              contextManager.set(nodeId, output);
              
              if (onEvent) {
                onEvent({ type: 'node_finish', nodeId, output });
              }

              const downstream = adjList.get(nodeId) || [];
              for (const childId of downstream) {
                let skipEdge = false;
                if (node.type === 'condition') {
                  const edge = edges.find(e => e.source === nodeId && e.target === childId);
                  if (edge) {
                    const branch = edge.sourceHandle;
                    if (String(result) !== String(branch)) {
                      skipEdge = true;
                    }
                  }
                }

                if (skipEdge) {
                  this.propagateSkip(childId, adjList, inDegree, skippedNodes);
                } else {
                  const currentInDegree = inDegree.get(childId);
                  inDegree.set(childId, currentInDegree - 1);
                }
              }

              executeReadyNodes();
            }).catch(error => {
              if (isRejected) return;
              isRejected = true;
              console.error(`Error executing node ${nodeId}:`, error);
              if (onEvent) {
                onEvent({ type: 'node_error', nodeId, error: error.message });
              }
              reject(error);
            });
          }
        });

        if (!startedNewNode && runningNodes.size === 0) {
          checkCompletion();
        }
      };

      executeReadyNodes();
    });
  }
}

module.exports = { DagEngine, ContextManager };