import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays, XCircle } from "lucide-react";
import type { Appointment } from "../../types";
import { getUserAppointments, cancelAppointment } from "../../api";
import { useAppStore } from "../../store";
import { formatTime, formatPrice, statusLabel, statusColor } from "../../utils";

export default function MyAppointmentsPage() {
  const currentUser = useAppStore((s) => s.currentUser);
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) { navigate("/login"); return; }
    (async () => {
      const list = await getUserAppointments(currentUser.userId);
      setAppointments(list);
      setLoading(false);
    })();
  }, [currentUser, navigate]);

  // 按状态排序：待确认 > 已确认 > 已完成 > 已取消/已拒绝
  const sorted = [...appointments].sort((a, b) => a.status - b.status);

  const handleCancel = async (id: number) => {
    await cancelAppointment(id);
    setAppointments((prev) => prev.map((a) => (a.appointmentId === id ? { ...a, status: 4 } : a)));
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-4 animate-pulse">
        {[1, 2].map((i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-5">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-3" />
            <div className="h-3 bg-gray-200 rounded w-1/3 mb-2" />
            <div className="h-3 bg-gray-200 rounded w-1/4" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <CalendarDays className="w-7 h-7 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-900">我的预约</h1>
      </div>

      {appointments.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <CalendarDays className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-lg">还没有预约记录</p>
          <button onClick={() => navigate("/services")} className="text-blue-600 text-sm mt-2 underline">
            去浏览服务 →
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((apt) => (
            <div key={apt.appointmentId} className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{apt.serviceName}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${statusColor(apt.status)}`}>
                      {statusLabel(apt.status)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{apt.merchantName}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {formatTime(apt.startTime)} - {formatTime(apt.endTime)}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-blue-600">{formatPrice(apt.price)}</p>
                  {apt.status === 1 && (
                    <button
                      onClick={() => handleCancel(apt.appointmentId)}
                      className="flex items-center gap-1 text-xs text-red-500 mt-2 hover:underline"
                    >
                      <XCircle className="w-3 h-3" />
                      取消预约
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
