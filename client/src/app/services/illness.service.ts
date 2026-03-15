import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class IllnessService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/v1/illnesses`;

  getIllnesses(search?: string, status?: string): Observable<{ illnesses: any[]; total: number }> {
    let params = new HttpParams();
    if (search) params = params.set('search', search);
    if (status) params = params.set('status', status);
    return this.http.get<{ illnesses: any[]; total: number }>(this.apiUrl, { params, withCredentials: true });
  }

  getIllness(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`, { withCredentials: true });
  }

  createIllness(illness: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, illness, { withCredentials: true });
  }

  updateIllness(id: string, illness: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, illness, { withCredentials: true });
  }

  deleteIllness(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { withCredentials: true });
  }
}
