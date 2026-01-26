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
      // Redirect to login on 401 Unauthorized
      if (error.status === 401 && !req.url.includes('/auth/login')) {
        router.navigate(['/login']);
      }

      // Log 403 Forbidden errors
      if (error.status === 403) {
        console.error('Access forbidden:', error);
      }

      return throwError(() => error);
    })
  );
};
