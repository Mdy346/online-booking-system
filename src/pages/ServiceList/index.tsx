import { useEffect, useState, useCallback } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import type { ServiceItem } from "../../types";
import { getServiceList } from "../../api";
import { serviceCategories } from "../../mock/data";
import ServiceCard from "../../components/ServiceCard";

export default function ServiceListPage() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState("");
  const [sortBy, setSortBy] = useState<"price" | "rating">("rating");
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    const list = await getServiceList({
      keyword: keyword || undefined,
      category: category || undefined,
      sortBy,
    });
    setServices(list);
    setLoading(false);
  }, [keyword, category, sortBy]);

  useEffect(() => { fetch(); }, [fetch]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Hero / 搜索区 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">浏览服务</h1>
        <p className="text-gray-500 mt-1">发现并预约你需要的服务</p>
      </div>

      {/* 搜索与筛选 */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6 space-y-4">
        {/* 搜索框 */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="搜索服务名称、描述或商家..."
            className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* 分类标签 与 排序 */}
        <div className="flex flex-wrap items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-gray-400 shrink-0" />
          <button
            onClick={() => setCategory("")}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              !category ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            全部
          </button>
          {serviceCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat === category ? "" : cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                category === cat ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {cat}
            </button>
          ))}

          <div className="ml-auto flex items-center gap-1 text-xs">
            <span className="text-gray-400">排序：</span>
            <button
              onClick={() => setSortBy("rating")}
              className={`px-2 py-1 rounded ${sortBy === "rating" ? "text-blue-600 font-medium" : "text-gray-500"}`}
            >
              评分
            </button>
            <button
              onClick={() => setSortBy("price")}
              className={`px-2 py-1 rounded ${sortBy === "price" ? "text-blue-600 font-medium" : "text-gray-500"}`}
            >
              价格
            </button>
          </div>
        </div>
      </div>

      {/* 服务卡片列表 */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-5 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-4" />
              <div className="h-3 bg-gray-200 rounded w-full mb-4" />
              <div className="flex justify-between">
                <div className="h-4 bg-gray-200 rounded w-20" />
                <div className="h-4 bg-gray-200 rounded w-16" />
              </div>
            </div>
          ))}
        </div>
      ) : services.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg">没有找到匹配的服务</p>
          <p className="text-sm mt-1">试试调整搜索条件</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((svc) => (
            <ServiceCard key={svc.serviceId} service={svc} />
          ))}
        </div>
      )}
    </div>
  );
}
