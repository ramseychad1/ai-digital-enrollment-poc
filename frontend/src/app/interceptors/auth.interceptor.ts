import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

/**
 * HTTP interceptor to handle authentication.
 * Adds withCredentials to all requests and handles 401/403 responses.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  // Clone request and add withCredentials for session cookies
  const authReq = req.clone({
    withCredentials: true
  });

  return next(authReq).pipe(
    catchError(error => {
      // Redirect to login on 401 Unauthorized (session expired)
      if (error.status === 401 && !req.url.includes('/auth/login')) {
        console.warn('Session expired - redirecting to login');

        // Show user-friendly message
        const message = 'Your session has expired. Please log in again.';

        // Store message to show on login page
        sessionStorage.setItem('sessionExpiredMessage', message);

        // Navigate to login page
        router.navigate(['/login']);
      }

      // Handle 403 Forbidden errors
      if (error.status === 403) {
        console.error('Access forbidden:', error);

        // Show alert for forbidden access
        if (!req.url.includes('/auth/')) {
          alert('Access denied. You do not have permission to perform this action.');
        }
      }

      return throwError(() => error);
    })
  );
};
