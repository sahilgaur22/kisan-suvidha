"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Users, UserPlus } from "lucide-react";
import ProtectedRoute from "../../../components/auth/ProtectedRoute";
import StaffTable from "../../../components/admin/StaffTable";
import StaffFormModal from "../../../components/admin/StaffFormModal";
import { useAuthStore } from "../../../store/authStore";
import { useCenterStaff } from "../../../hooks/useStaff";

export default function AdminStaffManagementPage() {
  const { user } = useAuthStore();
  const centerId = user?.centerId || "11111111-1111-1111-1111-111111111111";

  const { data: staffList, isLoading } = useCenterStaff(centerId);
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <ProtectedRoute allowedRoles={["center_admin", "super_admin"]}>
      <div className="min-h-screen bg-slate-950 text-slate-100 p-6 flex flex-col justify-between">
        <div>
          <header className="max-w-6xl mx-auto w-full flex items-center justify-between py-4 border-b border-slate-800/80 mb-6">
            <div className="flex items-center gap-3">
              <Link
                href="/admin/dashboard"
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-all"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center gap-2">
                <div className="bg-emerald-500 p-2 rounded-xl text-slate-950">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-white">Center Staff Management</h1>
                  <p className="text-xs text-emerald-400">Center ({centerId})</p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-lg shadow-emerald-500/20"
            >
              <UserPlus className="w-4 h-4" /> Add New Staff
            </button>
          </header>

          <main className="max-w-6xl mx-auto w-full">
            <StaffTable staffList={staffList} isLoading={isLoading} />
          </main>

          <StaffFormModal
            centerId={centerId}
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
          />
        </div>

        <footer className="text-center text-xs text-slate-600 pt-8 pb-4 max-w-6xl mx-auto w-full border-t border-slate-900">
          Ministry of Consumer Affairs | SIH Problem Statement 26032 Staff Control
        </footer>
      </div>
    </ProtectedRoute>
  );
}
