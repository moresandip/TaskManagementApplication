import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { AppUser } from '../../models/user.model';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="header">
      <div class="header-content">
        <div class="logo">
          <h1>Sales Log</h1>
        </div>
        
        <div class="user-menu" *ngIf="currentUser">
          <div class="user-info">
            <span class="user-name">{{ getUserName() }}</span>
            <span class="user-email">{{ currentUser.email }}</span>
          </div>
          <button class="logout-btn" (click)="logout()" [disabled]="isLoggingOut">
            <span *ngIf="isLoggingOut" class="loading-spinner"></span>
            <svg *ngIf="!isLoggingOut" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16,17 21,12 16,7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            {{ isLoggingOut ? 'Signing out...' : 'Logout' }}
          </button>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .header {
      background: white;
      border-bottom: 1px solid #e5e7eb;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
    }

    .header-content {
      max-width: 1400px;
      margin: 0 auto;
      padding: 16px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .logo h1 {
      font-size: 1.5rem;
      font-weight: 700;
      color: #2563eb;
      margin: 0;
    }

    .user-menu {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .user-info {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
    }

    .user-name {
      font-weight: 600;
      color: #111827;
      font-size: 0.875rem;
    }

    .user-email {
      font-size: 0.75rem;
      color: #6b7280;
    }

    .logout-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      background: #f3f4f6;
      color: #374151;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      font-size: 0.875rem;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .logout-btn:hover:not(:disabled) {
      background: #e5e7eb;
      transform: translateY(-1px);
    }

    .logout-btn:disabled {
      background: #f9fafb;
      color: #9ca3af;
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

    @media (max-width: 768px) {
      .header-content {
        padding: 12px 16px;
      }

      .user-info {
        display: none;
      }
    }
  `]
})
export class HeaderComponent implements OnInit {
  currentUser: AppUser | null = null;
  isLoggingOut = false;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  getUserName(): string {
    return this.currentUser?.name || 'User';
  }

  logout() {
    this.isLoggingOut = true;
    this.authService.logout().subscribe(() => {
      this.isLoggingOut = false;
    });
  }
}