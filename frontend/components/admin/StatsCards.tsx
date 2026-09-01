"use client";

import { DashboardStats } from "../../hooks/useDashboard";
import { Calendar, CheckCircle2, Scale, IndianRupee, AlertCircle, Clock } from "lucide-react";

interface StatsCardsProps {
  stats: DashboardStats | undefined;
  isLoading: boolean;
}

export default function StatsCards({ stats, isLoading }: StatsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl animate-pulse h-28" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-6">
      {/* 1. Total Bookings Today */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Today's Bookings</span>
          <span className="text-3xl font-extrabold text-white mt-1 block">
            {stats?.total_bookings_today || 0}
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {stats?.completed_today || 0} Completed | {stats?.checked_in_today || 0} Checked In
          </span>
        </div>
        <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
          <Calendar className="w-6 h-6" />
        </div>
      </div>

      {/* 2. Total Weight Procured */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Crop Procured</span>
          <span className="text-3xl font-extrabold text-emerald-400 mt-1 block">
            {stats?.total_crop_procured_quintals.toLocaleString("en-IN") || 0}
            <span className="text-sm font-semibold text-slate-400 ml-1">Qtl</span>
          </span>
          <span className="text-[11px] text-emerald-400/80 mt-1 block">Guaranteed Weighing</span>
        </div>
        <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400">
          <Scale className="w-6 h-6" />
        </div>
      </div>

      {/* 3. Total Payments Disbursed */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Disbursed Payouts</span>
          <span className="text-3xl font-extrabold text-white mt-1 block">
            ₹{stats?.total_payments_disbursed_inr.toLocaleString("en-IN") || 0}
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block">Direct Bank Audit</span>
        </div>
        <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400">
          <IndianRupee className="w-6 h-6" />
        </div>
      </div>

      {/* 4. Open Complaints */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Open Grievances</span>
          <span className={`text-3xl font-extrabold mt-1 block ${stats?.open_complaints_count ? "text-amber-400" : "text-emerald-400"}`}>
            {stats?.open_complaints_count || 0}
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block">Center Inbox</span>
        </div>
        <div className={`p-3 rounded-xl ${stats?.open_complaints_count ? "bg-amber-500/10 text-amber-400" : "bg-emerald-500/10 text-emerald-400"}`}>
          <AlertCircle className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
