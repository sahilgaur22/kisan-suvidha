"use client";

import { useState } from "react";
import { AlertCircle, Send, CheckCircle2, ShieldAlert, Building2 } from "lucide-react";
import { useCreateComplaint } from "../../hooks/useComplaints";
import { useProcurementCenters } from "../../hooks/useBookings";

export default function ComplaintForm() {
  const { data: centers } = useProcurementCenters();
  const createComplaintMutation = useCreateComplaint();

  const [centerId, setCenterId] = useState("");
  const [category, setCategory] = useState<"delay_in_weighing" | "msp_discrepancy" | "staff_behavior" | "payment_issue" | "general">("delay_in_weighing");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");

  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);

    if (!centerId) {
      setErrorMsg("Please select the procurement center.");
      return;
    }

    createComplaintMutation.mutate(
      {
        center_id: centerId,
        category,
        subject,
        description,
      },
      {
        onSuccess: (data) => {
          setSuccessMsg(`Grievance ticket created! Ticket #: ${data.ticket_number}`);
          setSubject("");
          setDescription("");
        },
        onError: (err: any) => {
          setErrorMsg(err.message || "Failed to submit grievance complaint.");
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl space-y-5 max-w-xl mx-auto my-6">
      <div className="flex items-center gap-3">
        <div className="bg-amber-500/20 border border-amber-500/40 p-2.5 rounded-2xl text-amber-400">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Farmer Grievance Redressal</h2>
          <p className="text-xs text-amber-400 font-medium">Direct Ticket Dispatch to Mandi Center Admin</p>
        </div>
      </div>

      {successMsg && (
        <div className="p-3.5 bg-emerald-950/80 border border-emerald-600/80 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 bg-rose-950/60 border border-rose-800/80 rounded-xl text-rose-300 text-xs flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" />
          {errorMsg}
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
          <Building2 className="w-4 h-4 text-emerald-400" />
          Select Procurement Center
        </label>
        <select
          value={centerId}
          onChange={(e) => setCenterId(e.target.value)}
          required
          className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-emerald-500"
        >
          <option value="">-- Choose Procurement Center --</option>
          {centers?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} ({c.code})
            </option>
          ))}
          {!centers && (
            <option value="11111111-1111-1111-1111-111111111111">
              Bhopal Main Procurement Mandi (MP-CTR-014)
            </option>
          )}
        </select>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-1.5">Category</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as any)}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-emerald-500"
        >
          <option value="delay_in_weighing">Delay in Weighing / Slot Gate Entry</option>
          <option value="msp_discrepancy">MSP Payout Discrepancy</option>
          <option value="staff_behavior">Mandi Staff Misbehavior</option>
          <option value="payment_issue">Bank Receipt / Payment Processing Issue</option>
          <option value="general">General Feedback / Grievance</option>
        </select>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-1.5">Subject</label>
        <input
          type="text"
          required
          placeholder="Brief summary of issue"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-emerald-500"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-1.5">Detailed Description</label>
        <textarea
          rows={3}
          required
          placeholder="Provide exact details regarding token slot, date, or staff interaction..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-emerald-500"
        />
      </div>

      <button
        type="submit"
        disabled={createComplaintMutation.isPending}
        className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 flex items-center justify-center gap-1.5"
      >
        <Send className="w-4 h-4" /> {createComplaintMutation.isPending ? "Submitting Ticket..." : "Submit Grievance Ticket"}
      </button>
    </form>
  );
}
