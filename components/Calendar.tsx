"use client";

import { DayPicker } from "react-day-picker";
import { addDays, isWeekend } from "date-fns";
import { es } from "date-fns/locale";
import "react-day-picker/style.css";

interface CalendarProps {
  selected: Date | undefined;
  onSelect: (date: Date) => void;
}

/** Convierte un Date a "YYYY-MM-DD" usando la hora local del dispositivo */
function toLocalDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default function Calendar({ selected, onSelect }: CalendarProps) {
  const today = new Date();
  const todayStr = toLocalDateStr(today);
  const maxDate = addDays(today, 30);
  const maxDateStr = toLocalDateStr(maxDate);
  const tomorrow = addDays(today, 1);

  const isDisabledDay = (date: Date) => {
    const dateStr = toLocalDateStr(date);
    return (
      dateStr <= todayStr ||
      dateStr > maxDateStr ||
      isWeekend(date) ||
      date.getDay() === 3 // miércoles
    );
  };

  return (
    <div className="flex justify-center">
      <DayPicker
        mode="single"
        selected={selected}
        onSelect={(date) => date && onSelect(date)}
        disabled={isDisabledDay}
        startMonth={tomorrow}
        endMonth={maxDate}
        locale={es}
      />
    </div>
  );
}
