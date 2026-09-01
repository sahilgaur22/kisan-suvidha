import Link from "next/link";
import { Sprout, ShieldCheck, Clock, Users, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-gradient-to-b from-emerald-950 via-emerald-900 to-slate-900 text-white">
      {/* Header Navigation */}
      <header className="border-b border-emerald-800/50 bg-emerald-950/80 backdrop-blur sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500 p-2 rounded-xl text-slate-950">
            <Sprout className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">Kisan Suvidha</h1>
            <p className="text-xs text-emerald-300">Ministry of Consumer Affairs | SIH 26032</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="px-4 py-2 text-sm font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-lg shadow-emerald-600/30"
          >
            Portal Login
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-6 py-16 text-center flex flex-col items-center justify-center gap-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-800/40 border border-emerald-600/40 text-emerald-200 text-xs font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          Dynamic AI Queue Engine & Guaranteed MSP Token Allocation
        </div>

        <h2 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
          Eliminate Mill Mandi Queues with <span className="text-emerald-400">Smart Token Schedules</span>
        </h2>

        <p className="max-w-2xl text-base sm:text-lg text-emerald-100/80">
          Seamless procurement token booking for farmers via Web, WhatsApp, and SMS. Real-time dynamic slot recalculation, guaranteed MSP payouts, and zero data leakage.
        </p>

        <div className="flex flex-wrap justify-center gap-4 pt-4">
          <Link
            href="/book-slot"
            className="px-6 py-3.5 rounded-xl font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center gap-2 shadow-xl shadow-emerald-500/20 transition-all text-base"
          >
            Book Procurement Slot <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="/login"
            className="px-6 py-3.5 rounded-xl font-bold border border-emerald-700 hover:border-emerald-500 bg-emerald-900/30 hover:bg-emerald-800/40 text-white transition-all text-base"
          >
            Center Admin & Staff Portal
          </Link>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full pt-12 text-left">
          <div className="p-6 rounded-2xl bg-emerald-900/40 border border-emerald-800/50 backdrop-blur">
            <div className="p-3 bg-emerald-500/10 rounded-xl w-fit text-emerald-400 mb-4">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Dynamic Queue Engine</h3>
            <p className="text-sm text-emerald-200/70">
              Calculates exact arrival time windows based on vehicle capacity (Tractor, Trolley, Truck) and center processing rates.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-emerald-900/40 border border-emerald-800/50 backdrop-blur">
            <div className="p-3 bg-emerald-500/10 rounded-xl w-fit text-emerald-400 mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Omnichannel Access</h3>
            <p className="text-sm text-emerald-200/70">
              Book tokens instantly via Web Portal, WhatsApp Cloud API, or offline Twilio SMS commands.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-emerald-900/40 border border-emerald-800/50 backdrop-blur">
            <div className="p-3 bg-emerald-500/10 rounded-xl w-fit text-emerald-400 mb-4">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Role-Based RLS Security</h3>
            <p className="text-sm text-emerald-200/70">
              Center-scoped database Row Level Security ensuring 100% multi-tenant data isolation and audit trails.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-emerald-800/40 py-6 text-center text-xs text-emerald-400/60">
        © 2026 Kisan Suvidha — Smart India Hackathon Problem Statement 26032
      </footer>
    </div>
  );
}
