"use client";

import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

const SLOT_LABELS: Record<string, string> = {
  "11:00": "11:00 AM",
  "12:00": "12:00 PM",
  "13:00": "1:00 PM",
  "14:00": "2:00 PM",
};

interface ConfirmationProps {
  appointment: {
    date: string;    // "YYYY-MM-DD"
    time: string;
    fullName: string;
  };
}

export default function Confirmation({ appointment }: ConfirmationProps) {
  const { date, time, fullName } = appointment;
  const parsedDate = parseISO(date);

  return (
    <div className="text-center py-6">
      {/* Icono de exito */}
      <div className="mx-auto mb-5 w-16 h-16 flex items-center justify-center rounded-full bg-green-100">
        <svg
          className="w-8 h-8 text-green-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <h2 className="text-xl font-semibold text-gray-900 mb-2">
        ¡Cita confirmada!
      </h2>
      <p className="text-gray-500 text-sm mb-6">
        Hola {fullName}, tu cita ha sido agendada exitosamente.
      </p>

      {/* Detalle de la cita */}
      <div className="bg-gray-50 rounded-xl border border-gray-200 p-5 text-left space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Fecha</span>
          <span className="font-medium text-gray-900 capitalize">
            {format(parsedDate, "EEEE d 'de' MMMM 'de' yyyy", { locale: es })}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Hora</span>
          <span className="font-medium text-gray-900">{SLOT_LABELS[time] ?? time}</span>
        </div>
      </div>

      <p className="mt-6 text-sm text-gray-500">
        Un representante de CiLi se pondrá en contacto contigo para enviarte la información de tu reunión.
      </p>
    </div>
  );
}
