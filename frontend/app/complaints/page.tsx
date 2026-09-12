"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, AlertCircle, Calendar, LogOut } from "lucide-react";
import ComplaintForm from "../../components/complaints/ComplaintForm";
import FarmerComplaintsLog from "../../components/complaints/FarmerComplaintsLog";
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
      <div className="min-h-screen bg-slate-50 text-slate-900 p-6 flex flex-col justify-between">
        <div>
          <header className="max-w-4xl mx-auto w-full flex items-center justify-between py-4 border-b border-slate-200 mb-6">
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="p-2 rounded-xl bg-white border border-slate-200 hover:border-kisan-600 text-kisan-800 transition-all shadow-sm"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center gap-2">
                <div className="bg-gradient-to-tr from-amber-400 to-kisan-400 p-2 rounded-xl text-kisan-950 shadow">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-xl font-black text-kisan-900">Farmer Grievance Portal</h1>
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
                  className="px-3 py-1.5 text-slate-700 hover:bg-slate-100 rounded-lg flex items-center gap-1.5 transition-all"
                >
                  <Calendar className="w-3.5 h-3.5" /> Book Slot
                </Link>
                <Link
                  href="/complaints"
                  className="px-3 py-1.5 bg-kisan-700 text-white rounded-lg flex items-center gap-1.5 shadow-sm"
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
            <ComplaintForm />
            <FarmerComplaintsLog />
          </main>
        </div>

        <footer className="text-center text-xs text-slate-500 font-semibold pt-8 pb-4 max-w-4xl mx-auto w-full border-t border-slate-200">
          Department of Food & Public Distribution | Government of India
        </footer>
      </div>
    </ProtectedRoute>
  );
}
