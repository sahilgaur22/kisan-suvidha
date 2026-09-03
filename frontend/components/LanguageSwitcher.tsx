"use client";

import { Globe } from "lucide-react";
import { Language } from "../lib/i18n";
import { useUIStore } from "../store/uiStore";

export default function LanguageSwitcher() {
  const { language, setLanguage } = useUIStore();

  const toggleLanguage = (newLang: Language) => {
    setLanguage(newLang);
  };

  return (
    <div className="inline-flex items-center gap-1 bg-[#404E3B] border border-[#6C8480] rounded-xl p-1 text-xs shadow-md">
      <Globe className="w-3.5 h-3.5 text-[#BAC8B1] ml-1.5" />
      <button
        type="button"
        onClick={() => toggleLanguage("en")}
        className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
          language === "en"
            ? "bg-[#7B9669] text-white font-black shadow"
            : "text-[#BAC8B1] hover:text-white"
        }`}
      >
        English
      </button>
      <button
        type="button"
        onClick={() => toggleLanguage("hi")}
        className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
          language === "hi"
            ? "bg-[#7B9669] text-white font-black shadow"
            : "text-[#BAC8B1] hover:text-white"
        }`}
      >
        हिन्दी
      </button>
      <button
        type="button"
        onClick={() => toggleLanguage("mr")}
        className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
          language === "mr"
            ? "bg-[#7B9669] text-white font-black shadow"
            : "text-[#BAC8B1] hover:text-white"
        }`}
      >
        मराठी
      </button>
    </div>
  );
}
