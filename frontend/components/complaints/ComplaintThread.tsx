"use client";

import { useState } from "react";
import { ComplaintRecord, useResolveComplaint } from "../../hooks/useComplaints";
import { AlertCircle, CheckCircle2, XCircle, Clock } from "lucide-react";

interface ComplaintThreadProps {
  complaint: ComplaintRecord;
  isAdmin?: boolean;
}

export default function ComplaintThread({ complaint, isAdmin = false }: ComplaintThreadProps) {
  const resolveMutation = useResolveComplaint();
  const [notes, setNotes] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleResolve = (status: "resolved" | "rejected") => {
    setErrorMsg(null);
    if (!notes.trim() || notes.trim().length < 5) {
      setErrorMsg("Please enter at least 5 characters for resolution notes before updating ticket.");
      return;
    }
    resolveMutation.mutate(
      {
        complaintId: complaint.id,
        status,
        resolution_notes: notes.trim(),
      },
      {
        onError: (err: any) => {
          setErrorMsg(err.message || "Failed to update complaint resolution status.");
        },
      }
    );
  };

  const getStatusBadge = () => {
    switch (complaint.status) {
      case "resolved":
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 border border-emerald-600/40 text-emerald-300 text-xs font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Resolved
          </span>
        );
      case "rejected":
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-rose-950 border border-rose-600/40 text-rose-300 text-xs font-bold flex items-center gap-1">
            <XCircle className="w-3 h-3" /> Closed
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-amber-950 border border-amber-600/40 text-amber-300 text-xs font-bold flex items-center gap-1">
            <Clock className="w-3 h-3" /> Open
          </span>
        );
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3">
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs text-amber-400 font-bold tracking-wider">
          {complaint.ticket_number}
        </span>
        {getStatusBadge()}
      </div>

      <div>
        <h4 className="text-sm font-bold text-white mb-1">{complaint.subject}</h4>
        <p className="text-xs text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800/80">
          {complaint.description}
        </p>
      </div>

      {errorMsg && (
        <div className="p-2.5 bg-rose-950/80 border border-rose-600/60 rounded-xl text-xs text-rose-200 font-semibold">
          {errorMsg}
        </div>
      )}

      {complaint.resolution_notes && (
        <div className="p-3 bg-emerald-950/40 border border-emerald-800/50 rounded-xl text-xs text-emerald-300">
          <span className="font-bold text-emerald-400 block mb-1">Admin Resolution Note:</span>
          {complaint.resolution_notes}
        </div>
      )}

      {isAdmin && complaint.status === "open" && (
        <div className="pt-2 space-y-2 border-t border-slate-800">
          <textarea
            rows={2}
            placeholder="Type official resolution notes for farmer (min 5 characters)..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
          />
          <div className="flex items-center gap-2 justify-end">
            <button
              type="button"
              onClick={() => handleResolve("rejected")}
              disabled={resolveMutation.isPending}
              className="px-3 py-1.5 bg-rose-950 border border-rose-800 text-rose-300 rounded-lg text-xs font-semibold hover:bg-rose-900"
            >
              {resolveMutation.isPending ? "Updating..." : "Reject Ticket"}
            </button>
            <button
              type="button"
              onClick={() => handleResolve("resolved")}
              disabled={resolveMutation.isPending}
              className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg text-xs font-bold shadow-md shadow-emerald-500/20"
            >
              {resolveMutation.isPending ? "Updating..." : "Resolve Ticket"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
