import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2, Send } from "lucide-react";
import { getService, Service } from "@/api/services";
import { createTicket } from "@/api/tickets";
import FormRenderer from "@/components/FormBuilder/FormRenderer";

export default function OwnerCreate() {
  const navigate = useNavigate();
  const { serviceId } = useParams<{ serviceId: string }>();
  const [service, setService] = useState<Service | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (serviceId) {
      getService(serviceId).then(data => {
        setService(data);
        setLoading(false);
      }).catch(err => {
        console.error(err);
        setLoading(false);
      });
    }
  }, [serviceId]);

  const handleSubmit = async () => {
    if (!service) return;
    try {
      setSubmitting(true);
      const userStr = localStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : null;
      
      await createTicket({
        serviceId: service.id,
        title: `${service.name}工单`,
        description: "由业主小程序提交",
        formData,
        createdById: user?.id || "",
      });
      alert("提交成功");
      navigate("/mobile/owner/list");
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

  if (!service) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-gray-50 text-gray-500">
        <p>未找到服务信息</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-indigo-600 underline">返回</button>
      </div>
    );
  }

  const startNode = service.process?.config ? JSON.parse(service.process.config as any)?.nodes?.find((n: any) => n.type === 'start') : null;
  const formConfig = startNode?.data?.formConfig || { fields: [] };

  return (
    <div className="h-full flex flex-col bg-gray-50 relative">
      {/* Navbar */}
      <div className="h-14 bg-white border-b border-gray-100 flex items-center px-4 flex-shrink-0 z-10 sticky top-0">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2">
          <ArrowLeft className="w-5 h-5 text-gray-800" />
        </button>
        <h1 className="flex-1 text-center font-bold text-gray-900 mr-6 truncate">{service.name}</h1>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="bg-indigo-600 text-white p-6 pt-8 pb-10">
          <h2 className="text-xl font-bold mb-2">服务登记</h2>
          <p className="text-xs opacity-80 leading-relaxed">
            {service.description || "请填写真实有效的信息，我们将尽快为您安排处理人员。"}
          </p>
        </div>

        <div className="px-4 -mt-6 pb-24">
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
                该服务无需填写表单，可直接提交。
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Button */}
      <div className="absolute bottom-0 w-full bg-white border-t border-gray-100 p-4 pb-8 z-10">
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full bg-indigo-600 text-white rounded-xl py-3.5 font-bold text-[15px] shadow-sm active:bg-indigo-700 flex items-center justify-center disabled:opacity-50"
        >
          {submitting ? (
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
          ) : (
            <Send className="w-5 h-5 mr-2" />
          )}
          提交工单
        </button>
      </div>
    </div>
  );
}