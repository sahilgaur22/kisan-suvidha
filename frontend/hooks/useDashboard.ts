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

export function useDashboardStats(
  centerId: string | null,
  targetDate?: string | null,
  allTime?: boolean
) {
  return useQuery<DashboardStats>({
    queryKey: ["dashboard-stats", centerId, targetDate, allTime],
    queryFn: () => {
      const params = new URLSearchParams();
      if (centerId) params.append("center_id", centerId);
      if (allTime) params.append("all_time", "true");
      else if (targetDate) params.append("target_date", targetDate);
      return apiClient<DashboardStats>(`/dashboard/stats?${params.toString()}`);
    },
    enabled: !!centerId,
    refetchInterval: 10000, // Refetch stats every 10s
  });
}
