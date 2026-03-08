# CLIENT-006: Authentication Pages

> **Requirement**: CLIENT-006  
> **Component**: Client  
> **Status**: Implementation Ready

## Description

Implement login and registration pages using WebAuthn for passwordless authentication.

## Pages

### Login Page (Public)

- Welcome message with project description
- "Login" button to initiate WebAuthn
- "Register" link for new users
- Works with any WebAuthn-capable device (Windows Hello, Touch ID, security keys)

### Register Page (Public)

- Display name input
- "Register" button to initiate WebAuthn registration
- Instructions for using WebAuthn
- Success message after registration

### Home Page (Public)

- Project title and description
- Features overview
- Login/Register buttons
- Healthdiary branding

## UI Components

### Login Component

```typescript
@Component({
  selector: 'app-login',
  standalone: true,
  template: `
    <div class="auth-container">
      <h1>Welcome to Healthdiary</h1>
      <p class="description">Your personal health diary for tracking illnesses, prescriptions, and doctor appointments.</p>
      
      <button (click)="login()" class="btn btn-primary">
        <i class="fas fa-fingerprint"></i> Login with WebAuthn
      </button>
      
      <p class="register-link">
        Don't have an account? <a routerLink="/register">Register here</a>
      </p>
    </div>
  `
})
export class LoginComponent {
  // WebAuthn login logic
}
```

### Register Component

```typescript
@Component({
  selector: 'app-register',
  standalone: true,
  template: `
    <div class="auth-container">
      <h1>Create Account</h1>
      <input [(ngModel)]="displayName" placeholder="Your name" class="form-control">
      
      <button (click)="register()" class="btn btn-primary">
        <i class="fas fa-user-plus"></i> Register with WebAuthn
      </button>
    </div>
  `
})
export class RegisterComponent {
  // WebAuthn registration logic
}
```

### Home Component (Public)

```typescript
@Component({
  selector: 'app-home',
  standalone: true,
  template: `
    <div class="home-page">
      <div class="hero">
        <i class="fas fa-heartbeat logo-icon"></i>
        <h1>Healthdiary</h1>
        <p>Your personal health companion</p>
      </div>
      
      <div class="features">
        <div class="feature">
          <i class="fas fa-user-injured"></i>
          <h3>Illness Tracking</h3>
        </div>
        <div class="feature">
          <i class="fas fa-pills"></i>
          <h3>Prescriptions</h3>
        </div>
        <div class="feature">
          <i class="fas fa-calendar-check"></i>
          <h3>Appointments</h3>
        </div>
      </div>
      
      <div class="auth-buttons">
        <a routerLink="/login" class="btn btn-primary">Login</a>
        <a routerLink="/register" class="btn btn-secondary">Register</a>
      </div>
    </div>
  `
})
export class HomeComponent {}
```

## Route Protection

- All routes except `/`, `/login`, `/register` require authentication
- Auth guard checks for valid session
- Redirect to `/login` if not authenticated

## Icons

Use Font Awesome 6+ for icons:
- `fa-heartbeat` - Logo
- `fa-user-injured` - Illnesses
- `fa-pills` - Prescriptions
- `fa-calendar-check` - Appointments
- `fa-fingerprint` - Login
- `fa-user-plus` - Register

## Implementation

- `src/app/components/home/`
- `src/app/components/login/`
- `src/app/components/register/`
- `src/app/guards/auth.guard.ts`
- `src/app/services/auth.service.ts`
