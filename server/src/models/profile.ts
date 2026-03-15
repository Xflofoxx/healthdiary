export interface UserProfile {
  id: string;
  user_id: string;
  birth_date: string | null;
  blood_type: string | null;
  height: number | null;
  weight: number | null;
  allergies: string | null;
  chronic_conditions: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  emergency_contact_relationship: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}
