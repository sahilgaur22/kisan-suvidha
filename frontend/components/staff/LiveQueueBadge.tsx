"use client";

import { Wifi, WifiOff, RefreshCw } from "lucide-react";

interface LiveQueueBadgeProps {
  status: "connected" | "disconnected" | "reconnecting";
}

export default function LiveQueueBadge({ status }: LiveQueueBadgeProps) {
  if (status === "connected") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold shadow-sm">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
        </span>
        <Wifi className="w-3.5 h-3.5 text-emerald-700" /> Live Queue Connected
      </span>
    );
  }

  if (status === "reconnecting") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold shadow-sm">
        <RefreshCw className="w-3.5 h-3.5 text-amber-700 animate-spin" /> Reconnecting...
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 border border-rose-300 text-rose-900 text-xs font-bold shadow-sm">
      <WifiOff className="w-3.5 h-3.5 text-rose-700" /> Offline Mode
    </span>
  );
}
