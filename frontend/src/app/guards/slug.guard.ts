import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { SlugService } from '../services/slug.service';

/**
 * Validates the /:slug segment against /api/public/tenants/{slug} before rendering.
 * Also blocks reserved slugs so /platform never resolves as a tenant.
 */
export const slugGuard: CanActivateFn = (route) => {
  const slugService = inject(SlugService);
  const router = inject(Router);
  const slug = route.paramMap.get('slug');

  if (!slug || slugService.isReserved(slug)) {
    return router.createUrlTree(['/']);
  }

  return slugService.validate(slug).pipe(
    map(() => true),
    catchError(() => {
      slugService.clear();
      return of(router.createUrlTree(['/']));
    })
  );
};
