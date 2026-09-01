"use client";

import { BookingToken } from "../../store/queueStore";
import TokenCard from "./TokenCard";

interface QueueTableProps {
  tokens: BookingToken[];
  onRefresh?: () => void;
}

export default function QueueTable({ tokens, onRefresh }: QueueTableProps) {
  // CRITICAL: Order strictly by (bookingDate, slotStartTime), NEVER by created_at or id
  const sortedTokens = [...tokens].sort((a, b) => {
    const dateComp = a.bookingDate.localeCompare(b.bookingDate);
    if (dateComp !== 0) return dateComp;
    return a.slotStartTime.localeCompare(b.slotStartTime);
  });

  if (sortedTokens.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-400 my-6">
        <p className="text-sm font-semibold text-slate-300">No active procurement tokens in queue for this date.</p>
        <p className="text-xs text-slate-500 mt-1">Tokens will appear here live when farmers make bookings or check in.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 my-6">
      {sortedTokens.map((token) => (
        <TokenCard key={token.id} token={token} onStatusUpdate={onRefresh} />
      ))}
    </div>
  );
}
