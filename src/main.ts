import { Component } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { TaskListComponent } from './app/components/task-list/task-list.component';
import { AuthComponent } from './app/components/auth/auth.component';
import { HeaderComponent } from './app/components/header/header.component';
import { AuthService } from './app/services/auth.service';
import { User } from './app/models/user.model';

@Component({
  selector: 'app-root',
  template: `
    <div class="app-container" *ngIf="!isLoading">
      <div *ngIf="currentUser; else authTemplate">
        <app-header></app-header>
        <app-task-list></app-task-list>
      </div>
      <ng-template #authTemplate>
        <app-auth></app-auth>
      </ng-template>
    </div>
    <div class="loading-container" *ngIf="isLoading">
      <div class="loading-spinner"></div>
      <p>Loading...</p>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
    }

    .loading-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: #f8fafc;
      gap: 16px;
    }

    .loading-spinner {
      width: 32px;
      height: 32px;
      border: 3px solid #e5e7eb;
      border-top: 3px solid #2563eb;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
  `],
  standalone: true,
  imports: [CommonModule, TaskListComponent, AuthComponent, HeaderComponent]
})
export class App {
  currentUser: User | null = null;
  isLoading = true;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    // Simulate initial loading
    setTimeout(() => {
      this.isLoading = false;
    }, 1000);

    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }
}

bootstrapApplication(App);