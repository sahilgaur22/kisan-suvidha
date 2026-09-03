"use client";

import Link from "next/link";
import { ArrowLeft, Calendar, FileText } from "lucide-react";
import ProtectedRoute from "../../../components/auth/ProtectedRoute";
import { useAuthStore } from "../../../store/authStore";

export default function AdminBookingsPage() {
  const { user } = useAuthStore();
  const centerId = user?.centerId || "11111111-1111-1111-1111-111111111111";

  return (
    <ProtectedRoute allowedRoles={["center_admin"]}>
      <div className="min-h-screen bg-slate-950 text-slate-100 p-6 flex flex-col justify-between">
        <div>
          <header className="max-w-6xl mx-auto w-full flex items-center justify-between py-4 border-b border-slate-800/80 mb-6">
            <div className="flex items-center gap-3">
              <Link
                href="/admin/dashboard"
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-all"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center gap-2">
                <div className="bg-emerald-500 p-2 rounded-xl text-slate-950">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-white">Historical Bookings Audit Log</h1>
                  <p className="text-xs text-emerald-400">Center ({centerId})</p>
                </div>
              </div>
            </div>
          </header>

          <main className="max-w-6xl mx-auto w-full">
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl text-center space-y-3">
              <FileText className="w-8 h-8 text-emerald-400 mx-auto" />
              <h2 className="text-base font-bold text-white">Historical Booking Audit Logs</h2>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Full past-booking records with RLS-scoped date filtering and export capability.
              </p>
            </div>
          </main>
        </div>

        <footer className="text-center text-xs text-slate-600 pt-8 pb-4 max-w-6xl mx-auto w-full border-t border-slate-900">
          Ministry of Consumer Affairs | SIH Problem Statement 26032 Booking Audit
        </footer>
      </div>
    </ProtectedRoute>
  );
}
