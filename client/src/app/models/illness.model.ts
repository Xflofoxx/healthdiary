export interface Illness {
  id: string;
  name: string;
  notes: string | null;
  startDate: string;
  endDate: string | null;
  status: 'active' | 'resolved' | 'chronic';
  createdAt: string;
  updatedAt: string;
}

export interface IllnessInput {
  name: string;
  notes?: string;
  startDate: string;
  endDate?: string;
  status?: 'active' | 'resolved' | 'chronic';
}
