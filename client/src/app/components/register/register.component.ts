import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { startRegistration } from '@simplewebauthn/browser';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-container">
        <div class="logo">
          <i class="fas fa-heartbeat"></i>
        </div>
        <h1>Create Account</h1>
        <p class="subtitle">Register with WebAuthn</p>
        
        @if (error) {
          <div class="error-message">
            <i class="fas fa-exclamation-circle"></i> {{ error }}
          </div>
        }
        
        @if (success) {
          <div class="success-message">
            <i class="fas fa-check-circle"></i> Account created! Redirecting...
          </div>
        }
        
        <div class="form-group">
          <label for="displayName">Your Name</label>
          <input 
            type="text" 
            id="displayName" 
            [(ngModel)]="displayName" 
            placeholder="Enter your name"
            class="form-control"
            [disabled]="loading"
          >
        </div>
        
        <button (click)="register()" class="btn btn-primary btn-large" [disabled]="loading || !displayName">
          @if (loading) {
            <i class="fas fa-spinner fa-spin"></i> Registering...
          } @else {
            <i class="fas fa-user-plus"></i> Register with WebAuthn
          }
        </button>
        
        <p class="info">
          <i class="fas fa-info-circle"></i>
          You'll be prompted to create a credential using Windows Hello, Touch ID, or a security key
        </p>
        
        <p class="login-link">
          Already have an account? 
          <a routerLink="/login">Login here</a>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      min-height: calc(100vh - 120px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
    }
    .auth-container {
      max-width: 400px;
      width: 100%;
      text-align: center;
      background: white;
      padding: 3rem;
      border-radius: 16px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.1);
    }
    .logo {
      font-size: 4rem;
      color: #667eea;
      margin-bottom: 1rem;
    }
    h1 {
      font-size: 1.8rem;
      color: #1a202c;
      margin-bottom: 0.5rem;
    }
    .subtitle {
      color: #718096;
      margin-bottom: 2rem;
    }
    .error-message {
      background: #fee2e2;
      color: #dc2626;
      padding: 0.75rem;
      border-radius: 8px;
      margin-bottom: 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }
    .success-message {
      background: #d1fae5;
      color: #059669;
      padding: 0.75rem;
      border-radius: 8px;
      margin-bottom: 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }
    .form-group {
      text-align: left;
      margin-bottom: 1.5rem;
    }
    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      color: #4a5568;
      font-weight: 500;
    }
    .form-control {
      width: 100%;
      padding: 0.75rem;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      font-size: 1rem;
      transition: border-color 0.2s;
    }
    .form-control:focus {
      outline: none;
      border-color: #667eea;
    }
    .btn-large {
      width: 100%;
      padding: 1rem;
      font-size: 1.1rem;
    }
    .btn {
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      font-weight: 600;
      border: none;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      transition: all 0.2s;
      text-decoration: none;
    }
    .btn-primary {
      background: #667eea;
      color: white;
    }
    .btn-primary:hover:not(:disabled) {
      background: #5a67d8;
    }
    .btn:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }
    .info {
      margin-top: 1.5rem;
      color: #a0aec0;
      font-size: 0.875rem;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }
    .login-link {
      margin-top: 2rem;
      color: #718096;
    }
    .login-link a {
      color: #667eea;
      font-weight: 600;
    }
  `]
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  
  displayName = '';
  loading = false;
  error = '';
  success = false;

  async register() {
    if (!this.displayName) return;
    
    this.loading = true;
    this.error = '';
    
    try {
      const optionsRes = await this.authService.registerOptions().toPromise() as { challenge: string; user: { id: string; name: string } };
      
      const optionsWithUser = {
        ...optionsRes,
        user: {
          id: optionsRes.user.id,
          name: optionsRes.user.name,
          displayName: this.displayName
        }
      };
      
      const attestation = await startRegistration(
        optionsWithUser as any
      );
      
      this.authService.registerVerify({ response: attestation, displayName: this.displayName }).subscribe({
        next: () => {
          this.success = true;
          setTimeout(() => {
            this.router.navigate(['/illnesses']);
          }, 1500);
        },
        error: (err) => {
          this.error = 'Registration failed. Please try again.';
          this.loading = false;
        }
      });
    } catch (err) {
      this.error = 'WebAuthn error. Please use a supported browser.';
      this.loading = false;
    }
  }
}
