"use client";

import { Check } from "lucide-react";

interface SlotAvailabilityCalendarProps {
  selectedDate: string;
  onSelectDate: (dateStr: string) => void;
}

export default function SlotAvailabilityCalendar({
  selectedDate,
  onSelectDate,
}: SlotAvailabilityCalendarProps) {
  // Generate next 7 days dynamically
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      iso: d.toISOString().split("T")[0],
      dayName: d.toLocaleDateString("en-US", { weekday: "short" }),
      displayDate: d.toLocaleDateString("en-US", { day: "numeric", month: "short" }),
    };
  });

  return (
    <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 my-3">
      {dates.map((item) => {
        const isSelected = item.iso === selectedDate;
        return (
          <button
            key={item.iso}
            type="button"
            onClick={() => onSelectDate(item.iso)}
            className={`p-3 rounded-2xl border text-left transition-all relative flex flex-col justify-between ${
              isSelected
                ? "bg-[#7B9669] border-[#7B9669] text-[#404E3B] font-bold shadow-lg"
                : "bg-[#404E3B] border-[#6C8480]/50 text-[#E6E6E6] hover:border-[#7B9669]"
            }`}
          >
            <div>
              <span className={`text-[10px] uppercase block ${isSelected ? "text-[#404E3B]" : "text-[#BAC8B1]"}`}>
                {item.dayName}
              </span>
              <span className="text-xs font-extrabold block mt-0.5">{item.displayDate}</span>
            </div>

            {isSelected && (
              <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#404E3B] text-[#7B9669] flex items-center justify-center">
                <Check className="w-3 h-3 stroke-[3]" />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
