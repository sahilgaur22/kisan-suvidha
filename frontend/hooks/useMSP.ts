import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../lib/api-client";

export interface MSPRecord {
  id: string;
  crop_name: string;
  rate_per_quintal: number;
  center_id: string | null;
  effective_date: string;
  updated_at: string;
}

export interface MSPUpdatePayload {
  crop_name: string;
  rate_per_quintal: number;
  center_id?: string;
}

export function useMSPRates(centerId?: string) {
  return useQuery<MSPRecord[]>({
    queryKey: ["msp-rates", centerId],
    queryFn: () => apiClient<MSPRecord[]>(`/msp${centerId ? `?center_id=${centerId}` : ""}`),
  });
}

export function useUpdateMSPRate() {
  const queryClient = useQueryClient();

  return useMutation<MSPRecord, Error, MSPUpdatePayload>({
    mutationFn: (payload: MSPUpdatePayload) =>
      apiClient<MSPRecord>("/msp", {
        method: "POST",
        body: JSON.stringify({
          crop_name: payload.crop_name,
          rate_per_quintal: payload.rate_per_quintal,
          center_id: payload.center_id,
        }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["msp-rates"] });
    },
  });
}
