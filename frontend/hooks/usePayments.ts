import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../lib/api-client";

export interface PaymentAuditRecord {
  id: string;
  booking_id: string;
  center_id: string;
  amount: number;
  msp_rate_applied: number;
  payment_status: string;
  transaction_ref: string | null;
  created_at: string;
}

export function usePaymentAudit(centerId: string | null) {
  return useQuery<PaymentAuditRecord[]>({
    queryKey: ["payment-audit", centerId],
    queryFn: () => apiClient<PaymentAuditRecord[]>(`/payments/audit?center_id=${centerId}`),
    enabled: !!centerId,
  });
}
