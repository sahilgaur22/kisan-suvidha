import { useQuery, useMutation } from "@tanstack/react-query";
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

export function useProcurementCenters() {
  return useQuery<ProcurementCenter[]>({
    queryKey: ["procurement-centers"],
    queryFn: () => apiClient<ProcurementCenter[]>("/centers"),
  });
}

export function useCreateBooking() {
  return useMutation<BookingConfirmation, Error, BookingPayload>({
    mutationFn: (payload: BookingPayload) =>
      apiClient<BookingConfirmation>("/bookings", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
  });
}
