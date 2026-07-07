import type { User, ServiceItem, ScheduleSlot, Appointment, Comment, MerchantStats } from "../types";

// ─── 用户 ───────────────────────────────────────────
export const mockUsers: User[] = [
  { userId: 1, username: "alice", phone: "13800138001", role: "USER", registerTime: "2026-06-01T10:00:00" },
  { userId: 2, username: "bob_merchant", phone: "13800138002", role: "MERCHANT", registerTime: "2026-06-01T10:00:00" },
  { userId: 3, username: "carol", phone: "13800138003", role: "USER", registerTime: "2026-06-05T14:00:00" },
  { userId: 4, username: "david_merchant", phone: "13800138004", role: "MERCHANT", registerTime: "2026-06-03T09:00:00" },
];

// ─── 服务类别 ──────────────────────────────────────
export const serviceCategories = ["医疗", "美容", "健身", "教育", "家政", "维修"];

// ─── 服务项目 ──────────────────────────────────────
const merchant1 = mockUsers.find((u) => u.userId === 2)!;
const merchant2 = mockUsers.find((u) => u.userId === 4)!;

export const mockServices: ServiceItem[] = [
  {
    serviceId: 1,
    serviceName: "中医理疗推拿",
    description: "专业中医推拿，缓解颈椎、腰椎疲劳，疏通经络。每次约 60 分钟。",
    price: 128,
    category: "医疗",
    merchantId: merchant1.userId,
    merchantName: merchant1.username,
    merchantPhone: merchant1.phone,
    rating: 4.8,
    reviewCount: 126,
  },
  {
    serviceId: 2,
    serviceName: "皮肤管理基础护理",
    description: "深层清洁+补水面膜+面部按摩，改善肤质，适合所有肤质。",
    price: 198,
    category: "美容",
    merchantId: merchant1.userId,
    merchantName: merchant1.username,
    merchantPhone: merchant1.phone,
    rating: 4.6,
    reviewCount: 89,
  },
  {
    serviceId: 3,
    serviceName: "私教一对一健身课",
    description: "资深教练一对一指导，包含体测评估与定制训练计划。",
    price: 299,
    category: "健身",
    merchantId: merchant2.userId,
    merchantName: merchant2.username,
    merchantPhone: merchant2.phone,
    rating: 4.9,
    reviewCount: 203,
  },
  {
    serviceId: 4,
    serviceName: "钢琴入门教学",
    description: "零基础成人钢琴课，每节课 45 分钟，包含乐理与演奏练习。",
    price: 158,
    category: "教育",
    merchantId: merchant2.userId,
    merchantName: merchant2.username,
    merchantPhone: merchant2.phone,
    rating: 4.7,
    reviewCount: 54,
  },
  {
    serviceId: 5,
    serviceName: "全屋深度保洁",
    description: "深度清洁服务，含厨房、卫生间、窗户，约 3 小时。",
    price: 268,
    category: "家政",
    merchantId: merchant1.userId,
    merchantName: merchant1.username,
    merchantPhone: merchant1.phone,
    rating: 4.5,
    reviewCount: 312,
  },
  {
    serviceId: 6,
    serviceName: "空调清洗维修",
    description: "挂机/柜机空调深度清洗、故障排查与维修。",
    price: 99,
    category: "维修",
    merchantId: merchant2.userId,
    merchantName: merchant2.username,
    merchantPhone: merchant2.phone,
    rating: 4.4,
    reviewCount: 78,
  },
];

// ─── 排班时段 ──────────────────────────────────────
function generateSlots(serviceId: number, baseDay: number = 3): ScheduleSlot[] {
  const slots: ScheduleSlot[] = [];
  let id = serviceId * 100;
  const today = new Date(2026, 6, 7);

  for (let d = 0; d < 7; d++) {
    for (let h = 9; h < 18; h += 2) {
      id++;
      const start = new Date(today);
      start.setDate(start.getDate() + d);
      start.setHours(h, 0, 0, 0);
      const end = new Date(start);
      end.setHours(h + 1, 0, 0, 0);

      const capacity = 5;
      const isFuture = d > 0 || h > today.getHours();
      const bookedCount = isFuture ? Math.floor(Math.random() * 4) : capacity;

      slots.push({
        scheduleId: id,
        serviceId,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        capacity,
        bookedCount,
        available: bookedCount < capacity,
      });
    }
  }
  return slots;
}

export const mockSchedules: ScheduleSlot[] = mockServices.flatMap((s) => generateSlots(s.serviceId));

// ─── 预约订单 ──────────────────────────────────────
export const mockAppointments: Appointment[] = [
  {
    appointmentId: 1,
    userId: 1,
    serviceId: 1,
    scheduleId: 101,
    status: 2,
    createTime: "2026-07-05T10:30:00",
    serviceName: "中医理疗推拿",
    merchantName: "bob_merchant",
    startTime: "2026-07-08T09:00:00",
    endTime: "2026-07-08T10:00:00",
    price: 128,
  },
  {
    appointmentId: 2,
    userId: 1,
    serviceId: 3,
    scheduleId: 301,
    status: 1,
    createTime: "2026-07-06T14:00:00",
    serviceName: "私教一对一健身课",
    merchantName: "david_merchant",
    startTime: "2026-07-09T11:00:00",
    endTime: "2026-07-09T12:00:00",
    price: 299,
  },
  {
    appointmentId: 3,
    userId: 3,
    serviceId: 2,
    scheduleId: 201,
    status: 5,
    createTime: "2026-07-03T09:00:00",
    serviceName: "皮肤管理基础护理",
    merchantName: "bob_merchant",
    startTime: "2026-07-04T14:00:00",
    endTime: "2026-07-04T15:00:00",
    price: 198,
  },
  {
    appointmentId: 4,
    userId: 1,
    serviceId: 5,
    scheduleId: 501,
    status: 5,
    createTime: "2026-07-01T08:00:00",
    serviceName: "全屋深度保洁",
    merchantName: "bob_merchant",
    startTime: "2026-07-02T10:00:00",
    endTime: "2026-07-02T13:00:00",
    price: 268,
  },
];

// ─── 评价 ──────────────────────────────────────────
export const mockComments: Comment[] = [
  {
    commentId: 1,
    appointmentId: 4,
    ratingStar: 5,
    content: "师傅很专业，打扫得很干净，下次还约！",
    commentTime: "2026-07-02T18:00:00",
    username: "alice",
  },
  {
    commentId: 2,
    appointmentId: 3,
    ratingStar: 4,
    content: "环境不错，技师手法很好，就是时间有点短。",
    commentTime: "2026-07-04T16:00:00",
    username: "carol",
  },
];

// ─── 商家统计数据 ──────────────────────────────────
export const mockMerchantStats: Record<number, MerchantStats> = {
  [merchant1.userId]: {
    totalAppointments: 85,
    completedAppointments: 72,
    cancelledAppointments: 5,
    averageRating: 4.6,
    dailyTrend: Array.from({ length: 14 }, (_, i) => {
      const d = new Date(2026, 5, 24 + i);
      return { date: d.toISOString().slice(0, 10), count: Math.floor(Math.random() * 8) + 1 };
    }),
  },
  [merchant2.userId]: {
    totalAppointments: 120,
    completedAppointments: 105,
    cancelledAppointments: 8,
    averageRating: 4.8,
    dailyTrend: Array.from({ length: 14 }, (_, i) => {
      const d = new Date(2026, 5, 24 + i);
      return { date: d.toISOString().slice(0, 10), count: Math.floor(Math.random() * 10) + 2 };
    }),
  },
};
