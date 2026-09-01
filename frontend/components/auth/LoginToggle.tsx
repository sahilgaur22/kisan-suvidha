"use client";

export type LoginTab = "admin" | "staff" | "farmer";

interface LoginToggleProps {
  activeTab: LoginTab;
  onTabChange: (tab: LoginTab) => void;
}

export default function LoginToggle({ activeTab, onTabChange }: LoginToggleProps) {
  return (
    <div className="flex bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 text-xs font-semibold mb-6">
      <button
        type="button"
        onClick={() => onTabChange("admin")}
        className={`flex-1 py-2.5 rounded-lg transition-all ${
          activeTab === "admin"
            ? "bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20"
            : "text-slate-400 hover:text-slate-200"
        }`}
      >
        Center Admin
      </button>
      <button
        type="button"
        onClick={() => onTabChange("staff")}
        className={`flex-1 py-2.5 rounded-lg transition-all ${
          activeTab === "staff"
            ? "bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20"
            : "text-slate-400 hover:text-slate-200"
        }`}
      >
        Ground Staff
      </button>
      <button
        type="button"
        onClick={() => onTabChange("farmer")}
        className={`flex-1 py-2.5 rounded-lg transition-all ${
          activeTab === "farmer"
            ? "bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20"
            : "text-slate-400 hover:text-slate-200"
        }`}
      >
        Farmer OTP
      </button>
    </div>
  );
}
