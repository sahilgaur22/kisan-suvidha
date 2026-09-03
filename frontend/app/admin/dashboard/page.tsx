"use client";

import Link from "next/link";
import { Sprout, LogOut, Users, CreditCard, AlertCircle, RefreshCw } from "lucide-react";
import ProtectedRoute from "../../../components/auth/ProtectedRoute";
import StatsCards from "../../../components/admin/StatsCards";
import LanguageSwitcher from "../../../components/LanguageSwitcher";
import { useAuthStore } from "../../../store/authStore";
import { useDashboardStats } from "../../../hooks/useDashboard";

export default function AdminDashboardPage() {
  const { user, logout } = useAuthStore();
  const centerId = user?.centerId || "11111111-1111-1111-1111-111111111111";

  const { data: stats, isLoading, refetch } = useDashboardStats(centerId);

  return (
    <ProtectedRoute allowedRoles={["center_admin"]}>
      <div className="min-h-screen bg-[#F8FAFC] text-slate-900 p-6 flex flex-col justify-between">
        <div>
          {/* Header Navigation */}
          <header className="max-w-6xl mx-auto w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4 border-b-2 border-[#BAC8B1] mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-[#7B9669] p-2.5 rounded-2xl text-white shadow">
                <Sprout className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-black text-[#404E3B]">Center Admin Management Dashboard</h1>
                <p className="text-xs text-[#6C8480] font-bold">
                  {user?.fullName} — Procurement Center ({centerId})
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <LanguageSwitcher />
              <button
                type="button"
                onClick={() => refetch()}
                className="px-3.5 py-1.5 rounded-xl bg-white border-2 border-[#BAC8B1] hover:border-[#7B9669] text-[#404E3B] text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
              >
                <RefreshCw className="w-3.5 h-3.5 text-[#7B9669]" /> Refresh Stats
              </button>
              <button
                type="button"
                onClick={logout}
                className="px-3.5 py-1.5 rounded-xl bg-white border-2 border-[#BAC8B1] hover:border-rose-600 hover:bg-rose-50 text-slate-700 hover:text-rose-600 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
              >
                <LogOut className="w-3.5 h-3.5" /> Logout
              </button>
            </div>
          </header>

          <main className="max-w-6xl mx-auto w-full">
            {/* Live Stats Cards Grid */}
            <StatsCards stats={stats} isLoading={isLoading} />

            {/* Admin Quick Action Navigation Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 my-8">
              <Link
                href="/admin/msp"
                className="bg-white border-2 border-[#BAC8B1] hover:border-[#7B9669] p-6 rounded-2xl transition-all group shadow-sm hover:shadow-lg"
              >
                <div className="p-3.5 bg-[#7B9669] text-white rounded-xl w-fit mb-4 group-hover:bg-[#404E3B] transition-all shadow">
                  <Sprout className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-extrabold text-[#404E3B] mb-1">MSP & Crop Control</h3>
                <p className="text-xs text-slate-600 font-medium">Update MSP prices & add crop options for your mandi center.</p>
              </Link>

              <Link
                href="/admin/staff-management"
                className="bg-white border-2 border-[#BAC8B1] hover:border-[#7B9669] p-6 rounded-2xl transition-all group shadow-sm hover:shadow-lg"
              >
                <div className="p-3.5 bg-[#7B9669] text-white rounded-xl w-fit mb-4 group-hover:bg-[#404E3B] transition-all shadow">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-extrabold text-[#404E3B] mb-1">Staff Management</h3>
                <p className="text-xs text-slate-600 font-medium">Add ground staff accounts and manage RLS-scoped staff access.</p>
              </Link>

              <Link
                href="/admin/payments"
                className="bg-white border-2 border-[#BAC8B1] hover:border-[#7B9669] p-6 rounded-2xl transition-all group shadow-sm hover:shadow-lg"
              >
                <div className="p-3.5 bg-[#7B9669] text-white rounded-xl w-fit mb-4 group-hover:bg-[#404E3B] transition-all shadow">
                  <CreditCard className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-extrabold text-[#404E3B] mb-1">Payment Audit Trail</h3>
                <p className="text-xs text-slate-600 font-medium">Review MSP calculations, gross payouts, and direct bank receipts.</p>
              </Link>

              <Link
                href="/admin/complaints"
                className="bg-white border-2 border-[#BAC8B1] hover:border-[#7B9669] p-6 rounded-2xl transition-all group shadow-sm hover:shadow-lg"
              >
                <div className="p-3.5 bg-[#7B9669] text-white rounded-xl w-fit mb-4 group-hover:bg-[#404E3B] transition-all shadow">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-extrabold text-[#404E3B] mb-1">Grievance Inbox</h3>
                <p className="text-xs text-slate-600 font-medium">Review and resolve farmer grievance tickets routed to your center.</p>
              </Link>
            </div>
          </main>
        </div>

        <footer className="text-center text-xs text-[#6C8480] font-semibold pt-8 pb-4 max-w-6xl mx-auto w-full border-t border-[#BAC8B1]">
          Ministry of Consumer Affairs, Food & Public Distribution | Center Admin Portal
        </footer>
      </div>
    </ProtectedRoute>
  );
}
