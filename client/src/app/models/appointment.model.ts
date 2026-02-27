export interface Appointment {
  id: string;
  doctorName: string;
  specialty: string | null;
  date: string;
  time: string | null;
  location: string | null;
  notes: string | null;
  illnessId: string | null;
  illnessName: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AppointmentInput {
  doctorName: string;
  specialty?: string;
  date: string;
  time?: string;
  location?: string;
  notes?: string;
  illnessId?: string;
}
