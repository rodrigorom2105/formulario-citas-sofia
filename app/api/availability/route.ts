import { NextRequest, NextResponse } from "next/server";
import { sheetsStore } from "@/lib/store/sheetsStore";
import { SLOTS } from "@/lib/slots";
import { isBusinessDay, isWithinHorizon } from "@/lib/slots";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json(
      { error: "Parametro 'date' requerido con formato YYYY-MM-DD" },
      { status: 400 }
    );
  }

  if (!isBusinessDay(date)) {
    return NextResponse.json(
      { error: "Solo se permiten dias habiles (lunes a viernes)" },
      { status: 400 }
    );
  }

  if (!isWithinHorizon(date)) {
    return NextResponse.json(
      { error: "La fecha debe ser a partir de mañana y dentro de los proximos 30 dias" },
      { status: 400 }
    );
  }

  try {
    const appointments = await sheetsStore.getByDate(date);
    const takenTimes = new Set(appointments.map((a) => a.time));

    const slots = SLOTS.map((time) => ({
      time,
      available: !takenTimes.has(time),
    }));

    return NextResponse.json({ date, slots });
  } catch (error) {
    console.error("[availability] Error al consultar disponibilidad:", error);
    return NextResponse.json(
      { error: "Error interno al consultar disponibilidad" },
      { status: 500 }
    );
  }
}
