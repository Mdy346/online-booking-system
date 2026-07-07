import { NavLink, Outlet, Navigate } from "react-router-dom";
import { BarChart3, ListTodo, Clock } from "lucide-react";
import { useAppStore } from "../../store";
import { cn } from "../../utils";

const tabs = [
  { to: "/merchant", label: "数据概览", icon: BarChart3, end: true },
  { to: "/merchant/services", label: "服务管理", icon: ListTodo, end: false },
  { to: "/merchant/schedule", label: "预约管理", icon: Clock, end: false },
];

export default function MerchantLayout() {
  const currentUser = useAppStore((s) => s.currentUser);
  if (!currentUser || currentUser.role !== "MERCHANT") return <Navigate to="/login" />;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex gap-8">
        {/* Sidebar */}
        <div className="hidden md:flex flex-col gap-1 w-48 shrink-0">
          {tabs.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.end}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:bg-gray-50"
                )
              }
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </NavLink>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
