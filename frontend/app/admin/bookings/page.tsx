"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Search,
  Filter,
  RefreshCw,
  Download,
  CheckCircle2,
  Clock,
  Sprout,
  AlertCircle,
  FileSpreadsheet,
} from "lucide-react";
import ProtectedRoute from "../../../components/auth/ProtectedRoute";
import { useAuthStore } from "../../../store/authStore";
import { useCenterBookings, FarmerBookingRecord } from "../../../hooks/useBookings";

export default function AdminBookingsPage() {
  const { user } = useAuthStore();
  const centerId = user?.centerId || "11111111-1111-1111-1111-111111111111";

  const [dateFilter, setDateFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const { data: bookings, isLoading, refetch } = useCenterBookings(
    centerId,
    dateFilter || null,
    true
  );

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

  const exportCSV = () => {
    if (!filteredBookings || filteredBookings.length === 0) return;
    const headers = [
      "Token Number",
      "Booking Date",
      "Slot Start",
      "Slot End",
      "Farmer Name",
      "Farmer Phone",
      "Crop Name",
      "Requested Qtl",
      "Actual Weight Qtl",
      "Adjusted Weight Qtl",
      "Moisture %",
      "Status",
      "MSP Payout INR",
      "Vehicle",
    ];

    const rows = filteredBookings.map((b) => [
      b.token_number,
      b.booking_date,
      b.slot_start_time,
      b.slot_end_time,
      `"${b.farmer_name || "Farmer"}"`,
      b.farmer_phone || "",
      b.crop_name,
      b.crop_volume_quintals,
      b.actual_weight_quintals || "",
      b.adjusted_weight_quintals || "",
      b.moisture_content_percent !== null && b.moisture_content_percent !== undefined ? b.moisture_content_percent : "",
      b.status,
      b.payment_amount || "",
      b.vehicle_type,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `mandi_procurement_tokens_${dateFilter || "all_dates"}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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

  const totalProcuredQtl = filteredBookings?.reduce(
    (acc, curr) => acc + (curr.actual_weight_quintals ? Number(curr.actual_weight_quintals) : 0),
    0
  ) || 0;

  const totalDisbursedINR = filteredBookings?.reduce(
    (acc, curr) => acc + (curr.payment_amount ? Number(curr.payment_amount) : 0),
    0
  ) || 0;

  return (
    <ProtectedRoute allowedRoles={["center_admin"]}>
      <div className="min-h-screen bg-slate-50 text-slate-900 p-6 flex flex-col justify-between">
        <div>
          <header className="max-w-6xl mx-auto w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4 border-b border-slate-200 mb-6">
            <div className="flex items-center gap-3">
              <Link
                href="/admin/dashboard"
                className="p-2 rounded-xl bg-white border border-slate-200 hover:border-kisan-600 text-slate-700 hover:text-kisan-800 transition-all shadow-sm"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center gap-2">
                <div className="bg-gradient-to-tr from-amber-400 to-kisan-400 p-2 rounded-xl text-slate-950 shadow">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-xl font-black text-slate-900">Historical Bookings & Crop Procurement Audit</h1>
                  <p className="text-xs text-slate-500 font-bold">Center ({centerId})</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => refetch()}
                className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-kisan-700 text-slate-800 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
              >
                <RefreshCw className="w-3.5 h-3.5 text-kisan-600" /> Refresh
              </button>

              <button
                type="button"
                onClick={exportCSV}
                disabled={!filteredBookings || filteredBookings.length === 0}
                className="px-3.5 py-1.5 rounded-xl bg-kisan-700 hover:bg-kisan-600 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5" /> Export CSV
              </button>
            </div>
          </header>

          <main className="max-w-6xl mx-auto w-full space-y-6">
            {/* Filter Bar */}
            <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                {/* Search */}
                <div className="relative grow sm:grow-0">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search Token, Farmer, Crop..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full sm:w-60 bg-slate-50 border border-slate-200 rounded-xl py-1.5 pl-8 pr-3 text-xs text-slate-900 focus:outline-none focus:border-kisan-600 font-medium"
                  />
                </div>

                {/* Status */}
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

                {/* Date Picker */}
                <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-xs font-semibold text-slate-700">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-[11px] text-slate-500">Date:</span>
                  <input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
                  />
                  {dateFilter && (
                    <button
                      type="button"
                      onClick={() => setDateFilter("")}
                      className="text-[11px] text-rose-600 font-bold hover:underline ml-1"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Quick Summary Badges */}
              <div className="flex items-center gap-3 text-xs">
                <span className="bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl font-bold text-slate-700">
                  Tokens: <span className="text-kisan-800">{filteredBookings?.length || 0}</span>
                </span>
                <span className="bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl font-bold text-slate-700">
                  Procured: <span className="text-kisan-800">{totalProcuredQtl.toLocaleString("en-IN")} Qtl</span>
                </span>
                <span className="bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl font-bold text-slate-700">
                  Payouts: <span className="text-emerald-800">₹{totalDisbursedINR.toLocaleString("en-IN")}</span>
                </span>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-md">
              {isLoading ? (
                <div className="p-8 text-center text-xs text-slate-400 font-semibold animate-pulse">
                  Loading historical token and procurement logs...
                </div>
              ) : !filteredBookings || filteredBookings.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500 font-medium space-y-1">
                  <p className="font-bold text-slate-700">No Booking Records Found</p>
                  <p>Try clearing filters or selecting another date.</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-slate-200">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-3.5">Token #</th>
                        <th className="py-3 px-3.5">Date & Slot</th>
                        <th className="py-3 px-3.5">Farmer Info</th>
                        <th className="py-3 px-3.5">Crop Details</th>
                        <th className="py-3 px-3.5">Measured Weight</th>
                        <th className="py-3 px-3.5">Moisture</th>
                        <th className="py-3 px-3.5">Status</th>
                        <th className="py-3 px-3.5">Disbursed Payout</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {filteredBookings.map((b) => (
                        <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-3.5 font-mono font-black text-kisan-900">
                            <span className="bg-kisan-50 border border-kisan-200 px-2 py-0.5 rounded">
                              {b.token_number}
                            </span>
                          </td>

                          <td className="py-3 px-3.5">
                            <span className="font-bold text-slate-900 block">{b.booking_date}</span>
                            <span className="text-[11px] text-slate-500 font-medium">
                              {b.slot_start_time?.slice(0, 5)} - {b.slot_end_time?.slice(0, 5)}
                            </span>
                          </td>

                          <td className="py-3 px-3.5">
                            <span className="font-bold text-slate-900 block">{b.farmer_name || "Registered Farmer"}</span>
                            <span className="text-[11px] text-slate-500">{b.farmer_phone || "—"}</span>
                          </td>

                          <td className="py-3 px-3.5">
                            <span className="font-semibold text-slate-800 block">{b.crop_name}</span>
                            <span className="text-[11px] text-slate-500">{b.crop_volume_quintals} Qtl scheduled</span>
                          </td>

                          <td className="py-3 px-3.5">
                            {b.actual_weight_quintals ? (
                              <div>
                                <span className="font-black text-kisan-900 block">
                                  {b.actual_weight_quintals} Qtl
                                </span>
                                {b.adjusted_weight_quintals && (
                                  <span className="text-[10px] text-emerald-800 font-semibold">
                                    Payable: {b.adjusted_weight_quintals} Qtl
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-slate-400 italic">Pending</span>
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
                              <div>
                                <span className="font-extrabold text-emerald-800 block">
                                  ₹{b.payment_amount.toLocaleString("en-IN")}
                                </span>
                                {b.transaction_ref && (
                                  <span className="text-[10px] text-slate-400 font-mono">
                                    {b.transaction_ref}
                                  </span>
                                )}
                              </div>
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
          Ministry of Consumer Affairs, Food & Public Distribution | Center Admin Historical Procurement Audit
        </footer>
      </div>
    </ProtectedRoute>
  );
}
