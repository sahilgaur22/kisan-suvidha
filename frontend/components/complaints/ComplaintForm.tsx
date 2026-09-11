"use client";

import { useState } from "react";
import { AlertCircle, Send, CheckCircle2, ShieldAlert, Building2 } from "lucide-react";
import { useCreateComplaint } from "../../hooks/useComplaints";
import { useProcurementCenters } from "../../hooks/useBookings";

export default function ComplaintForm() {
  const { data: centers } = useProcurementCenters();
  const createComplaintMutation = useCreateComplaint();

  const [centerId, setCenterId] = useState("");
  const [category, setCategory] = useState<"delay" | "payment_dispute" | "weighment_issue" | "behavior" | "other">("delay");
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

    if (description.trim().length < 10) {
      setErrorMsg("Detailed description must be at least 10 characters long.");
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
    <form onSubmit={handleSubmit} className="bg-gradient-to-br from-kisan-900 via-kisan-800 to-kisan-950 text-white border-2 border-kisan-700 p-8 rounded-3xl shadow-2xl space-y-5 max-w-xl mx-auto my-6">
      <div className="flex items-center gap-3">
        <div className="bg-gradient-to-tr from-amber-400 to-kisan-400 text-slate-900 p-2.5 rounded-2xl shadow">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-black text-white">Farmer Grievance Redressal</h2>
          <p className="text-xs text-kisan-200 font-medium">Direct Ticket Dispatch to Mandi Center Admin</p>
        </div>
      </div>

      {successMsg && (
        <div className="p-3.5 bg-emerald-950/80 border border-emerald-600 rounded-xl text-emerald-200 text-xs flex items-center gap-2 font-bold">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 bg-rose-950/80 border border-rose-600 rounded-xl text-rose-100 text-xs flex items-center gap-2 font-bold">
          <ShieldAlert className="w-4 h-4 shrink-0 text-rose-300" />
          {errorMsg}
        </div>
      )}

      <div>
        <label className="block text-xs font-bold text-kisan-200 mb-1.5 flex items-center gap-1.5">
          <Building2 className="w-4 h-4 text-amber-400" />
          Select Procurement Center
        </label>
        <select
          value={centerId}
          onChange={(e) => setCenterId(e.target.value)}
          required
          className="w-full bg-kisan-950/90 border-2 border-kisan-700 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-kisan-400 font-semibold"
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
        <label className="block text-xs font-bold text-kisan-200 mb-1.5">Category</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as any)}
          className="w-full bg-kisan-950/90 border-2 border-kisan-700 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-kisan-400 font-semibold"
        >
          <option value="delay">Delay in Weighing / Slot Gate Entry</option>
          <option value="payment_dispute">MSP Payout / Payment Dispute</option>
          <option value="weighment_issue">Weighment / Scale Discrepancy</option>
          <option value="behavior">Mandi Staff Misbehavior</option>
          <option value="other">Other General Feedback / Grievance</option>
        </select>
      </div>

      <div>
        <label className="block text-xs font-bold text-kisan-200 mb-1.5">Subject</label>
        <input
          type="text"
          required
          placeholder="Brief summary of issue"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full bg-kisan-950/90 border-2 border-kisan-700 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-kisan-400 font-semibold"
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-kisan-200 mb-1.5">Detailed Description (Min. 10 characters)</label>
        <textarea
          rows={3}
          required
          minLength={10}
          placeholder="Provide exact details regarding token slot, date, or staff interaction (at least 10 characters)..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full bg-kisan-950/90 border-2 border-kisan-700 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-kisan-400 font-medium"
        />
      </div>

      <button
        type="submit"
        disabled={createComplaintMutation.isPending}
        className="w-full py-3 bg-kisan-700 hover:bg-kisan-600 text-white font-black rounded-xl text-xs transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-1.5"
      >
        <Send className="w-4 h-4" /> {createComplaintMutation.isPending ? "Submitting Ticket..." : "Submit Grievance Ticket"}
      </button>
    </form>
  );
}
