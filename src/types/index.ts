// 用户角色
export type UserRole = "USER" | "MERCHANT" | "ADMIN";

// 用户信息
export interface User {
  userId: number;
  username: string;
  phone: string;
  role: UserRole;
  registerTime: string;
}

// 预约状态码（对应 SRS 定义）
export type AppointmentStatus = 1 | 2 | 3 | 4 | 5;
// 1=待确认, 2=已确认, 3=已拒绝, 4=已取消, 5=已完成

// 服务项目
export interface ServiceItem {
  serviceId: number;
  serviceName: string;
  description: string;
  price: number;
  category: string;
  merchantId: number;
  merchantName: string;
  merchantPhone: string;
  rating: number;
  reviewCount: number;
  imageUrl?: string;
}

// 排班时段
export interface ScheduleSlot {
  scheduleId: number;
  serviceId: number;
  startTime: string;
  endTime: string;
  capacity: number;
  bookedCount: number;
  available: boolean;
}

// 预约订单
export interface Appointment {
  appointmentId: number;
  userId: number;
  serviceId: number;
  scheduleId: number;
  status: AppointmentStatus;
  createTime: string;
  serviceName: string;
  merchantName: string;
  startTime: string;
  endTime: string;
  price: number;
}

// 评价
export interface Comment {
  commentId: number;
  appointmentId: number;
  ratingStar: number;
  content: string;
  commentTime: string;
  username: string;
}

// 商家统计
export interface MerchantStats {
  totalAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  averageRating: number;
  dailyTrend: { date: string; count: number }[];
}


export interface Notification {
  notifId: number;
  userId: number;
  title: string;
  message: string;
  relatedType: "APPOINTMENT" | "SYSTEM" | null;
  relatedId: number | null;
  isRead: boolean;
  createTime: string;
}
