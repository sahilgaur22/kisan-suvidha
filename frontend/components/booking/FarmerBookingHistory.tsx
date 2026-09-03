"use client";

import { useMyBookings } from "../../hooks/useBookings";
import { Ticket, Calendar, Clock, Truck, Sprout, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";

export default function FarmerBookingHistory() {
  const { data: bookings, isLoading, refetch } = useMyBookings();

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return (
          <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-black flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Procurement Completed
          </span>
        );
      case "checked_in":
        return (
          <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 border border-blue-300 text-xs font-black flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-blue-600" /> Mandi Gate Checked-In
          </span>
        );
      case "in_progress":
        return (
          <span className="px-2.5 py-1 rounded-full bg-purple-100 text-purple-800 border border-purple-300 text-xs font-black flex items-center gap-1">
            <Sprout className="w-3.5 h-3.5 text-purple-600" /> Weighing In Progress
          </span>
        );
      case "rejected":
        return (
          <span className="px-2.5 py-1 rounded-full bg-red-100 text-red-800 border border-red-300 text-xs font-black flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 text-red-600" /> Lot Rejected (High Moisture)
          </span>
        );
      case "cancelled":
        return (
          <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 border border-rose-300 text-xs font-black flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600" /> Cancelled
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-xs font-black flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-amber-600" /> Token Scheduled
          </span>
        );
    }
  };

  return (
    <div className="bg-white border-2 border-[#BAC8B1] p-6 rounded-3xl shadow-lg space-y-4 max-w-xl mx-auto my-6">
      <div className="flex items-center justify-between border-b border-[#BAC8B1] pb-3">
        <div className="flex items-center gap-2">
          <div className="bg-[#7B9669] p-2 rounded-xl text-white shadow">
            <Ticket className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-[#404E3B]">My Slot Tokens & History</h3>
            <p className="text-xs text-slate-500 font-medium">Your active and previous Mandi arrival tokens</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => refetch()}
          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#404E3B] transition-all"
          title="Refresh token history"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {isLoading ? (
        <p className="text-xs text-slate-500 text-center py-4 font-semibold">Loading your token history...</p>
      ) : !bookings || bookings.length === 0 ? (
        <div className="text-center py-6 text-slate-500 text-xs space-y-1">
          <p className="font-bold text-[#404E3B]">No Token Reservations Found</p>
          <p>Book your first procurement slot above to receive a MSP Mandi entry token.</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
          {bookings.map((b) => (
            <div
              key={b.id}
              className="bg-[#F8FAFC] border-2 border-[#BAC8B1]/60 hover:border-[#7B9669] p-4 rounded-2xl transition-all space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm font-black text-[#404E3B] bg-[#BAC8B1]/30 px-2.5 py-1 rounded-lg">
                  {b.token_number}
                </span>
                {getStatusBadge(b.status)}
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div className="flex items-center gap-1.5 text-slate-700">
                  <Calendar className="w-3.5 h-3.5 text-[#7B9669]" />
                  <span className="font-bold">{b.booking_date}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-700">
                  <Clock className="w-3.5 h-3.5 text-[#7B9669]" />
                  <span className="font-bold">{b.slot_start_time} - {b.slot_end_time}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-700">
                  <Sprout className="w-3.5 h-3.5 text-[#7B9669]" />
                  <span className="font-semibold">{b.crop_name} ({b.crop_volume_quintals} Qtl)</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-700 capitalize">
                  <Truck className="w-3.5 h-3.5 text-[#7B9669]" />
                  <span className="font-semibold">{b.vehicle_type.replace("_", " ")}</span>
                </div>
              </div>

              {(b as any).actual_weight_quintals && (
                <div className="bg-[#7B9669]/10 border border-[#7B9669]/30 p-2.5 rounded-xl text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#404E3B]">Weighbridge Measured Weight:</span>
                    <span className="font-black text-[#7B9669]">{(b as any).actual_weight_quintals} Quintals</span>
                  </div>
                  {(b as any).moisture_content_percent !== undefined && (b as any).moisture_content_percent !== null && (
                    <div className="flex items-center justify-between text-slate-700">
                      <span className="font-medium">Measured Seed Moisture:</span>
                      <span className="font-bold">{(b as any).moisture_content_percent}%</span>
                    </div>
                  )}
                  {(b as any).adjusted_weight_quintals !== undefined && (b as any).adjusted_weight_quintals !== null && (
                    <div className="flex items-center justify-between text-emerald-800 font-extrabold border-t border-[#7B9669]/30 pt-1">
                      <span>Net Payable Quantity:</span>
                      <span>{(b as any).adjusted_weight_quintals} Quintals</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
