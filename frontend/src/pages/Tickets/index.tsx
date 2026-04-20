import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import dayjs from "dayjs";
import { Loader2, Search, Ticket, ArrowRight } from "lucide-react";
import { getTickets, Ticket as TicketType } from "@/api/tickets";

const STATUS_OPTIONS = [
  { value: "", label: "全部状态" },
  { value: "open", label: "开放" },
  { value: "closed", label: "已关闭" },
];

export default function Tickets() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const statusFromUrl = searchParams.get("status") || "";
  const qFromUrl = searchParams.get("q") || "";

  const [status, setStatus] = useState(statusFromUrl);
  const [q, setQ] = useState(qFromUrl);
  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setStatus(statusFromUrl);
    setQ(qFromUrl);
  }, [statusFromUrl, qFromUrl]);

  const loadTickets = async (params: { status?: string; q?: string }) => {
    try {
      setLoading(true);
      const data = await getTickets(params);
      setTickets(data);
    } catch (error) {
      console.error("Failed to load tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets({ status: statusFromUrl || undefined, q: qFromUrl || undefined });
  }, [statusFromUrl, qFromUrl]);

  const filteredTickets = useMemo(() => {
    return tickets;
  }, [tickets]);

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Ticket className="w-6 h-6 text-indigo-600" />
            工单台账
          </h1>
          <p className="text-sm text-gray-500 mt-1">查看、搜索工单，并进入详情推进流程。</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex-1 flex flex-col">
        <div className="p-4 border-b border-gray-200 flex flex-col lg:flex-row gap-3 justify-between bg-gray-50/50">
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <div className="relative max-w-md w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="搜索标题/描述..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full sm:w-44 px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            <button
              onClick={() => {
                const next = new URLSearchParams(searchParams);
                if (q.trim()) next.set("q", q.trim());
                else next.delete("q");
                if (status) next.set("status", status);
                else next.delete("status");
                setSearchParams(next);
              }}
              className="inline-flex items-center justify-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors focus:ring-4 focus:ring-indigo-100"
            >
              查询
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-x-auto bg-gray-50/30">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  工单号
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  标题
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  服务
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  状态
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  更新时间
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-4" />
                      <p className="text-sm text-gray-500">加载中...</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTickets.map((t) => (
                  <tr
                    key={t.id}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/tickets/${t.id}`)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{t.ticketNo}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{t.title}</div>
                      {t.description && <div className="text-sm text-gray-500 line-clamp-1">{t.description}</div>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {t.service?.name || t.serviceId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {t.status === "open" ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          开放
                        </span>
                      ) : t.status === "closed" ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          已关闭
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {t.status}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {t.updatedAt ? dayjs(t.updatedAt).format("YYYY-MM-DD HH:mm:ss") : "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/tickets/${t.id}`);
                        }}
                        className="inline-flex items-center text-indigo-600 hover:text-indigo-900"
                        title="查看详情"
                      >
                        详情 <ArrowRight className="w-4 h-4 ml-1" />
                      </button>
                    </td>
                  </tr>
                ))
              )}

              {!loading && filteredTickets.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">暂无工单</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
