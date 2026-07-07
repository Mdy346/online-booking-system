import { useEffect, useState } from "react";
import { Clock, CheckCircle, XCircle } from "lucide-react";
import type { Appointment } from "../../types";
import { getMerchantAppointments, confirmAppointment, rejectAppointment } from "../../api";
import { useAppStore } from "../../store";
import { formatTime, formatPrice, statusLabel, statusColor } from "../../utils";

export default function MerchantSchedule() {
  const currentUser = useAppStore((s) => s.currentUser);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser || currentUser.role !== "MERCHANT") return;
    (async () => {
      const list = await getMerchantAppointments(currentUser.userId);
      setAppointments(list);
      setLoading(false);
    })();
  }, [currentUser]);

  const handleConfirm = async (id: number) => {
    await confirmAppointment(id);
    setAppointments((prev) => prev.map((a) => (a.appointmentId === id ? { ...a, status: 2 } : a)));
  };

  const handleReject = async (id: number) => {
    await rejectAppointment(id);
    setAppointments((prev) => prev.map((a) => (a.appointmentId === id ? { ...a, status: 3 } : a)));
  };

  if (loading) {
    return (
      <div className="space-y-3 animate-pulse">
        {[1, 2, 3].map((i) => <div key={i} className="h-20 bg-gray-200 rounded-lg" />)}
      </div>
    );
  }

  // 先展示待确认
  const pending = appointments.filter((a) => a.status === 1);
  const others = appointments.filter((a) => a.status !== 1);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <Clock className="w-6 h-6 text-blue-600" />
        预约管理
      </h1>

      {/* 待确认 */}
      {pending.length > 0 && (
        <div className="mb-8">
          <h2 className="font-semibold text-yellow-600 mb-3">待确认（{pending.length}）</h2>
          <div className="space-y-3">
            {pending.map((apt) => (
              <div key={apt.appointmentId} className="bg-white rounded-lg border border-yellow-200 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">{apt.serviceName}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {formatTime(apt.startTime)} - {formatTime(apt.endTime)}
                    </p>
                    <p className="text-sm text-gray-500">
                      用户ID: {apt.userId}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-blue-600">{formatPrice(apt.price)}</p>
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => handleConfirm(apt.appointmentId)}
                        className="flex items-center gap-1 text-xs bg-green-500 text-white px-3 py-1.5 rounded-lg hover:bg-green-600"
                      >
                        <CheckCircle className="w-3 h-3" />
                        确认
                      </button>
                      <button
                        onClick={() => handleReject(apt.appointmentId)}
                        className="flex items-center gap-1 text-xs bg-red-500 text-white px-3 py-1.5 rounded-lg hover:bg-red-600"
                      >
                        <XCircle className="w-3 h-3" />
                        拒绝
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 历史预约 */}
      <div>
        <h2 className="font-semibold text-gray-700 mb-3">历史记录</h2>
        {others.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-10">暂无历史记录</p>
        ) : (
          <div className="space-y-2">
            {others.map((apt) => (
              <div key={apt.appointmentId} className="bg-white rounded-lg border border-gray-200 p-3 flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{apt.serviceName}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{formatTime(apt.startTime)}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full border font-medium shrink-0 ${statusColor(apt.status)}`}>
                  {statusLabel(apt.status)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
