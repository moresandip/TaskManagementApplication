import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, from, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { supabase } from '../../lib/supabase';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { AppUser } from '../models/user.model';

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
  private currentUserSubject = new BehaviorSubject<AppUser | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    this.initializeAuth();
  }

  private async initializeAuth() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        this.currentUserSubject.next(this.mapSupabaseUserToAppUser(session.user));
      }

      supabase.auth.onAuthStateChange((event, session) => {
        this.currentUserSubject.next(session?.user ? this.mapSupabaseUserToAppUser(session.user) : null);
      });
    } catch (error) {
      console.error('Auth initialization error:', error);
    }
  }

  private mapSupabaseUserToAppUser(supabaseUser: SupabaseUser): AppUser {
    return {
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      name: supabaseUser.user_metadata?.['name'] || supabaseUser.email?.split('@')[0] || 'User'
    };
  }

  login(credentials: LoginCredentials): Observable<{ success: boolean; message?: string; user?: AppUser | null }> {
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
        return { success: true, user: data.user ? this.mapSupabaseUserToAppUser(data.user) : null };
      }),
      catchError(error => {
        console.error('Login error:', error);
        return of({ success: false, message: 'Login failed. Please try again.' });
      })
    );
  }

  register(data: RegisterData): Observable<{ success: boolean; message?: string; user?: AppUser | null }> {
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
        return { success: true, user: authData.user ? this.mapSupabaseUserToAppUser(authData.user) : null };
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

  getCurrentUser(): AppUser | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null;
  }
}