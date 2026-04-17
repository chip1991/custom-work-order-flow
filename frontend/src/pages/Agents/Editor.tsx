import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, AlertCircle } from 'lucide-react';
import { getAgent, createAgent, updateAgent } from '@/api/agents';
import { Model, fetchModels } from '@/lib/api';
import { ReactFlowProvider, Node, Edge } from '@xyflow/react';

import Sidebar from './components/Sidebar';
import Canvas from './components/Canvas';
import PropertiesPanel from './components/PropertiesPanel';

export default function AgentEditor() {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [models, setModels] = useState<Model[]>([]);

  const [agentData, setAgentData] = useState({
    name: '',
    description: '',
    systemPrompt: '',
    modelId: '',
  });

  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = async () => {
    try {
      const data = await fetchModels();
      setModels(data);
      if (!isEditing && data.length > 0) {
        setAgentData((prev) => ({ ...prev, modelId: data[0].id }));
      }
    } catch (err) {
      console.error("Failed to load models:", err);
    }
  };

  useEffect(() => {
    if (isEditing && id) {
      getAgent(id)
        .then((data) => {
          setAgentData({
            name: data.name,
            description: data.description || '',
            systemPrompt: data.systemPrompt || '',
            modelId: data.modelId,
          });
          
          if (data.workflow) {
            try {
              const workflow = typeof data.workflow === 'string' ? JSON.parse(data.workflow) : data.workflow;
              if (workflow.nodes) setNodes(workflow.nodes);
              if (workflow.edges) setEdges(workflow.edges);
            } catch (e) {
              console.error("Failed to parse workflow:", e);
            }
          }
        })
        .catch((err) => {
          console.error(err);
          setError('加载代理失败');
        })
        .finally(() => setLoading(false));
    }
  }, [id, isEditing]);

  const handleSave = async () => {
    if (!agentData.name.trim()) {
      setError('代理名称不能为空');
      return;
    }

    if (!agentData.modelId) {
      setError('请选择一个默认模型');
      return;
    }

    setError(null);
    setSaving(true);

    const payload = {
      ...agentData,
      workflow: { nodes, edges }
    };

    try {
      if (isEditing && id) {
        await updateAgent(id, payload);
      } else {
        await createAgent(payload);
      }
      navigate('/agents');
    } catch (err: any) {
      console.error('Save failed:', err);
      setError(err.message || '保存失败');
    } finally {
      setSaving(false);
    }
  };

  const updateNodeData = useCallback((nodeId: string, newData: any) => {
    setNodes((nds) =>
      nds.map((n) => {
        if (n.id === nodeId) {
          const updatedNode = { ...n, data: { ...n.data, ...newData } };
          if (selectedNode?.id === nodeId) {
             setSelectedNode(updatedNode);
          }
          return updatedNode;
        }
        return n;
      })
    );
  }, [selectedNode]);

  if (loading) {
    return <div className="p-8 text-center text-gray-500 flex items-center justify-center h-full">加载中...</div>;
  }

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 border-b border-gray-200 bg-white px-6 py-4 flex items-center justify-between z-10">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/agents')}
            className="p-2 text-gray-500 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900 leading-tight">
              {isEditing ? '编辑 Agent 流程' : '新增 Agent 流程'}
            </h1>
            <p className="text-sm text-gray-500">{agentData.name || '未命名 Agent'}</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {error && (
            <div className="text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {error}
            </div>
          )}
          <button
            onClick={() => navigate('/agents')}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? '保存中...' : '保存 Agent'}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        
        <main className="flex-1 relative">
          <ReactFlowProvider>
            <Canvas 
              nodes={nodes} 
              edges={edges} 
              setNodes={setNodes} 
              setEdges={setEdges} 
              onNodeSelect={setSelectedNode} 
            />
          </ReactFlowProvider>
        </main>

        <PropertiesPanel
          selectedNode={selectedNode}
          onUpdateNodeData={updateNodeData}
          agentData={agentData}
          onUpdateAgentData={setAgentData}
          models={models}
        />
      </div>
    </div>
  );
}
