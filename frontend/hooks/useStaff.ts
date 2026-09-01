import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../lib/api-client";

export interface StaffUser {
  id: string;
  full_name: string;
  phone: string;
  role: string;
  center_id: string | null;
  is_active: boolean;
  created_at: string;
}

export interface StaffCreatePayload {
  full_name: string;
  phone: string;
  password: string;
  center_id?: string;
}

export function useCenterStaff(centerId: string | null) {
  return useQuery<StaffUser[]>({
    queryKey: ["center-staff", centerId],
    queryFn: () => apiClient<StaffUser[]>(`/staff/center/${centerId}`),
    enabled: !!centerId,
  });
}

export function useCreateStaff() {
  const queryClient = useQueryClient();

  return useMutation<StaffUser, Error, StaffCreatePayload>({
    mutationFn: (payload: StaffCreatePayload) =>
      apiClient<StaffUser>("/staff", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["center-staff"] });
    },
  });
}

export function useToggleStaffStatus() {
  const queryClient = useQueryClient();

  return useMutation<StaffUser, Error, { staffId: string; isActive: boolean }>({
    mutationFn: ({ staffId, isActive }) =>
      apiClient<StaffUser>(`/staff/${staffId}/deactivate`, {
        method: "PATCH",
        body: JSON.stringify({ is_active: isActive }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["center-staff"] });
    },
  });
}
