const { DagEngine } = require('./services/dag-engine');

const nodes = [
  { id: 'start_1', type: 'start', data: { input: 'Hello World' } },
  { id: 'llm_1', type: 'llm', data: { prompt: 'Translate: {{start_1.output}}' } },
  { id: 'tool_1', type: 'tool', data: { toolName: 'translator', text: '{{llm_1.output}}' } },
  { id: 'end_1', type: 'end', data: { final_result: '{{tool_1.output}}' } }
];

const edges = [
  { source: 'start_1', target: 'llm_1' },
  { source: 'llm_1', target: 'tool_1' },
  { source: 'tool_1', target: 'end_1' }
];

async function test() {
  const engine = new DagEngine();
  try {
    const results = await engine.run(nodes, edges);
    console.log('Execution Results:', JSON.stringify(results, null, 2));
  } catch (err) {
    console.error('Test Failed:', err);
  }
}

test();