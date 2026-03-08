import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { startAuthentication } from '@simplewebauthn/browser';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-container">
        <div class="logo">
          <i class="fas fa-heartbeat"></i>
        </div>
        <h1>Welcome Back</h1>
        <p class="subtitle">Login to your Healthdiary account</p>
        
        @if (error) {
          <div class="error-message">
            <i class="fas fa-exclamation-circle"></i> {{ error }}
          </div>
        }
        
        <button (click)="login()" class="btn btn-primary btn-large" [disabled]="loading">
          @if (loading) {
            <i class="fas fa-spinner fa-spin"></i> Verifying...
          } @else {
            <i class="fas fa-fingerprint"></i> Login with WebAuthn
          }
        </button>
        
        <p class="info">
          <i class="fas fa-info-circle"></i>
          Use Windows Hello, Touch ID, or your security key to authenticate
        </p>
        
        <p class="register-link">
          Don't have an account? 
          <a routerLink="/register">Register here</a>
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
      gap: 0.5rem;
      justify-content: center;
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
    .register-link {
      margin-top: 2rem;
      color: #718096;
    }
    .register-link a {
      color: #667eea;
      font-weight: 600;
    }
  `]
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  
  loading = false;
  error = '';

  async login() {
    this.loading = true;
    this.error = '';
    
    try {
      const optionsRes = await this.authService.loginOptions().toPromise() as { challenge: string; allowCredentials: { id: string }[] };
      
      if (!optionsRes.allowCredentials?.length) {
        this.error = 'No registered credentials found. Please register first.';
        this.loading = false;
        return;
      }
      
      const attestation = await startAuthentication(
        optionsRes as any
      );
      
      this.authService.loginVerify({ response: attestation }).subscribe({
        next: () => {
          this.router.navigate(['/illnesses']);
        },
        error: (err) => {
          this.error = 'Authentication failed. Please try again.';
          this.loading = false;
        }
      });
    } catch (err) {
      this.error = 'WebAuthn error. Please use a supported browser.';
      this.loading = false;
    }
  }
}
