"use client";

import { DashboardStats } from "../../hooks/useDashboard";
import { Calendar, Scale, IndianRupee, AlertCircle } from "lucide-react";

interface StatsCardsProps {
  stats: DashboardStats | undefined;
  isLoading: boolean;
  periodLabel?: string;
}

export default function StatsCards({ stats, isLoading, periodLabel = "Today's" }: StatsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700/60 p-6 rounded-2xl animate-pulse h-28" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-6">
      {/* 1. Total Bookings */}
      <div className="bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700/60 p-5 rounded-2xl shadow-xl flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">{periodLabel} Bookings</span>
          <span className="text-3xl font-extrabold text-white mt-1 block">
            {stats?.total_bookings_today || 0}
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {stats?.completed_today || 0} Completed | {stats?.checked_in_today || 0} Checked In
          </span>
        </div>
        <div className="p-3 bg-slate-800 rounded-xl text-amber-400 border border-slate-700">
          <Calendar className="w-6 h-6" />
        </div>
      </div>

      {/* 2. Total Weight Procured */}
      <div className="bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700/60 p-5 rounded-2xl shadow-xl flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Crop Procured</span>
          <span className="text-3xl font-extrabold text-kisan-400 mt-1 block">
            {stats?.total_crop_procured_quintals.toLocaleString("en-IN") || 0}
            <span className="text-sm font-semibold text-slate-300 ml-1">Qtl</span>
          </span>
          <span className="text-[11px] text-kisan-400 mt-1 block">Guaranteed Weighing</span>
        </div>
        <div className="p-3 bg-slate-800 rounded-xl text-kisan-400 border border-slate-700">
          <Scale className="w-6 h-6" />
        </div>
      </div>

      {/* 3. Total Payments Disbursed */}
      <div className="bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700/60 p-5 rounded-2xl shadow-xl flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Disbursed Payouts</span>
          <span className="text-3xl font-extrabold text-white mt-1 block">
            ₹{stats?.total_payments_disbursed_inr.toLocaleString("en-IN") || 0}
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block">Direct Bank Audit</span>
        </div>
        <div className="p-3 bg-slate-800 rounded-xl text-amber-400 border border-slate-700">
          <IndianRupee className="w-6 h-6" />
        </div>
      </div>

      {/* 4. Open Complaints */}
      <div className="bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700/60 p-5 rounded-2xl shadow-xl flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Open Grievances</span>
          <span className="text-3xl font-extrabold mt-1 block text-amber-400">
            {stats?.open_complaints_count || 0}
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block">Center Inbox</span>
        </div>
        <div className="p-3 rounded-xl bg-slate-800 text-amber-400 border border-slate-700">
          <AlertCircle className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
