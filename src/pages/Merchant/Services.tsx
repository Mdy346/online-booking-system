import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, X, Calendar } from "lucide-react";
import type { ServiceItem, ScheduleSlot } from "../../types";
import { getServiceList, createService, updateService, deleteService, getSchedules, createSchedule, deleteSchedule } from "../../api";
import { useAppStore } from "../../store";
import { formatPrice } from "../../utils";

type ModalMode = "create" | "edit" | "schedule" | null;

interface FormData {
  serviceName: string;
  description: string;
  price: string;
  category: string;
}

const emptyForm: FormData = { serviceName: "", description: "", price: "", category: "" };

export default function MerchantServices() {
  const currentUser = useAppStore((s) => s.currentUser);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<ModalMode>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [saving, setSaving] = useState(false);

  // 排班管理状态
  const [scheduleServiceId, setScheduleServiceId] = useState<number | null>(null);
  const [schedules, setSchedules] = useState<ScheduleSlot[]>([]);
  const [newSlotDate, setNewSlotDate] = useState("");
  const [newSlotStart, setNewSlotStart] = useState("");
  const [newSlotEnd, setNewSlotEnd] = useState("");
  const [newSlotCapacity, setNewSlotCapacity] = useState("3");

  const load = async () => {
    if (!currentUser) return;
    setLoading(true);
    const all = await getServiceList();
    setServices(all.filter((s) => s.merchantId === currentUser.userId));
    setLoading(false);
  };

  useEffect(() => { load(); }, [currentUser]);

  // 加载排班
  const loadSchedules = async (serviceId: number) => {
    const slots = await getSchedules(serviceId);
    setSchedules(slots);
  };

  const openCreate = () => {
    setForm(emptyForm);
    setEditId(null);
    setModal("create");
  };

  const openEdit = (svc: ServiceItem) => {
    setForm({
      serviceName: svc.serviceName,
      description: svc.description,
      price: String(svc.price),
      category: svc.category,
    });
    setEditId(svc.serviceId);
    setModal("edit");
  };

  const openSchedule = async (serviceId: number) => {
    setScheduleServiceId(serviceId);
    setNewSlotDate("");
    setNewSlotStart("");
    setNewSlotEnd("");
    setNewSlotCapacity("3");
    await loadSchedules(serviceId);
    setModal("schedule");
  };

  const handleSave = async () => {
    if (!form.serviceName || !form.price) return;
    setSaving(true);
    try {
      if (modal === "create") {
        await createService({
          serviceName: form.serviceName,
          description: form.description,
          price: Number(form.price),
          category: form.category,
        });
      } else if (editId) {
        await updateService(editId, {
          serviceName: form.serviceName,
          description: form.description,
          price: Number(form.price),
          category: form.category,
        });
      }
      setModal(null);
      await load();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("确定要删除这个服务吗？")) return;
    try {
      await deleteService(id);
      await load();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleAddSlot = async () => {
    if (!newSlotDate || !newSlotStart || !newSlotEnd || !scheduleServiceId) return;
    // 检查开始时间是否已过
    const slotStart = new Date(`${newSlotDate}T${newSlotStart}:00`);
    if (slotStart.getTime() <= Date.now()) {
      alert("所选时段已过期，请选择未来的时间");
      return;
    }
    try {
      await createSchedule({
        serviceId: scheduleServiceId,
        startTime: `${newSlotDate}T${newSlotStart}:00`,
        endTime: `${newSlotDate}T${newSlotEnd}:00`,
        capacity: Number(newSlotCapacity),
      });
      setNewSlotStart("");
      setNewSlotEnd("");
      await loadSchedules(scheduleServiceId);
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleDeleteSlot = async (scheduleId: number) => {
    if (!confirm("确定要删除这个时段吗？")) return;
    try {
      await deleteSchedule(scheduleId);
      if (scheduleServiceId) await loadSchedules(scheduleServiceId);
    } catch (e: any) {
      alert(e.message);
    }
  };

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
        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
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
                  {svc.category} &middot; {formatPrice(svc.price)} &middot; 评分 {svc.rating}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openSchedule(svc.serviceId)}
                  className="text-gray-400 hover:text-green-600 transition-colors p-1"
                  title="管理排班时段"
                >
                  <Calendar className="w-4 h-4" />
                </button>
                <button
                  onClick={() => openEdit(svc)}
                  className="text-gray-400 hover:text-blue-600 transition-colors p-1"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(svc.serviceId)}
                  className="text-gray-400 hover:text-red-500 transition-colors p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 发布/编辑弹窗 */}
      {(modal === "create" || modal === "edit") && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900">
                {modal === "create" ? "发布新服务" : "编辑服务"}
              </h2>
              <button onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">服务名称 *</label>
                <input type="text" value={form.serviceName} onChange={(e) => setForm({ ...form, serviceName: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="输入服务名称" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" rows={3} placeholder="输入服务描述" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">价格 *</label>
                  <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="0.00" min="0" step="0.01" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">分类</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                    <option value="">选择分类</option>
                    <option value="医疗">医疗</option>
                    <option value="美容">美容</option>
                    <option value="教育">教育</option>
                    <option value="健身">健身</option>
                    <option value="维修">维修</option>
                    <option value="其他">其他</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button onClick={() => setModal(null)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors">取消</button>
                <button onClick={handleSave} disabled={saving || !form.serviceName || !form.price}
                  className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">
                  {saving ? "保存中..." : modal === "create" ? "发布" : "保存"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 排班管理弹窗 */}
      {modal === "schedule" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-green-600" />
                排班时段管理
              </h2>
              <button onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 现有排班列表 */}
            <div className="mb-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                当前时段（{schedules.length}）
              </h3>
              {schedules.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">暂无排班时段，请在下方添加</p>
              ) : (
                <div className="space-y-2">
                  {schedules.map((slot) => (
                    <div key={slot.scheduleId} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                      <div className="text-sm">
                        <span className="text-gray-900 font-medium">{slot.startTime.slice(0, 16).replace("T", " ")}</span>
                        <span className="text-gray-400 mx-1">~</span>
                        <span className="text-gray-900 font-medium">{slot.endTime.slice(11, 16)}</span>
                        <span className="text-gray-400 ml-2">
                          容量 {slot.bookedCount}/{slot.capacity}
                        </span>
                      </div>
                      <button onClick={() => handleDeleteSlot(slot.scheduleId)}
                        className="text-gray-400 hover:text-red-500 transition-colors p-1">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 添加新时段 */}
            <div className="border-t pt-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">添加时段</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">日期</label>
                  <input type="date" value={newSlotDate} onChange={(e) => setNewSlotDate(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">开始时间</label>
                    <input type="time" value={newSlotStart} onChange={(e) => setNewSlotStart(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">结束时间</label>
                    <input type="time" value={newSlotEnd} onChange={(e) => setNewSlotEnd(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">最大预约人数</label>
                  <input type="number" value={newSlotCapacity} onChange={(e) => setNewSlotCapacity(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" min="1" />
                </div>
                <button onClick={handleAddSlot} disabled={!newSlotDate || !newSlotStart || !newSlotEnd}
                  className="w-full py-2 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors">
                  添加时段
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
