"use client";

import { Wifi, WifiOff, RefreshCw } from "lucide-react";

interface LiveQueueBadgeProps {
  status: "connected" | "disconnected" | "reconnecting";
}

export default function LiveQueueBadge({ status }: LiveQueueBadgeProps) {
  if (status === "connected") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950 border border-emerald-600/50 text-emerald-300 text-xs font-semibold">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <Wifi className="w-3.5 h-3.5 text-emerald-400" /> Live Queue Connected
      </span>
    );
  }

  if (status === "reconnecting") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950 border border-amber-600/50 text-amber-300 text-xs font-semibold">
        <RefreshCw className="w-3.5 h-3.5 text-amber-400 animate-spin" /> Reconnecting...
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-950 border border-rose-600/50 text-rose-300 text-xs font-semibold">
      <WifiOff className="w-3.5 h-3.5 text-rose-400" /> Offline Mode
    </span>
  );
}
