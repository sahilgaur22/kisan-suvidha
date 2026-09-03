import { create } from "zustand";

export interface User {
  id: string;
  fullName: string;
  phone: string;
  role: "center_admin" | "staff" | "farmer";
  centerId: string | null;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  validateSession: () => Promise<void>;
}

const memoryStorage: Record<string, string> = {};

const safeGetItem = (key: string): string | null => {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      return localStorage.getItem(key);
    }
  } catch (e) {}
  return memoryStorage[key] || null;
};

const safeSetItem = (key: string, val: string) => {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      localStorage.setItem(key, val);
    }
  } catch (e) {}
  memoryStorage[key] = val;
};

const safeRemoveItem = (key: string) => {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      localStorage.removeItem(key);
    }
  } catch (e) {}
  delete memoryStorage[key];
};

const getInitialAuth = () => {
  try {
    const token = safeGetItem("access_token");
    const storedUser = safeGetItem("user_data");
    if (token && storedUser) {
      const user = JSON.parse(storedUser);
      if (user && user.id && user.role) {
        return { user, token, isAuthenticated: true };
      }
    }
  } catch (e) {
    console.error("Failed to parse stored auth user:", e);
  }
  // Clear any corrupted/partial auth storage
  safeRemoveItem("access_token");
  safeRemoveItem("user_data");
  return { user: null, token: null, isAuthenticated: false };
};

const initialAuth = getInitialAuth();

export const useAuthStore = create<AuthState>((set) => ({
  user: initialAuth.user,
  accessToken: initialAuth.token,
  isAuthenticated: initialAuth.isAuthenticated,
  setAuth: (user, token) => {
    safeSetItem("access_token", token);
    safeSetItem("user_data", JSON.stringify(user));
    set({ user, accessToken: token, isAuthenticated: true });
  },
  logout: () => {
    safeRemoveItem("access_token");
    safeRemoveItem("user_data");
    set({ user: null, accessToken: null, isAuthenticated: false });
  },
  validateSession: async () => {
    const token = safeGetItem("access_token");
    if (!token) {
      set({ user: null, accessToken: null, isAuthenticated: false });
      return;
    }
    try {
      const { apiClient } = await import("../lib/api-client");
      await apiClient("/auth/me");
    } catch (err) {
      safeRemoveItem("access_token");
      safeRemoveItem("user_data");
      set({ user: null, accessToken: null, isAuthenticated: false });
    }
  },
}));
