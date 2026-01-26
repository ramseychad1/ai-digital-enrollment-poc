import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface LoginResponse {
  success: boolean;
  message: string;
  username?: string;
}

export interface AuthStatus {
  authenticated: boolean;
  username?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private authenticatedSubject = new BehaviorSubject<boolean>(false);
  public authenticated$ = this.authenticatedSubject.asObservable();

  constructor(private http: HttpClient) {
    // Check authentication status on service initialization
    this.checkAuthStatus().subscribe();
  }

  /**
   * Login with username and password
   */
  login(username: string, password: string): Observable<LoginResponse> {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);

    return this.http.post<LoginResponse>(
      `${this.apiUrl}/auth/login`,
      formData,
      { withCredentials: true }
    ).pipe(
      tap(response => {
        if (response.success) {
          this.authenticatedSubject.next(true);
        }
      })
    );
  }

  /**
   * Logout current user
   */
  logout(): Observable<{ success: boolean }> {
    return this.http.post<{ success: boolean }>(
      `${this.apiUrl}/auth/logout`,
      {},
      { withCredentials: true }
    ).pipe(
      tap(() => {
        this.authenticatedSubject.next(false);
      })
    );
  }

  /**
   * Check current authentication status
   */
  checkAuthStatus(): Observable<AuthStatus> {
    return this.http.get<AuthStatus>(
      `${this.apiUrl}/auth/status`,
      { withCredentials: true }
    ).pipe(
      tap(status => {
        this.authenticatedSubject.next(status.authenticated);
      })
    );
  }

  /**
   * Check if user is currently authenticated (synchronous)
   */
  isAuthenticated(): boolean {
    return this.authenticatedSubject.value;
  }
}
