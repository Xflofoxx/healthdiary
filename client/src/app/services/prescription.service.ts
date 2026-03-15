import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PrescriptionService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/v1/prescriptions`;

  getPrescriptions(illnessId?: string, search?: string, active?: boolean): Observable<{ prescriptions: any[]; total: number }> {
    let params = new HttpParams();
    if (illnessId) params = params.set('illnessId', illnessId);
    if (search) params = params.set('search', search);
    if (active) params = params.set('active', 'true');
    return this.http.get<{ prescriptions: any[]; total: number }>(this.apiUrl, { params, withCredentials: true });
  }

  getPrescription(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`, { withCredentials: true });
  }

  createPrescription(prescription: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, prescription, { withCredentials: true });
  }

  updatePrescription(id: string, prescription: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, prescription, { withCredentials: true });
  }

  deletePrescription(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { withCredentials: true });
  }
}
