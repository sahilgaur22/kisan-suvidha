import { create } from "zustand";
import { Language } from "../lib/i18n";

interface UIState {
  language: Language;
  sidebarOpen: boolean;
  setLanguage: (lang: Language) => void;
  toggleSidebar: () => void;
}

const getInitialLanguage = (): Language => {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("app_lang") as Language;
    if (saved === "en" || saved === "hi") {
      return saved;
    }
  }
  return "en"; // Default fallback if not saved
};

export const useUIStore = create<UIState>((set) => ({
  language: getInitialLanguage(),
  sidebarOpen: false,
  setLanguage: (language) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("app_lang", language);
    }
    set({ language });
  },
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}));
