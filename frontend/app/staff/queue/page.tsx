"use client";

import { useEffect, useState } from "react";
import { Sprout, LogOut, Calendar } from "lucide-react";
import ProtectedRoute from "../../../components/auth/ProtectedRoute";
import LiveQueueBadge from "../../../components/staff/LiveQueueBadge";
import QueueTable from "../../../components/staff/QueueTable";
import { useAuthStore } from "../../../store/authStore";
import { useQueueStore } from "../../../store/queueStore";
import { useQueueSocket } from "../../../hooks/useQueueSocket";
import { apiClient } from "../../../lib/api-client";

export default function StaffQueuePage() {
  const { user, logout } = useAuthStore();
  const { tokens, connectionStatus, setTokens } = useQueueStore();

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);

  // Connect live WebSocket
  useQueueSocket(user?.centerId || "11111111-1111-1111-1111-111111111111");

  const fetchQueue = async () => {
    try {
      const data = await apiClient<any[]>(
        `/bookings/queue?center_id=${user?.centerId || "11111111-1111-1111-1111-111111111111"}&booking_date=${selectedDate}`
      );
      const formatted = data.map((t) => ({
        id: t.id,
        tokenNumber: t.token_number,
        farmerName: t.farmer_name || "Farmer",
        farmerPhone: t.farmer_phone || "",
        cropName: t.crop_name,
        cropVolumeQuintals: t.crop_volume_quintals,
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
  }, [selectedDate, user?.centerId]);

  return (
    <ProtectedRoute allowedRoles={["staff", "center_admin", "super_admin"]}>
      <div className="min-h-screen bg-slate-950 text-slate-100 p-6 flex flex-col justify-between">
        <div>
          {/* Header */}
          <header className="max-w-6xl mx-auto w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4 border-b border-slate-800/80 mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-500 p-2.5 rounded-2xl text-slate-950">
                <Sprout className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Live Ground Staff Queue Portal</h1>
                <p className="text-xs text-emerald-400 font-medium">
                  {user?.fullName} — Procurement Center ({user?.centerId || "Default Center"})
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <LiveQueueBadge status={connectionStatus} />
              <button
                type="button"
                onClick={logout}
                className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-rose-900/50 hover:bg-rose-950/40 text-slate-400 hover:text-rose-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
              >
                <LogOut className="w-3.5 h-3.5" /> Logout
              </button>
            </div>
          </header>

          {/* Controls Bar */}
          <main className="max-w-6xl mx-auto w-full">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
              <div>
                <h2 className="text-base font-bold text-white">Date-Time Ordered Queue</h2>
                <p className="text-xs text-slate-400">Strictly ordered by (booking_date, slot_start_time)</p>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-400" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Queue Cards Grid */}
            <QueueTable tokens={tokens} onRefresh={fetchQueue} />
          </main>
        </div>

        <footer className="text-center text-xs text-slate-600 pt-8 pb-4 max-w-6xl mx-auto w-full border-t border-slate-900">
          Ministry of Consumer Affairs | SIH Problem Statement 26032 Ground Operations
        </footer>
      </div>
    </ProtectedRoute>
  );
}
