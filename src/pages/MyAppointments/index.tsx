import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays, XCircle, Star, MessageSquare } from "lucide-react";
import type { Appointment, Comment } from "../../types";
import { getUserAppointments, cancelAppointment, submitComment } from "../../api";
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

  const [reviewModal, setReviewModal] = useState<{ appointmentId: number; star: number; content: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmitReview = async () => {
    if (!reviewModal || reviewModal.star === 0) return;
    setSubmitting(true);
    try {
      await submitComment({
        appointmentId: reviewModal.appointmentId,
        ratingStar: reviewModal.star,
        content: reviewModal.content,
      });
      setReviewModal(null);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSubmitting(false);
    }
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
    <>
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
                  {apt.status === 5 && (
                    <button
                      onClick={() => setReviewModal({ appointmentId: apt.appointmentId, star: 5, content: "" })}
                      className="flex items-center gap-1 text-xs text-yellow-500 mt-2 hover:underline"
                    >
                      <Star className="w-3 h-3" />
                      评价
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
      {/* 评分弹窗 */}
      {reviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm mx-4 p-6">
            <div className="text-center mb-4">
              <h2 className="text-lg font-bold text-gray-900">评价服务</h2>
              <p className="text-sm text-gray-500 mt-1">请为本次服务打分</p>
            </div>

            <div className="flex justify-center gap-2 mb-4">
              {[1, 2, 3, 4, 5].map((s) => (
                <button key={s} onClick={() => setReviewModal({ ...reviewModal, star: s })}
                  className="transition-colors">
                  <Star className={`w-8 h-8 ${s <= reviewModal.star ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
                </button>
              ))}
            </div>

            <textarea value={reviewModal.content}
              onChange={(e) => setReviewModal({ ...reviewModal, content: e.target.value })}
              placeholder="写下你的评价（选填）"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none" rows={3} />

            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => setReviewModal(null)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors">取消</button>
              <button onClick={handleSubmitReview}
                disabled={submitting || reviewModal.star === 0}
                className="px-4 py-2 text-sm font-medium bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50 transition-colors">
                {submitting ? "提交中..." : "提交评价"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
