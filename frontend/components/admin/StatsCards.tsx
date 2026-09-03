"use client";

import { DashboardStats } from "../../hooks/useDashboard";
import { Calendar, Scale, IndianRupee, AlertCircle } from "lucide-react";

interface StatsCardsProps {
  stats: DashboardStats | undefined;
  isLoading: boolean;
}

export default function StatsCards({ stats, isLoading }: StatsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-[#404E3B] border border-[#6C8480]/40 p-6 rounded-2xl animate-pulse h-28" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-6">
      {/* 1. Total Bookings Today */}
      <div className="bg-[#404E3B] border border-[#6C8480]/50 p-5 rounded-2xl shadow-xl flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-[#BAC8B1] uppercase tracking-wider block">Today's Bookings</span>
          <span className="text-3xl font-extrabold text-[#E6E6E6] mt-1 block">
            {stats?.total_bookings_today || 0}
          </span>
          <span className="text-[11px] text-[#BAC8B1] mt-1 block">
            {stats?.completed_today || 0} Completed | {stats?.checked_in_today || 0} Checked In
          </span>
        </div>
        <div className="p-3 bg-[#7B9669]/20 rounded-xl text-[#BAC8B1]">
          <Calendar className="w-6 h-6" />
        </div>
      </div>

      {/* 2. Total Weight Procured */}
      <div className="bg-[#404E3B] border border-[#6C8480]/50 p-5 rounded-2xl shadow-xl flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-[#BAC8B1] uppercase tracking-wider block">Crop Procured</span>
          <span className="text-3xl font-extrabold text-[#7B9669] mt-1 block">
            {stats?.total_crop_procured_quintals.toLocaleString("en-IN") || 0}
            <span className="text-sm font-semibold text-[#BAC8B1] ml-1">Qtl</span>
          </span>
          <span className="text-[11px] text-[#7B9669] mt-1 block">Guaranteed Weighing</span>
        </div>
        <div className="p-3 bg-[#7B9669]/20 rounded-xl text-[#7B9669]">
          <Scale className="w-6 h-6" />
        </div>
      </div>

      {/* 3. Total Payments Disbursed */}
      <div className="bg-[#404E3B] border border-[#6C8480]/50 p-5 rounded-2xl shadow-xl flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-[#BAC8B1] uppercase tracking-wider block">Disbursed Payouts</span>
          <span className="text-3xl font-extrabold text-[#E6E6E6] mt-1 block">
            ₹{stats?.total_payments_disbursed_inr.toLocaleString("en-IN") || 0}
          </span>
          <span className="text-[11px] text-[#BAC8B1] mt-1 block">Direct Bank Audit</span>
        </div>
        <div className="p-3 bg-[#7B9669]/20 rounded-xl text-[#7B9669]">
          <IndianRupee className="w-6 h-6" />
        </div>
      </div>

      {/* 4. Open Complaints */}
      <div className="bg-[#404E3B] border border-[#6C8480]/50 p-5 rounded-2xl shadow-xl flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-[#BAC8B1] uppercase tracking-wider block">Open Grievances</span>
          <span className="text-3xl font-extrabold mt-1 block text-[#7B9669]">
            {stats?.open_complaints_count || 0}
          </span>
          <span className="text-[11px] text-[#BAC8B1] mt-1 block">Center Inbox</span>
        </div>
        <div className="p-3 rounded-xl bg-[#7B9669]/20 text-[#BAC8B1]">
          <AlertCircle className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
