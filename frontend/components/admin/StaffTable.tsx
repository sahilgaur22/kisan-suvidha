"use client";

import { StaffUser, useToggleStaffStatus } from "../../hooks/useStaff";
import { Users, UserX, UserCheck } from "lucide-react";

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
        <p className="text-sm font-semibold text-slate-300">No ground staff accounts created yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden my-6 shadow-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider">
            <tr>
              <th className="py-3.5 px-4">Staff Name</th>
              <th className="py-3.5 px-4">Phone Number</th>
              <th className="py-3.5 px-4">Role</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {staffList.map((staff) => (
              <tr key={staff.id} className="hover:bg-slate-800/40 transition-all">
                <td className="py-3.5 px-4 font-bold text-white">{staff.full_name}</td>
                <td className="py-3.5 px-4 text-slate-300">{staff.phone}</td>
                <td className="py-3.5 px-4 font-mono uppercase text-emerald-400 font-bold">{staff.role}</td>
                <td className="py-3.5 px-4">
                  {staff.is_active ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-950 border border-emerald-600/40 text-emerald-300 font-bold text-[11px]">
                      <UserCheck className="w-3 h-3" /> Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-950 border border-rose-600/40 text-rose-300 font-bold text-[11px]">
                      <UserX className="w-3 h-3" /> Deactivated
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
                    className={`px-3 py-1 rounded-lg font-semibold text-xs transition-all ${
                      staff.is_active
                        ? "bg-rose-950 border border-rose-800 text-rose-300 hover:bg-rose-900"
                        : "bg-emerald-950 border border-emerald-800 text-emerald-300 hover:bg-emerald-900"
                    }`}
                  >
                    {staff.is_active ? "Deactivate" : "Reactivate"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
