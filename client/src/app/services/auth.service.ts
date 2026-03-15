import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface User {
  id: string;
  username: string;
  displayName: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/v1/auth`;
  
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  registerOptions(): Observable<unknown> {
    return this.http.get(`${this.apiUrl}/register/options`, { withCredentials: true });
  }

  registerVerify(response: { response: unknown; displayName: string }): Observable<unknown> {
    return this.http.post(`${this.apiUrl}/register/verify`, response, { withCredentials: true });
  }

  loginOptions(): Observable<unknown> {
    return this.http.get(`${this.apiUrl}/login/options`, { withCredentials: true });
  }

  loginVerify(response: { response: unknown }): Observable<unknown> {
    return this.http.post(`${this.apiUrl}/login/verify`, response, { withCredentials: true });
  }

demoLogin(username: string, password: string): Observable<{ success: boolean; user: User }> {
    return this.http.post<{ success: boolean; user: User }>(`${this.apiUrl}/login/demo`, 
      { username, password }, 
      { withCredentials: true }
    ).pipe(
      tap(response => {
        if (response.success) {
          this.currentUserSubject.next(response.user);
        }
      })
    );
  }

  logout(): Observable<unknown> {
    return this.http.post(`${this.apiUrl}/logout`, {}, { withCredentials: true }).pipe(
      tap(() => this.currentUserSubject.next(null))
    );
  }

  private setCurrentUser(user: User | null): void {
    this.currentUserSubject.next(user);
  }

  me(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/me`, { withCredentials: true });
  }

  checkAuth(): void {
    this.me().subscribe({
      next: (user) => {
        this.currentUserSubject.next(user);
      },
      error: () => {
        this.currentUserSubject.next(null);
      }
    });
  }

  isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null;
  }
}
