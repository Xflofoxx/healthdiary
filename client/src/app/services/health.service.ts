import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Illness {
  id: string;
  name: string;
  notes: string | null;
  startDate: string;
  endDate: string | null;
  status: string;
}

export interface Prescription {
  id: string;
  medication: string;
  dosage: string | null;
  frequency: string | null;
  startDate: string;
  endDate: string | null;
  notes: string | null;
  illnessId: string | null;
  illnessName: string | null;
}

export interface Appointment {
  id: string;
  doctorName: string;
  specialty: string | null;
  date: string;
  time: string | null;
  location: string | null;
  notes: string | null;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  notes: string | null;
}

export interface UserProfile {
  id: string;
  user_id: string;
  birthDate: string | null;
  bloodType: string | null;
  height: number | null;
  weight: number | null;
  allergies: string | null;
  chronicConditions: string | null;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  emergencyContactRelationship: string | null;
  notes: string | null;
}

export interface DashboardData {
  illnesses: Illness[];
  prescriptions: Prescription[];
  appointments: Appointment[];
}

@Injectable({ providedIn: 'root' })
export class HealthService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/v1`;

  // Illnesses
  getIllnesses(): Observable<{ illnesses: Illness[]; total: number }> {
    return this.http.get<{ illnesses: Illness[]; total: number }>(`${this.apiUrl}/illnesses`, { withCredentials: true });
  }

  getIllness(id: string): Observable<Illness> {
    return this.http.get<Illness>(`${this.apiUrl}/illnesses/${id}`, { withCredentials: true });
  }

  createIllness(data: Partial<Illness>): Observable<Illness> {
    return this.http.post<Illness>(`${this.apiUrl}/illnesses`, data, { withCredentials: true });
  }

  updateIllness(id: string, data: Partial<Illness>): Observable<Illness> {
    return this.http.put<Illness>(`${this.apiUrl}/illnesses/${id}`, data, { withCredentials: true });
  }

  deleteIllness(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/illnesses/${id}`, { withCredentials: true });
  }

  // Prescriptions
  getPrescriptions(): Observable<{ prescriptions: Prescription[]; total: number }> {
    return this.http.get<{ prescriptions: Prescription[]; total: number }>(`${this.apiUrl}/prescriptions`, { withCredentials: true });
  }

  getPrescription(id: string): Observable<Prescription> {
    return this.http.get<Prescription>(`${this.apiUrl}/prescriptions/${id}`, { withCredentials: true });
  }

  createPrescription(data: Partial<Prescription>): Observable<Prescription> {
    return this.http.post<Prescription>(`${this.apiUrl}/prescriptions`, data, { withCredentials: true });
  }

  updatePrescription(id: string, data: Partial<Prescription>): Observable<Prescription> {
    return this.http.put<Prescription>(`${this.apiUrl}/prescriptions/${id}`, data, { withCredentials: true });
  }

  deletePrescription(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/prescriptions/${id}`, { withCredentials: true });
  }

  // Appointments
  getAppointments(): Observable<{ appointments: Appointment[]; total: number }> {
    return this.http.get<{ appointments: Appointment[]; total: number }>(`${this.apiUrl}/appointments`, { withCredentials: true });
  }

  getAppointment(id: string): Observable<Appointment> {
    return this.http.get<Appointment>(`${this.apiUrl}/appointments/${id}`, { withCredentials: true });
  }

  createAppointment(data: Partial<Appointment>): Observable<Appointment> {
    return this.http.post<Appointment>(`${this.apiUrl}/appointments`, data, { withCredentials: true });
  }

  updateAppointment(id: string, data: Partial<Appointment>): Observable<Appointment> {
    return this.http.put<Appointment>(`${this.apiUrl}/appointments/${id}`, data, { withCredentials: true });
  }

  deleteAppointment(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/appointments/${id}`, { withCredentials: true });
  }

  // Doctors
  getDoctors(): Observable<{ doctors: Doctor[]; total: number }> {
    return this.http.get<{ doctors: Doctor[]; total: number }>(`${this.apiUrl}/doctors`, { withCredentials: true });
  }

  getDoctor(id: string): Observable<Doctor> {
    return this.http.get<Doctor>(`${this.apiUrl}/doctors/${id}`, { withCredentials: true });
  }

  createDoctor(data: Partial<Doctor>): Observable<Doctor> {
    return this.http.post<Doctor>(`${this.apiUrl}/doctors`, data, { withCredentials: true });
  }

  updateDoctor(id: string, data: Partial<Doctor>): Observable<Doctor> {
    return this.http.put<Doctor>(`${this.apiUrl}/doctors/${id}`, data, { withCredentials: true });
  }

  deleteDoctor(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/doctors/${id}`, { withCredentials: true });
  }

  // Profile
  getProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.apiUrl}/profile`, { withCredentials: true });
  }

  updateProfile(data: Partial<UserProfile>): Observable<UserProfile> {
    return this.http.put<UserProfile>(`${this.apiUrl}/profile`, data, { withCredentials: true });
  }

  // Data export/import
  exportData(): Observable<any> {
    return this.http.get(`${this.apiUrl}/data/export`, { withCredentials: true, responseType: 'blob' });
  }

  importData(data: any): Observable<{ success: boolean; imported: any }> {
    return this.http.post<{ success: boolean; imported: any }>(`${this.apiUrl}/data/import`, data, { withCredentials: true });
  }

  // Report
  getReport(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/report`, { withCredentials: true, responseType: 'blob' });
  }
}
