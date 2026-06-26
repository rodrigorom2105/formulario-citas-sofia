import { COLUMNS, getSheetsClient, getSheetId, SHEET_NAME } from "../sheets";
import { businessToday } from "../slots";
import type { Appointment, AppointmentStore } from "./types";

/** Convierte una fila del Sheet en un objeto Appointment */
function rowToAppointment(row: (string | null | undefined)[]): Appointment {
  return {
    createdAt: row[0] ?? "",
    date: row[1] ?? "",
    time: row[2] ?? "",
    fullName: row[3] ?? "",
    company: row[4] ?? undefined,
    phone: row[5] ?? "",
    email: row[6] ?? "",
  };
}

/** Convierte un Appointment en una fila del Sheet (mismo orden que COLUMNS) */
function appointmentToRow(appt: Appointment): string[] {
  return COLUMNS.map((col) => (appt[col as keyof Appointment] as string) ?? "");
}

/**
 * Obtiene todas las filas de datos del Sheet (excluye fila de encabezados).
 * Retorna [] si el Sheet esta vacio.
 */
async function getAllRows(): Promise<string[][]> {
  const sheets = getSheetsClient();
  const range = `${SHEET_NAME}!A2:G`;
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
      .filter((row) => row[1] === date)
      .map(rowToAppointment);
  },

  async hasFutureAppointment(phone: string, email: string): Promise<boolean> {
    const today = businessToday();
    const rows = await getAllRows();
    return rows.some(
      (row) =>
        row[1] >= today &&
        (row[5] === phone || row[6] === email)
    );
  },

  async isSlotTaken(date: string, time: string): Promise<boolean> {
    const rows = await getAllRows();
    return rows.some((row) => row[1] === date && row[2] === time);
  },

  async create(appt: Appointment): Promise<void> {
    const sheets = getSheetsClient();
    await sheets.spreadsheets.values.append({
      spreadsheetId: getSheetId(),
      range: `${SHEET_NAME}!A:G`,
      valueInputOption: "RAW",
      requestBody: {
        values: [appointmentToRow(appt)],
      },
    });
  },
};
