import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";
import { ArrowLeft, Loader2, Play } from "lucide-react";
import { advanceTicket, getTicket, Ticket } from "@/api/tickets";

export default function TicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [advancing, setAdvancing] = useState(false);

  const loadTicket = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await getTicket(id);
      setTicket(data);
    } catch (error) {
      console.error("Failed to load ticket:", error);
      setTicket(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTicket();
  }, [id]);

  const pendingTask = useMemo(() => {
    return (ticket?.tasks || []).find((t) => t.status === "pending") || null;
  }, [ticket]);

  const handleAdvance = async () => {
    if (!id) return;
    try {
      setAdvancing(true);
      const userId = (() => {
        try {
          return JSON.parse(localStorage.getItem("user") || "null")?.id;
        } catch {
          return undefined;
        }
      })();
      const updated = await advanceTicket(id, { userId });
      setTicket(updated);
    } catch (error: any) {
      console.error("Failed to advance ticket:", error);
      alert(error?.message || "推进失败");
    } finally {
      setAdvancing(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500">
        <div className="flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-4" />
          <p className="text-sm text-gray-500">加载中...</p>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="p-8 text-center text-gray-500">
        <p className="text-sm text-gray-500 mb-4">工单不存在或加载失败</p>
        <button
          onClick={() => navigate("/tickets")}
          className="inline-flex items-center justify-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
        >
          返回列表
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回
        </button>

        <button
          onClick={handleAdvance}
          disabled={advancing || ticket.status !== "open" || !pendingTask}
          className="inline-flex items-center justify-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title={
            ticket.status !== "open"
              ? "工单已关闭"
              : !pendingTask
                ? "无待处理步骤"
                : "推进到下一步"
          }
        >
          <Play className="w-4 h-4 mr-2" />
          {advancing ? "推进中..." : "推进下一步"}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100">
          <div className="flex flex-col gap-1">
            <div className="text-sm text-gray-500">{ticket.ticketNo}</div>
            <h1 className="text-xl font-semibold text-gray-900">{ticket.title}</h1>
            <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
              <span>服务：{ticket.service?.name || ticket.serviceId}</span>
              <span className="text-gray-300">|</span>
              <span>流程：{ticket.process?.name || ticket.processId}</span>
              <span className="text-gray-300">|</span>
              <span>状态：{ticket.status}</span>
              <span className="text-gray-300">|</span>
              <span>更新时间：{dayjs(ticket.updatedAt).format("YYYY-MM-DD HH:mm:ss")}</span>
            </div>
            {pendingTask && (
              <div className="mt-3 inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 border border-indigo-100 px-3 py-2 rounded-lg text-sm">
                <span className="font-medium">当前待处理：</span>
                <span>{pendingTask.name}</span>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h2 className="text-sm font-semibold text-gray-900 mb-2">基础信息</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                <div className="text-gray-500 mb-1">描述</div>
                <div className="text-gray-900 whitespace-pre-wrap">{ticket.description || "-"}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                <div className="text-gray-500 mb-1">创建时间</div>
                <div className="text-gray-900">{dayjs(ticket.createdAt).format("YYYY-MM-DD HH:mm:ss")}</div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-gray-900 mb-2">formData</h2>
            <pre className="text-xs bg-gray-900 text-gray-100 rounded-lg p-4 overflow-auto">
              {JSON.stringify(ticket.formData ?? {}, null, 2)}
            </pre>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-gray-900 mb-2">任务列表</h2>
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      名称
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      状态
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      开始时间
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      完成时间
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {(ticket.tasks || []).map((t) => (
                    <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm text-gray-900">{t.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{t.status}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {t.startedAt ? dayjs(t.startedAt).format("YYYY-MM-DD HH:mm:ss") : "-"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {t.finishedAt ? dayjs(t.finishedAt).format("YYYY-MM-DD HH:mm:ss") : "-"}
                      </td>
                    </tr>
                  ))}
                  {(ticket.tasks || []).length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-10 text-center text-sm text-gray-500">
                        暂无任务
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-gray-900 mb-2">日志</h2>
            <div className="space-y-2">
              {(ticket.logs || []).map((l) => (
                <div key={l.id} className="border border-gray-200 rounded-lg p-4 bg-white">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="text-sm font-medium text-gray-900">{l.action}</div>
                    <div className="text-xs text-gray-500">{dayjs(l.createdAt).format("YYYY-MM-DD HH:mm:ss")}</div>
                  </div>
                  <div className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">{l.message}</div>
                  {l.meta !== undefined && (
                    <pre className="text-xs bg-gray-50 border border-gray-200 rounded-lg p-3 overflow-auto mt-2">
                      {JSON.stringify(l.meta, null, 2)}
                    </pre>
                  )}
                </div>
              ))}
              {(ticket.logs || []).length === 0 && (
                <div className="text-sm text-gray-500">暂无日志</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
