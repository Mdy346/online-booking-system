import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Star, Clock, Phone, MapPin } from "lucide-react";
import type { ServiceItem, ScheduleSlot } from "../../types";
import { getServiceDetail, getSchedules, createAppointment } from "../../api";
import { formatPrice, formatTime } from "../../utils";
import { useAppStore } from "../../store";

export default function ServiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const currentUser = useAppStore((s) => s.currentUser);

  const [service, setService] = useState<ServiceItem | null>(null);
  const [slots, setSlots] = useState<ScheduleSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<ScheduleSlot | null>(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const svc = await getServiceDetail(Number(id));
      const slotList = await getSchedules(Number(id));
      setService(svc);
      setSlots(slotList);
      setLoading(false);
    })();
  }, [id]);

  // 按日期分组
  const grouped = slots.reduce<Record<string, ScheduleSlot[]>>((acc, s) => {
    const key = s.startTime.slice(0, 10);
    if (!acc[key]) acc[key] = [];
    acc[key].push(s);
    return acc;
  }, {});
  const sortedDates = Object.keys(grouped).sort();

  const handleBook = async () => {
    if (!currentUser || !selectedSlot || !service) {
      navigate("/login");
      return;
    }
    setBooking(true);
    try {
      await createAppointment({
        userId: currentUser.userId,
        serviceId: service.serviceId,
        scheduleId: selectedSlot.scheduleId,
      });
      setSuccess(true);
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 animate-pulse space-y-4">
        <div className="h-6 bg-gray-200 rounded w-1/3" />
        <div className="h-8 bg-gray-200 rounded w-2/3" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-gray-400">
        <p className="text-lg">服务不存在</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* 返回 */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 mb-6">
        <ArrowLeft className="w-4 h-4" />
        返回
      </button>

      {/* 预约成功提示 */}
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
          <p className="font-medium">预约已提交！</p>
          <p className="text-sm mt-0.5">请等待商家确认，可在"我的预约"中查看状态。</p>
          <button onClick={() => navigate("/my-appointments")} className="text-sm underline mt-2 inline-block">
            查看我的预约 →
          </button>
        </div>
      )}

      {/* 服务信息 */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{service.serviceName}</h1>
            <span className="inline-block mt-1 text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
              {service.category}
            </span>
          </div>
          <span className="text-2xl font-bold text-blue-600 shrink-0">{formatPrice(service.price)}</span>
        </div>

        <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-500 fill-current" />
            {service.rating} ({service.reviewCount}条评价)
          </span>
          <span className="flex items-center gap-1">
            <Phone className="w-4 h-4" />
            {service.merchantPhone}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {service.merchantName}
          </span>
        </div>

        <p className="mt-4 text-sm text-gray-600 leading-relaxed">{service.description}</p>
      </div>

      {/* 排班选择 */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">选择预约时间</h2>

        <div className="space-y-4">
          {sortedDates.map((date) => (
            <div key={date}>
              <p className="text-sm font-medium text-gray-700 mb-2">
                {new Date(date + "T00:00:00").toLocaleDateString("zh-CN", { weekday: "long", month: "long", day: "numeric" })}
              </p>
              <div className="flex flex-wrap gap-2">
                {grouped[date].map((slot) => {
                  const timeLabel = `${formatTime(slot.startTime).slice(-5)} - ${formatTime(slot.endTime).slice(-5)}`;
                  return (
                    <button
                      key={slot.scheduleId}
                      onClick={() => setSelectedSlot(slot)}
                      disabled={!slot.available || success}
                      className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                        selectedSlot?.scheduleId === slot.scheduleId
                          ? "bg-blue-600 text-white border-blue-600"
                          : slot.available
                          ? "bg-white text-gray-700 border-gray-300 hover:border-blue-400"
                          : "bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed"
                      }`}
                    >
                      {timeLabel}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            {selectedSlot
              ? `已选：${formatTime(selectedSlot.startTime)} - ${formatTime(selectedSlot.endTime)}`
              : "请在上方选择一个时间"}
          </p>
          <button
            onClick={handleBook}
            disabled={!selectedSlot || booking || success}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {booking ? "提交中..." : success ? "已预约" : "立即预约"}
          </button>
        </div>
      </div>
    </div>
  );
}
