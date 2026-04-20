import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2, Send, Camera, MapPin } from "lucide-react";
import { getTicket, advanceTicket, Ticket } from "@/api/tickets";
import FormRenderer from "@/components/FormBuilder/FormRenderer";

export default function EmployeeTask() {
  const navigate = useNavigate();
  const { taskId } = useParams<{ taskId: string }>(); // ticketId acting as taskId for simplicity
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (taskId) {
      getTicket(taskId).then(data => {
        setTicket(data);
        setLoading(false);
      }).catch(err => {
        console.error(err);
        setLoading(false);
      });
    }
  }, [taskId]);

  const handleSubmit = async () => {
    if (!ticket) return;
    try {
      setSubmitting(true);
      const userStr = localStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : null;
      
      await advanceTicket(ticket.id, {
        userId: user?.id,
        output: formData
      });
      alert("提交并流转成功");
      navigate("/mobile/employee");
    } catch (error: any) {
      alert("提交失败: " + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-gray-50 text-gray-500">
        <p>未找到工单信息</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-indigo-600 underline">返回</button>
      </div>
    );
  }

  // 员工处理通常对应 taskNode 或 approvalNode，这里简化取第一个非 start 的配置
  const handleNode = ticket.process?.config ? JSON.parse(ticket.process.config as any)?.nodes?.find((n: any) => n.type !== 'start' && n.type !== 'endNode') : null;
  const formConfig = handleNode?.data?.formConfig || { fields: [] };

  return (
    <div className="h-full flex flex-col bg-gray-50 relative">
      {/* Navbar */}
      <div className="h-14 bg-white border-b border-gray-100 flex items-center px-4 flex-shrink-0 z-10 sticky top-0">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2">
          <ArrowLeft className="w-5 h-5 text-gray-800" />
        </button>
        <h1 className="flex-1 text-center font-bold text-gray-900 mr-6 truncate">任务处理</h1>
      </div>

      <div className="flex-1 overflow-y-auto pb-24">
        {/* Ticket Basic Info */}
        <div className="bg-white p-4 mb-3 border-b border-gray-100 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <h2 className="font-bold text-gray-900 text-base">{ticket.title}</h2>
            <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-medium">
              {handleNode?.data?.label || '处理中'}
            </span>
          </div>
          <div className="text-sm text-gray-600 mb-2">工单号：{ticket.ticketNo}</div>
          <div className="flex items-center text-xs text-gray-500 bg-gray-50 p-2 rounded-lg">
            <MapPin className="w-4 h-4 mr-2 text-indigo-500" />
            幸福社区 {ticket.process?.name}
          </div>
        </div>

        {/* Form area */}
        <div className="px-4">
          <div className="flex justify-between items-center mb-2 px-1">
            <h3 className="font-bold text-gray-900 text-sm">处理结果登记</h3>
            <div className="flex space-x-2">
              <button className="bg-white border border-gray-200 p-1.5 rounded-md text-gray-500 shadow-sm">
                <Camera className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 min-h-[300px]">
            {formConfig.fields && formConfig.fields.length > 0 ? (
              <FormRenderer
                config={formConfig}
                value={formData}
                onChange={setFormData}
                readonly={false}
              />
            ) : (
              <div className="py-10 text-center text-gray-400 text-sm">
                当前节点无需填写表单，可直接提交完成。
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Button */}
      <div className="absolute bottom-0 w-full bg-white border-t border-gray-100 p-4 pb-8 z-10 flex space-x-3">
        <button
          onClick={() => navigate(-1)}
          className="flex-1 bg-gray-100 text-gray-700 rounded-xl py-3.5 font-bold text-[15px] shadow-sm active:bg-gray-200"
        >
          暂存 / 返回
        </button>
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="flex-[2] bg-indigo-600 text-white rounded-xl py-3.5 font-bold text-[15px] shadow-sm active:bg-indigo-700 flex items-center justify-center disabled:opacity-50"
        >
          {submitting ? (
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
          ) : (
            <Send className="w-5 h-5 mr-2" />
          )}
          提交完成
        </button>
      </div>
    </div>
  );
}