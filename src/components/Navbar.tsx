import { Link, useNavigate } from "react-router-dom";
import { Calendar, LogOut, Menu, X, Store, User } from "lucide-react";
import { useState } from "react";
import { useAppStore } from "../store";
import { cn } from "../utils";

export default function Navbar() {
  const { currentUser, setCurrentUser } = useAppStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    setCurrentUser(null);
    navigate("/login");
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 text-blue-600 font-bold text-lg">
          <Calendar className="w-6 h-6" />
          <span>预约系统</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
          <Link to="/services" className="hover:text-blue-600 transition-colors">
            浏览服务
          </Link>
          {currentUser ? (
            <>
              <Link to="/my-appointments" className="hover:text-blue-600 transition-colors">
                我的预约
              </Link>
              {currentUser.role === "MERCHANT" && (
                <Link to="/merchant" className="hover:text-blue-600 transition-colors flex items-center gap-1">
                  <Store className="w-4 h-4" />
                  商家中心
                </Link>
              )}
              <div className="flex items-center gap-3 ml-4 pl-4 border-l border-gray-200">
                <span className="text-gray-400 flex items-center gap-1">
                  <User className="w-4 h-4" />
                  {currentUser.username}
                </span>
                <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 transition-colors">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <Link
              to="/login"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              登录
            </Link>
          )}
        </div>

        {/* Mobile hamburger */}
        <button className="md:hidden text-gray-600" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-3 text-sm font-medium">
          <Link to="/services" className="block py-1" onClick={() => setMenuOpen(false)}>
            浏览服务
          </Link>
          {currentUser ? (
            <>
              <Link to="/my-appointments" className="block py-1" onClick={() => setMenuOpen(false)}>
                我的预约
              </Link>
              {currentUser.role === "MERCHANT" && (
                <Link to="/merchant" className="block py-1" onClick={() => setMenuOpen(false)}>
                  商家中心
                </Link>
              )}
              <hr className="border-gray-100" />
              <span className="block text-gray-400">{currentUser.username}</span>
              <button onClick={() => { handleLogout(); setMenuOpen(false); }} className="text-red-500">
                退出登录
              </button>
            </>
          ) : (
            <Link to="/login" className="block text-blue-600" onClick={() => setMenuOpen(false)}>
              登录
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
