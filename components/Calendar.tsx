"use client";

import { DayPicker } from "react-day-picker";
import { addDays, isWeekend, startOfDay } from "date-fns";
import { es } from "date-fns/locale";
import "react-day-picker/style.css";

interface CalendarProps {
  selected: Date | undefined;
  onSelect: (date: Date) => void;
}

export default function Calendar({ selected, onSelect }: CalendarProps) {
  const today = startOfDay(new Date());
  const tomorrow = addDays(today, 1);
  const maxDate = addDays(today, 30);

  const isDisabledDay = (date: Date) => {
    return (
      date <= today || // hoy y dias pasados
      date > maxDate || // mas de 30 dias
      isWeekend(date) // sabados y domingos
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
