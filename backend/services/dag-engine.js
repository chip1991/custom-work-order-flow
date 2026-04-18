const { OpenAI } = require('openai');

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

    const queue = [];
    inDegree.forEach((degree, nodeId) => {
      if (degree === 0) {
        queue.push(nodeId);
      }
    });

    const sortedNodes = [];
    while (queue.length > 0) {
      const currentId = queue.shift();
      sortedNodes.push(nodeMap.get(currentId));

      adjList.get(currentId).forEach(neighborId => {
        inDegree.set(neighborId, inDegree.get(neighborId) - 1);
        if (inDegree.get(neighborId) === 0) {
          queue.push(neighborId);
        }
      });
    }

    if (sortedNodes.length !== nodes.length) {
      throw new Error("Cycle detected in the graph");
    }

    return sortedNodes;
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

  async executeLLM(node, contextManager) {
    console.log(`Executing LLM Node: ${node.id}`);
    const input = contextManager.substituteObject(node.data || {});
    return { output: `[LLM Output placeholder for prompt: "${input.prompt || ''}"]` };
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
    // Placeholder logic: condition defaults to true branch
    return { result: true, output: `[Condition evaluated to true]` };
  }

  async run(nodes, edges, initialContext = {}, onEvent = null) {
    const sortedNodes = this.parseAndSort(nodes, edges);
    const contextManager = new ContextManager(initialContext);
    const results = {};

    for (const node of sortedNodes) {
      const executor = this.executors[node.type];
      if (!executor) {
        console.warn(`No executor found for node type: ${node.type}`);
        continue;
      }

      if (onEvent) {
        onEvent({ type: 'node_start', nodeId: node.id });
      }

      try {
        const output = await executor(node, contextManager);
        results[node.id] = output;
        contextManager.set(node.id, output);
        
        if (onEvent) {
          onEvent({ type: 'node_finish', nodeId: node.id, output });
        }
      } catch (error) {
        console.error(`Error executing node ${node.id}:`, error);
        if (onEvent) {
          onEvent({ type: 'node_error', nodeId: node.id, error: error.message });
        }
        throw error;
      }
    }

    if (onEvent) {
      onEvent({ type: 'workflow_finish', results });
    }

    return results;
  }
}

module.exports = { DagEngine, ContextManager };