import { useState } from "react";
import { Outlet, NavLink, Navigate, useNavigate } from "react-router-dom";
import { Cpu, BookOpen, Activity, LogOut, Menu, X, Bot } from "lucide-react";

export default function Layout() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const navItems = [
    { name: "模型中心", path: "/models", icon: <Cpu className="w-5 h-5 mr-3" /> },
    { name: "智能体中心", path: "/agents", icon: <Bot className="w-5 h-5 mr-3" /> },
    { name: "题库中心", path: "/datasets", icon: <BookOpen className="w-5 h-5 mr-3" /> },
    { name: "测评中心", path: "/evaluations", icon: <Activity className="w-5 h-5 mr-3" /> },
  ];

  return (
    <div className="flex h-screen bg-gray-50 flex-col md:flex-row">
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between h-14 bg-white border-b border-gray-200 px-4">
        <h1 className="text-lg font-bold text-gray-800 tracking-tight">
          LLM Eval Platform
        </h1>
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 -mr-2 text-gray-600 hover:bg-gray-100 rounded-md"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col transform transition-transform duration-200 ease-in-out ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="h-14 md:h-16 flex items-center justify-between px-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-800 tracking-tight hidden md:block">
            LLM Eval Platform
          </h1>
          <h1 className="text-lg font-bold text-gray-800 tracking-tight md:hidden">
            菜单
          </h1>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden p-2 -mr-2 text-gray-600 hover:bg-gray-100 rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center px-3 py-2.5 rounded-md transition-colors duration-200 ${
                  isActive
                    ? "bg-blue-50 text-blue-700 font-medium"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`
              }
            >
              {item.icon}
              {item.name}
            </NavLink>
          ))}
        </nav>
        
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-2.5 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-md transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" />
            退出登录
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto flex flex-col relative z-0">
        <div className="flex-1 p-4 md:p-6 pb-safe">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
