import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../lib/api-client";

export interface DashboardStats {
  center_id: string;
  total_bookings_today: number;
  checked_in_today: number;
  completed_today: number;
  no_shows_today: number;
  total_crop_procured_quintals: number;
  total_payments_disbursed_inr: number;
  open_complaints_count: number;
}

export function useDashboardStats(centerId: string | null) {
  return useQuery<DashboardStats>({
    queryKey: ["dashboard-stats", centerId],
    queryFn: () => apiClient<DashboardStats>(`/dashboard/stats?center_id=${centerId}`),
    enabled: !!centerId,
    refetchInterval: 10000, // Refetch stats every 10s
  });
}
