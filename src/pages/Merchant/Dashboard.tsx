import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart3, CalendarCheck, XCircle, Star, TrendingUp } from "lucide-react";
import type { MerchantStats } from "../../types";
import { getMerchantStats } from "../../api";
import { useAppStore } from "../../store";

export default function MerchantDashboard() {
  const currentUser = useAppStore((s) => s.currentUser);
  const navigate = useNavigate();
  const [stats, setStats] = useState<MerchantStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser || currentUser.role !== "MERCHANT") { navigate("/login"); return; }
    (async () => {
      const data = await getMerchantStats(currentUser.userId);
      setStats(data);
      setLoading(false);
    })();
  }, [currentUser, navigate]);

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-24 bg-gray-200 rounded-lg" />)}
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const cards = [
    { label: "总预约数", value: stats.totalAppointments, icon: CalendarCheck, color: "text-blue-600 bg-blue-50" },
    { label: "已完成", value: stats.completedAppointments, icon: TrendingUp, color: "text-green-600 bg-green-50" },
    { label: "已取消", value: stats.cancelledAppointments, icon: XCircle, color: "text-red-500 bg-red-50" },
    { label: "平均评分", value: stats.averageRating.toFixed(1), icon: Star, color: "text-yellow-500 bg-yellow-50" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">数据概览</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.label} className="bg-white rounded-lg border border-gray-200 p-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${c.color} mb-3`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{c.value}</p>
              <p className="text-sm text-gray-500 mt-0.5">{c.label}</p>
            </div>
          );
        })}
      </div>

      {/* 预约趋势 */}
      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          近 14 天预约趋势
        </h2>
        <div className="flex items-end gap-1 h-32">
          {stats.dailyTrend.map((d) => {
            const max = Math.max(...stats.dailyTrend.map((x) => x.count), 1);
            const h = (d.count / max) * 100;
            return (
              <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] text-gray-400">{d.count}</span>
                <div
                  className="w-full bg-blue-500 rounded-t"
                  style={{ height: `${Math.max(h, 4)}%` }}
                />
                <span className="text-[10px] text-gray-400 -rotate-45 origin-left whitespace-nowrap">
                  {d.date.slice(5)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
