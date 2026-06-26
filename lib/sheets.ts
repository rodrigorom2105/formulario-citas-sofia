import { google } from "googleapis";

/** Nombre de la hoja dentro del Google Sheet */
export const SHEET_NAME = "Citas";

/** Columnas en orden — deben coincidir con los encabezados del Sheet */
export const COLUMNS = [
  "createdAt",
  "date",
  "time",
  "fullName",
  "company",
  "phone",
  "email",
] as const;

/**
 * Retorna un cliente autenticado de Google Sheets usando Service Account.
 * Las credenciales viven en variables de entorno (nunca en el frontend).
 */
export function getSheetsClient() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const rawKey = process.env.GOOGLE_PRIVATE_KEY;

  if (!email || !rawKey) {
    throw new Error(
      "Faltan variables de entorno: GOOGLE_SERVICE_ACCOUNT_EMAIL o GOOGLE_PRIVATE_KEY"
    );
  }

  // En Vercel/env los saltos de linea suelen quedar como "\n" literales
  const privateKey = rawKey.replace(/\\n/g, "\n");

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: email,
      private_key: privateKey,
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  return google.sheets({ version: "v4", auth });
}

export function getSheetId(): string {
  const id = process.env.GOOGLE_SHEET_ID;
  if (!id) throw new Error("Falta variable de entorno: GOOGLE_SHEET_ID");
  return id;
}
