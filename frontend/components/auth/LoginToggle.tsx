"use client";

import { UserCheck, ShieldCheck, UserPlus } from "lucide-react";

export type LoginTab = "admin" | "staff" | "farmer";

interface LoginToggleProps {
  activeTab: LoginTab;
  onTabChange: (tab: LoginTab) => void;
}

export default function LoginToggle({
  activeTab,
  onTabChange,
}: LoginToggleProps) {
  return (
    <div className="bg-kisan-950/80 p-1.5 rounded-2xl border border-kisan-700/60 grid grid-cols-3 gap-1 mb-6 text-xs font-bold">
      <button
        type="button"
        onClick={() => onTabChange("farmer")}
        className={`py-2 px-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
          activeTab === "farmer"
            ? "bg-kisan-700 text-white shadow-md font-extrabold"
            : "text-kisan-200 hover:text-white"
        }`}
      >
        <UserPlus className="w-3.5 h-3.5" /> Farmer OTP
      </button>

      <button
        type="button"
        onClick={() => onTabChange("staff")}
        className={`py-2 px-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
          activeTab === "staff"
            ? "bg-kisan-700 text-white shadow-md font-extrabold"
            : "text-kisan-200 hover:text-white"
        }`}
      >
        <UserCheck className="w-3.5 h-3.5" /> Staff
      </button>

      <button
        type="button"
        onClick={() => onTabChange("admin")}
        className={`py-2 px-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
          activeTab === "admin"
            ? "bg-kisan-700 text-white shadow-md font-extrabold"
            : "text-kisan-200 hover:text-white"
        }`}
      >
        <ShieldCheck className="w-3.5 h-3.5" /> Admin
      </button>
    </div>
  );
}
