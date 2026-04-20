import { useEffect, useState } from "react";
import { Loader2, MessageSquare, Star, ArrowRight, Edit3 } from "lucide-react";
import dayjs from "dayjs";
import { getFeedbacks, submitCallback, Feedback } from "@/api/feedback";
import { useNavigate } from "react-router-dom";

export default function FeedbackPage() {
  const navigate = useNavigate();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [callbackModal, setCallbackModal] = useState<{ open: boolean; id: string; notes: string }>({ open: false, id: "", notes: "" });

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await getFeedbacks();
      setFeedbacks(data);
    } catch (error) {
      console.error("Failed to load feedbacks:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCallbackSubmit = async () => {
    if (!callbackModal.notes.trim()) return;
    try {
      await submitCallback(callbackModal.id, callbackModal.notes);
      setCallbackModal({ open: false, id: "", notes: "" });
      loadData();
    } catch (error: any) {
      alert(error.message || "Failed to submit callback");
    }
  };

  // derived stats
  const total = feedbacks.length;
  const badReviews = feedbacks.filter(f => f.rating <= 3).length;
  const avgRating = total > 0 ? (feedbacks.reduce((acc, f) => acc + f.rating, 0) / total).toFixed(1) : "0.0";
  const badRate = total > 0 ? ((badReviews / total) * 100).toFixed(1) + "%" : "0.0%";

  return (
    <div className="h-full flex flex-col space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-indigo-600" />
          评价与回访中心
        </h1>
        <p className="text-sm text-gray-500 mt-1">工单满意度统计、差评池与抽样回访记录。</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="text-sm text-gray-500">累计评价数</div>
          <div className="mt-2 text-2xl font-bold text-gray-900">{total}</div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="text-sm text-gray-500">平均满意度</div>
          <div className="mt-2 text-2xl font-bold text-indigo-600 flex items-center gap-1">
            {avgRating} <Star className="w-5 h-5 text-yellow-400 fill-current" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="text-sm text-gray-500">差评数 (≤3星)</div>
          <div className="mt-2 text-2xl font-bold text-red-600">{badReviews}</div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="text-sm text-gray-500">差评率</div>
          <div className="mt-2 text-2xl font-bold text-gray-900">{badRate}</div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex-1 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50/50 flex justify-between items-center">
          <h2 className="text-sm font-bold text-gray-900">评价列表</h2>
        </div>
        
        <div className="flex-1 overflow-x-auto bg-gray-50/30">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">工单号/标题</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">评价内容</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">回访记录</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">评价时间</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mx-auto mb-4" />
                  </td>
                </tr>
              ) : feedbacks.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">暂无评价记录</td>
                </tr>
              ) : (
                feedbacks.map(f => (
                  <tr key={f.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-indigo-600 cursor-pointer" onClick={() => navigate(`/tickets/${f.ticketId}`)}>
                        {f.ticket?.ticketNo}
                      </div>
                      <div className="text-xs text-gray-500 mt-1 truncate max-w-[200px]">{f.ticket?.title}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 mb-1">
                        {[1, 2, 3, 4, 5].map(star => (
                          <Star key={star} className={`w-4 h-4 ${star <= f.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                        ))}
                      </div>
                      {f.content && <div className="text-sm text-gray-900 mt-1">{f.content}</div>}
                      {f.tags.length > 0 && (
                        <div className="flex gap-1 mt-2 flex-wrap">
                          {f.tags.map(tag => (
                            <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">{tag}</span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {f.callback ? (
                        <div className="whitespace-pre-wrap">{f.callback}</div>
                      ) : (
                        <span className="text-gray-400 italic">待回访</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {dayjs(f.createdAt).format("YYYY-MM-DD HH:mm")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                      <button
                        onClick={() => setCallbackModal({ open: true, id: f.id, notes: f.callback || "" })}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="录入回访记录"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => navigate(`/tickets/${f.ticketId}`)}
                        className="text-gray-400 hover:text-gray-600"
                        title="查看工单"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {callbackModal.open && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">录入回访记录</h3>
            <textarea
              value={callbackModal.notes}
              onChange={(e) => setCallbackModal(prev => ({ ...prev, notes: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              rows={4}
              placeholder="记录电话回访或人工干预情况..."
            />
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setCallbackModal({ open: false, id: "", notes: "" })}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                取消
              </button>
              <button
                onClick={() => {
                  submitCallback(callbackModal.id, callbackModal.notes)
                    .then(() => {
                      setCallbackModal({ open: false, id: "", notes: "" });
                      loadData();
                    })
                    .catch(e => alert(e.message || "提交失败"));
                }}
                disabled={!callbackModal.notes.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:opacity-50"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
