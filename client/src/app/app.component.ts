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
          <a routerLink="/dashboard" class="brand"><i class="fas fa-heartbeat"></i> Healthdiary</a>
          <div class="nav-links">
            <a routerLink="/dashboard" routerLinkActive="active"><i class="fas fa-th-large"></i> Dashboard</a>
            <a routerLink="/illnesses" routerLinkActive="active"><i class="fas fa-user-injured"></i> Malattie</a>
            <a routerLink="/prescriptions" routerLinkActive="active"><i class="fas fa-pills"></i> Farmaci</a>
            <a routerLink="/appointments" routerLinkActive="active"><i class="fas fa-calendar-check"></i> Visite</a>
            <a routerLink="/doctors" routerLinkActive="active"><i class="fas fa-user-md"></i> Medici</a>
            <a routerLink="/calendar" routerLinkActive="active"><i class="fas fa-calendar-alt"></i> Calendario</a>
            <button (click)="logout()" class="logout-btn"><i class="fas fa-sign-out-alt"></i> Esci</button>
          </div>
        </div>
      </nav>
    }
    <main class="container">
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [`
    :host { --primary-color: #667eea; --accent-color: #764ba2; --text-primary: #1a202c; --text-secondary: #4a5568; --text-muted: #718096; }
    .navbar { background: linear-gradient(135deg, var(--primary-color) 0%, var(--accent-color) 100%); padding: 0.75rem 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .navbar .container { display: flex; justify-content: space-between; align-items: center; max-width: 1400px; margin: 0 auto; padding: 0 1rem; }
    .brand { color: white; font-size: 1.25rem; font-weight: bold; text-decoration: none; display: flex; align-items: center; gap: 0.5rem; }
    .nav-links { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }
    .nav-links a { color: rgba(255,255,255,0.85); text-decoration: none; font-weight: 500; transition: all 0.2s; display: flex; align-items: center; gap: 0.4rem; padding: 0.5rem 0.75rem; border-radius: 8px; font-size: 0.9rem; }
    .nav-links a:hover, .nav-links a.active { background: rgba(255,255,255,0.2); color: white; }
    .logout-btn { background: rgba(255,255,255,0.15); color: white; border: none; padding: 0.5rem 0.75rem; border-radius: 8px; cursor: pointer; font-weight: 500; display: flex; align-items: center; gap: 0.4rem; transition: all 0.2s; font-size: 0.9rem; }
    .logout-btn:hover { background: rgba(255,255,255,0.25); }
    main { padding: 2rem 1rem; max-width: 1400px; margin: 0 auto; }
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
