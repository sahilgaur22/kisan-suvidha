import { create } from "zustand";
import { Language } from "../lib/i18n";

interface UIState {
  language: Language;
  sidebarOpen: boolean;
  setLanguage: (lang: Language) => void;
  toggleSidebar: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  language: "en",
  sidebarOpen: false,
  setLanguage: (language) => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("app_lang", language);
      } catch (e) {}
    }
    set({ language });
  },
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}));

// Sync stored language once mounted on client side
if (typeof window !== "undefined") {
  try {
    const saved = localStorage.getItem("app_lang") as Language;
    if (saved === "en" || saved === "hi" || saved === "mr") {
      useUIStore.setState({ language: saved });
    }
  } catch (e) {}
}
