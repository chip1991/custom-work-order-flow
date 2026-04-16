import { useState, useEffect } from "react";
import { ArrowLeft, Save, Cpu, HelpCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { fetchModels, Model } from "@/lib/api";
import { getQuestions, Question } from "@/api/questions";
import { createTask } from "@/api/tasks";

export default function EvaluationsCreate() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [models, setModels] = useState<Model[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  
  const [selectedModels, setSelectedModels] = useState<Set<string>>(new Set());
  const [selectedQuestions, setSelectedQuestions] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [modelsData, questionsData] = await Promise.all([
          fetchModels(),
          getQuestions()
        ]);
        setModels(modelsData.filter(m => m.enabled));
        setQuestions(questionsData);
      } catch (error) {
        console.error("Failed to load data:", error);
      }
    };
    loadData();
  }, []);

  const toggleModel = (id: string) => {
    const next = new Set(selectedModels);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedModels(next);
  };

  const toggleQuestion = (id: string) => {
    const next = new Set(selectedQuestions);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedQuestions(next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return alert("请输入测评名称");
    if (selectedModels.size === 0) return alert("请至少选择一个模型");
    if (selectedQuestions.size === 0) return alert("请至少选择一个题目");

    try {
      setLoading(true);
      const task = await createTask({
        name,
        modelIds: Array.from(selectedModels),
        questionIds: Array.from(selectedQuestions)
      });
      navigate(`/evaluations/${task.id}`);
    } catch (error) {
      console.error("Failed to create task:", error);
      alert("创建失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-full flex flex-col space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/evaluations")}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">创建测评任务</h1>
          <p className="text-sm text-gray-500 mt-1">
            选择多个模型和题目进行横向对比测评
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex-1">
        <form onSubmit={handleSubmit} className="p-6 space-y-8 flex flex-col h-full overflow-y-auto">
          {/* Task Name */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-900">
              测评名称 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="block w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
              placeholder="例如：主流大模型代码能力横向对比"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Models Selection */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-900 flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-blue-500" />
                  选择模型 ({selectedModels.size}) <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    if (selectedModels.size === models.length) setSelectedModels(new Set());
                    else setSelectedModels(new Set(models.map(m => m.id)));
                  }}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  {selectedModels.size === models.length ? '取消全选' : '全选'}
                </button>
              </div>
              <div className="bg-gray-50 rounded-lg border border-gray-200 p-2 max-h-64 overflow-y-auto space-y-1">
                {models.length === 0 ? (
                  <p className="text-sm text-gray-500 p-4 text-center">暂无可用模型，请先到模型中心添加并启用</p>
                ) : (
                  models.map(model => (
                    <label key={model.id} className="flex items-center p-3 hover:bg-white rounded-md cursor-pointer transition-colors border border-transparent hover:border-gray-200 hover:shadow-sm">
                      <input
                        type="checkbox"
                        checked={selectedModels.has(model.id)}
                        onChange={() => toggleModel(model.id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <div className="ml-3 flex flex-col">
                        <span className="text-sm font-medium text-gray-900">{model.name}</span>
                        <span className="text-xs text-gray-500">{model.provider}</span>
                      </div>
                    </label>
                  ))
                )}
              </div>
            </div>

            {/* Questions Selection */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-900 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-blue-500" />
                  选择题目 ({selectedQuestions.size}) <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    if (selectedQuestions.size === questions.length) setSelectedQuestions(new Set());
                    else setSelectedQuestions(new Set(questions.map(q => q.id)));
                  }}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  {selectedQuestions.size === questions.length ? '取消全选' : '全选'}
                </button>
              </div>
              <div className="bg-gray-50 rounded-lg border border-gray-200 p-2 max-h-64 overflow-y-auto space-y-1">
                {questions.length === 0 ? (
                  <p className="text-sm text-gray-500 p-4 text-center">暂无可用题目，请先到题库中心添加</p>
                ) : (
                  questions.map(question => (
                    <label key={question.id} className="flex items-center p-3 hover:bg-white rounded-md cursor-pointer transition-colors border border-transparent hover:border-gray-200 hover:shadow-sm">
                      <input
                        type="checkbox"
                        checked={selectedQuestions.has(question.id)}
                        onChange={() => toggleQuestion(question.id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <div className="ml-3 flex flex-col">
                        <span className="text-sm font-medium text-gray-900">{question.name}</span>
                        <span className="text-xs text-gray-500 truncate max-w-[200px]">{question.description || '无描述'}</span>
                      </div>
                    </label>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="pt-6 mt-auto border-t border-gray-200 flex flex-col-reverse sm:flex-row justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate("/evaluations")}
              className="w-full sm:w-auto px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto inline-flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  创建中...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  保存并开始测评
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
