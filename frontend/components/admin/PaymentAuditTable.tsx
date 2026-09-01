"use client";

import { PaymentAuditRecord } from "../../hooks/usePayments";
import { CreditCard, CheckCircle2 } from "lucide-react";

interface PaymentAuditTableProps {
  payments: PaymentAuditRecord[] | undefined;
  isLoading: boolean;
}

export default function PaymentAuditTable({ payments, isLoading }: PaymentAuditTableProps) {
  if (isLoading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400 animate-pulse my-6">
        Loading payment audit records...
      </div>
    );
  }

  if (!payments || payments.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400 my-6">
        <CreditCard className="w-8 h-8 text-slate-500 mx-auto mb-2" />
        <p className="text-sm font-semibold text-slate-300">No financial payment records found.</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden my-6 shadow-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider">
            <tr>
              <th className="py-3.5 px-4">Transaction Ref</th>
              <th className="py-3.5 px-4">Booking ID</th>
              <th className="py-3.5 px-4">Applied MSP Rate</th>
              <th className="py-3.5 px-4">Total Amount</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {payments.map((p) => (
              <tr key={p.id} className="hover:bg-slate-800/40 transition-all">
                <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">
                  {p.transaction_ref || "PAY-2026-0001"}
                </td>
                <td className="py-3.5 px-4 font-mono text-slate-400">{p.booking_id.slice(0, 8)}...</td>
                <td className="py-3.5 px-4 font-semibold text-white">₹{p.msp_rate_applied}/Qtl</td>
                <td className="py-3.5 px-4 font-extrabold text-white text-sm">
                  ₹{p.amount.toLocaleString("en-IN")}
                </td>
                <td className="py-3.5 px-4">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-950 border border-emerald-600/40 text-emerald-300 font-bold text-[11px]">
                    <CheckCircle2 className="w-3 h-3" /> Processed
                  </span>
                </td>
                <td className="py-3.5 px-4 text-slate-400">
                  {new Date(p.created_at).toLocaleDateString("en-IN")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
