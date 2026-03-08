import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="home-page">
      <div class="hero">
        <div class="logo">
          <i class="fas fa-heartbeat"></i>
        </div>
        <h1>Healthdiary</h1>
        <p class="tagline">Your Personal Health Companion</p>
        
        <p class="description">
          A modern personal health diary for tracking your illnesses, prescriptions, and doctor appointments. 
          Secure, private, and easy to use with passwordless WebAuthn authentication.
        </p>
        
        <div class="features">
          <div class="feature">
            <i class="fas fa-user-injured"></i>
            <h3>Illness Tracking</h3>
            <p>Track your illnesses with dates and notes</p>
          </div>
          <div class="feature">
            <i class="fas fa-pills"></i>
            <h3>Prescriptions</h3>
            <p>Manage your medications</p>
          </div>
          <div class="feature">
            <i class="fas fa-calendar-check"></i>
            <h3>Appointments</h3>
            <p>Never miss a doctor visit</p>
          </div>
        </div>
        
        <div class="buttons">
          <a routerLink="/login" class="btn btn-primary">
            <i class="fas fa-sign-in-alt"></i> Login
          </a>
          <a routerLink="/register" class="btn btn-secondary">
            <i class="fas fa-user-plus"></i> Register
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .home-page {
      min-height: calc(100vh - 120px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
    }
    .hero {
      max-width: 700px;
      text-align: center;
    }
    .logo {
      font-size: 5rem;
      color: #667eea;
      margin-bottom: 1rem;
    }
    h1 {
      font-size: 3rem;
      color: #1a202c;
      margin-bottom: 0.5rem;
    }
    .tagline {
      color: #718096;
      font-size: 1.3rem;
      margin-bottom: 1.5rem;
    }
    .description {
      color: #4a5568;
      line-height: 1.8;
      margin-bottom: 2rem;
      font-size: 1.1rem;
    }
    .features {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.5rem;
      margin-bottom: 2rem;
    }
    .feature {
      padding: 1.5rem;
      background: #f7fafc;
      border-radius: 12px;
      transition: transform 0.2s;
    }
    .feature:hover {
      transform: translateY(-4px);
    }
    .feature i {
      font-size: 2.5rem;
      color: #667eea;
      margin-bottom: 0.75rem;
    }
    .feature h3 {
      color: #2d3748;
      font-size: 1.1rem;
      margin-bottom: 0.5rem;
    }
    .feature p {
      color: #718096;
      font-size: 0.9rem;
    }
    .buttons {
      display: flex;
      gap: 1rem;
      justify-content: center;
    }
    .btn {
      padding: 0.9rem 2rem;
      border-radius: 8px;
      font-weight: 600;
      text-decoration: none;
      transition: all 0.2s;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
    }
    .btn-primary {
      background: #667eea;
      color: white;
    }
    .btn-primary:hover {
      background: #5a67d8;
      transform: translateY(-2px);
    }
    .btn-secondary {
      background: #edf2f7;
      color: #4a5568;
    }
    .btn-secondary:hover {
      background: #e2e8f0;
    }
    @media (max-width: 768px) {
      .features {
        grid-template-columns: 1fr;
      }
      h1 {
        font-size: 2rem;
      }
    }
  `]
})
export class HomeComponent {}
