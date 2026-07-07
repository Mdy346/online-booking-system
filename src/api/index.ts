import type { User, ServiceItem, ScheduleSlot, Appointment, Comment, MerchantStats } from "../types";

/**
 * API 层 --- 支持 Mock / 真实后端 双模式
 * 开发时 USE_MOCK = true   -> 用本地假数据（不依赖后端）
 * 联调时 USE_MOCK = false  -> 调用后端 Spring Boot API
 */
const USE_MOCK = true;

/** 后端服务地址（后端默认端口 8080） */
const API_BASE = "http://localhost:8080";

// --- HTTP 请求工具 ---

interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem("token");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options?.headers as Record<string, string>) || {}),
  };
  if (token) {
    headers["Authorization"] = "Bearer " + token;
  }
  const res = await fetch(API_BASE + path, { ...options, headers });
  const json: ApiResponse<T> = await res.json();
  if (json.code !== 200) {
    throw new Error(json.message || "请求失败");
  }
  return json.data;
}

function delay(ms = 300): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

// 延迟加载 Mock 数据
let _mockLoaded = false;
let _mockUsers: User[] = [];
let _mockServices: ServiceItem[] = [];
let _mockSchedules: ScheduleSlot[] = [];
let _mockAppointments: Appointment[] = [];
let _mockComments: Comment[] = [];
let _mockMerchantStats: Record<number, MerchantStats> = {};

async function ensureMock() {
  if (!_mockLoaded) {
    const m = await import("../mock/data");
    _mockUsers = m.mockUsers;
    _mockServices = m.mockServices;
    _mockSchedules = m.mockSchedules;
    _mockAppointments = m.mockAppointments;
    _mockComments = m.mockComments;
    _mockMerchantStats = m.mockMerchantStats;
    _mockLoaded = true;
  }
}

// --- 用户相关 ---

export async function login(username: string, password: string): Promise<{ token: string; user: User }> {
  if (USE_MOCK) {
    await delay();
    await ensureMock();
    const user = _mockUsers.find((u) => u.username === username);
    if (!user) throw new Error("账号或密码错误");
    return { token: "mock-token-" + user.userId, user };
  }
  const data = await request<{ token: string; user: { userId: number; username: string; phone: string; role: string; registerTime: string } }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
  return {
    token: data.token,
    user: {
      userId: data.user.userId,
      username: data.user.username,
      phone: data.user.phone,
      role: data.user.role as User["role"],
      registerTime: data.user.registerTime,
    },
  };
}

export async function register(data: { username: string; password: string; phone: string; role: "USER" | "MERCHANT" }): Promise<User> {
  if (USE_MOCK) {
    await delay();
    return {
      userId: Date.now(),
      username: data.username,
      phone: data.phone,
      role: data.role,
      registerTime: new Date().toISOString(),
    };
  }
  const resp = await request<{ token: string; user: { userId: number; username: string; phone: string; role: string; registerTime: string } }>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return {
    userId: resp.user.userId,
    username: resp.user.username,
    phone: resp.user.phone,
    role: resp.user.role as User["role"],
    registerTime: resp.user.registerTime,
  };
}

// --- 服务相关 ---

export async function getServiceList(params?: { keyword?: string; category?: string; sortBy?: "price" | "rating" }): Promise<ServiceItem[]> {
  if (USE_MOCK) {
    await delay();
    await ensureMock();
    let list = [..._mockServices];
    if (params?.keyword) {
      const kw = params.keyword.toLowerCase();
      list = list.filter((s) => s.serviceName.toLowerCase().includes(kw) || s.description.toLowerCase().includes(kw) || s.merchantName.toLowerCase().includes(kw));
    }
    if (params?.category) list = list.filter((s) => s.category === params.category);
    if (params?.sortBy === "price") list.sort((a, b) => a.price - b.price);
    else if (params?.sortBy === "rating") list.sort((a, b) => b.rating - a.rating);
    return list;
  }
  const qs = new URLSearchParams();
  if (params?.keyword) qs.set("keyword", params.keyword);
  if (params?.category) qs.set("category", params.category);
  if (params?.sortBy) qs.set("sortBy", params.sortBy);
  const q = qs.toString();
  return request<ServiceItem[]>("/api/services" + (q ? "?" + q : ""));
}

export async function getServiceDetail(serviceId: number): Promise<ServiceItem | null> {
  if (USE_MOCK) {
    await delay();
    await ensureMock();
    return _mockServices.find((s) => s.serviceId === serviceId) ?? null;
  }
  try {
    return await request<ServiceItem>("/api/services/" + serviceId);
  } catch {
    return null;
  }
}

export async function getSchedules(serviceId: number): Promise<ScheduleSlot[]> {
  if (USE_MOCK) {
    await delay();
    await ensureMock();
    return _mockSchedules.filter((s) => s.serviceId === serviceId && s.available);
  }
  const detail = (await request<any>("/api/services/" + serviceId)) as any;
  return (detail && detail.schedules) || [];
}

// --- 预约相关 ---

export async function createAppointment(data: { userId: number; serviceId: number; scheduleId: number }): Promise<Appointment> {
  if (USE_MOCK) {
    await delay();
    await ensureMock();
    const service = _mockServices.find((s) => s.serviceId === data.serviceId)!;
    const slot = _mockSchedules.find((s) => s.scheduleId === data.scheduleId)!;
    return {
      appointmentId: _mockAppointments.length + 1,
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
  }
  return request<Appointment>("/api/appointments?userId=" + data.userId, {
    method: "POST",
    body: JSON.stringify({ serviceId: data.serviceId, scheduleId: data.scheduleId }),
  });
}

export async function getUserAppointments(userId: number): Promise<Appointment[]> {
  if (USE_MOCK) {
    await delay();
    await ensureMock();
    return _mockAppointments.filter((a) => a.userId === userId);
  }
  return request<Appointment[]>("/api/appointments/user/" + userId);
}

export async function cancelAppointment(appointmentId: number): Promise<void> {
  if (USE_MOCK) {
    await delay();
    return;
  }
  const userId = Number(localStorage.getItem("userId") ?? 0);
  await request<void>("/api/appointments/" + appointmentId + "/cancel?userId=" + userId, { method: "PUT" });
}

export async function getMerchantAppointments(merchantId: number): Promise<Appointment[]> {
  if (USE_MOCK) {
    await delay();
    await ensureMock();
    const serviceIds = _mockServices.filter((s) => s.merchantId === merchantId).map((s) => s.serviceId);
    return _mockAppointments.filter((a) => serviceIds.includes(a.serviceId));
  }
  return request<Appointment[]>("/api/appointments/merchant/" + merchantId);
}

export async function confirmAppointment(appointmentId: number): Promise<void> {
  if (USE_MOCK) { await delay(); return; }
  await request<void>("/api/appointments/" + appointmentId + "/confirm", { method: "PUT" });
}

export async function rejectAppointment(appointmentId: number): Promise<void> {
  if (USE_MOCK) { await delay(); return; }
  await request<void>("/api/appointments/" + appointmentId + "/reject", { method: "PUT" });
}

// --- 评价相关 ---

export async function submitComment(data: { appointmentId: number; ratingStar: number; content: string }): Promise<Comment> {
  if (USE_MOCK) {
    await delay();
    await ensureMock();
    return {
      commentId: _mockComments.length + 1,
      appointmentId: data.appointmentId,
      ratingStar: data.ratingStar,
      content: data.content,
      commentTime: new Date().toISOString(),
      username: "当前用户",
    };
  }
  return request<Comment>("/api/comments", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getMerchantStats(merchantId: number): Promise<MerchantStats> {
  if (USE_MOCK) {
    await delay();
    await ensureMock();
    return _mockMerchantStats[merchantId] ?? { totalAppointments: 0, completedAppointments: 0, cancelledAppointments: 0, averageRating: 0, dailyTrend: [] };
  }
  return request<MerchantStats>("/api/stats/merchant/" + merchantId);
}
