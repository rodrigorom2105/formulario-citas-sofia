// Capa de abstraccion de almacenamiento — intercambiable (Sheets → Calendar, etc.)

export interface Appointment {
  /** Identificador unico de la cita (ej. "cita_webapp_20260710_1100_ab12cd34") */
  citaId: string;
  /** ISO timestamp del momento de creacion */
  createdAt: string;
  /** ISO timestamp de la ultima actualizacion */
  updatedAt: string;
  /** "YYYY-MM-DD" en zona horaria del negocio */
  date: string;
  /** "11:00" | "12:00" | "13:00" | "14:00" */
  time: string;
  /** "confirmada" | "cancelada" | "reagendada" | ... */
  status: string;
  /** Origen de la cita: "bot" | "webapp" */
  source: string;
  /** Clave de conversacion del bot (vacio en webapp) */
  conversationKey: string;
  /** Id del lead del bot (vacio en webapp) */
  leadId: string;
  fullName: string;
  company?: string;
  phone: string;
  email: string;
  /** Id de ejecucion de n8n (vacio en webapp) */
  n8nExecutionId: string;
}

/** Datos que aporta el usuario al agendar desde la webapp */
export interface BookingData {
  date: string;
  time: string;
  fullName: string;
  company?: string;
  phone: string;
  email: string;
}

export interface AppointmentStore {
  /** Retorna todas las citas activas de un dia dado */
  getByDate(date: string): Promise<Appointment[]>;

  /**
   * Retorna true si el celular O el correo ya tienen una cita activa
   * con fecha >= hoy del negocio.
   */
  hasFutureAppointment(phone: string, email: string): Promise<boolean>;

  /** Retorna true si el slot ya esta ocupado por una cita activa */
  isSlotTaken(date: string, time: string): Promise<boolean>;

  /** Retorna el conjunto de fechas ("YYYY-MM-DD") bloqueadas */
  getBlockedDates(): Promise<Set<string>>;

  /**
   * Agrega una nueva cita al store a partir de los datos del usuario.
   * El store genera citaId, status, source y timestamps.
   * Retorna la cita creada.
   */
  create(data: BookingData): Promise<Appointment>;
}
