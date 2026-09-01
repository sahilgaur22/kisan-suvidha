"use client";

import Link from "next/link";
import { Sprout, LogOut, Users, CreditCard, AlertCircle, RefreshCw, BarChart2 } from "lucide-react";
import ProtectedRoute from "../../../components/auth/ProtectedRoute";
import StatsCards from "../../../components/admin/StatsCards";
import { useAuthStore } from "../../../store/authStore";
import { useDashboardStats } from "../../../hooks/useDashboard";

export default function AdminDashboardPage() {
  const { user, logout } = useAuthStore();
  const centerId = user?.centerId || "11111111-1111-1111-1111-111111111111";

  const { data: stats, isLoading, refetch } = useDashboardStats(centerId);

  return (
    <ProtectedRoute allowedRoles={["center_admin", "super_admin"]}>
      <div className="min-h-screen bg-slate-950 text-slate-100 p-6 flex flex-col justify-between">
        <div>
          {/* Header Navigation */}
          <header className="max-w-6xl mx-auto w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4 border-b border-slate-800/80 mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-500 p-2.5 rounded-2xl text-slate-950">
                <Sprout className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Center Admin Management Dashboard</h1>
                <p className="text-xs text-emerald-400 font-medium">
                  {user?.fullName} — Procurement Center ({centerId})
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => refetch()}
                className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5 text-emerald-400" /> Refresh Stats
              </button>
              <button
                type="button"
                onClick={logout}
                className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-rose-900/50 hover:bg-rose-950/40 text-slate-400 hover:text-rose-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
              >
                <LogOut className="w-3.5 h-3.5" /> Logout
              </button>
            </div>
          </header>

          <main className="max-w-6xl mx-auto w-full">
            {/* Live Stats Cards Grid */}
            <StatsCards stats={stats} isLoading={isLoading} />

            {/* Admin Quick Action Navigation Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
              <Link
                href="/admin/staff-management"
                className="bg-slate-900/90 border border-slate-800 hover:border-emerald-500/50 p-6 rounded-2xl transition-all group"
              >
                <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl w-fit mb-4 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-all">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white mb-1">Staff Management</h3>
                <p className="text-xs text-slate-400">Add ground staff accounts and manage RLS-scoped staff access.</p>
              </Link>

              <Link
                href="/admin/payments"
                className="bg-slate-900/90 border border-slate-800 hover:border-emerald-500/50 p-6 rounded-2xl transition-all group"
              >
                <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl w-fit mb-4 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-all">
                  <CreditCard className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white mb-1">Payment Audit Trail</h3>
                <p className="text-xs text-slate-400">Review MSP calculations, gross payouts, and direct bank receipts.</p>
              </Link>

              <Link
                href="/admin/complaints"
                className="bg-slate-900/90 border border-slate-800 hover:border-emerald-500/50 p-6 rounded-2xl transition-all group"
              >
                <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl w-fit mb-4 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-all">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white mb-1">Grievance Inbox</h3>
                <p className="text-xs text-slate-400">Review and resolve farmer grievance tickets routed to your center.</p>
              </Link>
            </div>
          </main>
        </div>

        <footer className="text-center text-xs text-slate-600 pt-8 pb-4 max-w-6xl mx-auto w-full border-t border-slate-900">
          Ministry of Consumer Affairs | SIH Problem Statement 26032 Center Admin Portal
        </footer>
      </div>
    </ProtectedRoute>
  );
}
