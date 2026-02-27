import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar">
      <div class="container">
        <a routerLink="/" class="brand">Healthdiary</a>
        <div class="nav-links">
          <a routerLink="/illnesses" routerLinkActive="active">Illnesses</a>
          <a routerLink="/prescriptions" routerLinkActive="active">Prescriptions</a>
          <a routerLink="/appointments" routerLinkActive="active">Appointments</a>
        </div>
      </div>
    </nav>
    <main class="container">
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [`
    .navbar {
      background: #2563eb;
      padding: 1rem 0;
      margin-bottom: 2rem;
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
    }
    .nav-links {
      display: flex;
      gap: 1.5rem;
    }
    .nav-links a {
      color: rgba(255,255,255,0.8);
      text-decoration: none;
      font-weight: 500;
      transition: color 0.2s;
    }
    .nav-links a:hover, .nav-links a.active {
      color: white;
    }
  `]
})
export class AppComponent {}
