"use client";

import { useState } from "react";
import { Sprout, IndianRupee, Save, CheckCircle2, ShieldAlert } from "lucide-react";
import { useMSPRates, useUpdateMSPRate } from "../../hooks/useMSP";

interface MSPEditorProps {
  centerId: string;
}

export default function MSPEditor({ centerId }: MSPEditorProps) {
  const { data: mspRates, isLoading } = useMSPRates(centerId);
  const updateMspMutation = useUpdateMSPRate();

  const [selectedCrop, setSelectedCrop] = useState("Paddy (Dhan)");
  const [newRate, setNewRate] = useState("2300");

  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);

    updateMspMutation.mutate(
      {
        crop_name: selectedCrop,
        rate_per_quintal: parseFloat(newRate),
        center_id: centerId,
      },
      {
        onSuccess: () => {
          setSuccessMsg(`MSP Rate for ${selectedCrop} updated to ₹${newRate}/Qtl! Broadcast sent to live dashboards.`);
        },
        onError: (err: any) => {
          setErrorMsg(err.message || "Failed to update MSP rate.");
        },
      }
    );
  };

  return (
    <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl space-y-6 max-w-xl mx-auto my-6">
      <div className="flex items-center gap-3">
        <div className="bg-emerald-500 p-2.5 rounded-2xl text-slate-950">
          <Sprout className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">Live MSP Rate Management</h2>
          <p className="text-xs text-emerald-400">Updates trigger WebSocket broadcasts to farmers & dashboards</p>
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

      {/* Existing Rates Display */}
      <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-2">
        <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Current MSP Table</span>
        {isLoading ? (
          <p className="text-xs text-slate-500">Loading live MSP table...</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 pt-1">
            {mspRates?.map((r) => (
              <div key={r.id} className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
                <span className="text-xs font-semibold text-white">{r.crop_name}</span>
                <span className="text-xs font-bold text-emerald-400">₹{r.rate_per_quintal}/Qtl</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <form onSubmit={handleUpdate} className="space-y-4 pt-2">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">Select Crop</label>
          <select
            value={selectedCrop}
            onChange={(e) => setSelectedCrop(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="Paddy (Dhan)">Paddy (Dhan)</option>
            <option value="Wheat (Gehun)">Wheat (Gehun)</option>
            <option value="Maize (Makka)">Maize (Makka)</option>
            <option value="Mustard (Sarson)">Mustard (Sarson)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">New MSP Rate (₹ per Quintal)</label>
          <div className="relative">
            <IndianRupee className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
            <input
              type="number"
              step="0.01"
              required
              value={newRate}
              onChange={(e) => setNewRate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-emerald-500 font-bold"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={updateMspMutation.isPending}
          className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-xl shadow-emerald-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" /> {updateMspMutation.isPending ? "Broadcasting Update..." : "Update MSP Rate & Broadcast"}
        </button>
      </form>
    </div>
  );
}
