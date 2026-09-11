"use client";

import { useEffect, useState } from "react";
import { Sprout, LogOut, Calendar, Filter, RotateCcw, AlertTriangle } from "lucide-react";
import ProtectedRoute from "../../../components/auth/ProtectedRoute";
import LiveQueueBadge from "../../../components/staff/LiveQueueBadge";
import QueueTable from "../../../components/staff/QueueTable";
import LanguageSwitcher from "../../../components/LanguageSwitcher";
import { useAuthStore } from "../../../store/authStore";
import { useQueueStore } from "../../../store/queueStore";
import { useQueueSocket } from "../../../hooks/useQueueSocket";
import { apiClient } from "../../../lib/api-client";

export default function StaffQueuePage() {
  const { user, logout } = useAuthStore();
  const { tokens, connectionStatus, setTokens } = useQueueStore();

  const getLocalDateString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const [selectedDate, setSelectedDate] = useState(getLocalDateString());
  const [includeCancelled, setIncludeCancelled] = useState(false);

  const targetCenterId = user?.centerId || "11111111-1111-1111-1111-111111111111";

  // Connect live WebSocket
  useQueueSocket(targetCenterId);

  const fetchQueue = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedDate) params.append("booking_date", selectedDate);
      if (includeCancelled) params.append("include_cancelled", "true");

      const queryStr = params.toString() ? `?${params.toString()}` : "";
      const url = `/bookings/queue/${targetCenterId}${queryStr}`;
      const data = await apiClient<any[]>(url);
      const formatted = data.map((t) => ({
        id: t.id,
        tokenNumber: t.token_number,
        farmerName: t.farmer_name || "Farmer",
        farmerPhone: t.farmer_phone || "",
        cropName: t.crop_name,
        cropVolumeQuintals: t.crop_volume_quintals,
        actualWeightQuintals: t.actual_weight_quintals,
        moistureContentPercent: t.moisture_content_percent,
        adjustedWeightQuintals: t.adjusted_weight_quintals,
        vehicleType: t.vehicle_type,
        bookingDate: t.booking_date,
        slotStartTime: t.slot_start_time,
        slotEndTime: t.slot_end_time,
        status: t.status,
      }));
      setTokens(formatted);
    } catch (err) {
      console.error("Failed to fetch initial queue:", err);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, [selectedDate, includeCancelled, user?.centerId]);

  return (
    <ProtectedRoute allowedRoles={["staff", "center_admin"]}>
      <div className="min-h-screen bg-slate-50 text-slate-900 p-6 flex flex-col justify-between">
        <div>
          {/* Header */}
          <header className="max-w-6xl mx-auto w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4 border-b border-slate-200 mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-tr from-amber-400 to-kisan-400 p-2.5 rounded-2xl text-kisan-950 shadow">
                <Sprout className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-900">Live Mandi Queue & Weighbridge Operations</h1>
                <p className="text-xs text-slate-500 font-bold">
                  {user?.fullName} ({user?.role === "center_admin" ? "Center Admin" : "Ground Staff"}) — Center ({user?.centerId || "Default Center"})
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <LanguageSwitcher />
              <LiveQueueBadge status={connectionStatus} />
              <button
                type="button"
                onClick={logout}
                className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-rose-600 hover:bg-rose-50 text-slate-700 hover:text-rose-600 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
              >
                <LogOut className="w-3.5 h-3.5" /> Logout
              </button>
            </div>
          </header>

          {/* Controls Bar */}
          <main className="max-w-6xl mx-auto w-full">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-gradient-to-br from-kisan-900 via-kisan-800 to-kisan-950 text-white p-5 rounded-2xl border border-kisan-700/50 shadow-lg">
              <div>
                <h2 className="text-base font-bold text-white">Date-Time Ordered Queue</h2>
                <p className="text-xs text-kisan-200">Strictly ordered by (booking_date, slot_start_time)</p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Active vs Cancelled Queue Mode Toggle */}
                <div className="flex items-center bg-kisan-950/80 p-1 rounded-xl border border-kisan-700/60 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setIncludeCancelled(false)}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      !includeCancelled
                        ? "bg-kisan-700 text-white shadow"
                        : "text-kisan-200 hover:text-white"
                    }`}
                  >
                    Active Tokens
                  </button>
                  <button
                    type="button"
                    onClick={() => setIncludeCancelled(true)}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      includeCancelled
                        ? "bg-rose-800 text-white shadow"
                        : "text-kisan-200 hover:text-white"
                    }`}
                  >
                    Include Cancelled
                  </button>
                </div>

                {/* Date Filter */}
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-kisan-300" />
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="bg-kisan-950/80 border border-kisan-700/60 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-kisan-400 font-bold"
                  />
                  {selectedDate && (
                    <button
                      type="button"
                      onClick={() => setSelectedDate("")}
                      className="px-2.5 py-1.5 rounded-xl bg-kisan-700 hover:bg-kisan-600 text-white text-xs font-bold transition-all shadow"
                      title="View all active tokens across all dates"
                    >
                      All Dates
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Cancelled Token Helper Note if enabled */}
            {includeCancelled && (
              <div className="mt-3 p-3 bg-rose-950/60 border border-rose-700/60 rounded-xl text-xs text-rose-200 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  Showing active and cancelled tokens. Cancelled tokens can be uncancelled/restored using the button on their card.
                </span>
                <span className="font-bold text-rose-300 text-[11px]">SMS notifications sent on cancel/retrieval</span>
              </div>
            )}

            {/* Queue Cards Grid */}
            <QueueTable tokens={tokens} onRefresh={fetchQueue} />
          </main>
        </div>

        <footer className="text-center text-xs text-slate-500 font-semibold pt-8 pb-4 max-w-6xl mx-auto w-full border-t border-slate-200">
          Ministry of Consumer Affairs, Food & Public Distribution | Mandi Ground Operations Portal
        </footer>
      </div>
    </ProtectedRoute>
  );
}
