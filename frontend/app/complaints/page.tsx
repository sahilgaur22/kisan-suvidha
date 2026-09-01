"use client";

import Link from "next/link";
import { ArrowLeft, AlertCircle } from "lucide-react";
import ComplaintForm from "../../components/complaints/ComplaintForm";

export default function FarmerComplaintsPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 flex flex-col justify-between">
      <div>
        <header className="max-w-4xl mx-auto w-full flex items-center justify-between py-4 border-b border-slate-800/80 mb-6">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="bg-amber-500 p-2 rounded-xl text-slate-950">
                <AlertCircle className="w-5 h-5" />
              </div>
              <h1 className="text-lg font-bold text-white">Farmer Grievance Portal</h1>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto w-full">
          <ComplaintForm />
        </main>
      </div>

      <footer className="text-center text-xs text-slate-600 pt-8 pb-4 max-w-4xl mx-auto w-full border-t border-slate-900">
        Ministry of Consumer Affairs | SIH Problem Statement 26032 Grievance Cell
      </footer>
    </div>
  );
}
