import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, AlertCircle, Edit2, LayoutList, SlidersHorizontal } from 'lucide-react';
import { getWorkOrder, createWorkOrder, updateWorkOrder } from '@/api/work-orders';
import { ReactFlowProvider, Node, Edge } from '@xyflow/react';

import Sidebar from './components/Sidebar';
import Canvas from './components/Canvas';
import PropertiesPanel from './components/PropertiesPanel';
import FormConfigPanel, { FormField } from './components/FormConfigPanel';
import WorkOrderSettingsModal, { WorkOrderSettingsData } from './components/WorkOrderSettingsModal';

export default function WorkOrderFlowEditor() {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id && id !== 'new');
  const navigate = useNavigate();

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [workOrderData, setWorkOrderData] = useState<WorkOrderSettingsData>({
    name: '',
    description: '',
  });

  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [formSchema, setFormSchema] = useState<FormField[]>([]);
  
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  
  // Controls which tab is active in the right panel
  const [rightPanelTab, setRightPanelTab] = useState<'properties' | 'formConfig'>('formConfig');

  useEffect(() => {
    if (isEditing && id) {
      getWorkOrder(id)
        .then((data) => {
          setWorkOrderData({
            name: data.name,
            description: data.description || '',
          });
          
          if (data.formSchema) {
            try {
              const parsedSchema = typeof data.formSchema === 'string' ? JSON.parse(data.formSchema) : data.formSchema;
              setFormSchema(parsedSchema || []);
            } catch (e) {
              console.error("Failed to parse formSchema:", e);
            }
          }

          if (data.workflowData) {
            try {
              const workflow = typeof data.workflowData === 'string' ? JSON.parse(data.workflowData) : data.workflowData;
              if (workflow.nodes) setNodes(workflow.nodes);
              if (workflow.edges) setEdges(workflow.edges);
            } catch (e) {
              console.error("Failed to parse workflowData:", e);
            }
          }
        })
        .catch((err) => {
          console.error(err);
          setError('加载工单流程失败');
        })
        .finally(() => setLoading(false));
    }
  }, [id, isEditing]);

  // Auto switch to properties tab when a node is selected
  useEffect(() => {
    if (selectedNode) {
      setRightPanelTab('properties');
    }
  }, [selectedNode]);

  const handleSave = async () => {
    if (!workOrderData.name.trim()) {
      setError('流程名称不能为空');
      return;
    }

    setError(null);
    setSaving(true);

    const payload = {
      ...workOrderData,
      formSchema,
      workflowData: { nodes, edges }
    };

    try {
      if (isEditing && id) {
        await updateWorkOrder(id, payload);
      } else {
        await createWorkOrder(payload);
      }
      navigate('/work-orders');
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
    <div className="flex flex-col h-screen w-full bg-white overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 border-b border-gray-200 bg-white px-6 py-4 flex items-center justify-between z-10">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/work-orders')}
            className="p-2 text-gray-500 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900 leading-tight">
                {workOrderData.name || '未命名工单流程'}
              </h1>
              <button 
                onClick={() => setIsSettingsModalOpen(true)}
                className="p-1 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                title="设置流程"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-gray-500">{workOrderData.description || '暂无描述'}</p>
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
            onClick={() => navigate('/work-orders')}
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
            {saving ? '保存中...' : '保存流程'}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column: Sidebar */}
        <Sidebar />
        
        {/* Center Column: Canvas */}
        <main className="flex-1 relative">
          <ReactFlowProvider>
            <Canvas 
              nodes={nodes} 
              edges={edges} 
              setNodes={setNodes} 
              setEdges={setEdges} 
              onNodeSelect={setSelectedNode}
              activeNodeId={activeNodeId}
            />
          </ReactFlowProvider>
        </main>

        {/* Right Column: Tabbed Panel */}
        <aside className="w-80 border-l border-gray-200 bg-white flex flex-col h-full z-10 shadow-sm">
          {/* Tabs */}
          <div className="flex border-b border-gray-200 bg-gray-50 flex-shrink-0">
            <button
              onClick={() => setRightPanelTab('properties')}
              className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-colors ${
                rightPanelTab === 'properties'
                  ? 'border-indigo-600 text-indigo-600 bg-white'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              节点属性
            </button>
            <button
              onClick={() => setRightPanelTab('formConfig')}
              className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 border-b-2 transition-colors ${
                rightPanelTab === 'formConfig'
                  ? 'border-indigo-600 text-indigo-600 bg-white'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              <LayoutList className="w-4 h-4" />
              表单配置
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-hidden relative">
            {rightPanelTab === 'properties' ? (
              <div className="absolute inset-0 overflow-y-auto">
                <PropertiesPanel
                  selectedNode={selectedNode}
                  onUpdateNodeData={updateNodeData}
                  nodes={nodes}
                  edges={edges}
                />
              </div>
            ) : (
              <div className="absolute inset-0">
                <FormConfigPanel
                  formSchema={formSchema}
                  setFormSchema={setFormSchema}
                />
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Settings Modal */}
      <WorkOrderSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        onSave={(data) => setWorkOrderData(prev => ({ ...prev, ...data }))}
        initialData={workOrderData}
      />
    </div>
  );
}
