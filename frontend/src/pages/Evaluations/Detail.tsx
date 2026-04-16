import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Clock, 
  Zap, 
  CheckCircle2, 
  XCircle, 
  PlayCircle,
  AlertCircle,
  Cpu,
  HelpCircle,
  MessageSquare,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { getTask, Task, TaskResult } from "@/api/tasks";

export default function EvaluationsDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [task, setTask] = useState<Task | null>(null);
  const [results, setResults] = useState<Record<string, TaskResult>>({}); // resultId -> TaskResult
  const [activeQuestionId, setActiveQuestionId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isContextExpanded, setIsContextExpanded] = useState(false);
  
  // Ref for the SSE EventSource
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!id) return;
    
    const loadTask = async () => {
      try {
        setLoading(true);
        const data = await getTask(id);
        setTask(data);
        if (data.questions && data.questions.length > 0) {
          setActiveQuestionId(data.questions[0].id);
        }
        
        // Initialize results map
        if (data.results) {
          const resultsMap: Record<string, TaskResult> = {};
          data.results.forEach(r => {
            resultsMap[r.id] = r;
          });
          setResults(resultsMap);
        }
        
        // If task is pending or running, connect to SSE stream
        if (data.status === 'pending' || data.status === 'running') {
          connectSSE(id);
        }
      } catch (err) {
        console.error("Failed to load task:", err);
        setError("加载任务失败");
      } finally {
        setLoading(false);
      }
    };
    
    loadTask();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [id]);

  const connectSSE = (taskId: string) => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }
    
    const es = new EventSource(`/api/tasks/${taskId}/stream`);
    eventSourceRef.current = es;

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        handleSSEEvent(data);
      } catch (err) {
        console.error("SSE parse error:", err);
      }
    };

    es.onerror = (err) => {
      console.error("SSE connection error:", err);
      es.close();
    };
  };

  const handleSSEEvent = (data: any) => {
    switch (data.type) {
      case 'task_started':
        setTask(prev => prev ? { ...prev, status: 'running' } : prev);
        break;
      case 'task_completed':
        setTask(prev => prev ? { ...prev, status: 'completed' } : prev);
        if (eventSourceRef.current) eventSourceRef.current.close();
        break;
      case 'task_failed':
        setTask(prev => prev ? { ...prev, status: 'failed' } : prev);
        if (eventSourceRef.current) eventSourceRef.current.close();
        break;
      case 'chunk':
        setResults(prev => {
          const result = prev[data.resultId] || {
            id: data.resultId,
            taskId: task?.id || '',
            modelId: data.modelId,
            questionId: data.questionId,
            response: '',
            status: 'running'
          };
          return {
            ...prev,
            [data.resultId]: {
              ...result,
              response: (result.response || '') + data.content,
              status: 'running'
            }
          };
        });
        break;
      case 'result_completed':
        setResults(prev => {
          const result = prev[data.resultId];
          if (!result) return prev;
          return {
            ...prev,
            [data.resultId]: {
              ...result,
              status: 'success',
              timeTaken: data.timeTaken,
              firstTokenTime: data.firstTokenTime
            }
          };
        });
        break;
      case 'result_error':
        setResults(prev => {
          const result = prev[data.resultId];
          if (!result) return prev;
          return {
            ...prev,
            [data.resultId]: {
              ...result,
              status: 'error',
              error: data.error
            }
          };
        });
        break;
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex flex-col items-center justify-center text-gray-500">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
          <p>加载测评详情...</p>
        </div>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="h-full flex items-center justify-center text-red-500">
        <div className="flex flex-col items-center">
          <AlertCircle className="w-12 h-12 mb-4" />
          <p>{error || "任务不存在"}</p>
          <button
            onClick={() => navigate("/evaluations")}
            className="mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            返回列表
          </button>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> 已完成</span>;
      case 'running':
        return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 flex items-center gap-1"><PlayCircle className="w-3.5 h-3.5 animate-pulse" /> 运行中</span>;
      case 'failed':
        return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> 失败</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">等待中</span>;
    }
  };

  // Get results for the active question
  const activeQuestionResults = Object.values(results).filter(
    r => r.questionId === activeQuestionId
  );

  // Get messages context for the active question
  const activeQuestion = task.questions?.find(q => q.id === activeQuestionId);
  const activeQuestionMessages = activeQuestion?.messages || [];

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/evaluations")}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
            {task.name}
            {getStatusBadge(task.status)}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            创建于 {new Date(task.createdAt).toLocaleString()} · 包含 {task.models?.length || 0} 个模型和 {task.questions?.length || 0} 个题目
          </p>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
        {/* Questions Sidebar / Mobile Top Tabs */}
        <div className="w-full lg:w-64 flex flex-col bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden shrink-0">
          <div className="p-4 border-b border-gray-200 bg-gray-50/50 hidden lg:block">
            <h2 className="font-semibold text-gray-900">测评题目</h2>
          </div>
          <div className="flex lg:flex-col overflow-x-auto lg:overflow-y-auto p-2 space-x-2 lg:space-x-0 lg:space-y-1">
            {task.questions?.map(q => (
              <button
                key={q.id}
                onClick={() => setActiveQuestionId(q.id)}
                className={`flex-none lg:w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors whitespace-nowrap lg:whitespace-normal ${
                  activeQuestionId === q.id
                    ? "bg-blue-50 text-blue-700 font-medium"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <div className="truncate max-w-[200px] lg:max-w-none">{q.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Results Matrix */}
        <div className="flex-1 flex flex-col bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden min-w-0">
          <div className="p-4 border-b border-gray-200 bg-gray-50/50 flex justify-between items-center">
            <h2 className="font-semibold text-gray-900 truncate">
              {activeQuestion?.name || '横向对比'}
            </h2>
          </div>
          
          {/* Context / Messages Display Area */}
          <div className="border-b border-gray-200 bg-white flex-shrink-0">
            <button
              onClick={() => setIsContextExpanded(!isContextExpanded)}
              className="w-full flex items-center justify-between p-3 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center font-medium">
                <MessageSquare className="w-4 h-4 mr-2 text-gray-400" />
                查看题目上下文 (共 {activeQuestionMessages.length} 轮对话)
              </div>
              {isContextExpanded ? (
                <ChevronUp className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              )}
            </button>
            
            {isContextExpanded && (
              <div className="p-4 pt-0 bg-gray-50/30 max-h-64 overflow-y-auto border-t border-gray-100">
                <div className="space-y-4 mt-4">
                  {activeQuestionMessages.map((msg, idx) => (
                    <div 
                      key={idx} 
                      className={`flex flex-col max-w-[85%] ${
                        msg.role === 'user' ? 'ml-auto items-end' : 
                        msg.role === 'system' ? 'mx-auto items-center max-w-full' : 
                        'mr-auto items-start'
                      }`}
                    >
                      {msg.role !== 'system' && (
                        <span className="text-xs text-gray-400 mb-1 capitalize">
                          {msg.role}
                        </span>
                      )}
                      <div 
                        className={`px-4 py-2.5 rounded-2xl text-sm whitespace-pre-wrap font-sans leading-relaxed ${
                          msg.role === 'user' 
                            ? 'bg-blue-600 text-white rounded-tr-sm' 
                            : msg.role === 'system'
                            ? 'bg-gray-100 text-gray-500 text-xs px-6 rounded-full border border-gray-200'
                            : 'bg-white text-gray-800 border border-gray-200 shadow-sm rounded-tl-sm'
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="flex-1 overflow-x-hidden overflow-y-auto lg:overflow-x-auto lg:overflow-y-hidden bg-gray-50">
            <div className="flex flex-col lg:flex-row lg:h-full lg:min-w-max p-4 gap-4">
              {task.models?.map(model => {
                const result = activeQuestionResults.find(r => r.modelId === model.id);
                
                return (
                  <div key={model.id} className="w-full lg:w-80 xl:w-96 flex flex-col bg-white rounded-xl border border-gray-200 overflow-hidden shrink-0 min-h-[300px] lg:min-h-0 shadow-sm">
                    {/* Model Header */}
                    <div className="p-3 border-b border-gray-200 bg-gray-50/50 flex justify-between items-center">
                      <div className="flex items-center gap-2 truncate">
                        <div className="h-6 w-6 rounded bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                          {model.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-sm text-gray-900 truncate">{model.name}</span>
                      </div>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{model.provider}</span>
                    </div>
                    
                    {/* Metrics Header */}
                    <div className="px-3 py-2 bg-gray-100 border-b border-gray-200 flex justify-between text-xs text-gray-500">
                      <div className="flex items-center gap-1" title="首字响应时间">
                        <Zap className="w-3 h-3 text-yellow-500" />
                        {result?.firstTokenTime ? `${result.firstTokenTime}ms` : '-'}
                      </div>
                      <div className="flex items-center gap-1" title="总耗时">
                        <Clock className="w-3 h-3 text-blue-500" />
                        {result?.timeTaken ? `${result.timeTaken}ms` : '-'}
                      </div>
                    </div>
                    
                    {/* Response Body */}
                    <div className="flex-1 p-4 overflow-y-auto bg-white text-sm text-gray-700 relative">
                      {!result ? (
                        <div className="flex items-center justify-center h-full text-gray-400">
                          等待评测开始...
                        </div>
                      ) : result.status === 'error' ? (
                        <div className="text-red-500 flex flex-col items-center justify-center h-full text-center">
                          <AlertCircle className="w-8 h-8 mb-2 opacity-50" />
                          <p>生成失败</p>
                          <p className="text-xs mt-1 opacity-70">{result.error}</p>
                        </div>
                      ) : (
                        <div className="whitespace-pre-wrap font-mono text-xs leading-relaxed">
                          {result.response || (
                            <span className="text-gray-400 italic">生成中...</span>
                          )}
                          {result.status === 'running' && (
                            <span className="inline-block w-2 h-4 bg-blue-400 ml-1 animate-pulse align-middle"></span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
