import { Link } from "react-router-dom";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
      <div className="text-center">
        <p className="text-6xl font-bold text-gray-200">404</p>
        <p className="text-gray-500 mt-2">页面不存在</p>
        <Link
          to="/services"
          className="inline-flex items-center gap-1 mt-6 text-sm text-blue-600 hover:underline"
        >
          <Home className="w-4 h-4" />
          返回首页
        </Link>
      </div>
    </div>
  );
}
