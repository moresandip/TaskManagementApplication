import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, from, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { supabase } from '../../lib/supabase';
import { User } from '@supabase/supabase-js';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    this.initializeAuth();
  }

  private async initializeAuth() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        this.currentUserSubject.next(session.user);
      }

      supabase.auth.onAuthStateChange((event, session) => {
        this.currentUserSubject.next(session?.user || null);
      });
    } catch (error) {
      console.error('Auth initialization error:', error);
    }
  }

  login(credentials: LoginCredentials): Observable<{ success: boolean; message?: string; user?: User | null }> {
    return from(
      supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password
      })
    ).pipe(
      map(({ data, error }) => {
        if (error) {
          return { success: false, message: error.message };
        }
        return { success: true, user: data.user };
      }),
      catchError(error => {
        console.error('Login error:', error);
        return of({ success: false, message: 'Login failed. Please try again.' });
      })
    );
  }

  register(data: RegisterData): Observable<{ success: boolean; message?: string; user?: User | null }> {
    return from(
      supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name
          }
        }
      })
    ).pipe(
      map(({ data: authData, error }) => {
        if (error) {
          return { success: false, message: error.message };
        }
        return { success: true, user: authData.user };
      }),
      catchError(error => {
        console.error('Registration error:', error);
        return of({ success: false, message: 'Registration failed. Please try again.' });
      })
    );
  }

  logout(): Observable<void> {
    return from(supabase.auth.signOut()).pipe(
      map(() => {
        this.currentUserSubject.next(null);
      }),
      catchError(error => {
        console.error('Logout error:', error);
        this.currentUserSubject.next(null);
        return [];
      })
    );
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null;
  }
}