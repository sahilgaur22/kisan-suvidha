"use client";

import React from "react";
import { CheckCircle2, Clock, Sprout, AlertCircle, RefreshCw, Send, Radio } from "lucide-react";

export type StatusBadgeType =
  | "serving_now"
  | "in_progress"
  | "in_queue"
  | "scheduled"
  | "checked_in"
  | "completed"
  | "procured"
  | "paid"
  | "dbt_sent"
  | "processing"
  | "cancelled"
  | "skipped"
  | "rejected"
  | "offline_syncing";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export default function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const norm = (status || "").toLowerCase().trim();

  switch (norm) {
    case "serving_now":
    case "in_progress":
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold shadow-sm ${className}`}
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
          </span>
          Serving Now (बारी चालू है)
        </span>
      );

    case "in_queue":
    case "scheduled":
    case "checked_in":
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold shadow-sm ${className}`}
        >
          <Clock className="w-3.5 h-3.5 text-amber-700" />
          {norm === "checked_in" ? "Mandi Gate Checked In" : "In Queue (प्रतीक्षा में)"}
        </span>
      );

    case "completed":
    case "procured":
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-100 border border-blue-300 text-blue-900 text-xs font-bold shadow-sm ${className}`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-blue-700" />
          Completed / Procured
        </span>
      );

    case "paid":
    case "dbt_sent":
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 border border-emerald-400 text-emerald-900 text-xs font-bold shadow-sm ${className}`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
          Paid / DBT Direct Sent
        </span>
      );

    case "processing":
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-100 border border-indigo-300 text-indigo-900 text-xs font-bold shadow-sm ${className}`}
        >
          <RefreshCw className="w-3.5 h-3.5 text-indigo-700 animate-spin" />
          Processing (प्रक्रियाधीन)
        </span>
      );

    case "cancelled":
    case "skipped":
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-100 border border-rose-300 text-rose-900 text-xs font-bold shadow-sm ${className}`}
        >
          <AlertCircle className="w-3.5 h-3.5 text-rose-700" />
          Cancelled / Skipped
        </span>
      );

    case "rejected":
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-100 border border-rose-300 text-rose-900 text-xs font-bold shadow-sm ${className}`}
        >
          <AlertCircle className="w-3.5 h-3.5 text-rose-700" />
          Lot Rejected (High Moisture)
        </span>
      );

    case "offline_syncing":
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-100 border border-purple-300 text-purple-900 text-xs font-bold shadow-sm ${className}`}
        >
          <RefreshCw className="w-3.5 h-3.5 text-purple-700 animate-spin" />
          Offline Syncing
        </span>
      );

    default:
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold shadow-sm ${className}`}
        >
          <Clock className="w-3.5 h-3.5 text-amber-700" />
          In Queue (प्रतीक्षा में)
        </span>
      );
  }
}
