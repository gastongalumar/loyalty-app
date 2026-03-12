import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const auth = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Token expired or invalid — clear session and redirect
        auth.logout();
        router.navigate(['/login']);
      }

      if (error.status === 403) {
        // Role mismatch — redirect to appropriate home
        if (auth.isCustomer()) {
          router.navigate(['/customer/card']);
        } else if (auth.isAdmin()) {
          router.navigate(['/admin/dashboard']);
        }
      }

      return throwError(() => error);
    })
  );
};
