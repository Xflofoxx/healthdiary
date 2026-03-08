import { Component, OnInit, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet, Router } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    @if (showNav) {
      <nav class="navbar">
        <div class="container">
          <a routerLink="/" class="brand"><i class="fas fa-heartbeat"></i> Healthdiary</a>
          <div class="nav-links">
            <a routerLink="/illnesses" routerLinkActive="active"><i class="fas fa-user-injured"></i> Illnesses</a>
            <a routerLink="/prescriptions" routerLinkActive="active"><i class="fas fa-pills"></i> Prescriptions</a>
            <a routerLink="/appointments" routerLinkActive="active"><i class="fas fa-calendar-check"></i> Appointments</a>
            <button (click)="logout()" class="logout-btn"><i class="fas fa-sign-out-alt"></i> Logout</button>
          </div>
        </div>
      </nav>
    }
    <main class="container">
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [`
    .navbar {
      background: #667eea;
      padding: 1rem 0;
    }
    .navbar .container {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .brand {
      color: white;
      font-size: 1.5rem;
      font-weight: bold;
      text-decoration: none;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .nav-links {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }
    .nav-links a {
      color: rgba(255,255,255,0.85);
      text-decoration: none;
      font-weight: 500;
      transition: color 0.2s;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .nav-links a:hover, .nav-links a.active {
      color: white;
    }
    .logout-btn {
      background: rgba(255,255,255,0.2);
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: background 0.2s;
    }
    .logout-btn:hover {
      background: rgba(255,255,255,0.3);
    }
  `]
})
export class AppComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  
  showNav = false;

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.showNav = user !== null;
    });
    this.authService.checkAuth();
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/']);
      }
    });
  }
}
