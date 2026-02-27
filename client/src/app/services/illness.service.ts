import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Illness, IllnessInput } from '../models/illness.model';

@Injectable({ providedIn: 'root' })
export class IllnessService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/v1/illnesses';

  getIllnesses(search?: string, status?: string): Observable<{ illnesses: Illness[]; total: number }> {
    let params = new HttpParams();
    if (search) params = params.set('search', search);
    if (status) params = params.set('status', status);
    return this.http.get<{ illnesses: Illness[]; total: number }>(this.apiUrl, { params });
  }

  getIllness(id: string): Observable<Illness> {
    return this.http.get<Illness>(`${this.apiUrl}/${id}`);
  }

  createIllness(illness: IllnessInput): Observable<Illness> {
    return this.http.post<Illness>(this.apiUrl, illness);
  }

  updateIllness(id: string, illness: IllnessInput): Observable<Illness> {
    return this.http.put<Illness>(`${this.apiUrl}/${id}`, illness);
  }

  deleteIllness(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
