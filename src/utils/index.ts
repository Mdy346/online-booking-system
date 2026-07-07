import { clsx, type ClassValue } from "clsx";

/** 合并 Tailwind class 的工具函数 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/** 格式化价格（元） */
export function formatPrice(price: number): string {
  return `￥${price.toFixed(2)}`;
}

/** 格式化时间 */
export function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** 格式化完整时间 */
export function formatFullTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleString("zh-CN");
}

/** 预约状态中文名 */
export function statusLabel(status: number): string {
  const map: Record<number, string> = {
    1: "待确认",
    2: "已确认",
    3: "已拒绝",
    4: "已取消",
    5: "已完成",
  };
  return map[status] ?? "未知";
}

/** 预约状态颜色 */
export function statusColor(status: number): string {
  const map: Record<number, string> = {
    1: "text-yellow-600 bg-yellow-50 border-yellow-200",
    2: "text-blue-600 bg-blue-50 border-blue-200",
    3: "text-red-600 bg-red-50 border-red-200",
    4: "text-gray-500 bg-gray-50 border-gray-200",
    5: "text-green-600 bg-green-50 border-green-200",
  };
  return map[status] ?? "text-gray-500 bg-gray-50 border-gray-200";
}
