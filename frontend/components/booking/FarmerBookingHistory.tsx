"use client";

import { useState } from "react";
import { useMyBookings, FarmerBookingRecord } from "../../hooks/useBookings";
import { Ticket, Calendar, Clock, Truck, Sprout, CheckCircle2, AlertCircle, RefreshCw, FileText, ArrowRight } from "lucide-react";
import ProcurementReceiptModal from "./ProcurementReceiptModal";

export default function FarmerBookingHistory() {
  const { data: bookings, isLoading, refetch } = useMyBookings();
  const [selectedReceipt, setSelectedReceipt] = useState<FarmerBookingRecord | null>(null);

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return (
          <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-900 border border-blue-300 text-xs font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-700" /> Procurement Completed
          </span>
        );
      case "checked_in":
        return (
          <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-amber-700" /> Mandi Gate Checked-In
          </span>
        );
      case "in_progress":
        return (
          <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-bold flex items-center gap-1 animate-pulse">
            <Sprout className="w-3.5 h-3.5 text-emerald-700" /> Serving Now (बारी चालू है)
          </span>
        );
      case "rejected":
        return (
          <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-900 border border-rose-300 text-xs font-bold flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 text-rose-700" /> Lot Rejected (High Moisture)
          </span>
        );
      case "cancelled":
        return (
          <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-900 border border-rose-300 text-xs font-bold flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 text-rose-700" /> Cancelled
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-amber-700" /> In Queue (प्रतीक्षा में)
          </span>
        );
    }
  };

  return (
    <>
      <div className="bg-white border-2 border-slate-200 p-6 rounded-3xl shadow-lg space-y-4 max-w-xl mx-auto my-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <div className="bg-kisan-700 p-2 rounded-xl text-white shadow">
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-800">My Slot Tokens & History</h3>
              <p className="text-xs text-slate-500 font-medium">Your active and previous Mandi arrival tokens</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => refetch()}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all"
            title="Refresh token history"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {isLoading ? (
          <p className="text-xs text-slate-500 text-center py-4 font-semibold">Loading your token history...</p>
        ) : !bookings || bookings.length === 0 ? (
          <div className="text-center py-6 text-slate-500 text-xs space-y-1">
            <p className="font-bold text-slate-800">No Token Reservations Found</p>
            <p>Book your first procurement slot above to receive a MSP Mandi entry token.</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {bookings.map((b) => (
              <div
                key={b.id}
                className="bg-slate-50 border-2 border-slate-200 hover:border-kisan-600 p-4 rounded-2xl transition-all space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm font-black text-kisan-900 bg-kisan-100 px-2.5 py-1 rounded-lg">
                    {b.token_number}
                  </span>
                  {getStatusBadge(b.status)}
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <Calendar className="w-3.5 h-3.5 text-kisan-700" />
                    <span className="font-bold">{b.booking_date}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <Clock className="w-3.5 h-3.5 text-kisan-700" />
                    <span className="font-bold">{b.slot_start_time} - {b.slot_end_time}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <Sprout className="w-3.5 h-3.5 text-kisan-700" />
                    <span className="font-semibold">{b.crop_name} ({b.crop_volume_quintals} Qtl)</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-700 capitalize">
                    <Truck className="w-3.5 h-3.5 text-kisan-700" />
                    <span className="font-semibold">{b.vehicle_type.replace("_", " ")}</span>
                  </div>
                </div>

                {b.actual_weight_quintals && (
                  <div className="bg-kisan-50 border border-kisan-200 p-3 rounded-xl text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-kisan-900">Weighbridge Measured Weight:</span>
                      <span className="font-black text-kisan-700">{b.actual_weight_quintals} Quintals</span>
                    </div>
                    {b.moisture_content_percent !== undefined && b.moisture_content_percent !== null && (
                      <div className="flex items-center justify-between text-slate-700">
                        <span className="font-medium">Measured Seed Moisture:</span>
                        <span className="font-bold">{b.moisture_content_percent}%</span>
                      </div>
                    )}
                    {b.adjusted_weight_quintals !== undefined && b.adjusted_weight_quintals !== null && (
                      <div className="flex items-center justify-between text-emerald-900 font-extrabold border-t border-kisan-200 pt-1">
                        <span>Net Payable Quantity:</span>
                        <span>{b.adjusted_weight_quintals} Quintals</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Official Procurement Receipt Option */}
                {(b.status === "completed" || b.actual_weight_quintals) && (
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => setSelectedReceipt(b)}
                      className="w-full py-2 px-4 rounded-xl bg-gradient-to-r from-kisan-800 to-kisan-700 hover:from-kisan-900 hover:to-kisan-800 text-white text-xs font-black transition-all shadow flex items-center justify-between group"
                    >
                      <span className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-kisan-200" />
                        <span>View MSP Procurement Receipt & Payout</span>
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] bg-white/20 px-2 py-0.5 rounded-lg">
                        Details <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Procurement Receipt Modal */}
      {selectedReceipt && (
        <ProcurementReceiptModal
          booking={selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
        />
      )}
    </>
  );
}
