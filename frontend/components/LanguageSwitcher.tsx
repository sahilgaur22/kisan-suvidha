"use client";

import { useState } from "react";
import { Globe } from "lucide-react";
import { Language } from "../lib/i18n";

interface LanguageSwitcherProps {
  currentLang?: Language;
  onLanguageChange?: (lang: Language) => void;
}

export default function LanguageSwitcher({
  currentLang = "en",
  onLanguageChange,
}: LanguageSwitcherProps) {
  const [lang, setLang] = useState<Language>(currentLang);

  const toggleLanguage = (newLang: Language) => {
    setLang(newLang);
    if (onLanguageChange) {
      onLanguageChange(newLang);
    }
  };

  return (
    <div className="inline-flex items-center gap-1 bg-emerald-900/60 border border-emerald-700/50 rounded-xl p-1 text-xs">
      <Globe className="w-3.5 h-3.5 text-emerald-400 ml-1.5" />
      <button
        type="button"
        onClick={() => toggleLanguage("en")}
        className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
          lang === "en"
            ? "bg-emerald-500 text-slate-950 font-bold shadow"
            : "text-emerald-200 hover:text-white"
        }`}
      >
        English
      </button>
      <button
        type="button"
        onClick={() => toggleLanguage("hi")}
        className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
          lang === "hi"
            ? "bg-emerald-500 text-slate-950 font-bold shadow"
            : "text-emerald-200 hover:text-white"
        }`}
      >
        हिन्दी
      </button>
    </div>
  );
}
