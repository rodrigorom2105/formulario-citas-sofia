"use client";

import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import Calendar from "@/components/Calendar";
import SlotPicker from "@/components/SlotPicker";
import BookingForm from "@/components/BookingForm";
import Confirmation from "@/components/Confirmation";
import { SlotTime } from "@/lib/slots";

type Step = "calendar" | "slots" | "form" | "confirmation";

interface SlotInfo {
  time: string;
  available: boolean;
}

interface BookedAppointment {
  date: string;
  time: string;
  fullName: string;
}

export default function Home() {
  const [step, setStep] = useState<Step>("calendar");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<SlotTime | null>(null);
  const [slots, setSlots] = useState<SlotInfo[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);
  const [confirmedAppointment, setConfirmedAppointment] =
    useState<BookedAppointment | null>(null);

  const handleDateSelect = async (date: Date) => {
    setSelectedDate(date);
    setSelectedTime(null);
    setSlotsError(null);
    setStep("slots");
    setSlotsLoading(true);

    try {
      const dateStr = format(date, "yyyy-MM-dd");
      const res = await fetch(`/api/availability?date=${dateStr}`);
      const data = await res.json();
      if (!res.ok) {
        setSlotsError(data.error ?? "Error al cargar disponibilidad");
        setSlots([]);
      } else {
        setSlots(data.slots);
      }
    } catch {
      setSlotsError("Error de red. Por favor intenta nuevamente.");
      setSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  };

  const handleSlotSelect = (time: SlotTime) => {
    setSelectedTime(time);
    setStep("form");
  };

  const handleConfirmation = (appointment: BookedAppointment) => {
    setConfirmedAppointment(appointment);
    setStep("confirmation");
  };

  const handleBack = () => {
    if (step === "form") {
      setStep("slots");
      setSelectedTime(null);
    } else if (step === "slots") {
      setStep("calendar");
      setSelectedDate(undefined);
      setSlots([]);
    }
  };

  const stepTitle: Record<Step, string> = {
    calendar: "Selecciona una fecha",
    slots: "Elige un horario",
    form: "Tus datos",
    confirmation: "",
  };

  return (
    <main className="min-h-screen bg-gray-50 flex items-start justify-center p-4 pt-8 sm:items-center sm:pt-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        {/* Header */}
        {step !== "confirmation" && (
          <div className="mb-6">
            {step !== "calendar" && (
              <button
                onClick={handleBack}
                className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 mb-3 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Volver
              </button>
            )}
            <h1 className="text-xl font-semibold text-gray-900">
              Agendar cita
            </h1>
            <p className="text-sm text-gray-500 mt-1">{stepTitle[step]}</p>
          </div>
        )}

        {/* Paso 1: Calendario */}
        {step === "calendar" && (
          <Calendar selected={selectedDate} onSelect={handleDateSelect} />
        )}

        {/* Paso 2: Seleccion de horario */}
        {step === "slots" && selectedDate && (
          <div>
            <p className="text-sm text-gray-600 mb-1">
              <span className="font-medium capitalize">
                {format(selectedDate, "EEEE d 'de' MMMM", { locale: es })}
              </span>
            </p>
            {slotsError ? (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {slotsError}
              </div>
            ) : (
              <SlotPicker
                slots={slots}
                selected={selectedTime}
                onSelect={handleSlotSelect}
                loading={slotsLoading}
              />
            )}
          </div>
        )}

        {/* Paso 3: Formulario */}
        {step === "form" && selectedDate && selectedTime && (
          <BookingForm
            date={selectedDate}
            time={selectedTime}
            onSuccess={handleConfirmation}
            onBack={handleBack}
          />
        )}

        {/* Paso 4: Confirmacion */}
        {step === "confirmation" && confirmedAppointment && (
          <Confirmation appointment={confirmedAppointment} />
        )}
      </div>
    </main>
  );
}
