"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Sprout, AlertCircle, LogOut, Calendar, User, Phone, ShieldCheck, CheckCircle2 } from "lucide-react";
import SlotBookingForm from "../../components/booking/SlotBookingForm";
import FarmerBookingHistory from "../../components/booking/FarmerBookingHistory";
import FarmerComplaintsLog from "../../components/complaints/FarmerComplaintsLog";
import LanguageSwitcher from "../../components/LanguageSwitcher";
import ProtectedRoute from "../../components/auth/ProtectedRoute";
import { useUIStore } from "../../store/uiStore";
import { useAuthStore } from "../../store/authStore";

export default function BookSlotPage() {
  const router = useRouter();
  const { language } = useUIStore();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <ProtectedRoute allowedRoles={["farmer", "staff", "center_admin"]}>
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between p-6">
        <header className="max-w-4xl mx-auto w-full flex items-center justify-between py-4 border-b border-slate-200 mb-8">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 rounded-xl bg-white border border-slate-200 hover:border-kisan-600 text-kisan-800 transition-all shadow-sm"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-tr from-amber-400 to-kisan-400 p-1.5 rounded-lg text-kisan-950 shadow">
                <Sprout className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-black text-kisan-900">Kisan Suvidha</h1>
                {user && (
                  <p className="text-xs text-slate-500 font-bold">
                    {user.fullName} {user.phone ? `(${user.phone})` : ""}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <nav className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200 text-xs font-bold">
              <Link
                href="/book-slot"
                className="px-3 py-1.5 bg-kisan-700 text-white rounded-lg flex items-center gap-1.5 shadow-sm"
              >
                <Calendar className="w-3.5 h-3.5" /> Book Slot
              </Link>
              <Link
                href="/complaints"
                className="px-3 py-1.5 text-slate-700 hover:bg-slate-100 rounded-lg flex items-center gap-1.5 transition-all"
              >
                <AlertCircle className="w-3.5 h-3.5" /> Complaints
              </Link>
            </nav>

            <LanguageSwitcher />

            {user && (
              <button
                type="button"
                onClick={handleLogout}
                className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
                title="Logout Account"
              >
                <LogOut className="w-3.5 h-3.5" /> Logout
              </button>
            )}
          </div>
        </header>

        <main className="max-w-4xl mx-auto w-full space-y-6">
          {/* Logged in Farmer Profile & Details Card */}
          {user && (
            <div className="bg-gradient-to-r from-kisan-900 via-kisan-800 to-kisan-950 text-white p-5 rounded-3xl border-2 border-kisan-700/60 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="p-3 bg-gradient-to-tr from-amber-400 to-kisan-400 text-slate-900 rounded-2xl shadow-md shrink-0">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-lg font-black text-white">{user.fullName || "Farmer"}</h2>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-bold">
                      <ShieldCheck className="w-3 h-3" /> Registered Farmer
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-kisan-200 mt-1 flex-wrap font-medium">
                    {user.phone && (
                      <span className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-amber-400" /> +91 {user.phone}
                      </span>
                    )}
                    {user.id && (
                      <span className="flex items-center gap-1 font-mono text-[11px] bg-black/30 px-2 py-0.5 rounded-lg border border-kisan-700/50 text-kisan-300">
                        Farmer ID: {user.id.slice(0, 8)}...{user.id.slice(-4)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Active Session
                </span>
              </div>
            </div>
          )}

          <SlotBookingForm />
          <FarmerBookingHistory />
          <FarmerComplaintsLog />
        </main>

        <footer className="text-center text-xs text-slate-500 font-semibold pt-8 pb-4">
          Ministry of Consumer Affairs, Food & Public Distribution | Government of India
        </footer>
      </div>
    </ProtectedRoute>
  );
}
