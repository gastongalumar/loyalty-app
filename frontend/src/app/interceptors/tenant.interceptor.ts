import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { SlugService } from '../services/slug.service';

/**
 * Public auth endpoints resolve their tenant from X-Tenant-Slug.
 * Authenticated requests never send it for authorization: the backend uses the JWT.
 */
export const tenantInterceptor: HttpInterceptorFn = (req, next) => {
  const slug = inject(SlugService).get();

  if (slug && req.url.includes('/auth/')) {
    return next(req.clone({ setHeaders: { 'X-Tenant-Slug': slug } }));
  }

  return next(req);
};
