import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AppointmentService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/v1/appointments`;

  getAppointments(illnessId?: string, dateFrom?: string, dateTo?: string, specialty?: string): Observable<{ appointments: any[]; total: number }> {
    let params = new HttpParams();
    if (illnessId) params = params.set('illnessId', illnessId);
    if (dateFrom) params = params.set('dateFrom', dateFrom);
    if (dateTo) params = params.set('dateTo', dateTo);
    if (specialty) params = params.set('specialty', specialty);
    return this.http.get<{ appointments: any[]; total: number }>(this.apiUrl, { params, withCredentials: true });
  }

  getAppointment(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`, { withCredentials: true });
  }

  createAppointment(appointment: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, appointment, { withCredentials: true });
  }

  updateAppointment(id: string, appointment: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, appointment, { withCredentials: true });
  }

  deleteAppointment(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { withCredentials: true });
  }
}
