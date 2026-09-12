"use client";

import { useMyComplaints } from "../../hooks/useComplaints";
import { AlertCircle, CheckCircle2, XCircle, Clock, RefreshCw, MessageSquareQuote } from "lucide-react";

export default function FarmerComplaintsLog() {
  const { data: complaints, isLoading, refetch } = useMyComplaints();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "resolved":
        return (
          <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" /> Resolved (निवारित)
          </span>
        );
      case "rejected":
        return (
          <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-900 border border-rose-300 text-xs font-bold flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5 text-rose-700" /> Closed (बंद)
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-amber-700" /> Under Review (प्रक्रियाधीन)
          </span>
        );
    }
  };

  const formatCategory = (cat: string) => {
    switch (cat) {
      case "delay":
        return "Delay in Weighing / Slot Entry";
      case "payment_dispute":
        return "MSP Payout / Payment Dispute";
      case "weighment_issue":
        return "Weighment / Scale Issue";
      case "behavior":
        return "Mandi Staff Misbehavior";
      default:
        return "General Grievance";
    }
  };

  return (
    <div className="bg-white border-2 border-slate-200 p-6 rounded-3xl shadow-lg space-y-4 max-w-xl mx-auto my-6">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="bg-amber-500 p-2 rounded-xl text-slate-950 shadow">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-800">My Grievance Tickets & Responses</h3>
            <p className="text-xs text-slate-500 font-medium">Track submitted complaints and official Mandi admin replies</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => refetch()}
          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all"
          title="Refresh grievance history"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {isLoading ? (
        <p className="text-xs text-slate-500 text-center py-4 font-semibold">Loading your grievance logs...</p>
      ) : !complaints || complaints.length === 0 ? (
        <div className="text-center py-6 text-slate-500 text-xs space-y-1">
          <p className="font-bold text-slate-800">No Grievance Tickets Found</p>
          <p>Any complaints or disputes you report will appear here along with the official resolution response.</p>
        </div>
      ) : (
        <div className="space-y-3.5 max-h-96 overflow-y-auto pr-1">
          {complaints.map((c) => (
            <div
              key={c.id}
              className="bg-slate-50 border-2 border-slate-200 hover:border-amber-400 p-4 rounded-2xl transition-all space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-black text-amber-900 bg-amber-100 border border-amber-300 px-2.5 py-1 rounded-lg">
                  {c.ticket_number}
                </span>
                {getStatusBadge(c.status)}
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900">
                    {c.subject || formatCategory(c.category)}
                  </h4>
                  <span className="text-[10px] text-slate-500 font-semibold">
                    {new Date(c.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-slate-600 bg-white p-2.5 rounded-xl border border-slate-200 mt-1 font-medium">
                  {c.description}
                </p>
              </div>

              {/* Official Admin Resolution Response */}
              {c.resolution_notes ? (
                <div className="bg-emerald-50 border border-emerald-300 p-3 rounded-xl text-xs space-y-1">
                  <div className="flex items-center gap-1.5 text-emerald-900 font-bold">
                    <MessageSquareQuote className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Mandi Admin Official Response:</span>
                  </div>
                  <p className="text-slate-800 pl-5 font-semibold leading-relaxed">
                    {c.resolution_notes}
                  </p>
                </div>
              ) : (
                <p className="text-[11px] text-amber-800 font-semibold bg-amber-50/80 px-3 py-1.5 rounded-lg border border-amber-200">
                  ⏳ Ticket registered. Awaiting Mandi Center Admin review and resolution.
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
