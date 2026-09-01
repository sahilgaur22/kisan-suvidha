"use client";

import { useState } from "react";
import { Calendar as CalendarIcon, CheckCircle2 } from "lucide-react";

interface SlotAvailabilityCalendarProps {
  selectedDate: string;
  onSelectDate: (dateStr: string) => void;
}

export default function SlotAvailabilityCalendar({
  selectedDate,
  onSelectDate,
}: SlotAvailabilityCalendarProps) {
  // Generate next 7 available days
  const getNext7Days = () => {
    const days = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const isoDate = d.toISOString().split("T")[0];
      const formattedDate = d.toLocaleDateString("en-IN", {
        weekday: "short",
        day: "numeric",
        month: "short",
      });
      days.push({ isoDate, formattedDate });
    }
    return days;
  };

  const availableDays = getNext7Days();

  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold text-slate-300 flex items-center gap-1.5">
        <CalendarIcon className="w-4 h-4 text-emerald-400" />
        Select Booking Date (Next 7 Days)
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {availableDays.map((day) => {
          const isSelected = selectedDate === day.isoDate;
          return (
            <button
              key={day.isoDate}
              type="button"
              onClick={() => onSelectDate(day.isoDate)}
              className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                isSelected
                  ? "bg-emerald-600/30 border-emerald-500 text-white shadow-lg shadow-emerald-500/10"
                  : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className="text-xs font-bold uppercase tracking-wider">
                  {day.formattedDate.split(",")[0]}
                </span>
                {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
              </div>
              <span className="text-sm font-semibold text-white">
                {day.formattedDate.split(",")[1]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
