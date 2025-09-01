import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, LoginCredentials, RegisterData } from '../../services/auth.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <h1>Sales Log</h1>
          <p>{{ isLoginMode ? 'Sign in to your account' : 'Create a new account' }}</p>
        </div>

        <form class="auth-form" (ngSubmit)="onSubmit()" #authForm="ngForm">
          <div class="form-group" *ngIf="!isLoginMode">
            <label for="name">Full Name</label>
            <input 
              type="text" 
              id="name" 
              name="name" 
              [(ngModel)]="formData.name" 
              required
              class="form-input"
              placeholder="Enter your full name">
          </div>

          <div class="form-group">
            <label for="email">Email</label>
            <input 
              type="email" 
              id="email" 
              name="email" 
              [(ngModel)]="formData.email" 
              required
              class="form-input"
              placeholder="Enter your email">
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input 
              type="password" 
              id="password" 
              name="password" 
              [(ngModel)]="formData.password" 
              required
              minlength="6"
              class="form-input"
              placeholder="Enter your password">
          </div>

          <div class="error-message" *ngIf="errorMessage">
            {{ errorMessage }}
          </div>

          <div class="success-message" *ngIf="successMessage">
            {{ successMessage }}
          </div>

          <button type="submit" class="auth-btn" [disabled]="!authForm.valid || isLoading">
            <span *ngIf="isLoading" class="loading-spinner"></span>
            {{ isLoading ? 'Please wait...' : (isLoginMode ? 'Sign In' : 'Sign Up') }}
          </button>
        </form>

        <div class="auth-footer">
          <p>
            {{ isLoginMode ? "Don't have an account?" : "Already have an account?" }}
            <button type="button" class="link-btn" (click)="toggleMode()">
              {{ isLoginMode ? 'Sign up' : 'Sign in' }}
            </button>
          </p>
        </div>

        <div class="demo-info">
          <p class="demo-note">
            <strong>Note:</strong> Create a real account with your email and password. All data will be securely stored in the database.
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 24px;
    }

    .auth-card {
      background: white;
      border-radius: 16px;
      padding: 40px;
      width: 100%;
      max-width: 400px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    }

    .auth-header {
      text-align: center;
      margin-bottom: 32px;
    }

    .auth-header h1 {
      font-size: 2rem;
      font-weight: 700;
      color: #111827;
      margin: 0 0 8px 0;
    }

    .auth-header p {
      color: #6b7280;
      margin: 0;
    }

    .auth-form {
      margin-bottom: 24px;
    }

    .form-group {
      margin-bottom: 20px;
    }

    label {
      display: block;
      font-weight: 500;
      color: #374151;
      margin-bottom: 8px;
      font-size: 0.875rem;
    }

    .form-input {
      width: 100%;
      padding: 12px 16px;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      font-size: 0.875rem;
      transition: all 0.2s ease;
      background: white;
      box-sizing: border-box;
    }

    .form-input:focus {
      outline: none;
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
    }

    .error-message {
      background: #fef2f2;
      color: #dc2626;
      padding: 12px 16px;
      border-radius: 8px;
      font-size: 0.875rem;
      margin-bottom: 20px;
      border: 1px solid #fecaca;
    }

    .success-message {
      background: #f0fdf4;
      color: #059669;
      padding: 12px 16px;
      border-radius: 8px;
      font-size: 0.875rem;
      margin-bottom: 20px;
      border: 1px solid #bbf7d0;
    }

    .auth-btn {
      width: 100%;
      padding: 12px 24px;
      background: #2563eb;
      color: white;
      border: none;
      border-radius: 8px;
      font-weight: 500;
      font-size: 0.875rem;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .auth-btn:hover:not(:disabled) {
      background: #1d4ed8;
      transform: translateY(-1px);
    }

    .auth-btn:disabled {
      background: #9ca3af;
      cursor: not-allowed;
      transform: none;
    }

    .loading-spinner {
      width: 16px;
      height: 16px;
      border: 2px solid transparent;
      border-top: 2px solid currentColor;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }

    .auth-footer {
      text-align: center;
      padding-top: 24px;
      border-top: 1px solid #e5e7eb;
    }

    .auth-footer p {
      color: #6b7280;
      margin: 0;
    }

    .link-btn {
      background: none;
      border: none;
      color: #2563eb;
      cursor: pointer;
      font-weight: 500;
      text-decoration: underline;
    }

    .link-btn:hover {
      color: #1d4ed8;
    }

    .demo-info {
      margin-top: 24px;
      padding: 16px;
      background: #f0f9ff;
      border-radius: 8px;
      border: 1px solid #bae6fd;
    }

    .demo-note {
      font-size: 0.75rem;
      color: #0369a1;
      margin: 0;
      line-height: 1.5;
    }

    @media (max-width: 480px) {
      .auth-card {
        padding: 24px;
      }
    }
  `]
})
export class AuthComponent {
  isLoginMode = true;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  formData: any = {
    email: '',
    password: '',
    name: ''
  };

  constructor(private authService: AuthService) {}

  onSubmit() {
    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    if (this.isLoginMode) {
      const credentials: LoginCredentials = {
        email: this.formData.email,
        password: this.formData.password
      };

      this.authService.login(credentials).subscribe(result => {
        this.isLoading = false;
        if (!result.success) {
          this.errorMessage = result.message || 'Login failed';
        }
      });
    } else {
      const registerData: RegisterData = {
        email: this.formData.email,
        password: this.formData.password,
        name: this.formData.name
      };

      this.authService.register(registerData).subscribe(result => {
        this.isLoading = false;
        if (result.success) {
          this.successMessage = 'Account created successfully! You can now sign in.';
          this.toggleMode();
          this.formData = { email: '', password: '', name: '' };
        } else {
          this.errorMessage = result.message || 'Registration failed';
        }
      });
    }
  }

  toggleMode() {
    this.isLoginMode = !this.isLoginMode;
    this.errorMessage = '';
    this.successMessage = '';
    this.formData = {
      email: '',
      password: '',
      name: ''
    };
  }
}