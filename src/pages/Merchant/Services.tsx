import { useEffect, useState } from "react";
import { Plus, Edit2 } from "lucide-react";
import type { ServiceItem } from "../../types";
import { getServiceList } from "../../api";
import { useAppStore } from "../../store";
import { formatPrice } from "../../utils";

export default function MerchantServices() {
  const currentUser = useAppStore((s) => s.currentUser);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser || currentUser.role !== "MERCHANT") return;
    (async () => {
      const all = await getServiceList();
      setServices(all.filter((s) => s.merchantId === currentUser.userId));
      setLoading(false);
    })();
  }, [currentUser]);

  if (loading) {
    return (
      <div className="space-y-3 animate-pulse">
        {[1, 2, 3].map((i) => <div key={i} className="h-20 bg-gray-200 rounded-lg" />)}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">服务管理</h1>
        <button className="flex items-center gap-1.5 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
          <Plus className="w-4 h-4" />
          发布服务
        </button>
      </div>

      {services.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg">还没有发布服务</p>
          <p className="text-sm mt-1">点击上方按钮发布你的第一个服务</p>
        </div>
      ) : (
        <div className="space-y-3">
          {services.map((svc) => (
            <div key={svc.serviceId} className="bg-white rounded-lg border border-gray-200 p-4 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">{svc.serviceName}</h3>
                <p className="text-sm text-gray-500 mt-0.5">
                  {svc.category} · {formatPrice(svc.price)} · 评分 {svc.rating}
                </p>
              </div>
              <button className="text-gray-400 hover:text-blue-600 transition-colors">
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
