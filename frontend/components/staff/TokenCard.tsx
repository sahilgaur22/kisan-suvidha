"use client";

import { useState } from "react";
import { BookingToken } from "../../store/queueStore";
import { Clock, Truck, Scale, User, CheckCircle2, PlayCircle, XCircle, RotateCcw } from "lucide-react";
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
  const [isUpdating, setIsUpdating] = useState(false);

  const updateStatus = async (newStatus: string) => {
    try {
      setIsUpdating(true);
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
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelToken = async () => {
    const confirmed = window.confirm(
      `Are you sure you want to CANCEL token #${token.tokenNumber} for ${token.farmerName}? An automated SMS cancellation notification will be dispatched to the farmer.`
    );
    if (confirmed) {
      await updateStatus("cancelled");
    }
  };

  const handleUncancelToken = async () => {
    const confirmed = window.confirm(
      `Are you sure you want to UNCANCEL / RETRIEVE token #${token.tokenNumber} for ${token.farmerName}? This will restore the token to ACTIVE status and send an automated SMS confirmation to the farmer.`
    );
    if (confirmed) {
      await updateStatus("scheduled");
    }
  };

  const getStatusBadge = () => {
    switch (token.status) {
      case "checked_in":
        return <span className="px-2.5 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold">Checked In</span>;
      case "in_progress":
        return <span className="px-2.5 py-1 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold animate-pulse">Serving Now (जारी है)</span>;
      case "completed":
        return <span className="px-2.5 py-1 rounded-full bg-blue-100 border border-blue-300 text-blue-900 text-xs font-bold">Completed / Procured</span>;
      case "rejected":
        return <span className="px-2.5 py-1 rounded-full bg-rose-100 border border-rose-300 text-rose-900 text-xs font-bold shadow animate-pulse">REJECTED (High Moisture)</span>;
      case "cancelled":
        return <span className="px-2.5 py-1 rounded-full bg-rose-100 border border-rose-300 text-rose-900 text-xs font-bold shadow">CANCELLED</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold">In Queue (प्रतीक्षा में)</span>;
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

  const isCancelled = token.status === "cancelled";

  return (
    <div className={`p-5 rounded-2xl shadow-xl flex flex-col justify-between space-y-4 transition-all ${
      isCancelled
        ? "bg-slate-900 border-2 border-rose-800/60 opacity-90"
        : "bg-gradient-to-br from-kisan-900 via-kisan-800 to-kisan-950 border border-kisan-700"
    }`}>
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs text-kisan-200 font-medium uppercase tracking-wider block">Token</span>
          <span className="text-2xl font-extrabold text-white">{token.tokenNumber}</span>
        </div>
        {getStatusBadge()}
      </div>

      <div className="space-y-2 border-t border-b border-kisan-700/50 py-3 text-xs text-slate-200">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1 text-kisan-200"><User className="w-3.5 h-3.5 text-amber-400" /> Farmer</span>
          <span className="font-semibold text-white">{token.farmerName} ({token.farmerPhone || "N/A"})</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1 text-kisan-200"><Scale className="w-3.5 h-3.5 text-amber-400" /> Crop / Volume</span>
          <span className="font-semibold text-white">{token.cropName} — {token.cropVolumeQuintals} Qtl</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1 text-kisan-200"><Truck className="w-3.5 h-3.5 text-amber-400" /> Vehicle</span>
          <span className="font-semibold text-kisan-300 capitalize">{token.vehicleType.replace("_", " ")}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1 text-kisan-200"><Clock className="w-3.5 h-3.5 text-amber-400" /> Slot Window</span>
          <span className="font-bold text-amber-300">{token.slotStartTime} - {token.slotEndTime}</span>
        </div>

        {token.actualWeightQuintals && (
          <div className="flex items-center justify-between bg-kisan-950/60 p-2 rounded-lg border border-kisan-700/60">
            <span className="flex items-center gap-1 text-white font-bold"><Scale className="w-3.5 h-3.5 text-kisan-400" /> Measured Weight</span>
            <span className="font-black text-kisan-300">{token.actualWeightQuintals} Qtl</span>
          </div>
        )}

        {token.moistureContentPercent !== undefined && token.moistureContentPercent !== null && (
          <div className="flex items-center justify-between bg-kisan-950/80 p-2 rounded-lg border border-kisan-700/50 text-xs">
            <span className="text-kisan-200 font-medium">Seed Moisture %:</span>
            <span className="font-bold text-white">{token.moistureContentPercent}%</span>
          </div>
        )}

        {token.adjustedWeightQuintals !== undefined && token.adjustedWeightQuintals !== null && (
          <div className="flex items-center justify-between bg-kisan-700 text-white p-2 rounded-lg font-bold text-xs shadow">
            <span>Net Adjusted Quantity:</span>
            <span className="font-extrabold text-sm">{token.adjustedWeightQuintals} Qtl</span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="space-y-2 pt-1">
        {token.status === "in_progress" && (
          <div className="space-y-2 bg-kisan-950/90 p-3 rounded-xl border border-kisan-700/60">
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-kisan-200">
                1. Measured Weighbridge Weight (Quintals):
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={actualWeight}
                onChange={(e) => setActualWeight(e.target.value)}
                className="w-full bg-kisan-900 border border-kisan-600 rounded-lg py-1.5 px-3 text-xs text-white font-black focus:outline-none focus:border-kisan-400"
                placeholder="e.g. 50.0"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-kisan-200">
                2. Seed Moisture Content (%):
              </label>
              <input
                type="number"
                step="0.1"
                required
                value={moistureContent}
                onChange={(e) => setMoistureContent(e.target.value)}
                className="w-full bg-kisan-900 border border-kisan-600 rounded-lg py-1.5 px-3 text-xs text-white font-black focus:outline-none focus:border-kisan-400"
                placeholder="e.g. 17.5"
              />
            </div>
          </div>
        )}

        {isCancelled ? (
          /* Cancelled state: Option to Uncancel / Retrieve Token */
          <button
            type="button"
            disabled={isUpdating}
            onClick={handleUncancelToken}
            className="w-full py-2.5 bg-kisan-700 hover:bg-kisan-600 disabled:opacity-50 text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all shadow-md"
          >
            <RotateCcw className="w-4 h-4" /> Uncancel / Retrieve Token (Restore)
          </button>
        ) : (
          /* Active state */
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {token.status === "scheduled" && (
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={() => updateStatus("checked_in")}
                  className="flex-1 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Check In
                </button>
              )}
              {token.status === "checked_in" && (
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={() => updateStatus("in_progress")}
                  className="flex-1 py-2 bg-kisan-700 hover:bg-kisan-600 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm"
                >
                  <PlayCircle className="w-3.5 h-3.5" /> Start Weighing & Moisture Test
                </button>
              )}
              {token.status === "in_progress" && (
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={() => updateStatus("completed")}
                  className="flex-1 py-2 bg-kisan-600 hover:bg-kisan-500 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Submit Weight & Moisture Test
                </button>
              )}

              {/* Cancel Token Action for Active Tokens */}
              {token.status !== "completed" && token.status !== "rejected" && (
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={handleCancelToken}
                  className="px-3 py-2 bg-rose-950/70 hover:bg-rose-900 border border-rose-600/70 text-rose-300 hover:text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all"
                  title="Cancel duplicate or erroneous token"
                >
                  <XCircle className="w-3.5 h-3.5" /> Cancel
                </button>
              )}
            </div>

            {/* Staff Gate Notification Dispatch */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => sendNotification("sms")}
                className="flex-1 py-1.5 bg-kisan-950/80 border border-kisan-700 hover:bg-kisan-800 text-kisan-200 text-[10px] font-bold rounded-md transition-all text-center"
              >
                📱 Send SMS Alert
              </button>
              <button
                type="button"
                onClick={() => sendNotification("whatsapp")}
                className="flex-1 py-1.5 bg-kisan-950/80 border border-kisan-700 hover:bg-kisan-800 text-kisan-200 text-[10px] font-bold rounded-md transition-all text-center"
              >
                💬 Send WhatsApp Alert
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
