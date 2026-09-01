"use client";

import { BookingToken } from "../../store/queueStore";
import { Clock, Truck, Scale, User, CheckCircle2, PlayCircle, AlertCircle } from "lucide-react";
import { apiClient } from "../../lib/api-client";

interface TokenCardProps {
  token: BookingToken;
  onStatusUpdate?: () => void;
}

export default function TokenCard({ token, onStatusUpdate }: TokenCardProps) {
  const updateStatus = async (newStatus: string) => {
    try {
      await apiClient(`/bookings/${token.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });
      if (onStatusUpdate) onStatusUpdate();
    } catch (err: any) {
      alert(err.message || "Failed to update token status.");
    }
  };

  const getStatusBadge = () => {
    switch (token.status) {
      case "checked_in":
        return <span className="px-2.5 py-1 rounded-md bg-blue-950 border border-blue-600/50 text-blue-300 text-xs font-bold">Checked In</span>;
      case "in_progress":
        return <span className="px-2.5 py-1 rounded-md bg-amber-950 border border-amber-600/50 text-amber-300 text-xs font-bold animate-pulse">In Progress</span>;
      case "completed":
        return <span className="px-2.5 py-1 rounded-md bg-emerald-950 border border-emerald-600/50 text-emerald-300 text-xs font-bold">Completed</span>;
      case "cancelled":
        return <span className="px-2.5 py-1 rounded-md bg-rose-950 border border-rose-600/50 text-rose-300 text-xs font-bold">Cancelled</span>;
      default:
        return <span className="px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold">Scheduled</span>;
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl flex flex-col justify-between space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block">Token</span>
          <span className="text-2xl font-extrabold text-white">{token.tokenNumber}</span>
        </div>
        {getStatusBadge()}
      </div>

      <div className="space-y-2 border-t border-b border-slate-800/80 py-3 text-xs text-slate-300">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1 text-slate-400"><User className="w-3.5 h-3.5" /> Farmer</span>
          <span className="font-semibold text-white">{token.farmerName} ({token.farmerPhone || "N/A"})</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1 text-slate-400"><Scale className="w-3.5 h-3.5" /> Crop / Volume</span>
          <span className="font-semibold text-white">{token.cropName} — {token.cropVolumeQuintals} Qtl</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1 text-slate-400"><Truck className="w-3.5 h-3.5" /> Vehicle</span>
          <span className="font-semibold text-slate-300 capitalize">{token.vehicleType.replace("_", " ")}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1 text-slate-400"><Clock className="w-3.5 h-3.5" /> Slot Window</span>
          <span className="font-bold text-emerald-400">{token.slotStartTime} - {token.slotEndTime}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 pt-1">
        {token.status === "scheduled" && (
          <button
            type="button"
            onClick={() => updateStatus("checked_in")}
            className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
          >
            <CheckCircle2 className="w-3.5 h-3.5" /> Check In
          </button>
        )}
        {token.status === "checked_in" && (
          <button
            type="button"
            onClick={() => updateStatus("in_progress")}
            className="flex-1 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
          >
            <PlayCircle className="w-3.5 h-3.5" /> Start Weighing
          </button>
        )}
        {token.status === "in_progress" && (
          <button
            type="button"
            onClick={() => updateStatus("completed")}
            className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-500/20"
          >
            <CheckCircle2 className="w-3.5 h-3.5" /> Complete Procurement
          </button>
        )}
      </div>
    </div>
  );
}
