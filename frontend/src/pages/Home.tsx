import { useState } from "react";
import { Mail, Smartphone } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "@/lib/api";

export default function Home() {
  const navigate = useNavigate();
  const [loginMethod, setLoginMethod] = useState<"phone" | "email">("email");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState("");

  const isPhoneValid = phone.length > 0 && code.length > 0 && agreed;
  const isEmailValid = identifier.length > 0 && password.length > 0 && agreed;
  const isValid = loginMethod === "phone" ? isPhoneValid : isEmailValid;

  const handleLogin = async () => {
    if (!isValid) return;
    setError("");
    try {
      if (loginMethod === "email") {
        const data = await login(identifier, password);
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        navigate("/");
      } else {
        setError("手机号登录暂未实现");
      }
    } catch (err: any) {
      setError(err.message || "登录失败");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white font-sans text-[#1a1a1a]">
      <div className="w-full max-w-[360px] px-6 pb-20">
        <h1 className="text-[26px] font-medium text-center mb-10">
          {loginMethod === "phone" ? "手机号登录" : "账号/邮箱登录"}
        </h1>

        {error && (
          <div className="mb-4 text-sm text-red-500 text-center bg-red-50 p-2 rounded">
            {error}
          </div>
        )}

        {loginMethod === "phone" ? (
          <div className="space-y-[14px]">
            <div className="h-[48px] bg-[#f7f8fa] rounded-full flex items-center px-5 focus-within:ring-1 focus-within:ring-[#e5e5e5] transition-all">
              <input
                type="tel"
                placeholder="请输入手机号"
                className="bg-transparent w-full outline-none text-[15px] placeholder:text-[#b2b2b2]"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div className="h-[48px] bg-[#f7f8fa] rounded-full flex items-center px-5 focus-within:ring-1 focus-within:ring-[#e5e5e5] transition-all">
              <input
                type="text"
                placeholder="请输入验证码"
                className="bg-transparent flex-1 outline-none text-[15px] placeholder:text-[#b2b2b2]"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
              <div className="h-[14px] w-[1px] bg-[#e5e5e5] mx-4" />
              <button
                className="text-[#b2b2b2] text-[15px] whitespace-nowrap hover:text-gray-600 transition-colors"
                type="button"
              >
                获取验证码
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-[14px]">
            <div className="h-[48px] bg-[#f7f8fa] rounded-full flex items-center px-5 focus-within:ring-1 focus-within:ring-[#e5e5e5] transition-all">
              <input
                type="text"
                placeholder="请输入账号或邮箱"
                className="bg-transparent w-full outline-none text-[15px] placeholder:text-[#b2b2b2]"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
              />
            </div>
            <div className="h-[48px] bg-[#f7f8fa] rounded-full flex items-center px-5 focus-within:ring-1 focus-within:ring-[#e5e5e5] transition-all">
              <input
                type="password"
                placeholder="请输入密码"
                className="bg-transparent w-full outline-none text-[15px] placeholder:text-[#b2b2b2]"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
        )}

        <button
          onClick={handleLogin}
          className={`w-full h-[48px] rounded-full mt-6 text-[16px] transition-colors ${
            isValid
              ? "bg-[#1a1a1a] text-white hover:bg-black"
              : "bg-[#b2b2b2] text-white cursor-not-allowed"
          }`}
          disabled={!isValid}
        >
          登录
        </button>

        <div className="mt-4 flex items-start justify-center gap-1.5 px-4">
          <div 
            className={`w-3.5 h-3.5 rounded-[3px] border mt-[3px] shrink-0 flex items-center justify-center cursor-pointer transition-colors ${
              agreed ? 'bg-[#51b13e] border-[#51b13e]' : 'border-[#d4d4d4] bg-white'
            }`}
            onClick={() => setAgreed(!agreed)}
          >
            {agreed && (
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </div>
          <div className="text-[13px] text-[#1a1a1a] leading-relaxed select-none cursor-pointer" onClick={() => setAgreed(!agreed)}>
            我已阅读并同意{" "}
            <Link to="/docs/policy" target="_blank" rel="noopener noreferrer" className="text-[#51b13e] hover:underline" onClick={e => e.stopPropagation()}>用户服务协议</Link>
            {" "}和{" "}
            <Link to="/docs/privacy" target="_blank" rel="noopener noreferrer" className="text-[#51b13e] hover:underline" onClick={e => e.stopPropagation()}>隐私政策</Link>
          </div>
        </div>

        <div className="mt-[60px] relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#f0f0f0]" />
          </div>
          <div className="relative flex justify-center text-[12px]">
            <span className="bg-white px-3 text-[#b2b2b2]">其他登录方式</span>
          </div>
        </div>

        <div className="mt-6 flex justify-center">
          {loginMethod === "phone" ? (
            <button
              onClick={() => setLoginMethod("email")}
              className="flex flex-col items-center gap-1.5 group"
            >
              <div className="w-10 h-10 flex items-center justify-center text-[#1a1a1a] transition-colors">
                <Mail className="w-[26px] h-[26px] text-[#a8a8a8]" strokeWidth={1.2} />
              </div>
              <span className="text-[12px] text-[#888888]">邮箱</span>
            </button>
          ) : (
            <button
              onClick={() => setLoginMethod("phone")}
              className="flex flex-col items-center gap-1.5 group"
            >
              <div className="w-10 h-10 flex items-center justify-center text-[#1a1a1a] transition-colors">
                <Smartphone className="w-[26px] h-[26px] text-[#a8a8a8]" strokeWidth={1.2} />
              </div>
              <span className="text-[12px] text-[#888888]">手机</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
