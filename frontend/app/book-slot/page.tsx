"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Sprout, AlertCircle, LogOut, Calendar } from "lucide-react";
import SlotBookingForm from "../../components/booking/SlotBookingForm";
import FarmerBookingHistory from "../../components/booking/FarmerBookingHistory";
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
      <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col justify-between p-6">
        <header className="max-w-4xl mx-auto w-full flex items-center justify-between py-4 border-b-2 border-[#BAC8B1] mb-8">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 rounded-xl bg-white border-2 border-[#BAC8B1] hover:border-[#7B9669] text-[#404E3B] transition-all shadow-sm"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="bg-[#7B9669] p-1.5 rounded-lg text-white shadow">
                <Sprout className="w-5 h-5" />
              </div>
              <h1 className="text-xl font-black text-[#404E3B]">Kisan Suvidha</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <nav className="flex items-center gap-2 bg-white p-1 rounded-xl border border-[#BAC8B1] text-xs font-bold">
              <Link
                href="/book-slot"
                className="px-3 py-1.5 bg-[#404E3B] text-white rounded-lg flex items-center gap-1.5 shadow-sm"
              >
                <Calendar className="w-3.5 h-3.5" /> Book Slot
              </Link>
              <Link
                href="/complaints"
                className="px-3 py-1.5 text-[#404E3B] hover:bg-[#BAC8B1]/30 rounded-lg flex items-center gap-1.5 transition-all"
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
          <SlotBookingForm />
          <FarmerBookingHistory />
        </main>

        <footer className="text-center text-xs text-[#6C8480] font-semibold pt-8 pb-4">
          Ministry of Consumer Affairs, Food & Public Distribution | Government of India
        </footer>
      </div>
    </ProtectedRoute>
  );
}
