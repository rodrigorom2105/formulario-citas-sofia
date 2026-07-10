import { NextRequest, NextResponse } from "next/server";
import { sheetsStore } from "@/lib/store/sheetsStore";
import { bookingSchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body invalido" }, { status: 400 });
  }

  // Validacion con zod
  const parsed = bookingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 }
    );
  }

  const { date, time, fullName, company, phone, email } = parsed.data;

  try {
    // 1. Verificar que la fecha no este bloqueada
    const blocked = await sheetsStore.getBlockedDates();
    if (blocked.has(date)) {
      return NextResponse.json(
        { error: "Esa fecha no esta disponible para agendar." },
        { status: 409 }
      );
    }

    // 2. Verificar si el usuario ya tiene una cita activa
    const hasActive = await sheetsStore.hasFutureAppointment(phone, email);
    if (hasActive) {
      return NextResponse.json(
        { error: "Ya tienes una cita activa. Solo se permite una cita por persona." },
        { status: 409 }
      );
    }

    // 3. Relectura anti-colision: verificar el slot justo antes de escribir
    const taken = await sheetsStore.isSlotTaken(date, time);
    if (taken) {
      return NextResponse.json(
        { error: "Ese horario ya fue tomado por otro usuario. Por favor selecciona otro." },
        { status: 409 }
      );
    }

    // 4. Crear la cita (el store genera citaId, status, source y timestamps)
    const created = await sheetsStore.create({
      date,
      time,
      fullName,
      company,
      phone,
      email,
    });

    return NextResponse.json({
      message: "Cita agendada exitosamente",
      appointment: {
        citaId: created.citaId,
        date,
        time,
        fullName,
      },
    });
  } catch (error) {
    console.error("[book] Error al agendar cita:", error);
    return NextResponse.json(
      { error: "Error interno al agendar la cita. Por favor intenta nuevamente." },
      { status: 500 }
    );
  }
}
