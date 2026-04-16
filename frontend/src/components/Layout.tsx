import { Outlet, NavLink, Navigate, useNavigate } from "react-router-dom";
import { Cpu, BookOpen, Activity, LogOut } from "lucide-react";

export default function Layout() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

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
    { name: "题库中心", path: "/datasets", icon: <BookOpen className="w-5 h-5 mr-3" /> },
    { name: "测评中心", path: "/evaluations", icon: <Activity className="w-5 h-5 mr-3" /> },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-800 tracking-tight">
            LLM Eval Platform
          </h1>
        </div>
        
        <nav className="flex-1 py-4 px-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
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
      <main className="flex-1 overflow-auto flex flex-col">
        <div className="flex-1 p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
