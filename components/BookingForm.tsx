"use client";

import { useState } from "react";
import { bookingSchema, BookingInput } from "@/lib/validation";
import { SlotTime } from "@/lib/slots";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface BookingFormProps {
  date: Date;
  time: SlotTime;
  onSuccess: (appointment: { date: string; time: string; fullName: string }) => void;
  onBack: () => void;
}

const SLOT_LABELS: Record<string, string> = {
  "11:00": "11:00 AM",
  "12:00": "12:00 PM",
  "13:00": "1:00 PM",
  "14:00": "2:00 PM",
};

export default function BookingForm({
  date,
  time,
  onSuccess,
  onBack,
}: BookingFormProps) {
  const [fields, setFields] = useState({
    fullName: "",
    company: "",
    phone: "",
    email: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof BookingInput, string>>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const dateStr = format(date, "yyyy-MM-dd");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFields((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: undefined }));
    setServerError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    const payload = {
      date: dateStr,
      time,
      fullName: fields.fullName,
      company: fields.company || undefined,
      phone: fields.phone,
      email: fields.email,
    };

    // Validacion en cliente
    const parsed = bookingSchema.safeParse(payload);
    if (!parsed.success) {
      const fieldErrors: typeof errors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof BookingInput;
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setServerError(data.error ?? "Error al agendar la cita");
      } else {
        onSuccess(data.appointment);
      }
    } catch {
      setServerError("Error de red. Por favor intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field: keyof BookingInput) =>
    [
      "w-full px-3 py-2 border rounded-lg text-sm outline-none transition-colors",
      errors[field]
        ? "border-red-400 focus:border-red-500"
        : "border-gray-300 focus:border-blue-500",
    ].join(" ");

  return (
    <div>
      {/* Resumen de seleccion */}
      <div className="mb-5 p-3 bg-blue-50 rounded-lg border border-blue-100 text-sm text-blue-800">
        <span className="font-medium">
          {format(date, "EEEE d 'de' MMMM", { locale: es })}
        </span>
        {" · "}
        <span>{SLOT_LABELS[time]}</span>
        <button
          onClick={onBack}
          className="ml-3 text-blue-500 hover:text-blue-700 underline text-xs"
        >
          Cambiar
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nombre completo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre completo <span className="text-red-500">*</span>
          </label>
          <input
            name="fullName"
            value={fields.fullName}
            onChange={handleChange}
            placeholder="Juan Pérez"
            className={inputClass("fullName")}
          />
          {errors.fullName && (
            <p className="mt-1 text-xs text-red-500">{errors.fullName}</p>
          )}
        </div>

        {/* Empresa (opcional) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Empresa <span className="text-gray-400 font-normal">(opcional)</span>
          </label>
          <input
            name="company"
            value={fields.company}
            onChange={handleChange}
            placeholder="Tu empresa"
            className={inputClass("company")}
          />
        </div>

        {/* Celular */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Celular <span className="text-red-500">*</span>
          </label>
          <input
            name="phone"
            value={fields.phone}
            onChange={handleChange}
            placeholder="+57 300 000 0000"
            type="tel"
            className={inputClass("phone")}
          />
          {errors.phone && (
            <p className="mt-1 text-xs text-red-500">{errors.phone}</p>
          )}
        </div>

        {/* Correo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Correo electronico <span className="text-red-500">*</span>
          </label>
          <input
            name="email"
            value={fields.email}
            onChange={handleChange}
            placeholder="tu@correo.com"
            type="email"
            className={inputClass("email")}
          />
          {errors.email && (
            <p className="mt-1 text-xs text-red-500">{errors.email}</p>
          )}
        </div>

        {/* Error del servidor */}
        {serverError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {serverError}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Agendando..." : "Confirmar cita"}
        </button>
      </form>
    </div>
  );
}
