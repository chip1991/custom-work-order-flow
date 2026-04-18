import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit2, Trash2, MessageSquare } from 'lucide-react';
import { getQuestions, deleteQuestion, Question } from '@/api/questions';

export default function Datasets() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchQuestions = async () => {
    try {
      const data = await getQuestions();
      setQuestions(data);
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('确定要删除这个题目吗？')) return;
    try {
      await deleteQuestion(id);
      setQuestions(questions.filter((q) => q.id !== id));
    } catch (error) {
      console.error('Error deleting question:', error);
      alert('删除失败');
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">加载中...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link
            to="/datasets/new"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="w-4 h-4 mr-2" />
            新增题目
          </Link>
        </div>
      </div>

      {questions.length === 0 ? (
        <div className="text-center bg-white rounded-lg border border-gray-200 py-12">
          <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">暂无题目</h3>
          <p className="mt-1 text-sm text-gray-500">
            开始创建一个新的题目来进行大模型测评吧。
          </p>
          <div className="mt-6">
            <Link
              to="/datasets/new"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
            >
              <Plus className="w-4 h-4 mr-2" />
              新增题目
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md border border-gray-200">
          <ul className="divide-y divide-gray-200">
            {questions.map((question) => (
              <li key={question.id}>
                <div className="px-4 py-4 sm:px-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-medium text-blue-600 truncate">
                      {question.name}
                    </h3>
                    <div className="mt-2 flex items-center text-sm text-gray-500">
                      <MessageSquare className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                      <p>包含 {question.messages?.length || 0} 轮对话</p>
                    </div>
                    {question.description && (
                      <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                        {question.description}
                      </p>
                    )}
                  </div>
                  <div className="ml-4 flex items-center space-x-4">
                    <Link
                      to={`/datasets/${question.id}/edit`}
                      className="text-gray-400 hover:text-blue-600 transition-colors"
                      title="编辑"
                    >
                      <Edit2 className="w-5 h-5" />
                    </Link>
                    <button
                      onClick={() => handleDelete(question.id)}
                      className="text-gray-400 hover:text-red-600 transition-colors"
                      title="删除"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
