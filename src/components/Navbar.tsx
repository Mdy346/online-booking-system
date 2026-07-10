import { Link, useNavigate } from "react-router-dom";
import { Calendar, LogOut, Menu, X, Store, User, Bell } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useAppStore } from "../store";
import { cn } from "../utils";
import { getNotifications, markAllAsRead } from "../api";

export default function Navbar() {
  const { currentUser, setCurrentUser } = useAppStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notifRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) { setNotifications([]); setUnreadCount(0); return; }
    (async () => {
      const all = await getNotifications(currentUser.userId);
      setNotifications(all.slice(0, 10));
      setUnreadCount(all.filter((n) => !n.isRead).length);
    })();
  }, [currentUser]);

  // Click outside to close notification panel
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    navigate("/login");
  };

  const handleMarkAllRead = async () => {
    if (!currentUser) return;
    await markAllAsRead(currentUser.userId);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-blue-600 font-bold text-lg">
          <Calendar className="w-6 h-6" />
          <span>预约系统</span>
        </Link>

        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
          <Link to="/services" className="hover:text-blue-600 transition-colors">浏览服务</Link>
          {currentUser ? (
            <>
              <Link to="/my-appointments" className="hover:text-blue-600 transition-colors">我的预约</Link>
              {currentUser.role === "MERCHANT" && (
                <Link to="/merchant" className="hover:text-blue-600 transition-colors flex items-center gap-1">
                  <Store className="w-4 h-4" /> 商家中心
                </Link>
              )}
              <div className="flex items-center gap-3 ml-4 pl-4 border-l border-gray-200">
                {/* Notification bell */}
                <div className="relative" ref={notifRef}>
                  <button onClick={() => setNotifOpen(!notifOpen)} className="relative text-gray-400 hover:text-blue-600 transition-colors p-1">
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </button>

                  {notifOpen && (
                    <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
                      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                        <span className="font-semibold text-sm text-gray-900">通知</span>
                        {unreadCount > 0 && (
                          <button onClick={handleMarkAllRead} className="text-xs text-blue-600 hover:underline">全部已读</button>
                        )}
                      </div>
                      {notifications.length === 0 ? (
                        <div className="text-center py-10 text-gray-400 text-sm">暂无通知</div>
                      ) : (
                        <div className="max-h-80 overflow-y-auto">
                          {notifications.map((n) => (
                            <div key={n.notifId} className={`px-4 py-3 border-b border-gray-50 text-sm ${n.isRead ? "" : "bg-blue-50"}`}>
                              <p className="font-medium text-gray-900">{n.title}</p>
                              <p className="text-gray-500 text-xs mt-0.5">{n.message}</p>
                              <p className="text-gray-400 text-[10px] mt-1">{n.createTime.slice(0, 16).replace("T", " ")}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <span className="text-gray-400 flex items-center gap-1">
                  <User className="w-4 h-4" /> {currentUser.username}
                </span>
                <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 transition-colors">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <Link to="/login" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">登录</Link>
          )}
        </div>

        <button className="md:hidden text-gray-600" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-3 text-sm font-medium">
          <Link to="/services" className="block py-1" onClick={() => setMenuOpen(false)}>浏览服务</Link>
          {currentUser ? (
            <>
              <Link to="/my-appointments" className="block py-1" onClick={() => setMenuOpen(false)}>我的预约</Link>
              {currentUser.role === "MERCHANT" && (
                <Link to="/merchant" className="block py-1" onClick={() => setMenuOpen(false)}>商家中心</Link>
              )}
              <hr className="border-gray-100" />
              <span className="block text-gray-400">{currentUser.username}</span>
              <button onClick={() => { handleLogout(); setMenuOpen(false); }} className="text-red-500">退出登录</button>
            </>
          ) : (
            <Link to="/login" className="block text-blue-600" onClick={() => setMenuOpen(false)}>登录</Link>
          )}
        </div>
      )}
    </nav>
  );
}