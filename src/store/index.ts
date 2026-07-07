import { create } from "zustand";
import type { User, ServiceItem } from "../types";

interface AppState {
  // 当前登录用户
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;

  // 搜索结果缓存（可选）
  lastSearchResults: ServiceItem[];
  setLastSearchResults: (results: ServiceItem[]) => void;

  // 当前所在页面导航
  currentPath: string;
  setCurrentPath: (path: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentUser: null,
  setCurrentUser: (user) => set({ currentUser: user }),

  lastSearchResults: [],
  setLastSearchResults: (results) => set({ lastSearchResults: results }),

  currentPath: "/",
  setCurrentPath: (path) => set({ currentPath: path }),
}));
