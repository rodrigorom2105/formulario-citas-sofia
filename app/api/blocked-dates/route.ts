import { NextResponse } from "next/server";
import { sheetsStore } from "@/lib/store/sheetsStore";

/**
 * Retorna las fechas bloqueadas (hoja "Bloqueos") para que el calendario
 * pueda deshabilitarlas. El servidor tambien las valida en /api/book.
 */
export async function GET() {
  try {
    const blocked = await sheetsStore.getBlockedDates();
    return NextResponse.json({ dates: [...blocked] });
  } catch (error) {
    console.error("[blocked-dates] Error al consultar bloqueos:", error);
    return NextResponse.json(
      { error: "Error interno al consultar fechas bloqueadas" },
      { status: 500 }
    );
  }
}
