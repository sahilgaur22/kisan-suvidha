import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../lib/api-client";

export interface ComplaintRecord {
  id: string;
  ticket_number: string;
  farmer_id: string;
  center_id: string;
  booking_id: string | null;
  category: string;
  subject: string;
  description: string;
  status: "open" | "in_progress" | "resolved" | "rejected";
  resolution_notes: string | null;
  created_at: string;
}

export interface ComplaintCreatePayload {
  center_id: string;
  category: "delay_in_weighing" | "msp_discrepancy" | "staff_behavior" | "payment_issue" | "general";
  subject: string;
  description: string;
  booking_id?: string;
}

export function useCenterComplaints(centerId: string | null) {
  return useQuery<ComplaintRecord[]>({
    queryKey: ["center-complaints", centerId],
    queryFn: () => apiClient<ComplaintRecord[]>(`/complaints/center/${centerId}`),
    enabled: !!centerId,
  });
}

export function useCreateComplaint() {
  const queryClient = useQueryClient();

  return useMutation<ComplaintRecord, Error, ComplaintCreatePayload>({
    mutationFn: (payload: ComplaintCreatePayload) =>
      apiClient<ComplaintRecord>("/complaints", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["center-complaints"] });
    },
  });
}

export function useResolveComplaint() {
  const queryClient = useQueryClient();

  return useMutation<
    ComplaintRecord,
    Error,
    { complaintId: string; status: "resolved" | "rejected"; resolution_notes: string }
  >({
    mutationFn: ({ complaintId, status, resolution_notes }) =>
      apiClient<ComplaintRecord>(`/complaints/${complaintId}/resolve`, {
        method: "PATCH",
        body: JSON.stringify({ status, resolution_notes }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["center-complaints"] });
    },
  });
}
