import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../lib/api-client";

export interface ProcurementCenter {
  id: string;
  name: string;
  code: string;
  district: string;
  state: string;
  capacity_per_day: number;
}

export interface BookingPayload {
  center_id: string;
  crop_name: string;
  crop_volume_quintals: number;
  vehicle_type: "tractor_trolley" | "small_pickup" | "heavy_truck" | "bullock_cart";
  booking_date: string;
  channel?: "web" | "whatsapp" | "sms";
}

export interface BookingConfirmation {
  id: string;
  token_number: string;
  booking_date: string;
  slot_start_time: string;
  slot_end_time: string;
  status: string;
}

export interface FarmerBookingRecord {
  id: string;
  token_number: string;
  farmer_id: string;
  farmer_name?: string | null;
  farmer_phone?: string | null;
  center_id: string;
  center_name?: string | null;
  center_address?: string | null;
  center_district?: string | null;
  center_state?: string | null;
  crop_name: string;
  crop_volume_quintals: number;
  actual_weight_quintals?: number | null;
  moisture_content_percent?: number | null;
  adjusted_weight_quintals?: number | null;
  vehicle_type: string;
  booking_date: string;
  slot_start_time: string;
  slot_end_time: string;
  status: string;
  channel: string;
  payment_amount?: number | null;
  msp_rate_applied?: number | null;
  transaction_ref?: string | null;
  payment_status?: string | null;
  created_at: string;
}

export function useProcurementCenters() {
  return useQuery<ProcurementCenter[]>({
    queryKey: ["procurement-centers"],
    queryFn: () => apiClient<ProcurementCenter[]>("/centers"),
  });
}

export function useMyBookings() {
  return useQuery<FarmerBookingRecord[]>({
    queryKey: ["my-bookings"],
    queryFn: () => apiClient<FarmerBookingRecord[]>("/bookings/my"),
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();
  return useMutation<BookingConfirmation, Error, BookingPayload>({
    mutationFn: (payload: BookingPayload) =>
      apiClient<BookingConfirmation>("/bookings", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-bookings"] });
    },
  });
}

export function useCenterBookings(
  centerId: string | null,
  bookingDate?: string | null,
  allStatuses: boolean = true
) {
  return useQuery<FarmerBookingRecord[]>({
    queryKey: ["center-bookings", centerId, bookingDate, allStatuses],
    queryFn: () => {
      const params = new URLSearchParams();
      if (bookingDate) params.append("booking_date", bookingDate);
      if (allStatuses) params.append("all_statuses", "true");
      const queryStr = params.toString() ? `?${params.toString()}` : "";
      return apiClient<FarmerBookingRecord[]>(`/bookings/queue/${centerId}${queryStr}`);
    },
    enabled: !!centerId,
    refetchInterval: 15000,
  });
}
