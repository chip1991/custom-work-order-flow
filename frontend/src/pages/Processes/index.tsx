import { useState, useEffect } from "react";
import { Search, Plus, Edit2, Trash2, Network, Loader2, History, Copy } from "lucide-react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { getProcesses, deleteProcess, createProcess, Process } from "@/api/processes";

export default function Processes() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [processes, setProcesses] = useState<Process[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProcesses();
  }, []);

  const loadProcesses = async () => {
    try {
      setLoading(true);
      const data = await getProcesses();
      setProcesses(data);
    } catch (error) {
      console.error("Failed to load processes", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个流程吗？')) return;
    try {
      await deleteProcess(id);
      setProcesses(processes.filter(p => p.id !== id));
    } catch (error) {
      console.error("Failed to delete process", error);
      alert('删除失败');
    }
  };

  const filteredProcesses = processes.filter(p => p.name.includes(searchQuery));

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/processes/new')}
            className="inline-flex items-center justify-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors focus:ring-4 focus:ring-indigo-100"
          >
            <Plus className="w-4 h-4 mr-2" />
            新增流程
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex-1 flex flex-col">
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row gap-4 justify-between bg-gray-50/50">
          <div className="relative max-w-md w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="搜索流程名称..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
        </div>

        <div className="flex-1 overflow-x-auto bg-gray-50/30">
          <table className="min-w-full divide-y divide-gray-200 hidden md:table">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">流程名称</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">描述</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">适用项目</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">节点数</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">版本</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">创建时间</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">更新时间</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-4" />
                      <p className="text-sm text-gray-500">加载中...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredProcesses.map(process => {
                let communitiesList: string[] = [];
                try {
                  if (process.communities) {
                    const parsed = JSON.parse(process.communities);
                    if (Array.isArray(parsed)) {
                      communitiesList = parsed;
                    } else if (typeof parsed === 'string') {
                      communitiesList = [parsed];
                    }
                  }
                } catch (e) {
                  if (typeof process.communities === 'string') {
                    communitiesList = [process.communities];
                  }
                }

                let nodesCount = 0;
                try {
                  if (process.nodes) {
                    const parsed = JSON.parse(process.nodes);
                    if (Array.isArray(parsed)) {
                      nodesCount = parsed.length;
                    }
                  }
                } catch (e) {}

                return (
                  <tr key={process.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm mr-3">
                          <Network className="w-4 h-4" />
                        </div>
                        <div className="text-sm font-medium text-gray-900">{process.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500">{process.description || '-'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {communitiesList.length > 0 ? communitiesList.map((c, i) => (
                          <span key={i} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            {c}
                          </span>
                        )) : <span className="text-sm text-gray-500">-</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {nodesCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {process.status === 'active' ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">启用</span>
                      ) : process.status === 'inactive' ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">停用</span>
                      ) : process.status === 'draft' ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">草稿</span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{process.status || '未知'}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      V1.0
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {process.createdAt ? dayjs(process.createdAt).format('YYYY-MM-DD HH:mm:ss') : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {process.updatedAt ? dayjs(process.updatedAt).format('YYYY-MM-DD HH:mm:ss') : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-3">
                        <button
                          onClick={() => alert("暂无历史版本记录")}
                          className="text-blue-600 hover:text-blue-900"
                          title="查看版本"
                        >
                          <History className="w-4 h-4" />
                        </button>
                        <button
                          onClick={async () => {
                            try {
                              await createProcess({ ...process, name: process.name + ' - 副本', id: undefined } as any);
                              loadProcesses();
                            } catch (error) {
                              console.error("Failed to copy process", error);
                              alert("复制失败");
                            }
                          }}
                          className="text-green-600 hover:text-green-900"
                          title="复制流程"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => navigate(`/processes/${process.id}/edit?tab=basic`)}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="编辑"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(process.id)} className="text-red-600 hover:text-red-900" title="删除">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!loading && filteredProcesses.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <Network className="w-12 h-12 text-gray-300 mb-4" />
                      <p className="text-lg font-medium text-gray-900">未找到流程</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
