import { z } from "zod";
import { isBusinessDay, isValidSlot, isWithinHorizon } from "./slots";

// Schema compartido entre cliente y servidor para los datos de la cita
export const bookingSchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de fecha invalido (YYYY-MM-DD)")
    .refine(isBusinessDay, "Solo se permiten dias habiles (lunes a viernes)")
    .refine(isWithinHorizon, "La fecha debe ser a partir de mañana y dentro de los proximos 30 dias"),
  time: z
    .string()
    .refine(isValidSlot, "Horario no valido"),
  fullName: z
    .string()
    .min(2, "Nombre completo requerido (minimo 2 caracteres)")
    .max(100),
  company: z.string().max(100).optional(),
  phone: z
    .string()
    .min(7, "Celular requerido")
    .max(20)
    .regex(/^[\d\s\+\-\(\)]+$/, "Formato de celular no valido"),
  email: z
    .string()
    .email("Correo electronico no valido")
    .max(150),
});

export type BookingInput = z.infer<typeof bookingSchema>;
