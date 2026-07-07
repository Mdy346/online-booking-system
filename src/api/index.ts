import type { User, ServiceItem, ScheduleSlot, Appointment, Comment, MerchantStats } from "../types";
import { mockUsers, mockServices, mockSchedules, mockAppointments, mockComments, mockMerchantStats } from "../mock/data";

/** 模拟网络延迟 */
function delay(ms = 300): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

// ─── 用户相关 ─────────────────────────────────────

export async function login(username: string, password: string): Promise<{ token: string; user: User }> {
  await delay();
  const user = mockUsers.find((u) => u.username === username);
  if (!user) throw new Error("账号或密码错误");
  // 密码不校验 mock，仅做演示
  return { token: `mock-token-${user.userId}`, user };
}

export async function register(data: { username: string; password: string; phone: string; role: "USER" | "MERCHANT" }): Promise<User> {
  await delay();
  const newUser: User = {
    userId: mockUsers.length + 1,
    username: data.username,
    phone: data.phone,
    role: data.role,
    registerTime: new Date().toISOString(),
  };
  return newUser;
}

// ─── 服务相关 ─────────────────────────────────────

export async function getServiceList(params?: {
  keyword?: string;
  category?: string;
  sortBy?: "price" | "rating";
}): Promise<ServiceItem[]> {
  await delay();
  let list = [...mockServices];

  if (params?.keyword) {
    const kw = params.keyword.toLowerCase();
    list = list.filter(
      (s) =>
        s.serviceName.toLowerCase().includes(kw) ||
        s.description.toLowerCase().includes(kw) ||
        s.merchantName.toLowerCase().includes(kw)
    );
  }
  if (params?.category) {
    list = list.filter((s) => s.category === params.category);
  }
  if (params?.sortBy === "price") {
    list.sort((a, b) => a.price - b.price);
  } else if (params?.sortBy === "rating") {
    list.sort((a, b) => b.rating - a.rating);
  }

  return list;
}

export async function getServiceDetail(serviceId: number): Promise<ServiceItem | null> {
  await delay();
  return mockServices.find((s) => s.serviceId === serviceId) ?? null;
}

export async function getSchedules(serviceId: number): Promise<ScheduleSlot[]> {
  await delay();
  return mockSchedules.filter((s) => s.serviceId === serviceId && s.available);
}

// ─── 预约相关 ─────────────────────────────────────

export async function createAppointment(data: {
  userId: number;
  serviceId: number;
  scheduleId: number;
}): Promise<Appointment> {
  await delay();
  const service = mockServices.find((s) => s.serviceId === data.serviceId)!;
  const slot = mockSchedules.find((s) => s.scheduleId === data.scheduleId)!;

  const appointment: Appointment = {
    appointmentId: mockAppointments.length + 1,
    userId: data.userId,
    serviceId: data.serviceId,
    scheduleId: data.scheduleId,
    status: 1,
    createTime: new Date().toISOString(),
    serviceName: service.serviceName,
    merchantName: service.merchantName,
    startTime: slot.startTime,
    endTime: slot.endTime,
    price: service.price,
  };
  return appointment;
}

export async function getUserAppointments(userId: number): Promise<Appointment[]> {
  await delay();
  return mockAppointments.filter((a) => a.userId === userId);
}

export async function cancelAppointment(appointmentId: number): Promise<void> {
  await delay();
  // mock update
}

export async function getMerchantAppointments(merchantId: number): Promise<Appointment[]> {
  await delay();
  const serviceIds = mockServices.filter((s) => s.merchantId === merchantId).map((s) => s.serviceId);
  return mockAppointments.filter((a) => serviceIds.includes(a.serviceId));
}

export async function confirmAppointment(appointmentId: number): Promise<void> {
  await delay();
}

export async function rejectAppointment(appointmentId: number): Promise<void> {
  await delay();
}

// ─── 评价相关 ─────────────────────────────────────

export async function submitComment(data: {
  appointmentId: number;
  ratingStar: number;
  content: string;
}): Promise<Comment> {
  await delay();
  const comment: Comment = {
    commentId: mockComments.length + 1,
    appointmentId: data.appointmentId,
    ratingStar: data.ratingStar,
    content: data.content,
    commentTime: new Date().toISOString(),
    username: "当前用户",
  };
  return comment;
}

export async function getMerchantStats(merchantId: number): Promise<MerchantStats> {
  await delay();
  return mockMerchantStats[merchantId] ?? {
    totalAppointments: 0,
    completedAppointments: 0,
    cancelledAppointments: 0,
    averageRating: 0,
    dailyTrend: [],
  };
}
