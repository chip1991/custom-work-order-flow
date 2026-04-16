import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Plus, Trash2, GripVertical, AlertCircle } from 'lucide-react';
import { getQuestion, createQuestion, updateQuestion, CreateQuestionDto, Message } from '@/api/questions';

export default function DatasetEditor() {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [messages, setMessages] = useState<Omit<Message, 'id'>[]>([
    { role: 'user', content: '' },
  ]);

  useEffect(() => {
    if (isEditing && id) {
      getQuestion(id)
        .then((data) => {
          setName(data.name);
          setDescription(data.description || '');
          if (data.messages && data.messages.length > 0) {
            setMessages(data.messages);
          }
        })
        .catch((err) => {
          console.error(err);
          setError('加载题目失败');
        })
        .finally(() => setLoading(false));
    }
  }, [id, isEditing]);

  const handleAddMessage = () => {
    setMessages([...messages, { role: 'user', content: '' }]);
  };

  const handleRemoveMessage = (index: number) => {
    setMessages(messages.filter((_, i) => i !== index));
  };

  const handleMessageChange = (index: number, field: 'role' | 'content', value: string) => {
    const newMessages = [...messages];
    newMessages[index] = { ...newMessages[index], [field]: value } as any;
    setMessages(newMessages);
  };

  const moveMessage = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === messages.length - 1) return;

    const newMessages = [...messages];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const temp = newMessages[index];
    newMessages[index] = newMessages[targetIndex];
    newMessages[targetIndex] = temp;
    setMessages(newMessages);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setError('题目标题不能为空');
      return;
    }

    if (messages.length === 0) {
      setError('至少需要一条对话内容');
      return;
    }

    const hasEmptyContent = messages.some((msg) => !msg.content.trim());
    if (hasEmptyContent) {
      setError('对话内容不能为空');
      return;
    }

    setError(null);
    setSaving(true);

    try {
      const data: CreateQuestionDto = {
        name,
        description,
        messages,
      };

      if (isEditing && id) {
        await updateQuestion(id, data);
      } else {
        await createQuestion(data);
      }

      navigate('/datasets');
    } catch (err) {
      console.error('Save failed:', err);
      setError('保存失败');
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
          onClick={() => navigate('/datasets')}
          className="p-2 text-gray-500 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? '编辑题目' : '新增题目'}
          </h1>
          <p className="mt-1 text-sm text-gray-500">编排多轮对话数据用于测评模型</p>
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
              题目标题 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例如：多轮逻辑推理测试"
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              题目描述（可选）
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="简要描述该题目的考察点"
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 resize-none"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-lg font-medium text-gray-900">对话编排</h3>
          <button
            onClick={handleAddMessage}
            className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <Plus className="w-4 h-4 mr-1" />
            添加对话
          </button>
        </div>

        <div className="space-y-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`relative bg-white shadow rounded-lg border ${
                msg.role === 'system'
                  ? 'border-gray-300'
                  : msg.role === 'user'
                  ? 'border-blue-200'
                  : 'border-green-200'
              } p-4`}
            >
              <div className="flex items-start space-x-4">
                <div className="flex flex-col items-center justify-center space-y-1 text-gray-400 mt-2">
                  <button
                    onClick={() => moveMessage(index, 'up')}
                    disabled={index === 0}
                    className="hover:text-gray-700 disabled:opacity-30 disabled:hover:text-gray-400"
                    title="上移"
                  >
                    <GripVertical className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-medium text-gray-500">
                    {index + 1}
                  </span>
                  <button
                    onClick={() => moveMessage(index, 'down')}
                    disabled={index === messages.length - 1}
                    className="hover:text-gray-700 disabled:opacity-30 disabled:hover:text-gray-400"
                    title="下移"
                  >
                    <GripVertical className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex-1 space-y-3">
                  <div className="flex items-center justify-between">
                    <select
                      value={msg.role}
                      onChange={(e) => handleMessageChange(index, 'role', e.target.value)}
                      className="block w-32 px-3 py-1.5 text-sm border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                    >
                      <option value="system">System</option>
                      <option value="user">User</option>
                      <option value="assistant">Assistant</option>
                    </select>
                    <button
                      onClick={() => handleRemoveMessage(index)}
                      className="text-red-400 hover:text-red-600 transition-colors"
                      title="删除该条对话"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <textarea
                    value={msg.content}
                    onChange={(e) => handleMessageChange(index, 'content', e.target.value)}
                    rows={4}
                    placeholder="输入对话内容..."
                    className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 font-mono text-sm resize-y"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="pt-6 border-t border-gray-200 flex justify-end space-x-4">
        <button
          onClick={() => navigate('/datasets')}
          className="px-6 py-2.5 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          取消
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center px-6 py-2.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-4 h-4 mr-2" />
          {saving ? '保存中...' : '保存题目'}
        </button>
      </div>
    </div>
  );
}
