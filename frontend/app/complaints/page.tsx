"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, AlertCircle, Calendar, LogOut } from "lucide-react";
import ComplaintForm from "../../components/complaints/ComplaintForm";
import ProtectedRoute from "../../components/auth/ProtectedRoute";
import LanguageSwitcher from "../../components/LanguageSwitcher";
import { useAuthStore } from "../../store/authStore";

export default function FarmerComplaintsPage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <ProtectedRoute allowedRoles={["farmer", "staff", "center_admin"]}>
      <div className="min-h-screen bg-[#F8FAFC] text-slate-900 p-6 flex flex-col justify-between">
        <div>
          <header className="max-w-4xl mx-auto w-full flex items-center justify-between py-4 border-b-2 border-[#BAC8B1] mb-6">
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="p-2 rounded-xl bg-white border-2 border-[#BAC8B1] hover:border-[#7B9669] text-[#404E3B] transition-all shadow-sm"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center gap-2">
                <div className="bg-[#7B9669] p-2 rounded-xl text-white shadow">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <h1 className="text-xl font-black text-[#404E3B]">Farmer Grievance Portal</h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <nav className="flex items-center gap-2 bg-white p-1 rounded-xl border border-[#BAC8B1] text-xs font-bold">
                <Link
                  href="/book-slot"
                  className="px-3 py-1.5 text-[#404E3B] hover:bg-[#BAC8B1]/30 rounded-lg flex items-center gap-1.5 transition-all"
                >
                  <Calendar className="w-3.5 h-3.5" /> Book Slot
                </Link>
                <Link
                  href="/complaints"
                  className="px-3 py-1.5 bg-[#404E3B] text-white rounded-lg flex items-center gap-1.5 shadow-sm"
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

          <main className="max-w-4xl mx-auto w-full">
            <ComplaintForm />
          </main>
        </div>

        <footer className="text-center text-xs text-[#6C8480] font-semibold pt-8 pb-4 max-w-4xl mx-auto w-full border-t border-[#BAC8B1]">
          Department of Food & Public Distribution | Government of India
        </footer>
      </div>
    </ProtectedRoute>
  );
}
