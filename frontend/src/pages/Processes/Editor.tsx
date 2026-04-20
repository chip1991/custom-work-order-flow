import { useState, useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Edit2, Play, SlidersHorizontal, AlertCircle, Shield } from 'lucide-react';
import { ReactFlowProvider, Node, Edge } from '@xyflow/react';

import Sidebar from './components/Sidebar';
import Canvas from './components/Canvas';
import PropertiesPanel from './components/PropertiesPanel';
import FormBuilder, { FormField } from './components/FormBuilder';
import { getProcess, createProcess, updateProcess } from '@/api/processes';

type TabType = 'basic' | 'form' | 'node';

export default function ProcessEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = !id || id === 'new';

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(!isNew);

  const [activeTab, setActiveTab] = useState<TabType>('node');
  const [activeRightTab, setActiveRightTab] = useState<'properties' | 'permissions'>('properties');

  const [processData, setProcessData] = useState({
    name: '新建流程',
    description: '',
    communities: [] as string[],
    status: 'active',
    timeLimit: 24,
  });

  const [formConfig, setFormConfig] = useState<FormField[]>([]);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  useEffect(() => {
    if (!isNew && id) {
      loadProcess(id);
    }
  }, [id, isNew]);

  const loadProcess = async (processId: string) => {
    try {
      setLoading(true);
      const data = await getProcess(processId);
      setProcessData({
        name: data.name,
        description: data.description || '',
        communities: data.communities ? JSON.parse(data.communities) : [],
        status: data.status || 'active',
        timeLimit: data.timeLimit || 24,
      });
      setFormConfig(JSON.parse(data.formConfig || '[]'));
      setNodes(JSON.parse(data.nodes || '[]'));
      setEdges(JSON.parse(data.edges || '[]'));
    } catch (err: any) {
      setError(err.message || '加载失败');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSave = async () => {
    if (!processData.name.trim()) {
      setError('流程名称不能为空');
      return;
    }
    setError(null);
    setSaving(true);
    
    try {
      const payload = {
        name: processData.name,
        description: processData.description,
        communities: JSON.stringify(processData.communities),
        status: processData.status,
        timeLimit: processData.timeLimit,
        formConfig: JSON.stringify(formConfig),
        nodes: JSON.stringify(nodes),
        edges: JSON.stringify(edges),
      };

      if (isNew) {
        await createProcess(payload);
      } else {
        await updateProcess(id!, payload);
      }
      navigate('/processes');
    } catch (err: any) {
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

  return (
    <div className="flex flex-col h-screen w-full bg-white overflow-hidden">
      <header className="relative flex-shrink-0 border-b border-gray-200 bg-white px-6 py-4 flex items-center justify-between z-10">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/processes')}
            className="p-2 text-gray-500 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900 leading-tight">
                {processData.name}
              </h1>
              <button 
                className="p-1 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                title="修改名称"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-gray-500">{processData.description || '暂无描述'}</p>
          </div>
        </div>

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center p-1 bg-gray-100 rounded-lg">
          {(['basic', 'form', 'node'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                activeTab === tab
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tab === 'basic' ? '基础信息' : tab === 'form' ? '表单配置' : '节点配置'}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-4">
          {error && (
            <div className="text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {error}
            </div>
          )}
          <button
            onClick={() => navigate('/processes')}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? '保存中...' : '保存流程'}
          </button>
        </div>
      </header>

      <div className={`flex-1 overflow-hidden ${activeTab === 'node' ? 'flex' : 'hidden'}`}>
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

        <aside className="w-80 border-l border-gray-200 bg-white flex flex-col h-full z-10 shadow-sm">
          <div className="flex border-b border-gray-200 bg-gray-50 flex-shrink-0">
            <button
              onClick={() => setActiveRightTab('properties')}
              className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 ${
                activeRightTab === 'properties'
                  ? 'border-b-2 border-indigo-600 text-indigo-600 bg-white'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              节点属性
            </button>
            <button
              onClick={() => setActiveRightTab('permissions')}
              className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 ${
                activeRightTab === 'permissions'
                  ? 'border-b-2 border-indigo-600 text-indigo-600 bg-white'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Shield className="w-4 h-4" />
              表单权限
            </button>
          </div>

          <div className="flex-1 overflow-hidden relative">
            <div className="absolute inset-0 overflow-y-auto">
              <PropertiesPanel
                selectedNode={selectedNode}
                onUpdateNodeData={updateNodeData}
                formConfig={formConfig}
                activeTab={activeRightTab}
              />
            </div>
          </div>
        </aside>
      </div>

      {activeTab === 'basic' && (
        <div className="flex-1 overflow-auto p-6 bg-gray-50">
          <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-sm p-8 border border-gray-200">
            <h2 className="text-lg font-medium text-gray-900 mb-6">基础信息</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  流程名称 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={processData.name}
                  onChange={(e) => setProcessData({ ...processData, name: e.target.value })}
                  placeholder="请输入流程名称"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  描述
                </label>
                <textarea
                  value={processData.description}
                  onChange={(e) => setProcessData({ ...processData, description: e.target.value })}
                  placeholder="请输入流程描述"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  适用小区
                </label>
                <div className="flex gap-4">
                  {['朝阳小区', '海淀小区', '望京小区'].map(community => (
                    <label key={community} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={processData.communities.includes(community)}
                        onChange={(e) => {
                          const newCommunities = e.target.checked
                            ? [...processData.communities, community]
                            : processData.communities.filter(c => c !== community);
                          setProcessData({ ...processData, communities: newCommunities });
                        }}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm text-gray-700">{community}</span>
                    </label>
                  ))}
                </div>
                <p className="mt-1 text-xs text-gray-500">留空表示适用于所有小区</p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    处理时效
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      value={Math.floor(processData.timeLimit / (24 * 60))}
                      onChange={(e) => {
                        const d = parseInt(e.target.value, 10) || 0;
                        const h = Math.floor((processData.timeLimit % (24 * 60)) / 60);
                        const m = processData.timeLimit % 60;
                        setProcessData({ ...processData, timeLimit: d * 24 * 60 + h * 60 + m });
                      }}
                      className="w-16 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                    <span className="text-sm text-gray-700">天</span>
                    <input
                      type="number"
                      min="0"
                      max="23"
                      value={Math.floor((processData.timeLimit % (24 * 60)) / 60)}
                      onChange={(e) => {
                        const d = Math.floor(processData.timeLimit / (24 * 60));
                        const h = parseInt(e.target.value, 10) || 0;
                        const m = processData.timeLimit % 60;
                        setProcessData({ ...processData, timeLimit: d * 24 * 60 + h * 60 + m });
                      }}
                      className="w-16 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                    <span className="text-sm text-gray-700">小时</span>
                    <input
                      type="number"
                      min="0"
                      max="59"
                      value={processData.timeLimit % 60}
                      onChange={(e) => {
                        const d = Math.floor(processData.timeLimit / (24 * 60));
                        const h = Math.floor((processData.timeLimit % (24 * 60)) / 60);
                        const m = parseInt(e.target.value, 10) || 0;
                        setProcessData({ ...processData, timeLimit: d * 24 * 60 + h * 60 + m });
                      }}
                      className="w-16 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                    <span className="text-sm text-gray-700">分钟</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    启用状态
                  </label>
                  <select
                    value={processData.status}
                    onChange={(e) => setProcessData({ ...processData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <option value="active">启用</option>
                    <option value="inactive">停用</option>
                    <option value="draft">草稿</option>
                  </select>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {activeTab === 'form' && (
        <div className="flex-1 overflow-hidden flex bg-gray-50">
          <FormBuilder fields={formConfig} onChange={setFormConfig} />
        </div>
      )}
    </div>
  );
}
