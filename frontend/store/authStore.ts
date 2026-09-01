import { create } from "zustand";

export interface User {
  id: string;
  fullName: string;
  phone: string;
  role: "super_admin" | "center_admin" | "staff" | "farmer";
  centerId: string | null;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: typeof window !== "undefined" ? localStorage.getItem("access_token") : null,
  isAuthenticated: false,
  setAuth: (user, token) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("access_token", token);
    }
    set({ user, accessToken: token, isAuthenticated: true });
  },
  logout: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token");
    }
    set({ user: null, accessToken: null, isAuthenticated: false });
  },
}));
