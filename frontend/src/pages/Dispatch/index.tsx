import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { ArrowRight, Loader2, UserPlus, Search } from "lucide-react";
import { getTickets, Ticket, assignTicket, getUsers } from "@/api/tickets";

export default function Dispatch() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<{ id: string; account: string }[]>([]);
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [data, usersData] = await Promise.all([
          getTickets({ status: "open" }),
          getUsers()
        ]);
        setTickets(data);
        setUsers(usersData);
      } catch (error) {
        console.error("Failed to load open tickets:", error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleAssign = async (ticketId: string, assigneeId: string) => {
    try {
      await assignTicket(ticketId, assigneeId);
      setTickets(tickets.map(t => t.id === ticketId ? { ...t, assigneeId, assignee: users.find(u => u.id === assigneeId) } : t));
      setAssigningId(null);
    } catch (error) {
      console.error("Failed to assign ticket:", error);
      alert("分配失败");
    }
  };

  const filteredTickets = tickets.filter(t => 
    t.title.toLowerCase().includes(search.toLowerCase()) || 
    t.ticketNo.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">调度中心</h1>
          <p className="text-sm text-gray-500 mt-1">统筹新进工单，进行人工派单、改派。</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="搜索工单号/标题"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto">
          <table className="min-w-full divide-y divide-gray-200 relative">
            <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">工单号</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">标题 / 服务</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">创建时间</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">当前处理人</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mx-auto mb-4" />
                    <p className="text-sm">加载中...</p>
                  </td>
                </tr>
              ) : filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    {search ? "没有匹配的工单" : "暂无待调度的工单"}
                  </td>
                </tr>
              ) : (
                filteredTickets.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600 cursor-pointer" onClick={() => navigate(`/tickets/${t.id}`)}>
                      {t.ticketNo}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="font-medium">{t.title}</div>
                      <div className="text-xs text-gray-500 mt-1">{t.service?.name || t.serviceId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {dayjs(t.createdAt).format("YYYY-MM-DD HH:mm:ss")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {t.assignee ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {t.assignee.account}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          待分配
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {assigningId === t.id ? (
                        <div className="flex items-center justify-end space-x-2">
                          <select
                            className="border border-gray-300 rounded text-sm p-1 focus:ring-indigo-500 focus:border-indigo-500"
                            onChange={(e) => {
                              if (e.target.value) handleAssign(t.id, e.target.value);
                            }}
                            defaultValue=""
                          >
                            <option value="" disabled>选择人员</option>
                            {users.map(u => (
                              <option key={u.id} value={u.id}>{u.account}</option>
                            ))}
                          </select>
                          <button onClick={() => setAssigningId(null)} className="text-gray-500 hover:text-gray-700">
                            取消
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setAssigningId(t.id)}
                          className="inline-flex items-center text-indigo-600 hover:text-indigo-900"
                        >
                          <UserPlus className="w-4 h-4 mr-1" />
                          派单
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
