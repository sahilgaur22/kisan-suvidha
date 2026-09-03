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
    <div className="bg-[#404E3B] p-1.5 rounded-2xl border border-[#6C8480]/50 grid grid-cols-3 gap-1 mb-6 text-xs font-bold">
      <button
        type="button"
        onClick={() => onTabChange("farmer")}
        className={`py-2 px-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
          activeTab === "farmer"
            ? "bg-[#7B9669] text-white shadow-md font-extrabold"
            : "text-[#BAC8B1] hover:text-white"
        }`}
      >
        <UserPlus className="w-3.5 h-3.5" /> Farmer OTP
      </button>

      <button
        type="button"
        onClick={() => onTabChange("staff")}
        className={`py-2 px-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
          activeTab === "staff"
            ? "bg-[#7B9669] text-white shadow-md font-extrabold"
            : "text-[#BAC8B1] hover:text-white"
        }`}
      >
        <UserCheck className="w-3.5 h-3.5" /> Staff
      </button>

      <button
        type="button"
        onClick={() => onTabChange("admin")}
        className={`py-2 px-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
          activeTab === "admin"
            ? "bg-[#7B9669] text-white shadow-md font-extrabold"
            : "text-[#BAC8B1] hover:text-white"
        }`}
      >
        <ShieldCheck className="w-3.5 h-3.5" /> Admin
      </button>
    </div>
  );
}
