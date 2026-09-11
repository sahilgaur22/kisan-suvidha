"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Sprout,
  LogOut,
  Users,
  CreditCard,
  AlertCircle,
  RefreshCw,
  Calendar,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  FileSpreadsheet,
  ArrowRight,
  Scale,
} from "lucide-react";
import ProtectedRoute from "../../../components/auth/ProtectedRoute";
import StatsCards from "../../../components/admin/StatsCards";
import LanguageSwitcher from "../../../components/LanguageSwitcher";
import { useAuthStore } from "../../../store/authStore";
import { useDashboardStats } from "../../../hooks/useDashboard";
import { useCenterBookings, FarmerBookingRecord } from "../../../hooks/useBookings";

export default function AdminDashboardPage() {
  const { user, logout } = useAuthStore();
  const centerId = user?.centerId || "11111111-1111-1111-1111-111111111111";

  const getLocalDateString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const [filterMode, setFilterMode] = useState<"today" | "all" | "custom">("today");
  const [selectedDate, setSelectedDate] = useState(getLocalDateString());
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const targetDateParam = filterMode === "today" ? getLocalDateString() : filterMode === "custom" ? selectedDate : null;
  const isAllTime = filterMode === "all";

  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useDashboardStats(
    centerId,
    targetDateParam,
    isAllTime
  );

  const { data: bookings, isLoading: bookingsLoading, refetch: refetchBookings } = useCenterBookings(
    centerId,
    targetDateParam,
    true
  );

  const handleRefresh = () => {
    refetchStats();
    refetchBookings();
  };

  const filteredBookings = bookings?.filter((b) => {
    const matchesStatus = statusFilter === "all" || b.status.toLowerCase() === statusFilter.toLowerCase();
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      b.token_number?.toLowerCase().includes(q) ||
      b.farmer_name?.toLowerCase().includes(q) ||
      b.farmer_phone?.toLowerCase().includes(q) ||
      b.crop_name?.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  const periodLabel = filterMode === "today" ? "Today's" : filterMode === "all" ? "All-Time" : selectedDate;

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900 border border-blue-300 text-[11px] font-bold inline-flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-blue-700" /> Completed
          </span>
        );
      case "checked_in":
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[11px] font-bold inline-flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-700" /> Checked In
          </span>
        );
      case "in_progress":
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 text-[11px] font-bold inline-flex items-center gap-1 animate-pulse">
            <Sprout className="w-3 h-3 text-emerald-700" /> Processing
          </span>
        );
      case "rejected":
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-900 border border-rose-300 text-[11px] font-bold inline-flex items-center gap-1">
            <AlertCircle className="w-3 h-3 text-rose-700" /> Rejected
          </span>
        );
      case "cancelled":
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-300 text-[11px] font-bold inline-flex items-center gap-1">
            <AlertCircle className="w-3 h-3 text-slate-500" /> Cancelled
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-bold inline-flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-600" /> Scheduled
          </span>
        );
    }
  };

  return (
    <ProtectedRoute allowedRoles={["center_admin"]}>
      <div className="min-h-screen bg-slate-50 text-slate-900 p-6 flex flex-col justify-between">
        <div>
          {/* Header Navigation */}
          <header className="max-w-6xl mx-auto w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4 border-b border-slate-200 mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-tr from-amber-400 to-kisan-400 p-2.5 rounded-2xl text-kisan-950 shadow">
                <Sprout className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-900">Center Admin Management Dashboard</h1>
                <p className="text-xs text-slate-500 font-bold">
                  {user?.fullName} — Procurement Center ({centerId})
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <LanguageSwitcher />
              <button
                type="button"
                onClick={handleRefresh}
                className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-kisan-700 text-slate-800 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
              >
                <RefreshCw className="w-3.5 h-3.5 text-kisan-600" /> Refresh
              </button>
              <button
                type="button"
                onClick={logout}
                className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-rose-600 hover:bg-rose-50 text-slate-700 hover:text-rose-600 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
              >
                <LogOut className="w-3.5 h-3.5" /> Logout
              </button>
            </div>
          </header>

          <main className="max-w-6xl mx-auto w-full space-y-6">
            {/* Period & Date Selection Bar */}
            <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-kisan-700" /> View Statistics & Procurement For:
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setFilterMode("today")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    filterMode === "today"
                      ? "bg-kisan-700 text-white shadow"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  Today ({getLocalDateString()})
                </button>

                <button
                  type="button"
                  onClick={() => setFilterMode("all")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    filterMode === "all"
                      ? "bg-kisan-700 text-white shadow"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  All Historical Records
                </button>

                <div className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-xl border border-slate-200">
                  <span className="text-[11px] font-semibold text-slate-500">Pick Date:</span>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => {
                      setSelectedDate(e.target.value);
                      setFilterMode("custom");
                    }}
                    className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Live / Historical Stats Cards Grid */}
            <StatsCards stats={stats} isLoading={statsLoading} periodLabel={periodLabel} />

            {/* Admin Quick Action Navigation Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 my-6">
              <Link
                href="/admin/bookings"
                className="bg-white border border-slate-200 hover:border-kisan-700 p-5 rounded-2xl transition-all group shadow-sm hover:shadow-md"
              >
                <div className="p-3 bg-gradient-to-b from-kisan-700 to-kisan-800 text-white rounded-xl w-fit mb-3 group-hover:from-kisan-800 group-hover:to-kisan-900 transition-all shadow">
                  <FileSpreadsheet className="w-5 h-5 text-kisan-300" />
                </div>
                <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-kisan-700 mb-0.5 transition-colors">
                  Tokens & Bookings Log
                </h3>
                <p className="text-[11px] text-slate-500 font-medium">Audit old tokens, weights & gate history.</p>
              </Link>

              <Link
                href="/admin/msp"
                className="bg-white border border-slate-200 hover:border-kisan-700 p-5 rounded-2xl transition-all group shadow-sm hover:shadow-md"
              >
                <div className="p-3 bg-gradient-to-b from-kisan-700 to-kisan-800 text-white rounded-xl w-fit mb-3 group-hover:from-kisan-800 group-hover:to-kisan-900 transition-all shadow">
                  <Sprout className="w-5 h-5 text-kisan-300" />
                </div>
                <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-kisan-700 mb-0.5 transition-colors">
                  MSP & Crop Control
                </h3>
                <p className="text-[11px] text-slate-500 font-medium">Update MSP prices & crop options.</p>
              </Link>

              <Link
                href="/admin/staff-management"
                className="bg-white border border-slate-200 hover:border-kisan-700 p-5 rounded-2xl transition-all group shadow-sm hover:shadow-md"
              >
                <div className="p-3 bg-gradient-to-b from-kisan-700 to-kisan-800 text-white rounded-xl w-fit mb-3 group-hover:from-kisan-800 group-hover:to-kisan-900 transition-all shadow">
                  <Users className="w-5 h-5 text-kisan-300" />
                </div>
                <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-kisan-700 mb-0.5 transition-colors">
                  Staff Management
                </h3>
                <p className="text-[11px] text-slate-500 font-medium">Manage ground staff accounts.</p>
              </Link>

              <Link
                href="/admin/payments"
                className="bg-white border border-slate-200 hover:border-kisan-700 p-5 rounded-2xl transition-all group shadow-sm hover:shadow-md"
              >
                <div className="p-3 bg-gradient-to-b from-kisan-700 to-kisan-800 text-white rounded-xl w-fit mb-3 group-hover:from-kisan-800 group-hover:to-kisan-900 transition-all shadow">
                  <CreditCard className="w-5 h-5 text-kisan-300" />
                </div>
                <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-kisan-700 mb-0.5 transition-colors">
                  Payment Audit Trail
                </h3>
                <p className="text-[11px] text-slate-500 font-medium">Review MSP calculations & DBT receipts.</p>
              </Link>

              <Link
                href="/admin/complaints"
                className="bg-white border border-slate-200 hover:border-kisan-700 p-5 rounded-2xl transition-all group shadow-sm hover:shadow-md"
              >
                <div className="p-3 bg-gradient-to-b from-kisan-700 to-kisan-800 text-white rounded-xl w-fit mb-3 group-hover:from-kisan-800 group-hover:to-kisan-900 transition-all shadow">
                  <AlertCircle className="w-5 h-5 text-kisan-300" />
                </div>
                <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-kisan-700 mb-0.5 transition-colors">
                  Grievance Inbox
                </h3>
                <p className="text-[11px] text-slate-500 font-medium">Resolve farmer grievance tickets.</p>
              </Link>
            </div>

            {/* Tokens & Crop Procurement Details Section */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-md space-y-4">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Scale className="w-5 h-5 text-kisan-700" />
                    <h2 className="text-base font-black text-slate-900">
                      Token & Crop Procurement Details ({periodLabel})
                    </h2>
                  </div>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    View active and past mandi tokens, weighbridge measurements, seed moisture, and MSP disbursements.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
                  {/* Search input */}
                  <div className="relative grow sm:grow-0">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search Token, Farmer, Crop..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full sm:w-56 bg-slate-50 border border-slate-200 rounded-xl py-1.5 pl-8 pr-3 text-xs text-slate-900 focus:outline-none focus:border-kisan-600 font-medium"
                    />
                  </div>

                  {/* Status filter dropdown */}
                  <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-700">
                    <Filter className="w-3.5 h-3.5 text-slate-500" />
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
                    >
                      <option value="all">All Statuses</option>
                      <option value="completed">Completed</option>
                      <option value="checked_in">Checked In</option>
                      <option value="in_progress">Processing</option>
                      <option value="scheduled">Scheduled</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>

                  <Link
                    href="/admin/bookings"
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1 transition-all"
                  >
                    Full Audit View <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Table */}
              {bookingsLoading ? (
                <div className="p-8 text-center text-xs text-slate-400 font-semibold animate-pulse">
                  Loading token and crop procurement records...
                </div>
              ) : !filteredBookings || filteredBookings.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500 font-medium space-y-1">
                  <p className="font-bold text-slate-700">No Procurement Records Found</p>
                  <p>
                    No tokens match the selected period ({periodLabel}) or search criteria.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-slate-200">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-3.5">Token / Date</th>
                        <th className="py-3 px-3.5">Farmer Info</th>
                        <th className="py-3 px-3.5">Crop & Scheduled Qtl</th>
                        <th className="py-3 px-3.5">Procured Weight</th>
                        <th className="py-3 px-3.5">Moisture %</th>
                        <th className="py-3 px-3.5">Status</th>
                        <th className="py-3 px-3.5">MSP Payout</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {filteredBookings.map((b) => (
                        <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-3.5">
                            <span className="font-mono font-black text-kisan-900 bg-kisan-50 px-2 py-0.5 rounded border border-kisan-200 block w-fit">
                              {b.token_number}
                            </span>
                            <span className="text-[11px] text-slate-500 font-medium mt-0.5 block">
                              {b.booking_date} ({b.slot_start_time?.slice(0, 5)} - {b.slot_end_time?.slice(0, 5)})
                            </span>
                          </td>

                          <td className="py-3 px-3.5">
                            <span className="font-bold text-slate-900 block">{b.farmer_name || "Registered Farmer"}</span>
                            <span className="text-[11px] text-slate-500">{b.farmer_phone || "—"}</span>
                          </td>

                          <td className="py-3 px-3.5">
                            <span className="font-semibold text-slate-800 block">{b.crop_name}</span>
                            <span className="text-[11px] text-slate-500">{b.crop_volume_quintals} Qtl requested</span>
                          </td>

                          <td className="py-3 px-3.5">
                            {b.actual_weight_quintals ? (
                              <div>
                                <span className="font-black text-kisan-900 block">
                                  {b.actual_weight_quintals} Qtl
                                </span>
                                {b.adjusted_weight_quintals && (
                                  <span className="text-[10px] text-emerald-800 font-semibold">
                                    Net: {b.adjusted_weight_quintals} Qtl
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-slate-400 italic">Pending Weighment</span>
                            )}
                          </td>

                          <td className="py-3 px-3.5">
                            {b.moisture_content_percent !== undefined && b.moisture_content_percent !== null ? (
                              <span
                                className={`font-bold ${
                                  b.moisture_content_percent > 14 ? "text-rose-600" : "text-emerald-700"
                                }`}
                              >
                                {b.moisture_content_percent}%
                              </span>
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </td>

                          <td className="py-3 px-3.5">{getStatusBadge(b.status)}</td>

                          <td className="py-3 px-3.5">
                            {b.payment_amount ? (
                              <span className="font-extrabold text-emerald-800 block">
                                ₹{b.payment_amount.toLocaleString("en-IN")}
                              </span>
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </main>
        </div>

        <footer className="text-center text-xs text-slate-500 font-semibold pt-8 pb-4 max-w-6xl mx-auto w-full border-t border-slate-200">
          Ministry of Consumer Affairs, Food & Public Distribution | Center Admin Portal
        </footer>
      </div>
    </ProtectedRoute>
  );
}

