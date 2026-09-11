"use client";

import { StaffUser, useToggleStaffStatus } from "../../hooks/useStaff";
import { Users, UserX, UserCheck, ShieldAlert, CheckCircle2 } from "lucide-react";

interface StaffTableProps {
  staffList: StaffUser[] | undefined;
  isLoading: boolean;
}

export default function StaffTable({ staffList, isLoading }: StaffTableProps) {
  const toggleStatusMutation = useToggleStaffStatus();

  if (isLoading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400 animate-pulse my-6">
        Loading center staff members...
      </div>
    );
  }

  if (!staffList || staffList.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400 my-6">
        <Users className="w-8 h-8 text-slate-500 mx-auto mb-2" />
        <p className="text-sm font-semibold text-white">No ground staff accounts registered for this center yet.</p>
      </div>
    );
  }

  const pendingStaff = staffList.filter((s) => !s.is_active);
  const activeStaff = staffList.filter((s) => s.is_active);

  return (
    <div className="space-y-6 my-6">
      {/* Pending Approvals Callout Banner */}
      {pendingStaff.length > 0 && (
        <div className="p-4 bg-amber-950/60 border border-amber-600/50 rounded-2xl text-amber-200 text-xs flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2 font-bold">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
            <span>{pendingStaff.length} Ground Staff Account(s) Pending Admin Approval</span>
          </div>
          <span className="text-[11px] text-amber-300 font-semibold">Review & click "Approve Account" below</span>
        </div>
      )}

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-200">
            <thead className="bg-slate-950 text-slate-400 font-bold border-b border-slate-800 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Staff Name</th>
                <th className="py-3.5 px-4">Phone Number</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Approval Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {staffList.map((staff) => (
                <tr key={staff.id} className="hover:bg-slate-800/40 transition-all">
                  <td className="py-3.5 px-4 font-bold text-white">{staff.full_name}</td>
                  <td className="py-3.5 px-4 text-slate-300 font-semibold">{staff.phone}</td>
                  <td className="py-3.5 px-4 font-mono uppercase text-kisan-400 font-bold">{staff.role}</td>
                  <td className="py-3.5 px-4">
                    {staff.is_active ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-900 font-bold text-[11px]">
                        <UserCheck className="w-3 h-3 text-emerald-700" /> Active / Approved
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 border border-amber-300 text-amber-900 font-bold text-[11px]">
                        <ShieldAlert className="w-3 h-3 text-amber-700" /> Pending Admin Approval
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      type="button"
                      onClick={() =>
                        toggleStatusMutation.mutate({
                          staffId: staff.id,
                          isActive: !staff.is_active,
                        })
                      }
                      disabled={toggleStatusMutation.isPending}
                      className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all flex items-center justify-end gap-1.5 ml-auto ${
                        staff.is_active
                          ? "bg-rose-900/60 border border-rose-700 text-rose-200 hover:bg-rose-800"
                          : "bg-kisan-700 hover:bg-kisan-600 text-white shadow"
                      }`}
                    >
                      {staff.is_active ? (
                        <>
                          <UserX className="w-3.5 h-3.5" /> Deactivate
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" /> Approve Staff Account
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
