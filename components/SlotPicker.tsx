"use client";

import { SLOTS, SlotTime } from "@/lib/slots";

interface SlotInfo {
  time: string;
  available: boolean;
}

interface SlotPickerProps {
  slots: SlotInfo[];
  selected: SlotTime | null;
  onSelect: (time: SlotTime) => void;
  loading: boolean;
}

const SLOT_LABELS: Record<string, string> = {
  "11:00": "11:00 AM",
  "12:00": "12:00 PM",
  "13:00": "1:00 PM",
  "14:00": "2:00 PM",
};

export default function SlotPicker({
  slots,
  selected,
  onSelect,
  loading,
}: SlotPickerProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 mt-4">
        {SLOTS.map((s) => (
          <div
            key={s}
            className="h-12 rounded-lg bg-gray-100 animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 mt-4">
      {slots.map(({ time, available }) => {
        const isSelected = selected === time;
        return (
          <button
            key={time}
            disabled={!available}
            onClick={() => available && onSelect(time as SlotTime)}
            className={[
              "h-12 rounded-lg text-sm font-medium transition-colors border-2",
              available
                ? isSelected
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-blue-200 bg-white text-blue-700 hover:border-blue-400"
                : "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed line-through",
            ].join(" ")}
          >
            {SLOT_LABELS[time] ?? time}
            {!available && (
              <span className="block text-xs font-normal">Ocupado</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
