import { create } from "zustand";

export interface BookingToken {
  id: string;
  tokenNumber: string;
  farmerName: string;
  farmerPhone: string;
  cropName: string;
  cropVolumeQuintals: number;
  actualWeightQuintals?: number | null;
  moistureContentPercent?: number | null;
  adjustedWeightQuintals?: number | null;
  vehicleType: string;
  bookingDate: string;
  slotStartTime: string;
  slotEndTime: string;
  status: "scheduled" | "checked_in" | "in_progress" | "completed" | "cancelled" | "no_show" | "rejected";
}

interface QueueState {
  centerId: string | null;
  tokens: BookingToken[];
  connectionStatus: "connected" | "disconnected" | "reconnecting";
  setCenterId: (centerId: string) => void;
  setTokens: (tokens: BookingToken[]) => void;
  upsertToken: (token: BookingToken) => void;
  setConnectionStatus: (status: "connected" | "disconnected" | "reconnecting") => void;
}

export const useQueueStore = create<QueueState>((set) => ({
  centerId: null,
  tokens: [],
  connectionStatus: "disconnected",
  setCenterId: (centerId) => set({ centerId }),
  setTokens: (tokens) => set({ tokens }),
  upsertToken: (newToken) =>
    set((state) => {
      const exists = state.tokens.some((t) => t.id === newToken.id);
      let updatedTokens: BookingToken[];
      if (exists) {
        updatedTokens = state.tokens.map((t) => (t.id === newToken.id ? newToken : t));
      } else {
        updatedTokens = [...state.tokens, newToken];
      }
      // Sort strictly by slotStartTime
      updatedTokens.sort((a, b) => a.slotStartTime.localeCompare(b.slotStartTime));
      return { tokens: updatedTokens };
    }),
  setConnectionStatus: (connectionStatus) => set({ connectionStatus }),
}));
