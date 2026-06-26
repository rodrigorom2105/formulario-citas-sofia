// Capa de abstraccion de almacenamiento — intercambiable (Sheets → Calendar, etc.)

export interface Appointment {
  /** "YYYY-MM-DD" en zona horaria del negocio */
  date: string;
  /** "11:00" | "12:00" | "13:00" | "14:00" */
  time: string;
  fullName: string;
  company?: string;
  phone: string;
  email: string;
  /** ISO timestamp del momento de creacion */
  createdAt: string;
}

export interface AppointmentStore {
  /** Retorna todas las citas de un dia dado */
  getByDate(date: string): Promise<Appointment[]>;

  /**
   * Retorna true si el celular O el correo ya tienen una cita
   * con fecha >= hoy del negocio (cita activa).
   */
  hasFutureAppointment(phone: string, email: string): Promise<boolean>;

  /** Retorna true si el slot ya esta ocupado */
  isSlotTaken(date: string, time: string): Promise<boolean>;

  /** Agrega una nueva cita al store */
  create(appt: Appointment): Promise<void>;
}
