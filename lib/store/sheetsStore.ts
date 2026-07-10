import { randomUUID } from "crypto";
import {
  BLOQUEOS_SHEET_NAME,
  COLUMNS,
  getSheetsClient,
  getSheetId,
  SHEET_NAME,
} from "../sheets";
import { businessToday } from "../slots";
import type { Appointment, AppointmentStore, BookingData } from "./types";

/** Estados que dejan una fila inactiva (liberan el slot) */
const INACTIVE_STATUSES = new Set(["cancelada", "reagendada"]);

/** Retorna true si la fila corresponde a una cita activa (status != cancelada/reagendada) */
function isActive(row: (string | null | undefined)[]): boolean {
  const status = (row[5] ?? "").trim().toLowerCase();
  return !INACTIVE_STATUSES.has(status);
}

/** Convierte una fila del Sheet en un objeto Appointment (indices A→N) */
function rowToAppointment(row: (string | null | undefined)[]): Appointment {
  return {
    citaId: row[0] ?? "",
    createdAt: row[1] ?? "",
    updatedAt: row[2] ?? "",
    date: row[3] ?? "",
    time: row[4] ?? "",
    status: row[5] ?? "",
    source: row[6] ?? "",
    conversationKey: row[7] ?? "",
    leadId: row[8] ?? "",
    fullName: row[9] ?? "",
    company: row[10] ?? undefined,
    phone: row[11] ?? "",
    email: row[12] ?? "",
    n8nExecutionId: row[13] ?? "",
  };
}

/** Convierte un Appointment en una fila del Sheet (mismo orden que COLUMNS) */
function appointmentToRow(appt: Appointment): string[] {
  return COLUMNS.map((col) => (appt[col as keyof Appointment] as string) ?? "");
}

/**
 * Obtiene todas las filas de datos de la hoja Citas (excluye encabezados).
 * Retorna [] si la hoja esta vacia.
 */
async function getAllRows(): Promise<string[][]> {
  const sheets = getSheetsClient();
  const range = `${SHEET_NAME}!A2:N`;
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: getSheetId(),
    range,
  });
  const rows = res.data.values;
  if (!rows || rows.length === 0) return [];
  return rows as string[][];
}

export const sheetsStore: AppointmentStore = {
  async getByDate(date: string): Promise<Appointment[]> {
    const rows = await getAllRows();
    return rows
      .filter((row) => row[3] === date && isActive(row))
      .map(rowToAppointment);
  },

  async hasFutureAppointment(phone: string, email: string): Promise<boolean> {
    const today = businessToday();
    const rows = await getAllRows();
    return rows.some((row) => {
      if (!isActive(row)) return false;
      if (!(row[3] >= today)) return false;
      const rowPhone = (row[11] ?? "").trim();
      const rowEmail = (row[12] ?? "").trim();
      const phoneMatch = rowPhone !== "" && rowPhone === phone;
      const emailMatch = rowEmail !== "" && rowEmail === email;
      return phoneMatch || emailMatch;
    });
  },

  async isSlotTaken(date: string, time: string): Promise<boolean> {
    const rows = await getAllRows();
    return rows.some(
      (row) => row[3] === date && row[4] === time && isActive(row)
    );
  },

  async getBlockedDates(): Promise<Set<string>> {
    const sheets = getSheetsClient();
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: getSheetId(),
      range: `${BLOQUEOS_SHEET_NAME}!A2:A`,
    });
    const rows = res.data.values;
    if (!rows || rows.length === 0) return new Set();
    const dates = rows
      .map((row) => (row[0] ?? "").trim())
      .filter((d) => d !== "");
    return new Set(dates);
  },

  async create(data: BookingData): Promise<Appointment> {
    const now = new Date().toISOString();
    const citaId = `cita_webapp_${data.date.replace(/-/g, "")}_${data.time.replace(
      ":",
      ""
    )}_${randomUUID().slice(0, 8)}`;

    const appt: Appointment = {
      citaId,
      createdAt: now,
      updatedAt: now,
      date: data.date,
      time: data.time,
      status: "confirmada",
      source: "webapp",
      conversationKey: "",
      leadId: "",
      fullName: data.fullName,
      company: data.company ?? "",
      phone: data.phone,
      email: data.email,
      n8nExecutionId: "",
    };

    const sheets = getSheetsClient();
    await sheets.spreadsheets.values.append({
      spreadsheetId: getSheetId(),
      range: `${SHEET_NAME}!A:N`,
      valueInputOption: "RAW",
      requestBody: {
        values: [appointmentToRow(appt)],
      },
    });

    return appt;
  },
};
