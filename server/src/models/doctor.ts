export interface Doctor {
  id: string;
  name: string;
  specialty: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DoctorInput {
  name: string;
  specialty?: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
}
