import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Prescription, PrescriptionInput } from '../models/prescription.model';

@Injectable({ providedIn: 'root' })
export class PrescriptionService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/v1/prescriptions';

  getPrescriptions(illnessId?: string, search?: string, active?: boolean): Observable<{ prescriptions: Prescription[]; total: number }> {
    let params = new HttpParams();
    if (illnessId) params = params.set('illnessId', illnessId);
    if (search) params = params.set('search', search);
    if (active) params = params.set('active', 'true');
    return this.http.get<{ prescriptions: Prescription[]; total: number }>(this.apiUrl, { params });
  }

  getPrescription(id: string): Observable<Prescription> {
    return this.http.get<Prescription>(`${this.apiUrl}/${id}`);
  }

  createPrescription(prescription: PrescriptionInput): Observable<Prescription> {
    return this.http.post<Prescription>(this.apiUrl, prescription);
  }

  updatePrescription(id: string, prescription: PrescriptionInput): Observable<Prescription> {
    return this.http.put<Prescription>(`${this.apiUrl}/${id}`, prescription);
  }

  deletePrescription(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
