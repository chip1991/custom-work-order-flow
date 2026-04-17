import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, AlertCircle } from 'lucide-react';
import { getAgent, createAgent, updateAgent } from '@/api/agents';
import { Model, fetchModels } from '@/lib/api';

export default function AgentEditor() {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [models, setModels] = useState<Model[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    systemPrompt: '',
    modelId: '',
  });

  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = async () => {
    try {
      const data = await fetchModels();
      setModels(data);
      if (!isEditing && data.length > 0) {
        setFormData((prev) => ({ ...prev, modelId: data[0].id }));
      }
    } catch (err) {
      console.error("Failed to load models:", err);
    }
  };

  useEffect(() => {
    if (isEditing && id) {
      getAgent(id)
        .then((data) => {
          setFormData({
            name: data.name,
            description: data.description || '',
            systemPrompt: data.systemPrompt || '',
            modelId: data.modelId,
          });
        })
        .catch((err) => {
          console.error(err);
          setError('加载代理失败');
        })
        .finally(() => setLoading(false));
    }
  }, [id, isEditing]);

  const handleSave = async () => {
    if (!formData.name.trim()) {
      setError('代理名称不能为空');
      return;
    }

    if (!formData.modelId) {
      setError('请选择一个模型');
      return;
    }

    setError(null);
    setSaving(true);

    try {
      if (isEditing && id) {
        await updateAgent(id, formData);
      } else {
        await createAgent(formData);
      }
      navigate('/agents');
    } catch (err: any) {
      console.error('Save failed:', err);
      setError(err.message || '保存失败');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">加载中...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex items-center space-x-4 mb-8">
        <button
          onClick={() => navigate('/agents')}
          className="p-2 text-gray-500 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? '编辑代理' : '新增代理'}
          </h1>
          <p className="mt-1 text-sm text-gray-500">配置和管理自定义大语言模型代理</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 p-4 rounded-md flex items-center text-red-700 border border-red-200">
          <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
          {error}
        </div>
      )}

      <div className="bg-white shadow rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              代理名称 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="例如：代码助手"
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              描述
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="代理功能的简短描述"
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              绑定模型 <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.modelId}
              onChange={(e) => setFormData({ ...formData, modelId: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              required
            >
              <option value="" disabled>请选择模型</option>
              {models.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name} ({model.provider})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              系统提示词 (System Prompt)
            </label>
            <textarea
              value={formData.systemPrompt}
              onChange={(e) => setFormData({ ...formData, systemPrompt: e.target.value })}
              rows={6}
              placeholder="You are a helpful assistant..."
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm resize-y"
            />
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-gray-200 flex justify-end space-x-4">
        <button
          onClick={() => navigate('/agents')}
          className="px-6 py-2.5 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          取消
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center px-6 py-2.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4 mr-2" />
          {saving ? '保存中...' : '保存代理'}
        </button>
      </div>
    </div>
  );
}
