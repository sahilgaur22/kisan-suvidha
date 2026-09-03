"use client";

import { useState } from "react";
import { BookingToken } from "../../store/queueStore";
import { Clock, Truck, Scale, User, CheckCircle2, PlayCircle } from "lucide-react";
import { apiClient } from "../../lib/api-client";

interface TokenCardProps {
  token: BookingToken;
  onStatusUpdate?: () => void;
}

export default function TokenCard({ token, onStatusUpdate }: TokenCardProps) {
  const [actualWeight, setActualWeight] = useState(
    token.actualWeightQuintals ? String(token.actualWeightQuintals) : String(token.cropVolumeQuintals)
  );
  const [moistureContent, setMoistureContent] = useState(
    token.moistureContentPercent ? String(token.moistureContentPercent) : "14.0"
  );

  const updateStatus = async (newStatus: string) => {
    try {
      const parsedWeight = parseFloat(actualWeight);
      const parsedMoisture = parseFloat(moistureContent);
      const payload: any = { status: newStatus };

      if (newStatus === "completed") {
        if (!isNaN(parsedWeight) && parsedWeight > 0) {
          payload.actual_weight_quintals = parsedWeight;
        }
        if (!isNaN(parsedMoisture) && parsedMoisture >= 0) {
          payload.moisture_content_percent = parsedMoisture;
        }
      }

      await apiClient(`/bookings/${token.id}/status`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
      if (onStatusUpdate) onStatusUpdate();
    } catch (err: any) {
      alert(err.message || "Failed to update token status.");
    }
  };

  const getStatusBadge = () => {
    switch (token.status) {
      case "checked_in":
        return <span className="px-2.5 py-1 rounded-md bg-[#6C8480]/40 border border-[#6C8480] text-[#E6E6E6] text-xs font-bold">Checked In</span>;
      case "in_progress":
        return <span className="px-2.5 py-1 rounded-md bg-[#7B9669]/30 border border-[#7B9669] text-[#BAC8B1] text-xs font-bold animate-pulse">In Progress</span>;
      case "completed":
        return <span className="px-2.5 py-1 rounded-md bg-[#7B9669] text-[#404E3B] text-xs font-bold">Completed</span>;
      case "rejected":
        return <span className="px-2.5 py-1 rounded-md bg-rose-700 border border-rose-500 text-white text-xs font-bold shadow animate-pulse">REJECTED (High Moisture)</span>;
      case "cancelled":
        return <span className="px-2.5 py-1 rounded-md bg-rose-950 border border-rose-600/50 text-rose-300 text-xs font-bold">Cancelled</span>;
      default:
        return <span className="px-2.5 py-1 rounded-md bg-[#404E3B] border border-[#6C8480]/40 text-[#BAC8B1] text-xs font-bold">Scheduled</span>;
    }
  };

  const sendNotification = async (channel: "sms" | "whatsapp") => {
    if (!token.farmerPhone) {
      alert("Farmer phone number is not available for notification.");
      return;
    }
    try {
      await apiClient("/staff/notify-farmer", {
        method: "POST",
        body: JSON.stringify({
          farmer_phone: token.farmerPhone,
          message: `Kisan Suvidha Gate Alert: Token #${token.tokenNumber} for ${token.cropName} is now called for entry/weighing. Please proceed to Mandi Gate.`,
          channel,
        }),
      });
      alert(`${channel.toUpperCase()} notification dispatched to farmer (${token.farmerPhone})!`);
    } catch (err: any) {
      alert(err.message || "Failed to dispatch notification.");
    }
  };

  return (
    <div className="bg-[#404E3B] border border-[#6C8480]/50 p-5 rounded-2xl shadow-xl flex flex-col justify-between space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs text-[#BAC8B1] font-medium uppercase tracking-wider block">Token</span>
          <span className="text-2xl font-extrabold text-[#E6E6E6]">{token.tokenNumber}</span>
        </div>
        {getStatusBadge()}
      </div>

      <div className="space-y-2 border-t border-b border-[#6C8480]/40 py-3 text-xs text-[#E6E6E6]">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1 text-[#BAC8B1]"><User className="w-3.5 h-3.5" /> Farmer</span>
          <span className="font-semibold text-[#E6E6E6]">{token.farmerName} ({token.farmerPhone || "N/A"})</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1 text-[#BAC8B1]"><Scale className="w-3.5 h-3.5" /> Crop / Volume</span>
          <span className="font-semibold text-[#E6E6E6]">{token.cropName} — {token.cropVolumeQuintals} Qtl</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1 text-[#BAC8B1]"><Truck className="w-3.5 h-3.5" /> Vehicle</span>
          <span className="font-semibold text-[#BAC8B1] capitalize">{token.vehicleType.replace("_", " ")}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1 text-[#BAC8B1]"><Clock className="w-3.5 h-3.5" /> Slot Window</span>
          <span className="font-bold text-[#7B9669]">{token.slotStartTime} - {token.slotEndTime}</span>
        </div>

        {token.actualWeightQuintals && (
          <div className="flex items-center justify-between bg-[#7B9669]/20 p-2 rounded-lg border border-[#7B9669]/40">
            <span className="flex items-center gap-1 text-white font-bold"><Scale className="w-3.5 h-3.5 text-[#7B9669]" /> Measured Weight</span>
            <span className="font-black text-[#BAC8B1]">{token.actualWeightQuintals} Qtl</span>
          </div>
        )}

        {token.moistureContentPercent !== undefined && token.moistureContentPercent !== null && (
          <div className="flex items-center justify-between bg-[#404E3B] p-2 rounded-lg border border-[#6C8480]/50 text-xs">
            <span className="text-[#BAC8B1] font-medium">Seed Moisture %:</span>
            <span className="font-bold text-white">{token.moistureContentPercent}%</span>
          </div>
        )}

        {token.adjustedWeightQuintals !== undefined && token.adjustedWeightQuintals !== null && (
          <div className="flex items-center justify-between bg-[#7B9669] text-[#404E3B] p-2 rounded-lg font-bold text-xs shadow">
            <span>Net Adjusted Quantity:</span>
            <span className="font-extrabold text-sm">{token.adjustedWeightQuintals} Qtl</span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="space-y-2 pt-1">
        {token.status === "in_progress" && (
          <div className="space-y-2 bg-[#404E3B]/90 p-3 rounded-xl border border-[#BAC8B1]/40">
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-[#BAC8B1]">
                1. Measured Weighbridge Weight (Quintals):
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={actualWeight}
                onChange={(e) => setActualWeight(e.target.value)}
                className="w-full bg-[#404E3B] border border-[#BAC8B1] rounded-lg py-1.5 px-3 text-xs text-white font-black focus:outline-none focus:border-[#7B9669]"
                placeholder="e.g. 50.0"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-[#BAC8B1]">
                2. Seed Moisture Content (%):
              </label>
              <input
                type="number"
                step="0.1"
                required
                value={moistureContent}
                onChange={(e) => setMoistureContent(e.target.value)}
                className="w-full bg-[#404E3B] border border-[#BAC8B1] rounded-lg py-1.5 px-3 text-xs text-white font-black focus:outline-none focus:border-[#7B9669]"
                placeholder="e.g. 17.5"
              />
            </div>
          </div>
        )}

        <div className="flex items-center gap-2">
          {token.status === "scheduled" && (
            <button
              type="button"
              onClick={() => updateStatus("checked_in")}
              className="flex-1 py-2 bg-[#6C8480] hover:bg-[#BAC8B1] text-[#404E3B] rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
            >
              <CheckCircle2 className="w-3.5 h-3.5" /> Check In
            </button>
          )}
          {token.status === "checked_in" && (
            <button
              type="button"
              onClick={() => updateStatus("in_progress")}
              className="flex-1 py-2 bg-[#7B9669] hover:bg-[#BAC8B1] text-[#404E3B] rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
            >
              <PlayCircle className="w-3.5 h-3.5" /> Start Weighing & Moisture Test
            </button>
          )}
          {token.status === "in_progress" && (
            <button
              type="button"
              onClick={() => updateStatus("completed")}
              className="flex-1 py-2 bg-[#7B9669] hover:bg-[#BAC8B1] text-[#404E3B] rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md"
            >
              <CheckCircle2 className="w-3.5 h-3.5" /> Submit Weight & Moisture Test
            </button>
          )}
        </div>

        {/* Staff Gate Notification Dispatch */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => sendNotification("sms")}
            className="flex-1 py-1.5 bg-[#404E3B] border border-[#6C8480] hover:bg-[#6C8480]/30 text-[#BAC8B1] text-[10px] font-bold rounded-md transition-all text-center"
          >
            📱 Send SMS Alert
          </button>
          <button
            type="button"
            onClick={() => sendNotification("whatsapp")}
            className="flex-1 py-1.5 bg-[#404E3B] border border-[#6C8480] hover:bg-[#6C8480]/30 text-[#BAC8B1] text-[10px] font-bold rounded-md transition-all text-center"
          >
            💬 Send WhatsApp Alert
          </button>
        </div>
      </div>
    </div>
  );
}
