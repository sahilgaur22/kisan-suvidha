"use client";

import Link from "next/link";
import { ArrowLeft, Sprout } from "lucide-react";
import SlotBookingForm from "../../components/booking/SlotBookingForm";
import LanguageSwitcher from "../../components/LanguageSwitcher";
import { useUIStore } from "../../store/uiStore";

export default function BookSlotPage() {
  const { language, setLanguage } = useUIStore();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-6">
      <header className="max-w-4xl mx-auto w-full flex items-center justify-between py-4 border-b border-slate-800/80 mb-8">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="bg-emerald-500 p-1.5 rounded-lg text-slate-950">
              <Sprout className="w-5 h-5" />
            </div>
            <h1 className="text-lg font-bold text-white">Kisan Suvidha</h1>
          </div>
        </div>

        <LanguageSwitcher currentLang={language} onLanguageChange={setLanguage} />
      </header>

      <main className="max-w-4xl mx-auto w-full">
        <SlotBookingForm />
      </main>

      <footer className="text-center text-xs text-slate-600 pt-8 pb-4">
        Ministry of Consumer Affairs | Smart India Hackathon 2026
      </footer>
    </div>
  );
}
