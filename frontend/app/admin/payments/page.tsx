"use client";

import Link from "next/link";
import { ArrowLeft, Sprout, CreditCard } from "lucide-react";
import ProtectedRoute from "../../../components/auth/ProtectedRoute";
import PaymentAuditTable from "../../../components/admin/PaymentAuditTable";
import { useAuthStore } from "../../../store/authStore";
import { usePaymentAudit } from "../../../hooks/usePayments";

export default function AdminPaymentsPage() {
  const { user } = useAuthStore();
  const centerId = user?.centerId || "11111111-1111-1111-1111-111111111111";

  const { data: payments, isLoading } = usePaymentAudit(centerId);

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
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-white">Financial Payout Audit Trail</h1>
                  <p className="text-xs text-emerald-400">Center ({centerId})</p>
                </div>
              </div>
            </div>
          </header>

          <main className="max-w-6xl mx-auto w-full">
            <PaymentAuditTable payments={payments} isLoading={isLoading} />
          </main>
        </div>

        <footer className="text-center text-xs text-slate-600 pt-8 pb-4 max-w-6xl mx-auto w-full border-t border-slate-900">
          Ministry of Consumer Affairs | SIH Problem Statement 26032 Financial Audit
        </footer>
      </div>
    </ProtectedRoute>
  );
}
