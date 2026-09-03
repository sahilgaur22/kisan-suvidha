"use client";

import { useEffect, useState } from "react";
import { Sprout, LogOut, Calendar } from "lucide-react";
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

  const targetCenterId = user?.centerId || "11111111-1111-1111-1111-111111111111";

  // Connect live WebSocket
  useQueueSocket(targetCenterId);

  const fetchQueue = async () => {
    try {
      const url = selectedDate
        ? `/bookings/queue/${targetCenterId}?booking_date=${selectedDate}`
        : `/bookings/queue/${targetCenterId}`;
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
  }, [selectedDate, user?.centerId]);

  return (
    <ProtectedRoute allowedRoles={["staff", "center_admin"]}>
      <div className="min-h-screen bg-[#F8FAFC] text-slate-900 p-6 flex flex-col justify-between">
        <div>
          {/* Header */}
          <header className="max-w-6xl mx-auto w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4 border-b-2 border-[#BAC8B1] mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-[#7B9669] p-2.5 rounded-2xl text-white shadow">
                <Sprout className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-black text-[#404E3B]">Live Ground Staff Queue Portal</h1>
                <p className="text-xs text-[#6C8480] font-bold">
                  {user?.fullName} — Procurement Center ({user?.centerId || "Default Center"})
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <LanguageSwitcher />
              <LiveQueueBadge status={connectionStatus} />
              <button
                type="button"
                onClick={logout}
                className="px-3.5 py-1.5 rounded-xl bg-white border-2 border-[#BAC8B1] hover:border-rose-600 hover:bg-rose-50 text-slate-700 hover:text-rose-600 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
              >
                <LogOut className="w-3.5 h-3.5" /> Logout
              </button>
            </div>
          </header>

          {/* Controls Bar */}
          <main className="max-w-6xl mx-auto w-full">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#404E3B] text-white p-5 rounded-2xl border-2 border-[#BAC8B1]/40 shadow-lg">
              <div>
                <h2 className="text-base font-bold text-white">Date-Time Ordered Queue</h2>
                <p className="text-xs text-[#BAC8B1]">Strictly ordered by (booking_date, slot_start_time)</p>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#BAC8B1]" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-[#404E3B] border-2 border-[#6C8480] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#7B9669] font-bold"
                />
                {selectedDate && (
                  <button
                    type="button"
                    onClick={() => setSelectedDate("")}
                    className="px-2.5 py-1.5 rounded-xl bg-[#7B9669] hover:bg-[#6C8480] text-white text-xs font-bold transition-all shadow"
                    title="View all active tokens across all dates"
                  >
                    View All Active Queue
                  </button>
                )}
              </div>
            </div>

            {/* Queue Cards Grid */}
            <QueueTable tokens={tokens} onRefresh={fetchQueue} />
          </main>
        </div>

        <footer className="text-center text-xs text-[#BAC8B1] pt-8 pb-4 max-w-6xl mx-auto w-full border-t border-[#6C8480]/40">
          Ministry of Consumer Affairs, Food & Public Distribution | Ground Operations Portal
        </footer>
      </div>
    </ProtectedRoute>
  );
}
