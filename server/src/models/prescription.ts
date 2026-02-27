export interface Prescription {
  id: string;
  medication: string;
  dosage: string | null;
  frequency: string | null;
  startDate: string;
  endDate: string | null;
  notes: string | null;
  illnessId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PrescriptionInput {
  medication: string;
  dosage?: string;
  frequency?: string;
  startDate: string;
  endDate?: string;
  notes?: string;
  illnessId?: string;
}
