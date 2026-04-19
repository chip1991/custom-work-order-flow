import StartNode from './StartNode';
import LLMNode from './LLMNode';
import EndNode from './EndNode';
import KnowledgeBaseNode from './KnowledgeBaseNode';
import PluginNode from './PluginNode';
import ConditionNode from './ConditionNode';
import CodeNode from './CodeNode';
import DatabaseNode from './DatabaseNode';

export const nodeTypes = {
  start: StartNode,
  llm: LLMNode,
  end: EndNode,
  knowledge_base: KnowledgeBaseNode,
  plugin: PluginNode,
  condition: ConditionNode,
  code: CodeNode,
  database: DatabaseNode,
};
