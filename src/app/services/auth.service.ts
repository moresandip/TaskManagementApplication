import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User, LoginCredentials, RegisterData } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private users: User[] = [
    {
      id: '1',
      email: 'admin@example.com',
      name: 'Admin User',
      role: 'admin'
    },
    {
      id: '2',
      email: 'user@example.com',
      name: 'Regular User',
      role: 'user'
    }
  ];

  constructor() {
    // Check for stored user session
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      this.currentUserSubject.next(JSON.parse(storedUser));
    }
  }

  login(credentials: LoginCredentials): Observable<{ success: boolean; message?: string; user?: User }> {
    return new Observable(observer => {
      // Simulate API call delay
      setTimeout(() => {
        // Demo credentials
        const validCredentials = [
          { email: 'admin@example.com', password: 'admin123' },
          { email: 'user@example.com', password: 'user123' }
        ];

        const isValid = validCredentials.some(cred => 
          cred.email === credentials.email && cred.password === credentials.password
        );

        if (isValid) {
          const user = this.users.find(u => u.email === credentials.email);
          if (user) {
            this.currentUserSubject.next(user);
            localStorage.setItem('currentUser', JSON.stringify(user));
            observer.next({ success: true, user });
          }
        } else {
          observer.next({ success: false, message: 'Invalid email or password' });
        }
        observer.complete();
      }, 1000);
    });
  }

  register(data: RegisterData): Observable<{ success: boolean; message?: string; user?: User }> {
    return new Observable(observer => {
      setTimeout(() => {
        // Check if user already exists
        const existingUser = this.users.find(u => u.email === data.email);
        if (existingUser) {
          observer.next({ success: false, message: 'User with this email already exists' });
        } else {
          const newUser: User = {
            id: this.generateId(),
            email: data.email,
            name: data.name,
            role: 'user'
          };
          this.users.push(newUser);
          this.currentUserSubject.next(newUser);
          localStorage.setItem('currentUser', JSON.stringify(newUser));
          observer.next({ success: true, user: newUser });
        }
        observer.complete();
      }, 1000);
    });
  }

  logout(): void {
    this.currentUserSubject.next(null);
    localStorage.removeItem('currentUser');
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null;
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}