// Constantes de slots y helpers de fecha/dia habil

export const SLOTS = ["11:00", "12:00", "13:00", "14:00"] as const;
export type SlotTime = (typeof SLOTS)[number];

/** Zona horaria del negocio — ajustar segun necesidad */
export const BUSINESS_TIMEZONE = process.env.BUSINESS_TIMEZONE ?? "America/Bogota";

/** Horizonte de reserva en dias calendario */
export const BOOKING_HORIZON_DAYS = 30;

/**
 * Retorna la fecha "hoy" del negocio como string "YYYY-MM-DD",
 * usando la zona horaria definida en BUSINESS_TIMEZONE.
 */
export function businessToday(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: BUSINESS_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

/**
 * Retorna true si la fecha (string "YYYY-MM-DD") es un dia habil
 * (lunes a viernes, sin festivos).
 */
export function isBusinessDay(date: string): boolean {
  // parse en UTC para evitar problemas de timezone al solo evaluar el dia
  const [y, m, d] = date.split("-").map(Number);
  const dow = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
  return dow >= 1 && dow <= 5; // 0 = domingo, 6 = sabado
}

/**
 * Retorna true si la fecha esta dentro del horizonte de reserva
 * (estrictamente mayor que hoy del negocio y <= hoy + BOOKING_HORIZON_DAYS).
 */
export function isWithinHorizon(date: string): boolean {
  const today = businessToday();
  if (date <= today) return false; // incluye "hoy" como no seleccionable
  const [ty, tm, td] = today.split("-").map(Number);
  const limit = new Date(Date.UTC(ty, tm - 1, td + BOOKING_HORIZON_DAYS));
  const [y, m, d] = date.split("-").map(Number);
  const target = new Date(Date.UTC(y, m - 1, d));
  return target <= limit;
}

/** Retorna true si el time pertenece a los slots validos */
export function isValidSlot(time: string): time is SlotTime {
  return (SLOTS as readonly string[]).includes(time);
}
