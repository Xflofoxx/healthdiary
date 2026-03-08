import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';

export interface User {
  id: string;
  username: string;
  displayName: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/v1/auth';
  
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  registerOptions(): Observable<unknown> {
    return this.http.get(`${this.apiUrl}/register/options`);
  }

  registerVerify(response: { response: unknown; displayName: string }): Observable<unknown> {
    return this.http.post(`${this.apiUrl}/register/verify`, response, { withCredentials: true });
  }

  loginOptions(): Observable<unknown> {
    return this.http.get(`${this.apiUrl}/login/options`);
  }

  loginVerify(response: { response: unknown }): Observable<unknown> {
    return this.http.post(`${this.apiUrl}/login/verify`, response, { withCredentials: true });
  }

  logout(): Observable<unknown> {
    return this.http.post(`${this.apiUrl}/logout`, {}, { withCredentials: true });
  }

  me(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/me`, { withCredentials: true });
  }

  checkAuth(): void {
    this.me().subscribe({
      next: (user) => this.currentUserSubject.next(user),
      error: () => this.currentUserSubject.next(null)
    });
  }

  isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null;
  }
}
